import { useEffect, useState } from "react";
import { Button, Input, Label, TextField } from "@heroui/react";

import { UsersTable } from "./usersTable";

import {
  adminApi,
  AdminRoleName,
  AdminUser,
  ApiError,
} from "@/config/admin-api";
import { PlusIcon, SaveIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FilterSelect } from "@/components/admin/filter-select";
import { useAdminAuth } from "@/lib/admin-auth";
import { toast } from "@/lib/toast";

const ROLE_OPTIONS = [
  { id: "developer", label: "Desarrollador" },
  { id: "photographer", label: "Fotógrafo" },
];

interface FormState {
  email: string;
  displayName: string;
  bio: string;
  role: AdminRoleName;
  password: string;
}

const EMPTY_FORM: FormState = {
  email: "",
  displayName: "",
  bio: "",
  role: "photographer",
  password: "",
};

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth();
  const isDeveloper = currentUser?.role.name === "developer";

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = () => {
    setLoadError(false);
    adminApi
      .get<AdminUser[]>("/admin/users")
      .then(setUsers)
      .catch((err) => {
        setLoadError(true);
        toast.danger(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los usuarios.",
        );
      });
  };

  useEffect(() => {
    if (isDeveloper) loadUsers();
  }, [isDeveloper]);

  if (!isDeveloper) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Usuarios
        </h1>
        <p className="mt-4 text-sm text-muted">
          Solo el desarrollador puede administrar cuentas del panel.
        </p>
      </div>
    );
  }

  const isEditing = editingId !== null;

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setForm({
      email: u.email,
      displayName: u.profile?.displayName ?? "",
      bio: u.profile?.bio ?? "",
      role: u.role.name,
      password: "",
    });
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditing && editingId) {
        const updated = await adminApi.patch<AdminUser>(
          `/admin/users/${editingId}`,
          {
            email: form.email.trim(),
            displayName: form.displayName.trim(),
            bio: form.bio.trim() || undefined,
            role: form.role,
          },
        );

        if (form.password.trim()) {
          await adminApi.patch(`/admin/users/${editingId}/password`, {
            password: form.password.trim(),
          });
        }
        setUsers(
          (prev) =>
            prev?.map((u) => (u.id === updated.id ? updated : u)) ?? null,
        );
      } else {
        const created = await adminApi.post<AdminUser>("/admin/users", {
          email: form.email.trim(),
          password: form.password.trim(),
          displayName: form.displayName.trim(),
          bio: form.bio.trim() || undefined,
          role: form.role,
        });

        setUsers((prev) => (prev ? [...prev, created] : [created]));
      }
      toast.success(isEditing ? "Usuario guardado." : "Usuario creado.");
      startCreate();
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo guardar el usuario.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (u: AdminUser) => {
    try {
      const updated = await adminApi.patch<AdminUser>(`/admin/users/${u.id}`, {
        isActive: !u.isActive,
      });

      setUsers(
        (prev) =>
          prev?.map((item) => (item.id === updated.id ? updated : item)) ??
          null,
      );
      toast.success(
        updated.isActive ? "Usuario activado." : "Usuario desactivado.",
      );
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el usuario.",
      );
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    try {
      await adminApi.delete(`/admin/users/${pendingDelete.id}`);
      setUsers(
        (prev) => prev?.filter((u) => u.id !== pendingDelete.id) ?? null,
      );
      if (editingId === pendingDelete.id) startCreate();
      toast.success("Usuario eliminado.");
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar el usuario.",
      );
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Usuarios
        </h1>
        {/* <p className="mt-1 text-sm text-muted">
          Cuentas del panel, su rol y su perfil. Solo visible para el
          desarrollador.
        </p> */}
      </div>

      <form
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-separator bg-surface p-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-sm font-semibold text-foreground">
          {isEditing ? "Editar usuario" : "Nuevo usuario"}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField isRequired name="email" type="email">
            <Label>Correo electrónico</Label>
            <Input
              placeholder="nombre@correo.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </TextField>
          <TextField isRequired name="displayName">
            <Label>Nombre para mostrar</Label>
            <Input
              placeholder="Nombre Apellido"
              value={form.displayName}
              onChange={(e) => updateField("displayName", e.target.value)}
            />
          </TextField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1 block text-sm text-foreground">Rol</Label>
            <FilterSelect
              aria-label="Rol"
              items={ROLE_OPTIONS}
              value={form.role}
              onChange={(value) => updateField("role", value as AdminRoleName)}
            />
          </div>
          <TextField isRequired={!isEditing} name="password" type="password">
            <Label>
              {isEditing ? "Nueva contraseña (opcional)" : "Contraseña"}
            </Label>
            <Input
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </TextField>
        </div>

        <TextField name="bio">
          <Label>Bio</Label>
          <Input
            placeholder="Breve descripción del perfil"
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
          />
        </TextField>

        <div className="flex justify-end gap-3">
          {isEditing && (
            <Button type="button" variant="secondary" onPress={startCreate}>
              Cancelar
            </Button>
          )}
          <Button isDisabled={isSaving} type="submit" variant="primary">
            {isEditing ? <SaveIcon size={16} /> : <PlusIcon size={16} />}
            {isSaving
              ? "Guardando…"
              : isEditing
                ? "Guardar cambios"
                : "Crear usuario"}
          </Button>
        </div>
      </form>

      {users === null && !loadError && (
        <p className="mt-8 text-sm text-muted">Cargando…</p>
      )}

      {users === null && loadError && (
        <p className="mt-8 text-sm text-muted">
          No se pudieron cargar los usuarios.
        </p>
      )}

      {users !== null && (
        <div className="mt-8">
          <UsersTable
            currentUserId={currentUser?.id}
            users={users}
            onDelete={setPendingDelete}
            onEdit={startEdit}
            onToggleActive={toggleActive}
          />
        </div>
      )}

      <ConfirmDialog
        description={`¿Eliminar la cuenta de "${pendingDelete?.email}"? Esta acción no se puede deshacer.`}
        isConfirming={deletingId === pendingDelete?.id}
        isOpen={pendingDelete !== null}
        title="Eliminar usuario"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
