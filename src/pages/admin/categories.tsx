import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Input, Label, TextField } from "@heroui/react";

import { CategoriesTable } from "./categoriesTable";

import { adminApi, ApiError, Category } from "@/config/admin-api";
import { CameraIcon, PlusIcon, SaveIcon, UploadIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { LoadingIndicator } from "@/components/loading-indicator";
import { toast } from "@/lib/toast";

interface FormState {
  name: string;
  nameEn: string;
  slug: string;
}

const EMPTY_FORM: FormState = { name: "", nameEn: "", slug: "" };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconFileName, setIconFileName] = useState<string | null>(null);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  const loadCategories = () => {
    setLoadError(false);
    adminApi
      .get<Category[]>("/admin/categories")
      .then(setCategories)
      .catch((err) => {
        setLoadError(true);
        toast.danger(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar las categorías.",
        );
      });
  };

  useEffect(loadCategories, []);

  const isEditing = editingId !== null;
  const editingCategory = useMemo(
    () => categories?.find((c) => c.id === editingId) ?? null,
    [categories, editingId],
  );

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setSlugTouched(true);
    setForm({
      name: category.name,
      nameEn: category.nameEn ?? "",
      slug: category.slug,
    });
    setIconFile(null);
    setIconFileName(null);
  };

  const startCreate = () => {
    setEditingId(null);
    setSlugTouched(false);
    setForm(EMPTY_FORM);
    setIconFile(null);
    setIconFileName(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || undefined,
      slug: form.slug.trim(),
    };

    try {
      if (isEditing && editingId) {
        const updated = await adminApi.patch<Category>(
          `/admin/categories/${editingId}`,
          payload,
        );

        setCategories(
          (prev) =>
            prev?.map((c) => (c.id === updated.id ? updated : c)) ?? null,
        );
      } else {
        const created = await adminApi.post<Category>(
          "/admin/categories",
          payload,
        );

        setCategories((prev) => (prev ? [...prev, created] : [created]));
      }
      toast.success(isEditing ? "Categoría guardada." : "Categoría creada.");
      startCreate();
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar la categoría.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    setIconFile(file);
    setIconFileName(file?.name ?? null);
  };

  const handleUploadIcon = async () => {
    if (!editingId || !iconFile) return;

    setIsUploadingIcon(true);
    const formData = new FormData();

    formData.append("file", iconFile);

    try {
      const updated = await adminApi.post<Category>(
        `/admin/categories/${editingId}/icon`,
        formData,
      );

      setCategories(
        (prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? null,
      );
      setIconFile(null);
      setIconFileName(null);
      if (iconInputRef.current) iconInputRef.current.value = "";
      toast.success("Icono actualizado.");
    } catch (err) {
      toast.danger(
        err instanceof ApiError ? err.message : "No se pudo subir el icono.",
      );
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const updated = await adminApi.patch<Category>(
        `/admin/categories/${category.id}`,
        { isActive: !category.isActive },
      );

      setCategories(
        (prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? null,
      );
      toast.success(
        updated.isActive ? "Categoría activada." : "Categoría desactivada.",
      );
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar la categoría.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    try {
      await adminApi.delete(`/admin/categories/${pendingDelete.id}`);
      setCategories(
        (prev) => prev?.filter((c) => c.id !== pendingDelete.id) ?? null,
      );
      if (editingId === pendingDelete.id) startCreate();
      toast.success("Categoría eliminada.");
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar la categoría.",
      );
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  const sortedCategories = useMemo(
    () =>
      categories
        ? [...categories].sort((a, b) => a.name.localeCompare(b.name))
        : [],
    [categories],
  );

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Categorías
        </h1>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-sm font-semibold text-foreground">
          {isEditing ? "Editar categoría" : "Nueva categoría"}
        </h2>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField isRequired name="name">
              <Label>Nombre</Label>
              <Input
                placeholder="Fotografía deportiva"
                value={form.name}
                onChange={(e) => {
                  const value = e.target.value;

                  updateField("name", value);
                  if (!slugTouched) updateField("slug", slugify(value));
                }}
              />
            </TextField>
            <TextField name="nameEn">
              <Label>Nombre (inglés)</Label>
              <Input
                placeholder="Sports photography"
                value={form.nameEn}
                onChange={(e) => updateField("nameEn", e.target.value)}
              />
            </TextField>
          </div>

          <TextField isRequired name="slug">
            <Label>Slug</Label>
            <Input
              placeholder="deportiva"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                updateField("slug", slugify(e.target.value));
              }}
            />
          </TextField>

          <div>
            <Label className="mb-2 block text-sm text-foreground">Icono</Label>
            {!isEditing ? (
              <p className="text-xs text-muted">
                Guarda la categoría primero para poder subirle un icono.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {editingCategory?.icon && !iconFileName && (
                  <img
                    alt="Icono actual"
                    className="size-11 rounded-lg border border-separator object-cover"
                    src={editingCategory.icon}
                  />
                )}
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-separator bg-transparent px-3 text-sm text-muted transition-colors hover:border-accent hover:text-foreground">
                  <CameraIcon className="shrink-0 text-accent" size={18} />
                  <span className="max-w-40 truncate">
                    {iconFileName ?? "Elegir imagen…"}
                  </span>
                  <input
                    ref={iconInputRef}
                    accept="image/*"
                    className="sr-only"
                    type="file"
                    onChange={handleIconFileChange}
                  />
                </label>
                <Button
                  isDisabled={!iconFile || isUploadingIcon}
                  type="button"
                  variant="secondary"
                  onPress={handleUploadIcon}
                >
                  {isUploadingIcon ? (
                    <LoadingIndicator label="Subiendo…" size="sm" />
                  ) : (
                    <>
                      <UploadIcon size={16} />
                      Subir icono
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {isEditing && (
              <Button type="button" variant="secondary" onPress={startCreate}>
                Cancelar
              </Button>
            )}
            <Button isDisabled={isSaving} type="submit" variant="primary">
              {isSaving ? (
                <LoadingIndicator label="Guardando…" />
              ) : (
                <>
                  {isEditing ? <SaveIcon size={16} /> : <PlusIcon size={16} />}
                  {isEditing ? "Guardar cambios" : "Crear categoría"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {categories === null && !loadError && (
        <p className="mt-8 text-sm text-muted">
          <LoadingIndicator label="Cargando…" />
        </p>
      )}

      {categories === null && loadError && (
        <p className="mt-8 text-sm text-muted">
          No se pudieron cargar las categorías.
        </p>
      )}

      {categories !== null && (
        <div className="mt-8">
          <CategoriesTable
            categories={sortedCategories}
            deletingId={deletingId}
            onDelete={setPendingDelete}
            onEdit={startEdit}
            onToggleActive={toggleActive}
          />
        </div>
      )}

      <ConfirmDialog
        description={`¿Eliminar la categoría "${pendingDelete?.name}"? Solo es posible si no tiene publicaciones asociadas.`}
        isConfirming={deletingId === pendingDelete?.id}
        isOpen={pendingDelete !== null}
        title="Eliminar categoría"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
