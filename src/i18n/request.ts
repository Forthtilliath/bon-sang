import { locale as localeRootParam } from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing, type Locale } from "./routing";

async function resolveLocale(explicit: string | undefined): Promise<Locale> {
  // `explicit` est fourni quand on appelle p.ex. getTranslations({locale: "en"}).
  if (hasLocale(routing.locales, explicit)) return explicit;
  const fromSegment = await localeRootParam();
  return hasLocale(routing.locales, fromSegment) ? fromSegment : routing.defaultLocale;
}

export default getRequestConfig(async ({ locale }) => {
  const active = await resolveLocale(locale);

  return {
    locale: active,
    messages: (await import(`../../messages/${active}.json`)).default,
  };
});
