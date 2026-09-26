import { cn } from "@/lib/cn";

/** Style commun des champs (`input`, `select`) : trait encre, fond papier. */
export function inputClasses(className?: string) {
  return cn(
    "border-ink bg-bg text-fg placeholder:text-muted rounded-xl border-2 px-3 py-2 text-sm",
    "transition-shadow focus-visible:shadow-sticker-sm aria-[invalid=true]:border-primary",
    className,
  );
}
