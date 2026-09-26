import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { cardClasses } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Drop } from "@/components/ui/drop";
import { Link } from "@/i18n/navigation";

export function CtaBand() {
  const t = useTranslations("HomePage.cta");

  return (
    <section>
      <Container className="py-16 sm:py-20">
        <div
          className={cardClasses({
            className:
              "bg-accent text-accent-fg shadow-sticker-lg relative overflow-hidden p-8 sm:p-14",
          })}
        >
          <Drop className="text-primary pointer-events-none absolute -right-8 -bottom-16 h-72 w-56 rotate-[18deg] opacity-90 max-sm:hidden" />
          <div className="relative flex max-w-2xl flex-col items-start gap-5">
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
              {t("title")}
            </h2>
            <p className="max-w-lg text-lg">{t("body")}</p>
            <Link href="/eligibilite" className={buttonClasses()}>
              {t("button")}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
