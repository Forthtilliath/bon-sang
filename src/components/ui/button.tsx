import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md";

type ButtonStyleOptions = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-2.5 text-sm sm:text-base",
    variant === "primary" && "bg-primary text-primary-fg hover:bg-primary-strong",
    variant === "outline" && "border border-border text-fg hover:bg-surface",
    variant === "ghost" && "text-fg hover:bg-surface",
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
