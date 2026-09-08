import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";

export async function generateMetadata() {
  const t = await getTranslations("Pages.eligibility");
  return { title: t("title") };
}

export default function EligibilityPage() {
  const t = useTranslations("Pages.eligibility");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
