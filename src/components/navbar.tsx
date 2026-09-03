"use client";

import { useState } from "react";
import { Link } from "@heroui/react";
import { Link as RouterLink } from "react-router-dom";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { InstagramIcon, MailIcon, CameraIcon } from "@/components/icons";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/80 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <RouterLink className="flex items-center gap-2" to="/">
            <CameraIcon className="text-accent" size={26} />
            <span className="font-bold tracking-tight text-inherit">
              {siteConfig.name}
            </span>
          </RouterLink>
          <ul className="hidden lg:flex gap-6">
            {siteConfig.navItems.map((item) => (
              <li key={item.href}>
                <RouterLink
                  className={clsx(
                    "text-sm font-medium text-foreground hover:text-accent transition-colors",
                  )}
                  to={item.href}
                >
                  {item.label}
                </RouterLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <Link
            aria-label="Instagram"
            href={siteConfig.links.instagram}
            rel="noopener noreferrer"
            target="_blank"
          >
            <InstagramIcon className="text-muted hover:text-accent transition-colors" />
          </Link>
          <Link aria-label="Email" href={siteConfig.links.email}>
            <MailIcon className="text-muted hover:text-accent transition-colors" />
          </Link>
          <ThemeSwitch />
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <ThemeSwitch />
          <button
            aria-expanded={isMenuOpen}
            aria-label="Abrir menú"
            className="p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              ) : (
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="border-t border-separator sm:hidden">
          <ul className="flex flex-col gap-1 px-4 py-4">
            {siteConfig.navItems.map((item) => (
              <li key={item.href}>
                <RouterLink
                  className="block py-2 text-lg text-foreground no-underline"
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </RouterLink>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 px-4 pb-4">
            <Link
              aria-label="Instagram"
              href={siteConfig.links.instagram}
              rel="noopener noreferrer"
              target="_blank"
            >
              <InstagramIcon className="text-muted" />
            </Link>
            <Link aria-label="Email" href={siteConfig.links.email}>
              <MailIcon className="text-muted" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
