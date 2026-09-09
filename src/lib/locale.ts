import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";

/** Restreint la valeur brute du segment `[locale]` au type `Locale` (404 sinon). */
export function assertLocale(value: string): Locale {
  if (!hasLocale(routing.locales, value)) {
    notFound();
  }
  return value;
}
