import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Chemin localisé pour une route donnée (FR = pas de préfixe, cf. localePrefix "as-needed"). */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}${clean}` || "/";
}

/** Bloc `alternates` (canonical + hreflang + x-default) pour `generateMetadata`. */
export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localizedPath(l, path)]),
  ) as Record<Locale, string>;

  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...languages,
      "x-default": localizedPath(routing.defaultLocale, path),
    },
  };
}

type PageMetaInput = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
};

/** Métadonnées communes d'une page de contenu (title, description, alternates, OpenGraph). */
export function pageMetadata({ locale, path, title, description }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: alternates(locale, path),
    openGraph: {
      type: "article",
      title,
      description,
      url: localizedPath(locale, path),
      locale,
    },
  };
}
