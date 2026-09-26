import { cn } from "@/lib/cn";

type CardVariant = "sticker" | "soft" | "outline";

type CardStyleOptions = {
  variant?: CardVariant;
  /** Soulève la carte au survol (cartes cliquables). */
  interactive?: boolean;
  className?: string;
};

/**
 * Forme « étiquette » : trois coins arrondis, le coin bas-gauche presque droit,
 * comme une étiquette collée sur une poche de sang.
 */
export const LABEL_RADIUS = "rounded-[1.5rem_1.5rem_1.5rem_0.375rem]";

export function cardClasses({
  variant = "sticker",
  interactive = false,
  className,
}: CardStyleOptions = {}) {
  return cn(
    LABEL_RADIUS,
    variant === "sticker" && "border-ink bg-bg shadow-sticker border-2",
    variant === "soft" && "bg-surface",
    variant === "outline" && "border-border bg-bg border-2",
    interactive &&
      "transition-[translate,box-shadow,border-color] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sticker-lg",
    className,
  );
}
