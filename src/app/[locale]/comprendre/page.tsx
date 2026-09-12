import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { ExternalLink } from "@/components/ui/external-link";
import { FACTS_SOURCE, KEY_FIGURES, SHELF_LIFE } from "@/data/facts";
import { assertLocale } from "@/lib/locale";
import { breadcrumbJsonLd, localizedPath, pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/comprendre";
const PURPOSE = ["transfusion", "chronic", "plasma"] as const;
const JOURNEY = ["s1", "s2", "s3", "s4", "s5"] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/comprendre">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.understand" });
  return pageMetadata({
    locale,
    path: PATH,
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default function UnderstandPage({ params }: PageProps<"/[locale]/comprendre">) {
  const locale = assertLocale(use(params).locale);
  const t = useTranslations("Pages.understand");
  const meta = useTranslations("Metadata");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: t("title"),
          description: t("metaDescription"),
          url: `${SITE_URL}${localizedPath(locale, PATH)}`,
          inLanguage: locale,
          about: { "@type": "MedicalProcedure", name: "Blood transfusion" },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: meta("title"), path: "/" },
          { name: t("title"), path: PATH },
        ])}
      />

      <PageHeader title={t("title")} lead={t("lead")} />

      <section>
        <Container className="border-border flex flex-col gap-6 border-b py-14">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{t("purpose.title")}</h2>
            <p className="text-muted max-w-2xl">{t("purpose.intro")}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {PURPOSE.map((key) => (
              <li
                key={key}
                className="border-border bg-surface flex flex-col gap-2 rounded-2xl border p-5"
              >
                <h3 className="font-medium">{t(`purpose.${key}.title`)}</h3>
                <p className="text-muted text-sm">{t(`purpose.${key}.body`)}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section>
        <Container className="border-border flex flex-col gap-6 border-b py-14">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{t("journey.title")}</h2>
            <p className="text-muted max-w-2xl">{t("journey.intro")}</p>
          </div>
          <ol className="flex flex-col gap-5">
            {JOURNEY.map((key, index) => (
              <li key={key} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="bg-primary-subtle text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                >
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-medium">{t(`journey.${key}.title`)}</h3>
                  <p className="text-muted text-sm">{t(`journey.${key}.body`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section>
        <Container className="flex flex-col gap-6 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">{t("figures.title")}</h2>

          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KEY_FIGURES.map((figure) => (
              <div
                key={figure.id}
                className="border-border flex flex-col gap-1 rounded-2xl border p-5"
              >
                <dt className="text-primary text-3xl font-semibold tracking-tight">
                  {figure.value}
                </dt>
                <dd className="text-muted text-sm">{t(`figures.${figure.id}`)}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-surface flex flex-col gap-3 rounded-2xl p-5">
            <h3 className="text-sm font-semibold">{t("figures.shelfLifeTitle")}</h3>
            <ul className="text-muted flex flex-wrap gap-x-8 gap-y-2 text-sm">
              {SHELF_LIFE.map((item) => (
                <li key={item.id}>
                  <span className="text-fg font-medium">{t(`figures.${item.id}`)}</span> —{" "}
                  {t("figures.days", { count: item.days })}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-muted text-xs">
            {t("figures.sourceLabel")}{" "}
            <ExternalLink href={FACTS_SOURCE.url}>{FACTS_SOURCE.label}</ExternalLink> —{" "}
            {t("figures.sourceNote", { year: FACTS_SOURCE.asOf })}
          </p>
        </Container>
      </section>
    </>
  );
}
