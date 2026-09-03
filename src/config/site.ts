export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Noticias en 55mm",
  tagline: "Fotoperiodismo",
  description:
    "Historias reales contadas a través de la imagen. Reportajes documentales sobre las personas y los lugares que no salen en los titulares.",
  navItems: [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Reportajes",
      href: "/reportajes",
    },
    {
      label: "Sobre mí",
      href: "/sobre-mi",
    },
    {
      label: "Contacto",
      href: "/contacto",
    },
  ],
  links: {
    instagram: "https://instagram.com",
    twitter: "https://x.com",
    email: "mailto:noticiasEn55mm@gmail.com",
  },
};
