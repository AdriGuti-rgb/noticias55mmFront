import { Checkbox } from "react-aria-components";
import clsx from "clsx";

import { CheckIcon } from "@/components/icons";

/**
 * `Checkbox` de `react-aria-components` (no el de `@heroui/react`, que está
 * construido sobre un primitivo distinto — `CheckboxField`/`CheckboxButton` —
 * no compatible con la ranura `slot="selection"` que usa `Table` para
 * selección de filas) es headless: sin `children` no dibuja nada visible,
 * solo el `<input>` nativo oculto. Este wrapper añade el cuadrado visible.
 * Usar siempre este componente (nunca `Checkbox` a secas) tanto en la
 * cabecera (seleccionar todo) como en cada celda de fila de cualquier tabla
 * del panel con `selectionMode="multiple"`.
 */
export function SelectionCheckbox({
  "aria-label": ariaLabel,
}: {
  "aria-label"?: string;
}) {
  return (
    <Checkbox aria-label={ariaLabel ?? "Seleccionar"} slot="selection">
      {({ isSelected, isIndeterminate }) => (
        <div
          className={clsx(
            "flex size-4 items-center justify-center rounded border transition-colors",
            isSelected || isIndeterminate
              ? "border-accent bg-accent text-accent-foreground"
              : "border-field-border bg-field",
          )}
        >
          {isIndeterminate ? (
            <span className="block h-0.5 w-2 bg-current" />
          ) : isSelected ? (
            <CheckIcon size={11} />
          ) : null}
        </div>
      )}
    </Checkbox>
  );
}
