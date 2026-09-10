"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * Enveloppe focusable qui prend le focus au montage, sans faire défiler la page.
 * Sert à porter le focus vers une zone de contenu fraîchement rendue (résultats
 * de recherche, message d'erreur) pour que les lecteurs d'écran l'annoncent.
 */
export function FocusOnMount({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div ref={ref} tabIndex={-1} role="region" aria-label={label} className={className}>
      {children}
    </div>
  );
}
