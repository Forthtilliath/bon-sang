import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { ResultsSkeleton } from "@/features/collectes/results-skeleton";

/** État de chargement instantané pendant que la recherche (Server Component) se résout. */
export default async function Loading() {
  const page = await getTranslations("Pages.collections");

  return (
    <>
      <PageHeader title={page("title")} lead={page("lead")} />

      <section>
        <Container className="py-12">
          <div className="flex max-w-md flex-wrap gap-2" aria-hidden>
            <div className="border-border bg-surface h-[38px] min-w-0 flex-1 animate-pulse rounded-xl border" />
            <div className="bg-surface h-[38px] w-28 animate-pulse rounded-xl" />
          </div>

          <div className="mt-8">
            <ResultsSkeleton />
          </div>
        </Container>
      </section>
    </>
  );
}
