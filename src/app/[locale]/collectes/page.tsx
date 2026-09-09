import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";
import { assertLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/collectes">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.collections" });
  return pageMetadata({ locale, path: "/collectes", title: t("title"), description: t("lead") });
}

export default function CollectionsPage() {
  const t = useTranslations("Pages.collections");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
