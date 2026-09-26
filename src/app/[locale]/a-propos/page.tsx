import { use } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { ExternalLink } from "@/components/ui/external-link";
import { FACTS_SOURCE } from "@/data/facts";
import { CRITERIA_UPDATED_AT } from "@/features/eligibility";
import { parseIsoDate } from "@/lib/dates";
import { assertLocale } from "@/lib/locale";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PATH = "/a-propos";
const REPO_URL = "https://github.com/Forthtilliath/bon-sang";

export async function generateMetadata({ params }: PageProps<"/[locale]/a-propos">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.about" });
  return pageMetadata({
    locale,
    path: PATH,
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default function AboutPage({ params }: PageProps<"/[locale]/a-propos">) {
  const locale = assertLocale(use(params).locale);
  const t = useTranslations("Pages.about");
  const quiz = useTranslations("Quiz");
  const meta = useTranslations("Metadata");
  const format = useFormatter();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: meta("title"), path: "/" },
          { name: t("title"), path: PATH },
        ])}
      />

      <PageHeader eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />

      <section>
        <Container className="flex max-w-4xl flex-col py-16">
          <Block title={t("independence.title")}>
            <p>{t("independence.body")}</p>
          </Block>

          <Block title={t("sources.title")}>
            <p>{t("sources.body")}</p>
            <p>
              <ExternalLink href={FACTS_SOURCE.url}>{t("sources.efs")}</ExternalLink>
            </p>
            <p className="text-sm">{t("sources.associations")}</p>
          </Block>

          <Block title={t("method.title")}>
            <p>{t("method.body")}</p>
            <p className="text-sm">
              {quiz("criteriaVersion", {
                date: format.dateTime(parseIsoDate(CRITERIA_UPDATED_AT) ?? new Date(), {
                  dateStyle: "short",
                }),
              })}
            </p>
          </Block>

          <Block title={t("privacy.title")}>
            <p>{t("privacy.body")}</p>
            <p className="text-sm">{t("privacy.analytics")}</p>
          </Block>

          <Block title={t("tech.title")}>
            <p>{t("tech.body")}</p>
            <p>
              <ExternalLink href={REPO_URL}>{t("tech.repo")}</ExternalLink>
            </p>
          </Block>

          <Block title={t("author.title")}>
            <p>{t("author.body")}</p>
          </Block>
        </Container>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-ink grid gap-3 border-t-2 border-dashed py-8 first:border-t-0 first:pt-0 md:grid-cols-[14rem_1fr] md:gap-10">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="text-muted flex flex-col gap-3">{children}</div>
    </div>
  );
}
