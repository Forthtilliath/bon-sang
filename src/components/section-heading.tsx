import type { ReactNode } from "react";

/** Titre de section (serif display) avec chapeau facultatif. */
export function SectionHeading({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {intro ? <p className="text-muted max-w-2xl text-lg">{intro}</p> : null}
    </div>
  );
}
