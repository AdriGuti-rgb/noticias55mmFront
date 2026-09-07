import { Link } from "react-router-dom";

import { getTranslations } from "@/config/translations";
import { useLanguage } from "@/lib/language";
import DefaultLayout from "@/layouts/default";

export default function AboutPage() {
  const { language } = useLanguage();
  const t = getTranslations(language).about;

  return (
    <DefaultLayout>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.heading}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{t.paragraph1}</p>
          <p className="mt-4 max-w-2xl text-muted">{t.paragraph2}</p>

          <h2 className="mt-12 text-xl font-semibold tracking-tight">
            {t.timelineHeading}
          </h2>
          <ol className="mt-6 space-y-6 border-l border-separator pl-6">
            {t.timeline.map((item) => (
              <li key={item.year} className="relative">
                <span className="absolute left-[-1.65rem] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-sm font-semibold text-accent">{item.year}</p>
                <p className="mt-1 text-foreground/90">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="md:sticky md:top-24">
          <div className="aspect-4/5 w-full overflow-hidden rounded-xl">
            <img
              alt="Retrato del fotoperiodista"
              className="h-full w-full object-cover"
              src="/about.jpg"
            />
          </div>
          <Link
            className="button button--primary button--md mt-6 flex w-full justify-center rounded-full"
            to="/contacto"
          >
            {t.contactCta}
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
