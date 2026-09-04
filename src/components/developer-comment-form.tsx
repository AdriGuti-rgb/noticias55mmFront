import { useState } from "react";
import { Button, Input, Label, TextArea, TextField } from "@heroui/react";

import { getTranslations } from "@/config/translations";
import { useLanguage } from "@/lib/language";
import { toast } from "@/lib/toast";

export const DeveloperCommentForm = () => {
  const { language } = useLanguage();
  const t = getTranslations(language).developerComment;
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, contact: contact || undefined }),
      });

      if (!response.ok) throw new Error("request failed");

      toast.success(t.success);
      setMessage("");
      setContact("");
    } catch {
      toast.danger(t.error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-6">
      <button
        className="text-xs font-medium text-muted hover:text-accent transition-colors cursor-pointer"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? t.toggleClose : t.toggleOpen}
      </button>

      {isOpen && (
        <form
          className="mt-4 flex max-w-md flex-col gap-3"
          onSubmit={handleSubmit}
        >
          <p className="text-xs text-muted">{t.disclaimer}</p>
          <TextField name="contact">
            <Label>{t.contactLabel}</Label>
            <Input
              placeholder={t.contactPlaceholder}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </TextField>
          <TextField isRequired name="message">
            <Label>{t.messageLabel}</Label>
            <TextArea
              placeholder={t.messagePlaceholder}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </TextField>
          <Button
            className="self-start rounded-full"
            isDisabled={isSending}
            type="submit"
            variant="primary"
          >
            {isSending ? t.submitting : t.submit}
          </Button>
        </form>
      )}
    </div>
  );
};
