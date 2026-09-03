import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Input, Label, TextField } from "@heroui/react";

import { CameraIcon, LogInIcon } from "@/components/icons";
import { ApiError } from "@/config/admin-api";
import { siteConfig } from "@/config/site";
import { useAdminAuth } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const { status, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate replace to="/system/admin" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/system/admin", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
          <CameraIcon className="text-accent" size={28} />
        </div>

        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-widest text-muted">
          {siteConfig.name}
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-foreground">
          Panel de administración
        </h1>
        <p className="mt-2 text-center text-sm text-muted">
          Acceso restringido al desarrollador y al fotógrafo.
        </p>

        <div className="mt-8 rounded-2xl border border-separator bg-surface p-6 shadow-sm">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <TextField isRequired name="email" type="email">
              <Label>Correo electrónico</Label>
              <Input
                autoComplete="username"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </TextField>
            <TextField isRequired name="password" type="password">
              <Label>Contraseña</Label>
              <Input
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </TextField>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            <Button
              className="mt-2 w-full rounded-full"
              isDisabled={isSubmitting}
              type="submit"
              variant="primary"
            >
              <LogInIcon size={18} />
              {isSubmitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </div>

        {/* <Link
          className="mt-6 block text-center text-sm text-muted hover:text-accent"
          to="/"
        >
          ← Volver al sitio
        </Link> */}
      </div>
    </div>
  );
}
