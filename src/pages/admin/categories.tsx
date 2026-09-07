import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Label, TextField } from "@heroui/react";
import clsx from "clsx";

import { CategoriesTable } from "./categoriesTable";

import { adminApi, ApiError, Category, publicApi } from "@/config/admin-api";
import { CATEGORY_ICON_OPTIONS } from "@/config/category-icons";
import { PlusIcon, SaveIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { LoadingIndicator } from "@/components/loading-indicator";
import { toast } from "@/lib/toast";

interface FormState {
  name: string;
  nameEn: string;
  slug: string;
  icon: string | null;
}

const EMPTY_FORM: FormState = { name: "", nameEn: "", slug: "", icon: null };

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

  const loadCategories = () => {
    setLoadError(false);
    publicApi
      .get<Category[]>("/categories")
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
      icon: category.icon ?? null,
    });
  };

  const startCreate = () => {
    setEditingId(null);
    setSlugTouched(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || undefined,
      slug: form.slug.trim(),
      icon: form.icon ?? undefined,
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
        {/* <p className="mt-1 text-sm text-muted">
          Gestiona las categorías de publicaciones y su icono. Visible para
          desarrollador y fotógrafo.
        </p> */}
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
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICON_OPTIONS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  aria-label={label}
                  className={clsx(
                    "flex size-11 items-center justify-center rounded-lg border transition-colors cursor-pointer",
                    form.icon === key
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-separator text-foreground hover:border-accent hover:text-accent",
                  )}
                  title={label}
                  type="button"
                  onClick={() =>
                    updateField("icon", form.icon === key ? null : key)
                  }
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
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
