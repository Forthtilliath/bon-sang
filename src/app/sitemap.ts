import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { localizedPath, SITE_URL } from "@/lib/seo";

const ROUTES = [
  { path: "/", priority: 1, changeFrequency: "monthly" as const },
  { path: "/comprendre", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/qui-ca-aide", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/eligibilite", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/collectes", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/mon-suivi", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/a-propos", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${localizedPath(routing.defaultLocale, path)}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${SITE_URL}${localizedPath(locale, path)}`]),
      ),
    },
  }));
}
