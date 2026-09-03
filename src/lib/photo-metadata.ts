import exifr from "exifr";

export type PhotoMetadata = Record<string, unknown>;

/** Lee los EXIF de una imagen (archivo local antes de subir, o URL ya subida). */
export async function readPhotoMetadata(source: File | string): Promise<PhotoMetadata | null> {
  try {
    const data = await exifr.parse(source, { gps: true, tiff: true, exif: true });
    return data ?? null;
  } catch {
    return null;
  }
}

/** `DateTimeOriginal` (u otra fecha EXIF) como YYYY-MM-DD para el <input type="date">. */
export function metadataToDateInput(metadata: PhotoMetadata): string | null {
  const value = metadata.DateTimeOriginal ?? metadata.CreateDate ?? metadata.ModifyDate;
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convierte coordenadas GPS a un texto de ubicación legible ("Valencia, España")
 * vía la API pública de Nominatim (OpenStreetMap) — no hace falta clave, pero es
 * una llamada a un tercero: solo se dispara cuando el EXIF trae GPS de verdad.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=es`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const address = data.address ?? {};
    const place = address.city ?? address.town ?? address.village ?? address.municipality;
    const country = address.country;
    return [place, country].filter(Boolean).join(", ") || data.display_name || null;
  } catch {
    return null;
  }
}

/** Da forma legible a un valor de metadato cualquiera para listarlo en pantalla. */
export function formatMetadataValue(value: unknown): string {
  if (value instanceof Date) return value.toLocaleString("es-ES");
  if (value instanceof Uint8Array || Array.isArray(value)) return `[${value.length} valores]`;
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}
