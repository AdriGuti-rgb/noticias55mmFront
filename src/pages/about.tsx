import { Link } from "react-router-dom";

import DefaultLayout from "@/layouts/default";

const timeline = [
  {
    year: "2024 — hoy",
    text: "Colaborador habitual en reportajes de largo formato para medios nacionales.",
  },
  {
    year: "2021",
    text: "Premio nacional de fotografía de prensa por el reportaje «Fronteras invisibles».",
  },
  {
    year: "2018",
    text: "Primer trabajo documental publicado, sobre el cierre de la industria minera.",
  },
  {
    year: "2015",
    text: "Inicios como fotógrafo freelance cubriendo actualidad local.",
  },
];

export default function AboutPage() {
  return (
    <DefaultLayout>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Sobre mí
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Soy fotoperiodista, especializado en reportaje social y
            documental de largo aliento. Durante más de diez años he
            recorrido comunidades rurales y urbanas para contar, desde
            dentro, historias que rara vez ocupan portada.
          </p>
          <p className="mt-4 max-w-2xl text-muted">
            Creo en un fotoperiodismo pausado: pasar tiempo con las personas
            antes de levantar la cámara, volver varias veces al mismo lugar y
            dejar que la historia se cuente sola. Mi trabajo se ha publicado
            en medios nacionales e internacionales y ha recibido varios
            reconocimientos de prensa.
          </p>

          <h2 className="mt-12 text-xl font-semibold tracking-tight">
            Trayectoria
          </h2>
          <ol className="mt-6 space-y-6 border-l border-separator pl-6">
            {timeline.map((item) => (
              <li key={item.year} className="relative">
                <span className="absolute left-[-1.65rem] top-1 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-sm font-semibold text-accent">
                  {item.year}
                </p>
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
              src="https://picsum.photos/seed/contraluz-portrait/800/1000"
            />
          </div>
          <Link
            className="button button--primary button--md mt-6 flex w-full justify-center rounded-full"
            to="/contacto"
          >
            Contactar
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
