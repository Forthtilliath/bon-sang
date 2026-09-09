import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // FR (langue par défaut) servi sans préfixe ; EN sous /en.
  localePrefix: "as-needed",
  // `/` sert toujours le français : pas de redirection selon la langue du navigateur.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
