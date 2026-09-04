import clsx from "clsx";

import { useLanguage } from "@/lib/language";
import { SpainFlagIcon, UnitedKingdomFlagIcon } from "@/components/icons";

export interface LanguageSwitchProps {
  className?: string;
}

const FLAG_BUTTON_CLASS =
  "flex items-center justify-center rounded-sm overflow-hidden transition-opacity cursor-pointer ring-offset-2 ring-offset-background";

export const LanguageSwitch = ({ className }: LanguageSwitchProps) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      <button
        aria-label="Español"
        aria-pressed={language === "es"}
        className={clsx(
          FLAG_BUTTON_CLASS,
          language === "es"
            ? "opacity-100"
            : "opacity-50 hover:opacity-80",
        )}
        type="button"
        onClick={() => setLanguage("es")}
      >
        <SpainFlagIcon size={20} />
      </button>
      <button
        aria-label="English"
        aria-pressed={language === "en"}
        className={clsx(
          FLAG_BUTTON_CLASS,
          language === "en"
            ? "opacity-100"
            : "opacity-50 hover:opacity-80",
        )}
        type="button"
        onClick={() => setLanguage("en")}
      >
        <UnitedKingdomFlagIcon size={20} />
      </button>
    </div>
  );
};
