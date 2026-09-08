import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";

export async function generateMetadata() {
  const t = await getTranslations("Pages.tracker");
  return { title: t("title") };
}

export default function TrackerPage() {
  const t = useTranslations("Pages.tracker");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
