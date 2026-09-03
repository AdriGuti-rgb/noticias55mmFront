import { AlertDialog, Button, Modal } from "@heroui/react";

import { TrashIcon } from "@/components/icons";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo de confirmación reutilizable (eliminar publicación, eliminar foto...).
 * Usa `AlertDialog` de HeroUI, que envuelve `Dialog`/`Modal` de
 * `react-aria-components` — **no** el sistema de `Collection` que rompió `Table`
 * (ver CLAUDE.md), así que no tiene ese riesgo. `AlertDialog.Root` se usa aquí en
 * modo controlado (sin `Trigger`): react-aria-components soporta explícitamente
 * accionar el diálogo desde fuera vía `isOpen`/`onOpenChange`, útil cuando el
 * botón que lo abre (p. ej. el icono de papelera de cada fila) no es hijo directo
 * del propio diálogo.
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Eliminar",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog>
            <AlertDialog.Icon status="danger" />
            <AlertDialog.Header>
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="text-sm text-muted">{description}</AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="secondary" onPress={onCancel}>
                Cancelar
              </Button>
              <Button isDisabled={isConfirming} variant="danger" onPress={onConfirm}>
                <TrashIcon size={16} />
                {isConfirming ? "Eliminando…" : confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog.Root>
  );
}

export function CustomTrigger() {
  return (
    <Modal>
      <Modal.Trigger className="group flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-xs select-none hover:bg-surface-secondary">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
          {/* <Gear className="size-6" /> */}
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-sm font-semibold">Settings</p>
          <p className="text-xs text-muted">Manage your preferences</p>
        </div>
      </Modal.Trigger>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                {/* <Gear className="size-5" /> */}
              </Modal.Icon>
              <Modal.Heading>Settings</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p>
                Use <code>Modal.Trigger</code> to create custom trigger elements
                beyond standard buttons. This example shows a card-style
                trigger with icons and descriptive text.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                Cancel
              </Button>
              <Button slot="close">Save</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
