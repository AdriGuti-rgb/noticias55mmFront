import { Navbar } from "@/components/navbar";
import { DeveloperCommentForm } from "@/components/developer-comment-form";
import { siteConfig } from "@/config/site";
import { getTranslations } from "@/config/translations";
import { useLanguage } from "@/lib/language";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  const t = getTranslations(language).footer;

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="w-full border-t border-separator">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. {t.rights}
          </p>
          <p className="text-muted">{t.tagline}</p>
        </div>
        <DeveloperCommentForm />
      </footer>
    </div>
  );
}
