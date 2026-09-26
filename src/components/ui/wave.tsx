import { cn } from "@/lib/cn";

/**
 * Bord ondulé pleine largeur (couleur = `currentColor`), pour raccorder deux
 * aplats comme la surface d'un liquide. Décoratif.
 */
export function Wave({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-5 w-full sm:h-8", flip && "rotate-180", className)}
    >
      <path
        d="M0 30C120 12 240 12 360 26s240 20 360 4 240-22 360-8 240 22 360 6v26H0Z"
        fill="currentColor"
      />
    </svg>
  );
}
