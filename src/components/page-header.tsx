import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

export function PageHeader({ title, lead }: { title: string; lead: ReactNode }) {
  return (
    <Container className="border-border flex flex-col gap-4 border-b py-12 sm:py-16">
      <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      <p className="text-muted max-w-2xl text-lg">{lead}</p>
    </Container>
  );
}
