import { Button } from "@heroui/react";
import { Link, Outlet } from "react-router-dom";

import { LogOutIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { useAdminAuth } from "@/lib/admin-auth";

const ROLE_LABELS: Record<string, string> = {
  developer: "Desarrollador",
  photographer: "Fotógrafo",
};

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-separator">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-sm font-semibold tracking-tight text-foreground">
              {siteConfig.name} · Panel
            </p>
            {user && (
              <p className="text-xs text-muted">
                {user.profile?.displayName ?? user.email} ·{" "}
                {ROLE_LABELS[user.role.name] ?? user.role.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link
              className="text-sm text-muted hover:text-accent"
              to="/system/admin"
            >
              Publicaciones
            </Link>
            <Button size="sm" variant="secondary" onPress={logout}>
              <LogOutIcon size={16} />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
