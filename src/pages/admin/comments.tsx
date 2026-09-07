import { useCallback, useEffect, useState } from "react";
import { CommentsTable } from "./commentsTable";

import { adminApi, AdminComment, ApiError } from "@/config/admin-api";
import { LoadingIndicator } from "@/components/loading-indicator";
import { toast } from "@/lib/toast";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadComments = useCallback(() => {
    setIsRefreshing(true);
    setLoadError(false);

    return adminApi
      .get<AdminComment[]>("/admin/comments")
      .then(setComments)
      .catch((err) => {
        setLoadError(true);
        toast.danger(
          err instanceof ApiError
            ? err.message
            : "No se pudieron cargar los comentarios.",
        );
      })
      .finally(() => setIsRefreshing(false));
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const toggleStatus = async (comment: AdminComment) => {
    setUpdatingId(comment.id);
    const nextStatus = comment.status === "unread" ? "read" : "unread";

    try {
      const updated = await adminApi.patch<AdminComment>(
        `/admin/comments/${comment.id}/${nextStatus}`,
      );

      setComments(
        (prev) => prev?.map((c) => (c.id === updated.id ? updated : c)) ?? null,
      );
      toast.success(
        nextStatus === "read"
          ? "Marcado como leído."
          : "Marcado como no leído.",
      );
    } catch (err) {
      toast.danger(
        err instanceof ApiError
          ? err.message
          : "No se pudo actualizar el comentario.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Comentarios
          </h1>
          {/* <p className="mt-1 text-sm text-muted">
            Mensajes recibidos del público. Solo ves los que van dirigidos a tu
            rol.
          </p> */}
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-separator px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          disabled={isRefreshing}
          type="button"
          onClick={loadComments}
        >
          {isRefreshing ? (
            <LoadingIndicator label="Actualizando…" />
          ) : (
            "Actualizar"
          )}
        </button>
      </div>

      {comments === null && !loadError && (
        <p className="mt-8 text-sm text-muted">
          <LoadingIndicator label="Cargando…" />
        </p>
      )}

      {comments === null && loadError && (
        <p className="mt-8 text-sm text-muted">
          No se pudieron cargar los comentarios.
        </p>
      )}

      {comments?.length === 0 && (
        <p className="mt-8 text-sm text-muted">
          Todavía no has recibido ningún comentario.
        </p>
      )}

      {comments !== null && comments.length > 0 && (
        <div className="mt-6">
          <CommentsTable
            comments={comments}
            updatingId={updatingId}
            onToggleStatus={toggleStatus}
          />
        </div>
      )}
    </div>
  );
}
