import { useState } from "react";
import { Button, Input, Label, TextArea, TextField } from "@heroui/react";

type Status = "idle" | "sending" | "sent" | "error";

export const DeveloperCommentForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    setStatus("sending");

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, contact: contact || undefined }),
      });

      if (!response.ok) throw new Error("request failed");

      setStatus("sent");
      setMessage("");
      setContact("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-6">
      <button
        className="text-xs font-medium text-muted hover:text-accent transition-colors"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "Ocultar" : "Comentar al desarrollador"}
      </button>

      {isOpen && (
        <form
          className="mt-4 flex max-w-md flex-col gap-3"
          onSubmit={handleSubmit}
        >
          <p className="text-xs text-muted">
            Este comentario no se publica en la web: llega directamente al
            desarrollador.
          </p>
          <TextField name="contact">
            <Label>Tu contacto (opcional)</Label>
            <Input
              placeholder="tu@correo.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </TextField>
          <TextField isRequired name="message">
            <Label>Comentario</Label>
            <TextArea
              placeholder="Cuéntanos qué falla o qué te gustaría ver"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </TextField>
          <Button
            className="self-start rounded-full"
            isDisabled={status === "sending"}
            type="submit"
            variant="primary"
          >
            {status === "sending" ? "Enviando…" : "Enviar comentario"}
          </Button>
          {status === "sent" && (
            <p className="text-sm text-accent">¡Gracias! Comentario enviado.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-danger">
              No se pudo enviar. Inténtalo de nuevo más tarde.
            </p>
          )}
        </form>
      )}
    </div>
  );
};
