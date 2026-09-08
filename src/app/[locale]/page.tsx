import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";

const PILLARS = [
  { key: "understand", href: "/comprendre", icon: <HeartIcon /> },
  { key: "test", href: "/eligibilite", icon: <CheckIcon /> },
  { key: "act", href: "/collectes", icon: <PinIcon /> },
] as const;

const STEPS = ["s1", "s2", "s3", "s4"] as const;

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <>
      <section className="border-border border-b">
        <Container className="flex flex-col gap-6 py-16 sm:py-24">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            {t("hero.eyebrow")}
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="text-muted max-w-xl text-lg">{t("hero.lead")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/eligibilite" className={buttonClasses()}>
              {t("hero.ctaPrimary")}
            </Link>
            <Link href="/collectes" className={buttonClasses({ variant: "outline" })}>
              {t("hero.ctaSecondary")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-border border-b">
        <Container className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">{t("pillars.title")}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <li key={pillar.key}>
                <Link
                  href={pillar.href}
                  className="group border-border bg-surface hover:border-primary flex h-full flex-col gap-3 rounded-2xl border p-6 transition-colors"
                >
                  <span className="bg-primary-subtle text-primary flex size-10 items-center justify-center rounded-full">
                    {pillar.icon}
                  </span>
                  <span className="text-lg font-medium">{t(`pillars.${pillar.key}.title`)}</span>
                  <span className="text-muted text-sm">{t(`pillars.${pillar.key}.body`)}</span>
                  <span className="text-primary mt-auto pt-2 text-sm font-medium">
                    {t("pillars.link")} <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-border border-b">
        <Container className="py-16">
          <h2 className="text-2xl font-semibold tracking-tight">{t("how.title")}</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step} className="flex flex-col gap-2">
                <span className="text-primary text-sm font-semibold">0{index + 1}</span>
                <span className="text-muted text-sm">{t(`how.${step}`)}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <div className="bg-primary-subtle flex flex-col items-start gap-4 rounded-2xl p-8 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-balance">{t("cta.title")}</h2>
            <p className="text-muted max-w-lg">{t("cta.body")}</p>
            <Link href="/eligibilite" className={buttonClasses()}>
              {t("cta.button")}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function iconWrap(path: ReactNode) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {path}
    </svg>
  );
}

function HeartIcon() {
  return iconWrap(
    <path
      d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />,
  );
}

function CheckIcon() {
  return iconWrap(
    <path
      d="m5 13 4 4L19 7"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );
}

function PinIcon() {
  return iconWrap(
    <>
      <path
        d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </>,
  );
}
