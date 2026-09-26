import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md";

type ButtonStyleOptions = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

// Boutons « sticker » : trait encre, ombre décalée qui se soulève au survol et
// s'écrase au clic (le bouton « s'enfonce » dans le papier).
const PRESSABLE =
  "border-ink shadow-sticker-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-sticker active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border-2 font-semibold",
    "transition-[translate,box-shadow,background-color,color] duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "px-4 py-1.5 text-sm" : "px-6 py-2.5 text-sm sm:text-base",
    variant === "primary" && [PRESSABLE, "bg-primary text-primary-fg"],
    variant === "accent" && [PRESSABLE, "bg-accent text-accent-fg"],
    variant === "outline" && [PRESSABLE, "bg-bg text-fg hover:bg-surface"],
    variant === "ghost" && "text-fg hover:bg-surface border-transparent",
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonStyleOptions) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
