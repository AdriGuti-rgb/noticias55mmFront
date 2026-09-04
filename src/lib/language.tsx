import { createContext, useContext, useState } from "react";

export type Language = "es" | "en";

const STORAGE_KEY = "berto_language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "es" || stored === "en") return stored;
  } catch {
    // localStorage no disponible (modo privado, navegador antiguo, etc.)
  }

  return "es";
}

/**
 * Se monta dentro de `DefaultLayout` (sitio público), no a nivel de toda la
 * app: el panel de administración es siempre en español (ver CLAUDE.md) y no
 * usa este contexto, así que no hace falta ningún mecanismo de "restaurar al
 * salir" como el que fuerza el modo oscuro del panel.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage no disponible
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);

  if (!ctx) {
    throw new Error("useLanguage debe usarse dentro de <LanguageProvider>");
  }

  return ctx;
}

/** Elige el campo `*En` si el idioma es inglés y ese campo existe; si no, cae al campo en español. */
export function localized(
  language: Language,
  es: string | null | undefined,
  en: string | null | undefined,
): string {
  if (language === "en" && en) return en;

  return es ?? "";
}
