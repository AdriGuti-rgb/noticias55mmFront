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
    instagram: "https://www.instagram.com/noticiasen55mm/",
    twitter: "https://x.com/noticiasen55mm?s=11",
    email: "mailto:noticiasen55mm@gmail.com",
    tiktok: "https://www.tiktok.com/@noticias55mm",
  },
};
