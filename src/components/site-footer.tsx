import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/site";

export function SiteFooter() {
  const nav = useTranslations("Nav");
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();
  // Nom de l'auteur : mention légale, jamais traduite. Un gabarit hors JSX plutôt
  // qu'un texte en dur entre balises (cf. règle `i18next/no-literal-string`).
  const copyright = `© ${year} · Vincent Lisita`;

  return (
    <footer className="border-border bg-surface mt-auto border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
        <nav aria-label={nav("secondary")}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted hover:text-fg">
                  {nav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-muted space-y-2 text-xs">
          <p>{t("disclaimer")}</p>
          <p>{t("privacy")}</p>
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
