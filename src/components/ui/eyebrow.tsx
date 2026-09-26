import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Drop } from "./drop";

/** Surtitre façon étiquette de poche : capitales mono, précédées d'une goutte. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-primary flex items-center gap-2 font-mono text-xs tracking-[0.18em] uppercase",
        className,
      )}
    >
      <Drop className="size-3.5 shrink-0" />
      {children}
    </p>
  );
}
