import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";

/** Page de section en attente de contenu (lots 4+). */
export function StubPage({ title, lead }: { title: string; lead: string }) {
  const t = useTranslations("Common");

  return (
    <Container className="flex flex-col gap-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted max-w-xl">{lead}</p>
      <p className="bg-surface-strong text-muted w-fit rounded-full px-3 py-1 text-xs font-medium">
        {t("underConstruction")}
      </p>
    </Container>
  );
}
