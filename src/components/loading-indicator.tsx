import clsx from "clsx";

import { IrisSpinner } from "@/components/iris-spinner";

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
      <IrisSpinner className={clsx(iconSize, "shrink-0")} />
      {label}
    </span>
  );
}