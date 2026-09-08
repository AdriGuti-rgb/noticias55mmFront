import type { Language } from "@/lib/language";

export const translations = {
  es: {
    nav: {
      inicio: "Inicio",
      reportajes: "Reportajes",
      sobreMi: "Sobre mí",
      contacto: "Contacto",
    },
    home: {
      badge: "Fotoperiodismo",
      heroTitle: "Donde la mejor fuente es el sensor de la cámara.",
      heroSubtitle: "Reportajes que solo una cámara puede contar.",
      ctaReportajes: "Ver reportajes",
      ctaSobreMi: "Sobre mí",
      featuredHeading: "Reportajes destacados",
      featuredSubheading: "Una selección de los últimos trabajos publicados.",
      viewAll: "Ver todos",
      emptyFeatured: "Todavía no hay reportajes publicados.",
      portraitHeading: "Diez años documentando lo que otros pasan por alto",
      portraitText:
        "Mi trabajo se mueve entre el reportaje social y el documental de largo aliento, con publicaciones en medios nacionales e internacionales y varios premios de fotografía de prensa.",
      portraitCta: "Conoce mi trabajo",
      ctaSectionHeading: "¿Tienes una historia que contar?",
      ctaSectionText:
        "Disponible para reportajes por encargo, medios y proyectos editoriales de largo formato.",
      ctaSectionButton: "Hablemos",
    },
    reportajes: {
      heading: "Reportajes",
      subheading:
        "Historias documentales de largo formato, ordenadas por tema.",
      refresh: "Actualizar",
      refreshing: "Actualizando…",
      all: "Todos",
      loading: "Cargando reportajes…",
      emptyCategory: "Todavía no hay reportajes publicados en esta categoría.",
    },
    about: {
      heading: "Sobre mí",
      paragraph1:
        "Periodista y fotografo freelancer, especializado en reportajes sociales, culturales y deportivos. Desde hace años recorro distintas ciudades con el objetivo de capturar distintas sensaciones y colores con un estilo naturalista. ",
      paragraph2:
        "Creo en un fotoperiodismo pausado: pasar tiempo con las personas antes de levantar la cámara, volver varias veces al mismo lugar y dejar que la historia se cuente sola. Mi trabajo se ha publicado en medios nacionales e internacionales y ha recibido varios reconocimientos de prensa.",
      timelineHeading: "Trayectoria",
      contactCta: "Contactar",
      timeline: [
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
      ],
    },
    contacto: {
      heading: "Contacto",
      description:
        "Disponible para reportajes por encargo, colaboraciones con medios y proyectos editoriales de largo formato.",
      formName: "Nombre",
      formNamePlaceholder: "Tu nombre",
      formEmail: "Correo electrónico",
      formEmailPlaceholder: "tu@correo.com",
      formSubject: "Asunto",
      formSubjectPlaceholder: "Encargo de reportaje, colaboración...",
      formMessage: "Mensaje",
      formMessagePlaceholder: "Cuéntame sobre tu proyecto",
      submit: "Enviar mensaje",
      submitting: "Enviando…",
      success: "¡Gracias! Tu mensaje ha llegado al fotógrafo.",
      error: "No se pudo enviar. Inténtalo de nuevo más tarde.",
    },
    footer: {
      rights: "Todos los derechos reservados.",
      tagline: "Reportajes documentales · fotografía de autor",
    },
    developerComment: {
      toggleOpen: "Comentar al desarrollador",
      toggleClose: "Ocultar",
      disclaimer:
        "Este comentario no se publica en la web: llega directamente al desarrollador.",
      contactLabel: "Tu contacto (opcional)",
      contactPlaceholder: "tu@correo.com",
      messageLabel: "Comentario",
      messagePlaceholder: "Cuéntanos qué falla o qué te gustaría ver",
      submit: "Enviar comentario",
      submitting: "Enviando…",
      success: "¡Gracias! Comentario enviado.",
      error: "No se pudo enviar. Inténtalo de nuevo más tarde.",
    },
    publicationDetail: {
      back: "Volver a reportajes",
      related: "También te puede interesar",
      notFound: "No se pudo cargar el reportaje.",
    },
  },
  en: {
    nav: {
      inicio: "Home",
      reportajes: "Stories",
      sobreMi: "About",
      contacto: "Contact",
    },
    home: {
      badge: "Photojournalism",
      heroTitle: "Where the best source is the camera's sensor.",
      heroSubtitle: "Stories only a camera can tell.",
      ctaReportajes: "View stories",
      ctaSobreMi: "About me",
      featuredHeading: "Featured stories",
      featuredSubheading: "A selection of the latest published work.",
      viewAll: "View all",
      emptyFeatured: "No stories have been published yet.",
      portraitHeading: "Ten years documenting what others overlook",
      portraitText:
        "My work moves between social reportage and long-form documentary, with publications in national and international outlets and several press photography awards.",
      portraitCta: "See my work",
      ctaSectionHeading: "Have a story to tell?",
      ctaSectionText:
        "Available for commissioned stories, media collaborations and long-form editorial projects.",
      ctaSectionButton: "Let's talk",
    },
    reportajes: {
      heading: "Stories",
      subheading: "Long-form documentary stories, organized by topic.",
      refresh: "Refresh",
      refreshing: "Refreshing…",
      all: "All",
      loading: "Loading stories…",
      emptyCategory: "No stories have been published in this category yet.",
    },
    about: {
      heading: "About me",
      paragraph1:
        "I'm a photojournalist specializing in social reportage and long-form documentary. For more than ten years I've traveled through rural and urban communities to tell, from within, stories that rarely make the front page.",
      paragraph2:
        "I believe in a slower kind of photojournalism: spending time with people before picking up the camera, returning to the same place several times, and letting the story tell itself. My work has been published in national and international outlets and has received several press awards.",
      timelineHeading: "Timeline",
      contactCta: "Get in touch",
      timeline: [
        {
          year: "2024 — today",
          text: "Regular contributor of long-form stories for national media.",
        },
        {
          year: "2021",
          text: "National press photography award for the story «Invisible Borders».",
        },
        {
          year: "2018",
          text: "First documentary work published, on the closure of the mining industry.",
        },
        {
          year: "2015",
          text: "Started as a freelance photographer covering local news.",
        },
      ],
    },
    contacto: {
      heading: "Contact",
      description:
        "Available for commissioned stories, media collaborations and long-form editorial projects.",
      formName: "Name",
      formNamePlaceholder: "Your name",
      formEmail: "Email",
      formEmailPlaceholder: "you@email.com",
      formSubject: "Subject",
      formSubjectPlaceholder: "Story commission, collaboration...",
      formMessage: "Message",
      formMessagePlaceholder: "Tell me about your project",
      submit: "Send message",
      submitting: "Sending…",
      success: "Thanks! Your message has reached the photographer.",
      error: "Couldn't send it. Please try again later.",
    },
    footer: {
      rights: "All rights reserved.",
      tagline: "Documentary stories · author photography",
    },
    developerComment: {
      toggleOpen: "Comment to the developer",
      toggleClose: "Hide",
      disclaimer:
        "This comment isn't published on the site: it goes straight to the developer.",
      contactLabel: "Your contact (optional)",
      contactPlaceholder: "you@email.com",
      messageLabel: "Comment",
      messagePlaceholder: "Tell us what's broken or what you'd like to see",
      submit: "Send comment",
      submitting: "Sending…",
      success: "Thanks! Comment sent.",
      error: "Couldn't send it. Please try again later.",
    },
    publicationDetail: {
      back: "Back to stories",
      related: "You might also like",
      notFound: "The story couldn't be loaded.",
    },
  },
} as const satisfies Record<Language, unknown>;

export function getTranslations(language: Language) {
  return translations[language];
}
