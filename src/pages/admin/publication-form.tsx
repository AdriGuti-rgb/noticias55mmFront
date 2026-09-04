import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  buttonVariants,
  Card,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";

import {
  adminApi,
  AdminPublication,
  ApiError,
  Category,
  publicApi,
  PublicationPhoto,
  PublicationStatus,
  PublicationType,
} from "@/config/admin-api";
import {
  ArrowLeftIcon,
  CameraIcon,
  InfoIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/icons";
import { AdminDatePicker } from "@/components/admin/admin-date-picker";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FilterSelect } from "@/components/admin/filter-select";
import {
  formatMetadataValue,
  metadataToDateInput,
  PhotoMetadata,
  readPhotoMetadata,
  reverseGeocode,
} from "@/lib/photo-metadata";
import { toast } from "@/lib/toast";

const TYPE_OPTIONS = [
  { id: "solo", label: "En solitario" },
  { id: "event", label: "Evento / rueda de prensa" },
];

const STATUS_OPTIONS = [
  { id: "draft", label: "Borrador" },
  { id: "published", label: "Publicado" },
];

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface FormState {
  slug: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  categoryId: string;
  location: string;
  date: string;
  type: PublicationType;
  status: PublicationStatus;
}

const EMPTY_FORM: FormState = {
  slug: "",
  title: "",
  titleEn: "",
  body: "",
  bodyEn: "",
  categoryId: "",
  location: "",
  date: "",
  type: "solo",
  status: "draft",
};

