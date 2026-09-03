import { useEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import ReportajesPage from "@/pages/reportajes";
import AboutPage from "@/pages/about";
import ContactoPage from "@/pages/contacto";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminPublicationFormPage from "@/pages/admin/publication-form";
import AdminLayout from "@/layouts/admin";
import { RequireAdminAuth } from "@/components/admin/require-admin-auth";
import { AdminAuthProvider } from "@/lib/admin-auth";

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
      <Route element={<IndexPage />} path="/" />
      <Route element={<ReportajesPage />} path="/reportajes" />
      <Route element={<AboutPage />} path="/sobre-mi" />
      <Route element={<ContactoPage />} path="/contacto" />

      <Route element={<AdminAuthLayout />} path="/system/admin">
        <Route element={<AdminLoginPage />} path="login" />
        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminLayout />}>
            <Route element={<AdminDashboardPage />} index />
            <Route element={<AdminPublicationFormPage />} path="publications/new" />
            <Route element={<AdminPublicationFormPage />} path="publications/:id" />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
