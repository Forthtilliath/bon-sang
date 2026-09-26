import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";
import { PageHeader } from "@/components/page-header";
import { cardClasses, LABEL_RADIUS } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ExternalLink } from "@/components/ui/external-link";
import { CONDITIONS } from "@/data/conditions";
import { cn } from "@/lib/cn";
import { assertLocale } from "@/lib/locale";
import { breadcrumbJsonLd, localizedPath, pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/qui-ca-aide";
// Guillemet décoratif géant (typographique, jamais traduit).
const QUOTE_MARK = "“";

export async function generateMetadata({ params }: PageProps<"/[locale]/qui-ca-aide">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.whoItHelps" });
  return pageMetadata({
    locale,
    path: PATH,
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default function WhoItHelpsPage({ params }: PageProps<"/[locale]/qui-ca-aide">) {
  const locale = assertLocale(use(params).locale);
  const t = useTranslations("Pages.whoItHelps");
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
          <p className="text-muted max-w-2xl text-sm italic">{t("personaDisclaimer")}</p>

          {CONDITIONS.map((condition, index) => (
            <article
              key={condition.id}
              className={cardClasses({
                className: "grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr]",
              })}
            >
              <div className="flex flex-col gap-4">
                <span aria-hidden="true" className="text-primary font-mono text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-3xl font-semibold tracking-tight">
                  {t(`conditions.${condition.id}.name`)}
                </h2>
                <p className="text-muted">{t(`conditions.${condition.id}.what`)}</p>

                <div
                  className={cardClasses({ variant: "soft", className: "flex flex-col gap-1 p-4" })}
                >
                  <h3 className="text-primary font-mono text-xs tracking-[0.16em] uppercase">
                    {t("howLabel")}
                  </h3>
                  <p className="text-sm">{t(`conditions.${condition.id}.howBloodHelps`)}</p>
                </div>

                <p className="mt-auto text-sm">
                  {t("associationLabel")} :{" "}
                  <ExternalLink href={condition.association.url}>
                    {condition.association.name}
                  </ExternalLink>
                </p>
              </div>

              <blockquote
                className={cn(
                  LABEL_RADIUS,
                  "bg-primary-subtle relative flex flex-col justify-center gap-4 overflow-hidden p-6 sm:p-8",
                )}
              >
                <span
                  aria-hidden="true"
                  className="font-display text-primary pointer-events-none absolute -top-6 left-3 text-9xl leading-none"
                >
                  {QUOTE_MARK}
                </span>
                <p className="font-display relative pt-8 text-xl leading-snug italic sm:text-2xl">
                  {t(`conditions.${condition.id}.quote`)}
                </p>
                <footer className="text-muted relative font-mono text-xs">
                  — {t(`conditions.${condition.id}.quoteBy`)}
                </footer>
              </blockquote>
            </article>
          ))}
        </Container>
      </section>
    </>
  );
}
