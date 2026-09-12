import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { ExternalLink } from "@/components/ui/external-link";
import { CONDITIONS } from "@/data/conditions";
import { assertLocale } from "@/lib/locale";
import { breadcrumbJsonLd, localizedPath, pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/qui-ca-aide";

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

      <PageHeader title={t("title")} lead={t("lead")} />

      <section>
        <Container className="flex flex-col gap-8 py-14">
          <p className="text-muted max-w-2xl text-sm italic">{t("personaDisclaimer")}</p>

          {CONDITIONS.map((condition) => (
            <article
              key={condition.id}
              className="border-border flex flex-col gap-4 rounded-2xl border p-6"
            >
              <h2 className="text-xl font-semibold tracking-tight">
                {t(`conditions.${condition.id}.name`)}
              </h2>
              <p className="text-muted text-sm">{t(`conditions.${condition.id}.what`)}</p>

              <div className="bg-surface flex flex-col gap-1 rounded-xl p-4">
                <h3 className="text-muted text-xs font-semibold tracking-wide uppercase">
                  {t("howLabel")}
                </h3>
                <p className="text-muted text-sm">
                  {t(`conditions.${condition.id}.howBloodHelps`)}
                </p>
              </div>

              <blockquote className="border-primary border-l-2 pl-4 text-sm">
                <p className="text-fg">“{t(`conditions.${condition.id}.quote`)}”</p>
                <footer className="text-muted mt-1">
                  — {t(`conditions.${condition.id}.quoteBy`)}
                </footer>
              </blockquote>

              <p className="text-sm">
                {t("associationLabel")} :{" "}
                <ExternalLink href={condition.association.url}>
                  {condition.association.name}
                </ExternalLink>
              </p>
            </article>
          ))}
        </Container>
      </section>
    </>
  );
}
