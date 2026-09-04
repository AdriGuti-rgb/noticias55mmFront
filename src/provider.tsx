import { I18nProvider } from "react-aria-components";
import { Toast } from "@heroui/react";

/**
 * Fuerza el locale de `react-aria-components` a español, independientemente
 * del idioma configurado en el navegador/SO de quien visite la web — el sitio
 * es 100% en español (ver CLAUDE.md), pero componentes como `DatePicker`
 * (día/mes/año, nombres de mes y de día de la semana) toman el locale del
 * navegador por defecto si no se fuerza aquí, lo que hacía que un admin con
 * el navegador en inglés viera "mm/dd/yyyy" en vez de "dd/mm/aaaa".
 *
 * `Toast.Provider` se monta una única vez aquí (cubre tanto el sitio público
 * como el panel de administración): usa por defecto la cola global del
 * objeto `toast` importado de `@heroui/react`, así que basta con llamar a
 * `toast.success(...)`/`toast.danger(...)` desde cualquier componente para
 * que aparezca — no hace falta ningún hook ni contexto adicional.
 */
export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider locale="es-ES">
      {children}
      <Toast.Provider placement="bottom end" className="z-50" />
    </I18nProvider>
  );
}
