"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "@/lib/site";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const closeMenu = () => setOpen(false);

  return (
    <header className="border-border bg-bg/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          <span className="text-primary">Don</span> du sang
        </Link>

        <nav aria-label={t("primary")} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary-subtle text-primary"
                      : "text-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <button
            type="button"
            className="text-muted hover:bg-surface hover:text-fg rounded-full p-2 md:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={t(open ? "closeMenu" : "openMenu")}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div id={menuId} hidden={!open} className="border-border border-t md:hidden">
        <nav aria-label={t("primary")} className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-primary-subtle text-primary"
                      : "text-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {open ? (
        <path
          d="M5 5l10 10M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M3 6h14M3 10h14M3 14h14"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
