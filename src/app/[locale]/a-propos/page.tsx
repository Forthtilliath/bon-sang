import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";

export async function generateMetadata() {
  const t = await getTranslations("Pages.about");
  return { title: t("title") };
}

export default function AboutPage() {
  const t = useTranslations("Pages.about");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
