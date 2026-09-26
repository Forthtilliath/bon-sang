import { cn } from "@/lib/cn";

/** Pastille de filtre activable (`aria-pressed`) : plasma quand active. */
export function chipClasses(active: boolean, className?: string) {
  return cn(
    "rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors",
    active
      ? "border-ink bg-accent text-accent-fg shadow-sticker-sm"
      : "border-border text-muted hover:border-ink hover:text-fg",
    className,
  );
}

/** Conteneur d'un sélecteur segmenté (groupe de boutons exclusifs). */
export const SEGMENT_GROUP = "border-ink flex rounded-full border-2 p-0.5 text-sm";

/** Option d'un sélecteur segmenté : pilule encre quand sélectionnée. */
export function segmentClasses(active: boolean) {
  return cn(
    "rounded-full px-3 py-1 font-medium transition-colors",
    active ? "bg-fg text-bg" : "text-muted hover:text-fg",
  );
}
