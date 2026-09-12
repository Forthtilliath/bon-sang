import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { JsonLd } from "@forthtilliath/react-kit/json-ld";
import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Tracker } from "@/features/tracker";
import { assertLocale } from "@/lib/locale";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const PATH = "/mon-suivi";

export async function generateMetadata({ params }: PageProps<"/[locale]/mon-suivi">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.tracker" });
  return pageMetadata({ locale, path: PATH, title: t("title"), description: t("lead") });
}

export default function TrackerPage({ params }: PageProps<"/[locale]/mon-suivi">) {
  const locale = assertLocale(use(params).locale);
  const t = useTranslations("Pages.tracker");
  const meta = useTranslations("Metadata");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: meta("title"), path: "/" },
          { name: t("title"), path: PATH },
        ])}
      />

      <PageHeader title={t("title")} lead={t("lead")} />
      <section>
        <Container className="max-w-2xl py-12">
          <Tracker />
        </Container>
      </section>
    </>
  );
}
