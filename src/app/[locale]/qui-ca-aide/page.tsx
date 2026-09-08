import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";

export async function generateMetadata() {
  const t = await getTranslations("Pages.whoItHelps");
  return { title: t("title") };
}

export default function WhoItHelpsPage() {
  const t = useTranslations("Pages.whoItHelps");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
