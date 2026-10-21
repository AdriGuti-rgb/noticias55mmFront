import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Label, TextField } from "@heroui/react";

import { ApiError, publicApi } from "@/config/admin-api";
import { siteConfig } from "@/config/site";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await publicApi.post("/admin/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo enviar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mx-auto flex h-24 w-24 items-center justify-center">
          <img src="/logo.png" alt="Logo" className="h-10" />
        </div>
        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-widest text-muted">
          {siteConfig.name}
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-foreground">
          Recuperar contraseña
        </h1>
        <div className="mt-8 rounded-2xl border border-separator bg-surface p-6 shadow-sm">
          {isSubmitted ? (
            <p className="text-sm leading-6 text-muted" role="status">
              Si existe una cuenta activa con ese correo, recibirá un enlace para recuperar la contraseña.
            </p>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <p className="text-sm leading-6 text-muted">
                Introduce el correo asociado a tu cuenta y te enviaremos un enlace de recuperación.
              </p>
              <TextField isRequired name="email" type="email">
                <Label>Correo electrónico</Label>
                <Input
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </TextField>
              {error && <p className="text-sm text-danger" role="alert">{error}</p>}
              <Button
                className="mt-2 w-full rounded-full"
                isDisabled={isSubmitting}
                type="submit"
                variant="primary"
              >
                {isSubmitting ? "Enviando solicitud..." : "Enviar enlace"}
              </Button>
            </form>
          )}
          <Link
            className="mt-5 block text-center text-sm text-muted transition-colors hover:text-accent"
            to="/system/admin/login"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}