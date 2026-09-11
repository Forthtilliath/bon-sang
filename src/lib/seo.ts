import type { Metadata } from "next";

import { routing, type Locale } from "@/i18n/routing";

const siteUrlFromEnv = process.env.NEXT_PUBLIC_SITE_URL;

// En production, l'URL du site est indispensable (canonical, sitemap, OpenGraph).
// On échoue le build plutôt que de laisser filer un fallback `localhost`.
if (!siteUrlFromEnv && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL est requis en production. Définissez-le avant `next build`.",
  );
}

export const SITE_URL = siteUrlFromEnv ?? "http://localhost:3000";

/** Chemin localisé pour une route donnée (FR = pas de préfixe, cf. localePrefix "as-needed"). */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${prefix}${clean}` || "/";
}

export type BreadcrumbItem = { name: string; path: string };

/** JSON-LD `BreadcrumbList` : `items` va de la racine à la page courante. */
export function breadcrumbJsonLd(locale: Locale, items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${localizedPath(locale, item.path)}`,
    })),
  };
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
