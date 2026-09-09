import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/page-header";
import { Container } from "@/components/ui/container";
import { Tracker } from "@/features/tracker";
import { assertLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

const PATH = "/mon-suivi";

export async function generateMetadata({ params }: PageProps<"/[locale]/mon-suivi">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.tracker" });
  return pageMetadata({ locale, path: PATH, title: t("title"), description: t("lead") });
}

export default function TrackerPage() {
  const t = useTranslations("Pages.tracker");

  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <section>
        <Container className="max-w-2xl py-12">
          <Tracker />
        </Container>
      </section>
    </>
  );
}
