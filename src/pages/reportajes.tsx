import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import { AdminPublication, ApiError, Category, publicApi } from "@/config/admin-api";
import { CameraIcon, RefreshIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

function truncate(text: string, maxLength: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= maxLength) return flat;
  return `${flat.slice(0, maxLength).trimEnd()}…`;
}

/** `publication.date` es una fecha sin hora (YYYY-MM-DD): construirla en local evita que
 * `new Date(string)` (que la interpreta en UTC) la muestre un día antes según el huso horario. */
function formatEventDate(value?: string | null): string | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(
    date,
  );
}

function formatPublishedDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const formatted = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
    date,
  );
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function ReportajesPage() {
  const [publications, setPublications] = useState<AdminPublication[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPublications = useCallback(() => {
    setIsRefreshing(true);
    return publicApi
      .get<AdminPublication[]>("/publications")
      .then(setPublications)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los reportajes."),
      )
      .finally(() => setIsRefreshing(false));
  }, []);

  useEffect(() => {
    loadPublications();
    publicApi
      .get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => undefined);
  }, [loadPublications]);

  const filteredPublications = useMemo(() => {
    if (!publications) return [];
    if (!activeCategorySlug) return publications;
    return publications.filter((p) => p.category.slug === activeCategorySlug);
  }, [publications, activeCategorySlug]);

  return (
    <DefaultLayout>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Reportajes
            </h1>
            <p className="mt-3 max-w-xl text-muted">
              Historias documentales de largo formato, ordenadas por tema.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full border border-separator px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            disabled={isRefreshing}
            type="button"
            onClick={loadPublications}
          >
            <RefreshIcon className={clsx(isRefreshing && "animate-spin")} size={16} />
            {isRefreshing ? "Actualizando…" : "Actualizar"}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            className={clsx(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              activeCategorySlug === null
                ? "border-accent bg-accent text-accent-foreground"
                : "border-separator text-foreground hover:border-accent hover:text-accent",
            )}
            onClick={() => setActiveCategorySlug(null)}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={clsx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                activeCategorySlug === category.slug
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-separator text-foreground hover:border-accent hover:text-accent",
              )}
              onClick={() => setActiveCategorySlug(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {error && <p className="mt-8 text-sm text-danger">{error}</p>}

        {publications === null && !error && (
          <p className="mt-8 text-sm text-muted">Cargando reportajes…</p>
        )}

        {publications !== null && filteredPublications.length === 0 && !error && (
          <p className="mt-8 text-sm text-muted">
            Todavía no hay reportajes publicados en esta categoría.
          </p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPublications.map((publication) => {
            const cover = publication.photos[0]?.url;
            const date =
              formatEventDate(publication.date) ?? formatPublishedDate(publication.publishedAt);
            const meta = [publication.location, date].filter(Boolean).join(" · ");

            return (
              <a
                key={publication.slug}
                className="group block"
                href={`#${publication.slug}`}
                id={publication.slug}
              >
                <div className="aspect-4/3 w-full overflow-hidden rounded-xl bg-surface-secondary">
                  {cover ? (
                    <img
                      alt={publication.title}
                      className="h-full w-full object-cover grayscale-15 transition-transform duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0"
                      src={cover}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CameraIcon className="text-muted" size={32} />
                    </div>
                  )}
                </div>
                <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wide text-accent">
                  {publication.category.name}
                </span>
                <h2 className="mt-1 text-lg font-semibold tracking-tight group-hover:text-accent transition-colors">
                  {publication.title}
                </h2>
                {meta && <p className="mt-1 text-sm text-muted">{meta}</p>}
                {publication.body && (
                  <p className="mt-2 text-sm text-foreground/80">
                    {truncate(publication.body, 160)}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      </section>
    </DefaultLayout>
  );
}
