import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { cardClasses } from "@/components/ui/card";
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

      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <section>
        <Container className="max-w-3xl py-12 sm:py-16">
          <div className={cardClasses({ className: "shadow-sticker-lg p-6 sm:p-10" })}>
            <Quiz />
          </div>
        </Container>
      </section>

      <section>
        <Container className="max-w-3xl pb-8">
          <SectionHeading title={quiz("faq.title")} />
          <dl className="mt-8 flex flex-col gap-4">
            {FAQ_KEYS.map((key) => (
              <div
                key={key}
                className={cardClasses({ variant: "soft", className: "flex flex-col gap-2 p-5" })}
              >
                <dt className="font-display text-lg font-semibold">{quiz(`faq.${key}.q`)}</dt>
                <dd className="text-muted text-sm">{quiz(`faq.${key}.a`)}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </>
  );
}
