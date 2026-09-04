import type { FC } from "react";

import {
  CalendarIcon,
  CameraIcon,
  HeartFilledIcon,
  TagIcon,
  TrophyIcon,
  UserIcon,
} from "@/components/icons";
import type { IconSvgProps } from "@/types";

export interface CategoryIconOption {
  key: string;
  label: string;
  Icon: FC<IconSvgProps>;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { key: "trophy", label: "Deportiva", Icon: TrophyIcon },
  { key: "calendar", label: "Eventos", Icon: CalendarIcon },
  { key: "user", label: "Personal", Icon: UserIcon },
  { key: "camera", label: "Cámara", Icon: CameraIcon },
  { key: "heart", label: "Destacado", Icon: HeartFilledIcon },
  { key: "tag", label: "Genérico", Icon: TagIcon },
];

const ICON_BY_KEY = new Map(CATEGORY_ICON_OPTIONS.map((option) => [option.key, option.Icon]));

export function getCategoryIcon(icon?: string | null): FC<IconSvgProps> | null {
  if (!icon) return null;
  return ICON_BY_KEY.get(icon) ?? null;
}
