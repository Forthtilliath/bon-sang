"use client";

import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Drop } from "@/components/ui/drop";

export default function LocaleError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("ErrorPage");

  return (
    <Container className="flex flex-1 flex-col items-start justify-center gap-6 py-20">
      <span className="border-ink bg-accent shadow-sticker flex size-20 items-center justify-center rounded-full border-2">
        <Drop className="text-primary size-10 rotate-180" />
      </span>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {t("title")}
      </h1>
      <p className="text-muted max-w-xl text-lg">{t("description")}</p>
      <button type="button" onClick={reset} className={buttonClasses()}>
        {t("retry")}
      </button>
    </Container>
  );
}