export default function AdminPublicationFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  // El borrador auto-creado ya existe en BD (por las fotos), pero de cara al usuario
  // sigue siendo "una publicación nueva" hasta que la guarde de verdad: no mostrar
  // "Editar publicación" en ese primer momento. Se marca vía router state al redirigir
  // desde el auto-borrador; si se recarga la página o se llega por otra vía, se pierde
  // (correcto: en ese punto ya es, de hecho, una publicación existente que se edita).
  const isFreshDraft =
    (location.state as { justCreated?: boolean } | null)?.justCreated === true;

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [photos, setPhotos] = useState<PublicationPhoto[]>([]);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  // Siempre empieza cargando: en modo edición carga la publicación existente; en modo
  // creación, prepara un borrador (ver más abajo) antes de mostrar nada.
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const draftCreationStarted = useRef(false);

  useEffect(() => {
    publicApi
      .get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;

    adminApi
      .get<AdminPublication>(`/admin/publications/${id}`)
      .then((publication) => {
        setForm({
          slug: publication.slug,
          title: publication.title,
          titleEn: publication.titleEn ?? "",
          body: publication.body ?? "",
          bodyEn: publication.bodyEn ?? "",
          categoryId: publication.category.id,
          location: publication.location ?? "",
          date: publication.date ?? "",
          type: publication.type,
          status: publication.status,
        });
        setPhotos(publication.photos);
      })
      .catch((err) =>
        toast.danger(
          err instanceof ApiError
            ? err.message
            : "No se pudo cargar la publicación.",
        ),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  /**
   * La prioridad del formulario es la foto, no el texto: muchas publicaciones "en
   * solitario" no llevan noticia asociada. Como las fotos cuelgan de un `publicationId`
   * real (FK), no se pueden subir antes de que exista la fila en BD — así que al abrir
   * "Nueva publicación" se crea de inmediato un borrador mínimo (categoría por defecto,
   * tipo "solo", sin texto) y se redirige a su URL de edición, donde la sección de fotos
   * ya está disponible desde el primer momento. El usuario nunca ve un formulario vacío
   * a la espera: el gate de `isLoading` cubre esta creación igual que la carga normal.
   */
  useEffect(() => {
    if (id || draftCreationStarted.current || categories.length === 0) return;
    draftCreationStarted.current = true;

    adminApi
      .post<AdminPublication>("/admin/publications", {
        slug: `borrador-${Date.now().toString(36)}`,
        title: "Nueva publicación",
        categoryId: categories[0].id,
        type: "solo",
        status: "draft",
      })
      .then((created) =>
        navigate(`/system/admin/publications/${created.id}`, {
          replace: true,
          state: { justCreated: true },
        }),
      )
      .catch((err) => {
        toast.danger(
          err instanceof ApiError
            ? err.message
            : "No se pudo preparar la nueva publicación.",
        );
        setIsLoading(false);
      });
  }, [id, categories, navigate]);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value: string) => {
    updateField("title", value);
    if (!slugTouched) {
      updateField("slug", slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      slug: form.slug,
      title: form.title,
      titleEn: form.titleEn || undefined,
      body: form.body,
      bodyEn: form.bodyEn || undefined,
      categoryId: form.categoryId,
      location: form.location || undefined,
      date: form.date || undefined,
      type: form.type,
      status: form.status,
    };

    try {
      if (isEditing && id) {
        await adminApi.patch(`/admin/publications/${id}`, payload);
        toast.success("Publicación guardada.");
        navigate("/system/admin");
      } else {
        const created = await adminApi.post<AdminPublication>(
          "/admin/publications",
          payload,
        );

        toast.success("Publicación creada.");
        navigate(`/system/admin/publications/${created.id}`, { replace: true });
      }
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar la publicación.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted">Cargando…</p>;
  }

  return (
    <div>
      <Link
        className={buttonVariants({ variant: "secondary", size: "sm" })}
        to="/system/admin"
      >
        <ArrowLeftIcon size={16} />
        Volver
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        {isFreshDraft ? "Nueva publicación" : "Editar publicación"}
      </h1>

      {id && (
        <PhotosSection
          currentDate={form.date}
          currentLocation={form.location}
          photos={photos}
          publicationId={id}
          onDetectedDate={(value) => updateField("date", value)}
          onDetectedLocation={(value) => updateField("location", value)}
          onPhotosChange={setPhotos}
        />
      )}

      <form className="mt-8 flex flex-col gap-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField isRequired name="title">
            <Label>Título</Label>
            <Input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
          </TextField>
          <TextField name="titleEn">
            <Label>Título (inglés)</Label>
            <Input
              value={form.titleEn}
              onChange={(e) => updateField("titleEn", e.target.value)}
            />
          </TextField>
        </div>

        <TextField isRequired name="slug">
          <Label>Slug (URL)</Label>
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              updateField("slug", e.target.value);
            }}
          />
        </TextField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField name="location">
            <Label>Ubicación</Label>
            <Input
              placeholder="Valencia, España"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </TextField>
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Fecha</span>
            <AdminDatePicker
              aria-label="Fecha"
              value={form.date}
              onChange={(value) => updateField("date", value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Categoría</span>
            <FilterSelect
              aria-label="Categoría"
              items={categories.map((category) => ({
                id: category.id,
                label: category.name,
              }))}
              value={form.categoryId}
              onChange={(value) => updateField("categoryId", value)}
            />
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Tipo</span>
            <FilterSelect
              aria-label="Tipo"
              items={TYPE_OPTIONS}
              value={form.type}
              onChange={(value) =>
                updateField("type", value as PublicationType)
              }
            />
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-foreground">Estado</span>
            <FilterSelect
              aria-label="Estado"
              items={STATUS_OPTIONS}
              value={form.status}
              onChange={(value) =>
                updateField("status", value as PublicationStatus)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField name="body">
            <Label>Texto / noticia (opcional)</Label>
            <TextArea
              rows={10}
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
            />
          </TextField>
          <TextField name="bodyEn">
            <Label>Texto / noticia (inglés)</Label>
            <TextArea
              rows={10}
              value={form.bodyEn}
              onChange={(e) => updateField("bodyEn", e.target.value)}
            />
          </TextField>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            className="rounded-full"
            isDisabled={isSaving}
            type="submit"
            variant="primary"
          >
            {isFreshDraft ? <PlusIcon size={16} /> : <SaveIcon size={16} />}
            {isSaving
              ? "Guardando…"
              : isFreshDraft
                ? "Crear publicación"
                : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function MetadataList({ metadata }: { metadata: PhotoMetadata }) {
  const entries = Object.entries(metadata);

  if (entries.length === 0) {
    return <p className="text-xs text-muted">Esta foto no tiene datos EXIF.</p>;
  }

  return (
    <dl className="max-h-48 space-y-1 overflow-y-auto text-xs">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <dt className="shrink-0 font-medium text-foreground">{key}</dt>
          <dd className="truncate text-muted">{formatMetadataValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function UploadedPhotoCard({
  photo,
  onDelete,
}: {
  photo: PublicationPhoto;
  onDelete: (photoId: string) => void;
}) {
  const [metadata, setMetadata] = useState<PhotoMetadata | null>();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMetadata = async () => {
    const next = !isOpen;

    setIsOpen(next);
    if (next && metadata === undefined) {
      setIsLoading(true);
      setMetadata(await readPhotoMetadata(photo.url));
      setIsLoading(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden p-0">
      <img
        alt={photo.caption ?? photo.originalName}
        className="aspect-square w-full object-cover"
        src={photo.url}
      />
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          isIconOnly
          aria-label="Ver datos"
          size="sm"
          variant="secondary"
          onPress={toggleMetadata}
        >
          <InfoIcon size={16} />
        </Button>
        <Button
          isIconOnly
          aria-label="Eliminar fotografía"
          size="sm"
          variant="danger-soft"
          onPress={() => onDelete(photo.id)}
        >
          <TrashIcon size={16} />
        </Button>
      </div>
      {photo.caption && (
        <p className="truncate px-2 py-1 text-xs text-muted">{photo.caption}</p>
      )}
      {isOpen && (
        <div className="border-t border-separator bg-surface p-2">
          {isLoading ? (
            <p className="text-xs text-muted">Leyendo datos…</p>
          ) : (
            <MetadataList metadata={metadata ?? {}} />
          )}
        </div>
      )}
    </Card>
  );
}

function PhotosSection({
  publicationId,
  photos,
  onPhotosChange,
  currentLocation,
  currentDate,
  onDetectedLocation,
  onDetectedDate,
}: {
  publicationId: string;
  photos: PublicationPhoto[];
  onPhotosChange: (photos: PublicationPhoto[]) => void;
  currentLocation: string;
  currentDate: string;
  onDetectedLocation: (value: string) => void;
  onDetectedDate: (value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingMetadata, setPendingMetadata] = useState<PhotoMetadata | null>(
    null,
  );
  const [isReadingMetadata, setIsReadingMetadata] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    setFileName(file?.name ?? null);
    setPendingMetadata(null);
    if (!file) return;

    setIsReadingMetadata(true);
    const metadata = await readPhotoMetadata(file);

    setPendingMetadata(metadata ?? {});

    // Autorrelleno desde EXIF: solo si el usuario todavía no ha puesto nada a mano.
    if (metadata) {
      if (!currentDate) {
        const detectedDate = metadataToDateInput(metadata);

        if (detectedDate) onDetectedDate(detectedDate);
      }
      if (
        !currentLocation &&
        typeof metadata.latitude === "number" &&
        typeof metadata.longitude === "number"
      ) {
        const place = await reverseGeocode(
          metadata.latitude,
          metadata.longitude,
        );

        if (place) onDetectedLocation(place);
      }
    }
    setIsReadingMetadata(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      toast.danger("Selecciona una imagen primero.");

      return;
    }

    setIsUploading(true);

    const formData = new FormData();

    formData.append("file", file);
    if (caption) formData.append("caption", caption);

    try {
      const photo = await adminApi.post<PublicationPhoto>(
        `/admin/publications/${publicationId}/photos`,
        formData,
      );

      onPhotosChange([...photos, photo]);
      setCaption("");
      setFileName(null);
      setPendingMetadata(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Foto añadida.");
    } catch (err) {
      toast.danger(
        err instanceof ApiError ? err.message : "No se pudo subir la foto.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);

  const confirmDeletePhoto = async () => {
    if (!pendingDeleteId) return;

    setIsDeletingPhoto(true);
    try {
      await adminApi.delete(`/admin/publication-photos/${pendingDeleteId}`);
      onPhotosChange(photos.filter((p) => p.id !== pendingDeleteId));
      toast.success("Foto eliminada.");
    } catch (err) {
      toast.danger(
        err instanceof ApiError ? err.message : "No se pudo eliminar la foto.",
      );
    } finally {
      setIsDeletingPhoto(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <section className="mt-6 mb-10 border-b border-separator pb-10">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        Fotografías
      </h2>

      {photos.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          Todavía no hay fotos en esta publicación.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <UploadedPhotoCard
              key={photo.id}
              photo={photo}
              onDelete={setPendingDeleteId}
            />
          ))}
        </div>
      )}

      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={handleUpload}
      >
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Subir foto</span>
          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-separator bg-transparent px-3 text-sm text-muted transition-colors hover:border-accent hover:text-foreground">
            <CameraIcon className="shrink-0 text-accent" size={18} />
            <span className="max-w-40 truncate">
              {fileName ?? "Elegir imagen…"}
            </span>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="sr-only"
              type="file"
              onChange={handleFileChange}
            />
          </label>
        </div>
        <TextField name="caption">
          <Label>Pie de foto (opcional)</Label>
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
        </TextField>
        <Button isDisabled={isUploading} type="submit" variant="secondary">
          <UploadIcon size={16} />
          {isUploading ? "Subiendo…" : "Añadir foto"}
        </Button>
      </form>

      {fileName && (
        <div className="mt-3 max-w-md rounded-lg border border-separator p-3">
          {isReadingMetadata ? (
            <p className="text-xs text-muted">Leyendo datos…</p>
          ) : (
            <details>
              <summary className="cursor-pointer text-xs font-medium text-accent">
                Datos de la foto ({Object.keys(pendingMetadata ?? {}).length})
              </summary>
              <div className="mt-2">
                <MetadataList metadata={pendingMetadata ?? {}} />
              </div>
            </details>
          )}
        </div>
      )}

      <ConfirmDialog
        description="¿Eliminar esta fotografía? Esta acción no se puede deshacer."
        isConfirming={isDeletingPhoto}
        isOpen={pendingDeleteId !== null}
        title="Eliminar fotografía"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDeletePhoto}
      />
    </section>
  );
}
