import { Button } from "@heroui/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";

import { LogOutIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { useAdminAuth } from "@/lib/admin-auth";

const ROLE_LABELS: Record<string, string> = {
  developer: "Desarrollador",
  photographer: "Fotógrafo",
};

const NAV_LINK_CLASS = "text-sm transition-colors";

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const { pathname } = useLocation();

  const isPublicationsActive =
    pathname === "/system/admin" ||
    pathname.startsWith("/system/admin/publications");
  const isCategoriesActive = pathname.startsWith("/system/admin/categories");
  const isCommentsActive = pathname.startsWith("/system/admin/comments");
  const isUsersActive = pathname.startsWith("/system/admin/users");
  const isAnalyticsActive = pathname.startsWith("/system/admin/analytics");

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
          <nav className="flex items-center gap-4">
            <Link
              className={clsx(
                NAV_LINK_CLASS,
                isPublicationsActive
                  ? "text-accent font-semibold"
                  : "text-muted hover:text-accent",
              )}
              to="/system/admin"
            >
              Publicaciones
            </Link>
            <Link
              className={clsx(
                NAV_LINK_CLASS,
                isCategoriesActive
                  ? "text-accent font-semibold"
                  : "text-muted hover:text-accent",
              )}
              to="/system/admin/categories"
            >
              Categorías
            </Link>
            <Link
              className={clsx(
                NAV_LINK_CLASS,
                isCommentsActive
                  ? "text-accent font-semibold"
                  : "text-muted hover:text-accent",
              )}
              to="/system/admin/comments"
            >
              Comentarios
            </Link>
            <Link
              className={clsx(
                NAV_LINK_CLASS,
                isAnalyticsActive
                  ? "text-accent font-semibold"
                  : "text-muted hover:text-accent",
              )}
              to="/system/admin/analytics"
            >
              Analíticas
            </Link>
            {user?.role.name === "developer" && (
              <Link
                className={clsx(
                  NAV_LINK_CLASS,
                  isUsersActive
                    ? "text-accent font-semibold"
                    : "text-muted hover:text-accent",
                )}
                to="/system/admin/users"
              >
                Usuarios
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-4">
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
