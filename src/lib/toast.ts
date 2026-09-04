import { toast as heroToast } from "@heroui/react";

type ToastOptions = Parameters<typeof heroToast.success>[1];

/**
 * Todos los toasts de la web duran 5s (en vez de los 4s por defecto de
 * HeroUI) — envoltorio fino para no repetir `{ timeout: 5000 }` en cada
 * `toast.success`/`toast.danger` de la app. Usar siempre este módulo en vez
 * de importar `toast` directamente de `@heroui/react`.
 */
const DEFAULT_TIMEOUT = 5000;

function withDefaultTimeout(options?: ToastOptions): ToastOptions {
  return { timeout: DEFAULT_TIMEOUT, ...options };
}

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    heroToast.success(message, withDefaultTimeout(options)),
  danger: (message: string, options?: ToastOptions) =>
    heroToast.danger(message, withDefaultTimeout(options)),
  info: (message: string, options?: ToastOptions) =>
    heroToast.info(message, withDefaultTimeout(options)),
  warning: (message: string, options?: ToastOptions) =>
    heroToast.warning(message, withDefaultTimeout(options)),
};
