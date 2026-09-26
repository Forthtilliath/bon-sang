import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Link } from "@/i18n/navigation";

import { BloodBag } from "./blood-bag";

export function Hero() {
  const t = useTranslations("HomePage.hero");

  return (
    <section className="border-ink relative overflow-hidden border-b-2">
      <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-6">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-tight text-balance sm:text-7xl">
            {t.rich("title", {
              accent: (chunks) => <span className="text-primary font-medium italic">{chunks}</span>,
            })}
          </h1>
          <p className="text-muted max-w-xl text-lg sm:text-xl">{t("lead")}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/eligibilite" className={buttonClasses()}>
              {t("ctaPrimary")}
            </Link>
            <Link href="/collectes" className={buttonClasses({ variant: "outline" })}>
              {t("ctaSecondary")}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
          <BloodBag className="w-full -rotate-3" />
          {/* Pastille plasma : vrai contenu (lu par les lecteurs d'écran). */}
          <p className="border-ink bg-accent text-accent-fg shadow-sticker animate-float absolute top-8 -left-4 flex size-32 rotate-[-10deg] flex-col items-center justify-center rounded-full border-2 p-3 text-center sm:-left-10 sm:size-36">
            <span className="font-display text-3xl leading-none font-semibold">
              {t("stickerTop")}
            </span>
            <span className="mt-1 text-xs leading-tight font-medium">{t("stickerBottom")}</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
