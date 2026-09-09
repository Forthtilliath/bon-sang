import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { StubPage } from "@/components/stub-page";
import { assertLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/eligibilite">) {
  const locale = assertLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: "Pages.eligibility" });
  return pageMetadata({ locale, path: "/eligibilite", title: t("title"), description: t("lead") });
}

export default function EligibilityPage() {
  const t = useTranslations("Pages.eligibility");
  return <StubPage title={t("title")} lead={t("lead")} />;
}
