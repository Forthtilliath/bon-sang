import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";

export async function generateMetadata() {
  const t = await getTranslations("Pages.understand");
  return { title: t("title") };
}

export default function UnderstandPage() {
  const t = useTranslations("Pages.understand");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
