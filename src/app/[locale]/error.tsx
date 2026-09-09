"use client";

import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function LocaleError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("ErrorPage");

  return (
    <Container className="flex flex-1 flex-col justify-center gap-4 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted">{t("description")}</p>
      <button
        type="button"
        onClick={reset}
        className={buttonClasses({ variant: "outline", className: "self-start" })}
      >
        {t("retry")}
      </button>
    </Container>
  );
}
