import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";
import { assertLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/mon-suivi">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.tracker" });
  return pageMetadata({ locale, path: "/mon-suivi", title: t("title"), description: t("lead") });
}

export default function TrackerPage() {
  const t = useTranslations("Pages.tracker");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
