import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { cardClasses } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Drop } from "@/components/ui/drop";
import { ExternalLink } from "@/components/ui/external-link";
import { FACTS_SOURCE, KEY_FIGURES, SHELF_LIFE } from "@/data/facts";
import { cn } from "@/lib/cn";
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

      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <section>
        <Container className="flex flex-col gap-10 py-16">
          <SectionHeading title={t("purpose.title")} intro={t("purpose.intro")} />
          <ul className="grid gap-6 sm:grid-cols-3">
            {PURPOSE.map((key, index) => (
              <li key={key} className={cardClasses({ className: "flex flex-col gap-3 p-6" })}>
                <span aria-hidden="true" className="text-primary font-mono text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold">{t(`purpose.${key}.title`)}</h3>
                <p className="text-muted text-sm">{t(`purpose.${key}.body`)}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-surface border-ink border-y-2">
        <Container className="flex flex-col gap-10 py-16">
          <SectionHeading title={t("journey.title")} intro={t("journey.intro")} />
          {/* Parcours d'une poche : étapes reliées par une tubulure en pointillés. */}
          <div className="relative">
            <span
              aria-hidden="true"
              className="border-primary absolute top-2 bottom-10 left-[22px] border-l-4 border-dotted"
            />
            <ol className="relative flex flex-col gap-8">
              {JOURNEY.map((key, index) => (
                <li key={key} className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "border-ink font-display shadow-sticker-sm flex size-12 shrink-0 items-center justify-center rounded-full border-2 text-xl font-semibold",
                      index === JOURNEY.length - 1 ? "bg-primary text-primary-fg" : "bg-bg",
                    )}
                  >
                    {index + 1}
                  </span>
                  <div className="flex max-w-2xl flex-col gap-1 pt-1.5">
                    <h3 className="text-xl font-semibold">{t(`journey.${key}.title`)}</h3>
                    <p className="text-muted">{t(`journey.${key}.body`)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section>
        <Container className="flex flex-col gap-10 py-16">
          <SectionHeading title={t("figures.title")} />

          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {KEY_FIGURES.map((figure, index) => (
              <div
                key={figure.id}
                className={cardClasses({
                  className: cn(
                    "flex flex-col gap-2 p-6",
                    index === 0 && "bg-accent text-accent-fg",
                  ),
                })}
              >
                <dt
                  className={cn(
                    "font-display text-5xl font-semibold tracking-tight",
                    index === 0 ? "text-accent-fg" : "text-primary",
                  )}
                >
                  {figure.value}
                </dt>
                <dd className={cn("text-sm", index !== 0 && "text-muted")}>
                  {t(`figures.${figure.id}`)}
                </dd>
              </div>
            ))}
          </dl>

          <div className={cardClasses({ variant: "soft", className: "flex flex-col gap-4 p-6" })}>
            <h3 className="text-xl font-semibold">{t("figures.shelfLifeTitle")}</h3>
            <ul className="flex flex-wrap gap-3">
              {SHELF_LIFE.map((item) => (
                <li
                  key={item.id}
                  className="border-ink bg-bg flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm"
                >
                  <Drop className="text-primary size-3.5" />
                  <span className="font-semibold">{t(`figures.${item.id}`)}</span>
                  <span className="text-muted font-mono text-xs">
                    {t("figures.days", { count: item.days })}
                  </span>
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
