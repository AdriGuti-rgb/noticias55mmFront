import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input, Label, TextField } from "@heroui/react";

import { ApiError, publicApi } from "@/config/admin-api";
import { siteConfig } from "@/config/site";

export default function AdminResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      await publicApi.post("/admin/auth/reset-password", { token, password });
      navigate("/system/admin/login", {
        replace: true,
        state: { passwordReset: true },
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "No se pudo cambiar la contraseña. Solicita un enlace nuevo.",
      );
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
          Nueva contraseña
        </h1>
        <div className="mt-8 rounded-2xl border border-separator bg-surface p-6 shadow-sm">
          {!token ? (
            <p className="text-sm text-muted" role="alert">
              El enlace no contiene un token válido. Solicita uno nuevo.
            </p>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <TextField isRequired name="password" type="password">
                <Label>Nueva contraseña</Label>
                <Input
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </TextField>
              <TextField isRequired name="confirm-password" type="password">
                <Label>Repetir contraseña</Label>
                <Input
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </TextField>
              {error && <p className="text-sm text-danger" role="alert">{error}</p>}
              <Button
                className="mt-2 w-full rounded-full"
                isDisabled={isSubmitting}
                type="submit"
                variant="primary"
              >
                {isSubmitting ? "Actualizando..." : "Cambiar contraseña"}
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