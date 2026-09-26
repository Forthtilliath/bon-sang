import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { ResultsSkeleton } from "@/features/collectes/results-skeleton";

/** État de chargement instantané pendant que la recherche (Server Component) se résout. */
export default async function Loading() {
  const page = await getTranslations("Pages.collections");

  return (
    <>
      <PageHeader eyebrow={page("eyebrow")} title={page("title")} lead={page("lead")} />

      <section>
        <Container className="py-12">
          <div className="flex max-w-lg flex-wrap gap-3" aria-hidden>
            <div className="border-ink bg-surface h-12 min-w-0 flex-1 animate-pulse rounded-full border-2" />
            <div className="bg-surface-strong h-12 w-32 animate-pulse rounded-full" />
          </div>

          <div className="mt-8">
            <ResultsSkeleton />
          </div>
        </Container>
      </section>
    </>
  );
}
