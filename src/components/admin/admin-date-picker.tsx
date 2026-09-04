import type { DateValue } from "@heroui/react";

import { Calendar, DateField, DatePicker } from "@heroui/react";
import { parseDate } from "@internationalized/date";

interface AdminDatePickerProps {
  "aria-label": string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Reemplaza el `<input type="date">` nativo por el `DatePicker` de HeroUI.
 * `value`/`onChange` del `DatePicker` no trabajan con strings ni `Date`, sino
 * con `CalendarDate` de `@internationalized/date` (añadido como dependencia
 * directa de `front/` — antes solo llegaba transitiva vía react-aria-components
 * y no era resoluble desde código propio, igual que pasó con
 * `react-aria-components` para `Select`/`Table`). `parseDate("YYYY-MM-DD")` y
 * `date.toString()` convierten en ambas direcciones porque ese formato
 * coincide exactamente con el que ya usa `publications.date` en el backend.
 *
 * Composición (verificada contra el código fuente instalado, no la doc web —
 * ver CLAUDE.md): el propio `DatePicker.Trigger` es un botón que aloja tanto
 * los segmentos editables (`DateField.Group > DateField.Input > DateField.Segment`,
 * patrón de colección dinámica de siempre: función-hijo por segmento) como el
 * icono de calendario (`DatePicker.TriggerIndicator`, ya trae su propio icono
 * por defecto sin pasarle children). El popover aloja un `Calendar.Root`
 * completo con cabecera de navegación (`Calendar.NavButton` con iconos por
 * defecto) y la rejilla de días (`Calendar.GridHeader`/`Calendar.GridBody`,
 * ambos con función-hijo obligatoria por día/fecha — `Calendar.Cell` sin
 * children ya muestra el número de día por defecto).
 */
export function AdminDatePicker({
  "aria-label": ariaLabel,
  value,
  onChange,
}: AdminDatePickerProps) {
  return (
    <DatePicker.Root
      aria-label={ariaLabel}
      className="w-full"
      value={value ? parseDate(value) : null}
      onChange={(date: DateValue | null) =>
        onChange(date ? date.toString() : "")
      }
    >
      <DatePicker.Trigger className="min-h-9 w-full px-3 py-2">
        <DateField.Group className="flex-1">
          <DateField.Input>
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
        </DateField.Group>
        <DatePicker.TriggerIndicator />
      </DatePicker.Trigger>
      <DatePicker.Popover>
        <Calendar.Root>
          <Calendar.Header>
            <Calendar.NavButton slot="previous" />
            <Calendar.Heading />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>
              {(date) => <Calendar.Cell date={date} />}
            </Calendar.GridBody>
          </Calendar.Grid>
        </Calendar.Root>
      </DatePicker.Popover>
    </DatePicker.Root>
  );
}
