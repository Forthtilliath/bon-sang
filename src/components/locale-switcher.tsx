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
    <nav aria-label={t("label")} className="flex items-center gap-2 text-sm">
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "rounded px-1.5 py-0.5 uppercase transition-colors",
              isActive
                ? "font-semibold text-zinc-900 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50",
            )}
          >
            {locale}
          </Link>
        );
      })}
    </nav>
  );
}
