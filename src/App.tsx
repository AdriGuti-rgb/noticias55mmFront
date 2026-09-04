import { useEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import ReportajesPage from "@/pages/reportajes";
import AboutPage from "@/pages/about";
import ContactoPage from "@/pages/contacto";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminPublicationFormPage from "@/pages/admin/publication-form";
import AdminCategoriesPage from "@/pages/admin/categories";
import AdminUsersPage from "@/pages/admin/users";
import AdminCommentsPage from "@/pages/admin/comments";
import AdminLayout from "@/layouts/admin";
import { RequireAdminAuth } from "@/components/admin/require-admin-auth";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { LanguageProvider } from "@/lib/language";

/**
 * Envuelve las rutas públicas en `LanguageProvider` desde un nivel por encima
 * de las propias páginas (`IndexPage`, `ReportajesPage`...) — necesario
 * porque esas páginas llaman a `useLanguage()` dentro de su propio cuerpo de
 * función para traducir textos, y un hook solo puede leer un contexto
 * provisto por un antepasado en el árbol de fibra de React, nunca por un
 * componente que la propia página renderiza como hijo suyo (como pasaba
 * poniendo el Provider dentro de `DefaultLayout`, que las páginas renderizan
 * ellas mismas). El panel de administración no usa este contexto — siempre
 * en español, ver CLAUDE.md.
 */
function PublicLayout() {
  return (
    <LanguageProvider>
      <Outlet />
    </LanguageProvider>
  );
}

/**
 * El panel de administración siempre se ve en modo oscuro, sin importar el
 * ThemeSwitch del sitio público.
 *
 * Antes esto se hacía con un `<div className="dark">` envolviendo las rutas
 * del panel, apoyándose en que las variables CSS de globals.css se
 * re-cascadean desde cualquier ancestro con esa clase. **Eso se rompe con
 * cualquier componente que use un portal** (Modal, Popover, Tooltip, Menu...
 * de HeroUI/react-aria-components renderizan a `document.body`, fuera de ese
 * div) — se descubrió con `AlertDialog`, que salía en modo claro (fondo
 * blanco) pese a estar "dentro" del wrapper oscuro en el árbol de React.
 *
 * Por eso ahora se aplica `.dark`/`data-theme="dark"` directamente en
 * `<html>` (via `document.documentElement`) mientras se está en
 * `/system/admin/*`, restaurando el valor previo al salir — así CUALQUIER
 * portal, presente o futuro, cuelga de `<html>` igual que el resto de la
 * página y hereda el tema oscuro correctamente. `useTheme` (ver
 * `theme-switch.tsx`) hace exactamente lo mismo para el sitio público, así
 * que este es el mismo mecanismo, solo forzado en vez de basado en
 * preferencia del usuario.
 */
function AdminAuthLayout() {
  useEffect(() => {
    const root = document.documentElement;
    const previousClassName = root.className;
    const previousTheme = root.getAttribute("data-theme");

    root.classList.remove("light");
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");

    return () => {
      root.className = previousClassName;
      if (previousTheme === null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", previousTheme);
    };
  }, []);

  return (
    <div className="contents text-foreground">
      <AdminAuthProvider>
        <Outlet />
      </AdminAuthProvider>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<IndexPage />} path="/" />
        <Route element={<ReportajesPage />} path="/reportajes" />
        <Route element={<AboutPage />} path="/sobre-mi" />
        <Route element={<ContactoPage />} path="/contacto" />
      </Route>

      <Route element={<AdminAuthLayout />} path="/system/admin">
        <Route element={<AdminLoginPage />} path="login" />
        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route
              element={<AdminPublicationFormPage />}
              path="publications/new"
            />
            <Route
              element={<AdminPublicationFormPage />}
              path="publications/:id"
            />
            <Route element={<AdminCategoriesPage />} path="categories" />
            <Route element={<AdminCommentsPage />} path="comments" />
            <Route element={<AdminUsersPage />} path="users" />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
