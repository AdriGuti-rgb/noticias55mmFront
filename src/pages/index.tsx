import { useEffect, useState } from "react";
import { Button, Skeleton } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";

import { AdminPublication, publicApi } from "@/config/admin-api";
import { getTranslations } from "@/config/translations";
import { localized, useLanguage } from "@/lib/language";
import { ArrowRightIcon, CameraIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

const FEATURED_COUNT = 3;

export default function IndexPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getTranslations(language).home;
  const [publications, setPublications] = useState<AdminPublication[] | null>(
    null,
  );

  useEffect(() => {
    publicApi
      .get<AdminPublication[]>(`/publications?sort=popular&limit=${FEATURED_COUNT}`)
      .then(setPublications)
      .catch(() =>
        publicApi
          .get<AdminPublication[]>("/publications")
          .then((all) =>
            setPublications(
              [...all].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)),
            ),
          )
          .catch(() => undefined),
      );
  }, []);

  const featured = (publications ?? []).slice(0, FEATURED_COUNT);

  return (
    <DefaultLayout>
      <section className="relative flex h-[85vh] min-h-130 w-full items-end overflow-hidden bg-black">
        <img
          alt="Reportaje fotográfico destacado"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
          src="/image_dashboard.jpg"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-black/10" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            {t.badge}
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/80">
            {t.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="button button--primary button--md rounded-full"
              to="/reportajes"
            >
              {t.ctaReportajes}
            </Link>
            <Link
              className="button button--tertiary button--md rounded-full"
              to="/sobre-mi"
            >
              {t.ctaSobreMi}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.featuredHeading}
            </h2>
            <p className="mt-2 text-muted">{t.featuredSubheading}</p>
          </div>
          <Link
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            to="/reportajes"
          >
            {t.viewAll} <ArrowRightIcon size={16} />
          </Link>
        </div>

        {publications === null ? (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="aspect-4/3 w-full rounded-xl" />
                <Skeleton className="mt-4 h-3 w-20 rounded" />
                <Skeleton className="mt-2 h-5 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="mt-8 text-sm text-muted">{t.emptyFeatured}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            {featured.map((publication) => {
              const cover = publication.photos[0]?.url;
              const title = localized(
                language,
                publication.title,
                publication.titleEn,
              );
              const subtitle = localized(
                language,
                publication.subtitle,
                publication.subtitleEn,
              );

              return (
                <Link
                  key={publication.slug}
                  className="group block"
                  to={`/reportajes/${publication.slug}`}
                >
                  <div className="aspect-4/3 w-full overflow-hidden rounded-xl bg-surface-secondary">
                    {cover ? (
                      <img
                        alt={title}
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
                    {localized(
                      language,
                      publication.category.name,
                      publication.category.nameEn,
                    )}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight group-hover:text-accent transition-colors">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-y border-separator bg-surface-secondary">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div className="aspect-4/5 w-full max-w-md overflow-hidden rounded-xl">
            <img
              alt="Retrato del fotoperiodista"
              className="h-full w-full object-cover"
              src="https://picsum.photos/seed/contraluz-portrait/800/1000"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.portraitHeading}
            </h2>
            <p className="mt-4 max-w-lg text-muted">{t.portraitText}</p>
            <Link
              className="button button--primary button--md mt-6 inline-flex rounded-full"
              to="/sobre-mi"
            >
              {t.portraitCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t.ctaSectionHeading}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted">{t.ctaSectionText}</p>
        <div className="mt-6">
          <Button
            className="rounded-full"
            variant="primary"
            onPress={() => navigate("/contacto")}
          >
            {t.ctaSectionButton}
          </Button>
        </div>
      </section>
    </DefaultLayout>
  );
}
