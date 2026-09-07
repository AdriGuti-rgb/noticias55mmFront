import { Icon } from "@iconify/react";
import clsx from "clsx";

interface LoadingIndicatorProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingIndicator({
  label,
  className,
  size = "lg",
}: LoadingIndicatorProps) {
  const iconSize = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  }[size];

  return (
    <span
      aria-label={label ?? "Cargando"}
      className={clsx(
        "flex w-full flex-col items-center justify-center gap-3 text-center",
        className,
      )}
      data-slot="spinner"
      role="status"
    >
      <Icon
        aria-hidden="true"
        className={clsx(iconSize, "shrink-0 animate-spin")}
        icon="streamline-plump:lens-remix"
      />
      {label}
    </span>
  );
}