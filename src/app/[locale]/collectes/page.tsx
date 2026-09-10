import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { CollectesResults } from "@/features/collectes/collectes-results";
import { ResultsSkeleton } from "@/features/collectes/results-skeleton";
import { assertLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

const PATH = "/collectes";

export async function generateMetadata({ params }: PageProps<"/[locale]/collectes">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.collections" });
  return pageMetadata({ locale, path: PATH, title: t("title"), description: t("lead") });
}

export default async function CollectionsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/collectes">) {
  assertLocale((await params).locale);
  const query = normalizeQuery((await searchParams).ville);

  const page = await getTranslations("Pages.collections");
  const t = await getTranslations("Collectes");

  return (
    <>
      <PageHeader title={page("title")} lead={page("lead")} />

      <section>
        <Container className="py-12">
          <form method="get" className="flex max-w-md flex-wrap gap-2">
            <label htmlFor="ville" className="sr-only">
              {t("searchLabel")}
            </label>
            <input
              id="ville"
              name="ville"
              type="search"
              defaultValue={query ?? ""}
              placeholder={t("searchPlaceholder")}
              className="border-border bg-bg min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-primary text-primary-fg hover:bg-primary-strong rounded-xl px-4 py-2 text-sm font-medium"
            >
              {t("searchSubmit")}
            </button>
          </form>

          <div className="mt-8">
            {!query ? (
              <p className="text-muted max-w-2xl text-sm">{t("intro")}</p>
            ) : (
              <Suspense key={query} fallback={<ResultsSkeleton />}>
                <CollectesResults query={query} />
              </Suspense>
            )}
          </div>

          <p className="border-border text-muted mt-8 max-w-2xl border-t pt-4 text-xs">
            {t("source")}
          </p>
        </Container>
      </section>
    </>
  );
}

function normalizeQuery(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed && trimmed.length >= 2 ? trimmed : null;
}
