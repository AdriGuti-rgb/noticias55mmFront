import { Navbar } from "@/components/navbar";
import { DeveloperCommentForm } from "@/components/developer-comment-form";
import { siteConfig } from "@/config/site";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="w-full border-t border-separator">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los
            derechos reservados.
          </p>
          <p className="text-muted">
            Reportajes documentales · fotografía de autor
          </p>
        </div>
        <DeveloperCommentForm />
      </footer>
    </div>
  );
}
