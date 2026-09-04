import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@heroui/react";

import { adminApi, AdminPublication, ApiError } from "@/config/admin-api";
import { PlusIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { toast } from "@/lib/toast";

import { ReportsTable } from "./reportsTable";

export default function AdminDashboardPage() {
  const [publications, setPublications] = useState<AdminPublication[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminPublication | null>(null);

  const loadPublications = () => {
    setLoadError(false);
    adminApi
      .get<AdminPublication[]>("/admin/publications")
      .then(setPublications)
      .catch((err) => {
        setLoadError(true);
        toast.danger(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar las publicaciones.",
        );
      });
  };

  useEffect(loadPublications, []);

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeletingId(pendingDelete.id);
    try {
      await adminApi.delete(`/admin/publications/${pendingDelete.id}`);
      setPublications((prev) => prev?.filter((p) => p.id !== pendingDelete.id) ?? null);
      toast.success("Publicación eliminada.");
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo eliminar la publicación.",
      );
    } finally {
      setDeletingId(null);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Publicaciones</h1>
          {/* <p className="mt-1 text-sm text-muted">
            Reportajes y galerías publicados.
          </p> */}
        </div>
        <Link
          className={buttonVariants({ variant: "primary" })}
          to="/system/admin/publications/new"
        >
          <PlusIcon size={16} />
          Nueva publicación
        </Link>
      </div>

      {publications === null && !loadError && (
        <p className="mt-8 text-sm text-muted">Cargando…</p>
      )}

      {publications === null && loadError && (
        <p className="mt-8 text-sm text-muted">
          No se pudieron cargar las publicaciones.
        </p>
      )}

      {publications?.length === 0 && (
        <p className="mt-8 text-sm text-muted">
          Todavía no hay publicaciones. Crea la primera con el botón de arriba.
        </p>
      )}

      {publications && publications.length > 0 && (
        <div className="mt-8">
          <ReportsTable deletingId={deletingId} publications={publications} onDelete={setPendingDelete} />
        </div>
      )}

      <ConfirmDialog
        description={`¿Eliminar "${pendingDelete?.title}"? Esta acción no se puede deshacer.`}
        isConfirming={deletingId === pendingDelete?.id}
        isOpen={pendingDelete !== null}
        title="Eliminar publicación"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
