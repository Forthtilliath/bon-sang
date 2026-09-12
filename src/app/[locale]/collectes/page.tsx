import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";

import { PageHeader } from "@/components/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { inputClasses } from "@/components/ui/input";
import { CollectesResults } from "@/features/collectes/collectes-results";
import { normalizeCityQuery } from "@/features/collectes/fetch-collectes";
import { ResultsSkeleton } from "@/features/collectes/results-skeleton";
import { assertLocale } from "@/lib/locale";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PATH = "/collectes";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/collectes">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.collections" });
  const query = normalizeQuery((await searchParams).ville);
  const meta = pageMetadata({ locale, path: PATH, title: t("title"), description: t("lead") });

  // Variantes paramétrées (`?ville=…`) : contenu dupliqué d'une ville à l'autre,
  // on garde la page mère indexable mais on retire ces variantes des résultats.
  return query ? { ...meta, robots: { index: false, follow: true } } : meta;
}

export default async function CollectionsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/collectes">) {
  const locale = assertLocale((await params).locale);
  const query = normalizeQuery((await searchParams).ville);

  const page = await getTranslations("Pages.collections");
  const t = await getTranslations("Collectes");
  const meta = await getTranslations("Metadata");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: meta("title"), path: "/" },
          { name: page("title"), path: PATH },
        ])}
      />

      <PageHeader eyebrow={page("eyebrow")} title={page("title")} lead={page("lead")} />

      <section>
        <Container className="py-12">
          <form method="get" className="flex max-w-lg flex-wrap gap-3">
            <label htmlFor="ville" className="sr-only">
              {t("searchLabel")}
            </label>
            <input
              id="ville"
              name="ville"
              type="search"
              defaultValue={query ?? ""}
              placeholder={t("searchPlaceholder")}
              className={inputClasses("min-w-0 flex-1 rounded-full px-5 py-2.5 text-base")}
            />
            <button type="submit" className={buttonClasses()}>
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

          <p className="border-ink text-muted mt-10 max-w-2xl border-t-2 border-dashed pt-4 text-xs">
            {t("source")}
          </p>
        </Container>
      </section>
    </>
  );
}

function normalizeQuery(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return normalizeCityQuery(raw);
}
