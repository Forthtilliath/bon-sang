"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1 text-sm">
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            aria-label={t(locale)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded px-1.5 py-0.5 uppercase transition-colors",
              isActive ? "text-fg font-semibold" : "text-muted hover:text-fg",
            )}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
