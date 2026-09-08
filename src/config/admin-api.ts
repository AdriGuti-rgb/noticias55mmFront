const TOKEN_KEY = "berto_admin_token";

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage no disponible (modo privado, navegador antiguo, etc.)
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit, auth: boolean): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAdminToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`/api${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body?.message === "string") message = body.message;
      else if (Array.isArray(body?.message)) message = body.message.join(", ");
    } catch {
      // sin cuerpo JSON legible
    }
    throw new ApiError(message, response.status);
  }

  // Los DELETE del backend devuelven 200 (no 204) con cuerpo vacío (`remove()` no retorna nada):
  // `response.json()` sobre un cuerpo vacío lanza un SyntaxError, así que se lee como texto primero.
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const publicApi = {
  get: <T>(path: string): Promise<T> => request<T>(path, { method: "GET" }, false),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, false),
};

export const adminApi = {
  get: <T>(path: string): Promise<T> => request<T>(path, { method: "GET" }, true),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(
      path,
      { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) },
      true,
    ),
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, true),
  delete: <T>(path: string): Promise<T> => request<T>(path, { method: "DELETE" }, true),
};

export type AdminRoleName = "developer" | "photographer";

export interface AdminUser {
  id: string;
  email: string;
  isActive: boolean;
  role: { id: string; name: AdminRoleName };
  profile?: {
    displayName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    featured: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  /** URL de la imagen subida (`/uploads/...`), no una clave fija de icono. */
  icon?: string | null;
  isActive: boolean;
}

export type PublicationType = "solo" | "event";
export type PublicationStatus = "draft" | "published";

export interface PublicationPhoto {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  caption?: string | null;
  position: number;
}

export type CommentStatus = "unread" | "read";

export interface AdminComment {
  id: string;
  message: string;
  contact?: string | null;
  status: CommentStatus;
  emailSent: boolean;
  publication?: { id: string; slug: string; title: string } | null;
  resolvedBy?: { id: string; email: string } | null;
  createdAt: string;
}

export interface RelatedPublicationSummary {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  category?: { slug: string; name: string; nameEn?: string | null } | null;
  photos?: { url: string }[];
}

export interface AdminPublication {
  id: string;
  slug: string;
  title: string;
  titleEn?: string | null;
  subtitle?: string | null;
  subtitleEn?: string | null;
  /** Opcional: muchas galerías "en solitario" no llevan texto/noticia asociado. */
  body?: string | null;
  bodyEn?: string | null;
  category: Category;
  location?: string | null;
  /** Fecha del reportaje (YYYY-MM-DD), no cuándo se publicó en el sitio (ver `publishedAt`). */
  date?: string | null;
  type: PublicationType;
  status: PublicationStatus;
  publishedAt?: string | null;
  viewCount?: number;
  photos: PublicationPhoto[];
  relatedPublications?: RelatedPublicationSummary[];
  createdAt: string;
  updatedAt: string;
}
