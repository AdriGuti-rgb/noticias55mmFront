import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Skeleton } from "@heroui/react";

import { AdminPublication, ApiError, publicApi } from "@/config/admin-api";
import { getTranslations } from "@/config/translations";
import { formatPublicationDate } from "@/lib/date-format";
import { localized, useLanguage } from "@/lib/language";
import { ArrowLeftIcon, CameraIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

function DetailSkeleton() {
  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <Skeleton className="h-4 w-32 rounded" />
      <Skeleton className="mt-6 aspect-16/9 w-full rounded-xl" />
      <Skeleton className="mt-6 h-3 w-24 rounded" />
      <Skeleton className="mt-2 h-9 w-3/4 rounded" />
      <Skeleton className="mt-3 h-5 w-1/2 rounded" />
      <Skeleton className="mt-6 h-32 w-full rounded" />
    </article>
  );
}

export default function PublicationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const t = getTranslations(language).publicationDetail;
  const [publication, setPublication] = useState<AdminPublication | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setPublication(null);
    setError(null);

    publicApi
      .get<AdminPublication>(`/publications/${slug}`)
      .then(setPublication)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : t.notFound),
      );
  }, [slug, t.notFound]);

  if (error) {
    return (
      <DefaultLayout>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Link className="text-sm text-accent hover:underline" to="/reportajes">
            <ArrowLeftIcon className="mr-1 inline" size={14} />
            {t.back}
          </Link>
          <p className="mt-6 text-sm text-danger">{error}</p>
        </div>
      </DefaultLayout>
    );
  }

  if (!publication) {
    return (
      <DefaultLayout>
        <DetailSkeleton />
      </DefaultLayout>
    );
  }

  const title = localized(language, publication.title, publication.titleEn);
  const subtitle = localized(language, publication.subtitle, publication.subtitleEn);
  const body = localized(language, publication.body, publication.bodyEn);
  const categoryName = localized(
    language,
    publication.category.name,
    publication.category.nameEn,
  );
  const [cover, ...gallery] = publication.photos;
  const meta = [publication.location, formatPublicationDate(publication)]
    .filter(Boolean)
    .join(" · ");
  const related = publication.relatedPublications ?? [];

  return (
    <DefaultLayout>
      <article className="mx-auto max-w-4xl px-6 py-16">
        <Link className="text-sm text-accent hover:underline" to="/reportajes">
          <ArrowLeftIcon className="mr-1 inline" size={14} />
          {t.back}
        </Link>

        <div className="mt-6 aspect-16/9 w-full overflow-hidden rounded-xl bg-surface-secondary">
          {cover ? (
            <img
              alt={title}
              className="h-full w-full object-cover"
              src={cover.url}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CameraIcon className="text-muted" size={40} />
            </div>
          )}
        </div>

        <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-wide text-accent">
          {categoryName}
        </span>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-lg text-foreground/90">{subtitle}</p>
        )}
        {meta && <p className="mt-2 text-sm text-muted">{meta}</p>}

        {body && (
          <div className="mt-8 whitespace-pre-line text-foreground/80">
            {body}
          </div>
        )}

        {gallery.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square overflow-hidden rounded-lg bg-surface-secondary"
              >
                <img
                  alt={photo.caption ?? title}
                  className="h-full w-full object-cover"
                  src={photo.url}
                />
              </div>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-16 border-t border-separator pt-10">
            <h2 className="text-xl font-semibold tracking-tight">
              {t.related}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((item) => {
                const relatedTitle = localized(language, item.title, item.titleEn);
                const relatedCover = item.photos?.[0]?.url;

                return (
                  <Link
                    key={item.slug}
                    className="group block"
                    to={`/reportajes/${item.slug}`}
                  >
                    <div className="aspect-4/3 w-full overflow-hidden rounded-lg bg-surface-secondary">
                      {relatedCover ? (
                        <img
                          alt={relatedTitle}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={relatedCover}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <CameraIcon className="text-muted" size={24} />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground group-hover:text-accent">
                      {relatedTitle}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </DefaultLayout>
  );
}
