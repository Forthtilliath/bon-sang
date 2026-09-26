import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Drop } from "@/components/ui/drop";
import { Link } from "@/i18n/navigation";

// « 404 » dont le zéro est une goutte : chiffres décoratifs, jamais traduits.
const FOUR = "4";

export default function NotFoundPage() {
  const t = useTranslations("NotFoundPage");

  return (
    <Container className="flex flex-1 flex-col items-start justify-center gap-6 py-20">
      <p
        aria-hidden="true"
        className="font-display flex items-center text-[9rem] leading-none font-semibold tracking-tighter sm:text-[12rem]"
      >
        {FOUR}
        <Drop className="text-primary h-[0.8em] w-[0.62em] -rotate-12" />
        {FOUR}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {t("title")}
      </h1>
      <p className="text-muted max-w-xl text-lg">{t("description")}</p>
      <Link href="/" className={buttonClasses()}>
        {t("backHome")}
      </Link>
    </Container>
  );
}
