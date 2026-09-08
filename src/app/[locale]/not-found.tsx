import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";

export default function NotFoundPage() {
  const t = useTranslations("NotFoundPage");

  return (
    <Container className="flex flex-1 flex-col justify-center gap-4 py-24">
      <p className="text-primary text-sm font-semibold">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted">{t("description")}</p>
      <Link href="/" className={buttonClasses({ variant: "outline", className: "self-start" })}>
        {t("backHome")}
      </Link>
    </Container>
  );
}
