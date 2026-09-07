import { Navigate, Outlet } from "react-router-dom";

import { LoadingIndicator } from "@/components/loading-indicator";
import { useAdminAuth } from "@/lib/admin-auth";

export function RequireAdminAuth() {
  const { status } = useAdminAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted">
        <LoadingIndicator label="Cargando…" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/system/admin/login" replace />;
  }

  return <Outlet />;
}
