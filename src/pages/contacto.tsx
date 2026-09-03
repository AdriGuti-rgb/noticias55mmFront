import {
  Button,
  Input,
  Label,
  Link,
  TextArea,
  TextField,
} from "@heroui/react";

import { siteConfig } from "@/config/site";
import { InstagramIcon, MailIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function ContactoPage() {
  return (
    <DefaultLayout>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[320px_minmax(0,1fr)]">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Contacto
          </h1>
          <p className="mt-4 text-muted">
            Disponible para reportajes por encargo, colaboraciones con
            medios y proyectos editoriales de largo formato.
          </p>

          <div className="mt-8 space-y-4">
            <Link
              className="flex items-center gap-3 text-foreground no-underline hover:text-accent"
              href={siteConfig.links.email}
            >
              <MailIcon className="text-accent" size={20} />
              noticiasEn55mm@gmail.com
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

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <TextField isRequired name="name">
              <Label>Nombre</Label>
              <Input placeholder="Tu nombre" />
            </TextField>
            <TextField isRequired name="email" type="email">
              <Label>Correo electrónico</Label>
              <Input placeholder="tu@correo.com" />
            </TextField>
          </div>
          <TextField isRequired name="subject">
            <Label>Asunto</Label>
            <Input placeholder="Encargo de reportaje, colaboración..." />
          </TextField>
          <TextField isRequired name="message">
            <Label>Mensaje</Label>
            <TextArea placeholder="Cuéntame sobre tu proyecto" rows={6} />
          </TextField>
          <Button className="self-start rounded-full" type="submit" variant="primary">
            Enviar mensaje
          </Button>
        </form>
      </section>
    </DefaultLayout>
  );
}
