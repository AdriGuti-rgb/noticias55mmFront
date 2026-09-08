/**
 * Formato de fecha único para toda la web: DD/MM/AAAA y horas en 24h.
 * Siempre con opciones explícitas (nunca `dateStyle`/`timeStyle`, que varían
 * de forma implícita según el locale) para que el formato no cambie solo.
 */

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

/** Para fechas puras "YYYY-MM-DD" (columna `date`): evita el desfase de zona horaria de `new Date(str)`. */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "—";
  return formatDate(new Date(year, month - 1, day));
}

/** Fecha del reportaje (`date`) si existe; si no, fecha+hora de publicación (`publishedAt`). */
export function formatPublicationDate(pub: {
  date?: string | null;
  publishedAt?: string | null;
}): string {
  if (pub.date) return formatDateOnly(pub.date);
  return formatDateTime(pub.publishedAt);
}
