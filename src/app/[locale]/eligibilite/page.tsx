import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Quiz } from "@/features/eligibility";
import { assertLocale } from "@/lib/locale";
import { breadcrumbJsonLd, localizedPath, pageMetadata, SITE_URL } from "@/lib/seo";

const PATH = "/eligibilite";
const FAQ_KEYS = ["q1", "q2", "q3"] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]/eligibilite">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.eligibility" });
  return pageMetadata({ locale, path: PATH, title: t("title"), description: t("lead") });
}

export default function EligibilityPage({ params }: PageProps<"/[locale]/eligibilite">) {
  const locale = assertLocale(use(params).locale);
  const t = useTranslations("Pages.eligibility");
  const quiz = useTranslations("Quiz");
  const meta = useTranslations("Metadata");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          name: t("title"),
          description: t("lead"),
          url: `${SITE_URL}${localizedPath(locale, PATH)}`,
          inLanguage: locale,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_KEYS.map((key) => ({
            "@type": "Question",
            name: quiz(`faq.${key}.q`),
            acceptedAnswer: { "@type": "Answer", text: quiz(`faq.${key}.a`) },
          })),
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
        <Container className="max-w-2xl py-12">
          <Quiz />
        </Container>
      </section>

      <section className="border-border border-t">
        <Container className="max-w-2xl py-12">
          <h2 className="text-xl font-semibold tracking-tight">{quiz("faq.title")}</h2>
          <dl className="mt-6 flex flex-col gap-5">
            {FAQ_KEYS.map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <dt className="font-medium">{quiz(`faq.${key}.q`)}</dt>
                <dd className="text-muted text-sm">{quiz(`faq.${key}.a`)}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </>
  );
}
