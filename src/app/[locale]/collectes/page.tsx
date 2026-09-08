import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";

export async function generateMetadata() {
  const t = await getTranslations("Pages.collections");
  return { title: t("title") };
}

export default function CollectionsPage() {
  const t = useTranslations("Pages.collections");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
