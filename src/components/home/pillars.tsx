import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { cardClasses } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// Chaque pilier a sa couleur : globule, plasma, veine.
const PILLARS = [
  {
    key: "understand",
    href: "/comprendre",
    icon: <HeartIcon />,
    tone: "bg-primary text-primary-fg",
  },
  { key: "test", href: "/eligibilite", icon: <CheckIcon />, tone: "bg-accent text-accent-fg" },
  { key: "act", href: "/collectes", icon: <PinIcon />, tone: "bg-info text-bg" },
] as const;

export function Pillars() {
  const t = useTranslations("HomePage.pillars");

  return (
    <section>
      <Container className="py-16 sm:py-20">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <li key={pillar.key}>
              <Link
                href={pillar.href}
                className={cardClasses({
                  interactive: true,
                  className: "group flex h-full flex-col gap-4 p-6",
                })}
              >
                <span className="flex items-start justify-between">
                  <span
                    className={cn(
                      "border-ink flex size-12 items-center justify-center rounded-full border-2",
                      pillar.tone,
                    )}
                  >
                    {pillar.icon}
                  </span>
                  <span aria-hidden="true" className="text-muted font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="font-display text-2xl font-semibold">
                  {t(`${pillar.key}.title`)}
                </span>
                <span className="text-muted text-sm">{t(`${pillar.key}.body`)}</span>
                <span className="text-primary mt-auto flex items-center gap-2 pt-2 text-sm font-semibold">
                  {t("link")}
                  <span
                    aria-hidden="true"
                    className="border-primary flex size-6 items-center justify-center rounded-full border-2 transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function iconWrap(path: ReactNode) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {path}
    </svg>
  );
}

function HeartIcon() {
  return iconWrap(
    <path
      d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />,
  );
}

function CheckIcon() {
  return iconWrap(
    <path
      d="m5 13 4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.25"
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
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
    </>,
  );
}
