import { locale as localeRootParam } from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { type Locale, routing } from "./routing";

// `next/root-params` est une API expérimentale de Next.js, sans typage
// précis à ce jour (`any`) — on l'appelle ici via une signature explicite
// plutôt que de propager l'`any` (et l'appel « unsafe » qui va avec).
const getRootLocale = localeRootParam as () => Promise<string | undefined>;

async function resolveLocale(explicit: string | undefined): Promise<Locale> {
  // `explicit` est fourni quand on appelle p.ex. getTranslations({locale: "en"}).
  if (hasLocale(routing.locales, explicit)) return explicit;
  const fromSegment = await getRootLocale();
  return hasLocale(routing.locales, fromSegment) ? fromSegment : routing.defaultLocale;
}

export default getRequestConfig(async ({ locale }) => {
  const active = await resolveLocale(locale);

  return {
    locale: active,
    timeZone: "Europe/Paris",
    messages: (await import(`../../messages/${active}.json`)).default,
  };
});
