import type { Key } from "@heroui/react";

import { ListBox, ListBoxItem, Select } from "@heroui/react";

export interface FilterSelectOption {
  id: string;
  label: string;
}

interface FilterSelectProps {
  "aria-label": string;
  items: FilterSelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Reemplaza el `<select>` nativo por el `Select` de HeroUI en toda la web.
 * `Select` en sí solo aporta el trigger/popover (su `children` se reescribe
 * internamente para composición visual, no para colección) — la colección
 * real de opciones vive en el `ListBox` anidado dentro de `Select.Popover`,
 * con el patrón de colección dinámica de siempre (`items` + función-hijo,
 * nunca `.map()` generando `ListBoxItem` a mano). Ver CLAUDE.md.
 */
export function FilterSelect({
  "aria-label": ariaLabel,
  items,
  value,
  onChange,
  className,
}: FilterSelectProps) {
  return (
    <Select.Root
      aria-label={ariaLabel}
      className={className}
      value={value}
      onChange={(key: Key | null) => onChange((key as string) ?? "")}
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox items={items}>
          {(item) => <ListBoxItem id={item.id}>{item.label}</ListBoxItem>}
        </ListBox>
      </Select.Popover>
    </Select.Root>
  );
}
