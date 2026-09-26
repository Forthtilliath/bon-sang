import type { ReactNode } from "react";

import { Drop } from "@/components/ui/drop";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export function PageHeader({
  title,
  lead,
  eyebrow,
}: {
  title: string;
  lead: ReactNode;
  /** Surtitre facultatif (rubrique), affiché en capitales mono. */
  eyebrow?: string;
}) {
  return (
    <div className="border-ink relative overflow-hidden border-b-2">
      {/* Grosse goutte en filigrane, coupée par le bord droit. */}
      <Drop
        filled={false}
        className="text-primary/25 pointer-events-none absolute top-6 -right-16 hidden h-80 w-64 rotate-12 sm:block"
      />
      <Container className="relative flex flex-col gap-5 py-14 sm:py-20">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
          {title}
        </h1>
        <p className="text-muted max-w-2xl text-lg">{lead}</p>
      </Container>
    </div>
  );
}
