import { useState } from "react";
import { Button, Input, Label, Link, TextArea, TextField } from "@heroui/react";

import { siteConfig } from "@/config/site";
import { getTranslations } from "@/config/translations";
import { useLanguage } from "@/lib/language";
import { InstagramIcon, MailIcon } from "@/components/icons";
import { publicApi } from "@/config/admin-api";
import { toast } from "@/lib/toast";
import DefaultLayout from "@/layouts/default";

export default function ContactoPage() {
  const { language } = useLanguage();
  const t = getTranslations(language).contacto;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim())
      return;

    setIsSending(true);
    try {
      await publicApi.post("/comments", {
        message: `Asunto: ${subject}\n\n${message}`,
        contact: `${name} <${email}>`,
        recipient: "photographer",
      });
      toast.success(t.success);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.danger(t.error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DefaultLayout>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[320px_minmax(0,1fr)]">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.heading}
          </h1>
          <p className="mt-4 text-muted">{t.description}</p>

          <div className="mt-8 space-y-4">
            <Link
              className="flex items-center gap-3 text-foreground no-underline hover:text-accent"
              href={siteConfig.links.email}
            >
              <MailIcon className="text-accent" size={20} />
              noticiasen55mm@gmail.com
            </Link>
            <Link
              className="flex items-center gap-3 text-foreground no-underline hover:text-accent"
              href={siteConfig.links.instagram}
              rel="noopener noreferrer"
              target="_blank"
            >
              <InstagramIcon className="text-accent" size={20} />
              @noticiasen55mm.foto
            </Link>
          </div>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TextField isRequired name="name">
              <Label>{t.formName}</Label>
              <Input
                placeholder={t.formNamePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </TextField>
            <TextField isRequired name="email" type="email">
              <Label>{t.formEmail}</Label>
              <Input
                placeholder={t.formEmailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </TextField>
          </div>
          <TextField isRequired name="subject">
            <Label>{t.formSubject}</Label>
            <Input
              placeholder={t.formSubjectPlaceholder}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </TextField>
          <TextField isRequired name="message">
            <Label>{t.formMessage}</Label>
            <TextArea
              placeholder={t.formMessagePlaceholder}
              rows={6}
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
      </section>
    </DefaultLayout>
  );
}
