import { useTranslations } from "next-intl";

import { Drop } from "@/components/ui/drop";
import { Wave } from "@/components/ui/wave";
import { Link } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/site";

// Logotype géant (marque, jamais traduite) : constantes hors JSX, cf. brand-mark.
const WORDMARK_PREFIX = "Bon";
const WORDMARK_HIGHLIGHT = "Sang";

export function SiteFooter() {
  const nav = useTranslations("Nav");
  const t = useTranslations("Footer");
  const meta = useTranslations("Metadata");
  // Doit refléter la vraie année en cours à chaque rendu (mention légale) —
  // pas un état à figer une fois pour toutes au montage.
  // eslint-disable-next-line @eslint-react/purity
  const year = new Date().getFullYear();
  // Nom de l'auteur : mention légale, jamais traduite. Un gabarit hors JSX plutôt
  // qu'un texte en dur entre balises (cf. règle `i18next/no-literal-string`).
  const copyright = `© ${year} · Vincent Lisita`;

  return (
    <footer className="text-deep-fg mt-auto pt-16">
      <Wave className="text-deep -mb-px" />
      <div className="bg-deep overflow-hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-10 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr]">
            <p className="font-display max-w-sm text-2xl leading-snug text-balance">
              {meta("description")}
            </p>

            <nav aria-label={nav("secondary")}>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="hover:text-accent group flex items-center gap-2 font-medium transition-colors"
                    >
                      <Drop className="text-accent size-3 shrink-0 transition-transform group-hover:scale-125" />
                      {nav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="border-deep-fg/20 text-deep-muted flex flex-col gap-2 border-t pt-6 text-xs">
            <p>{t("disclaimer")}</p>
            <p>{t("privacy")}</p>
            <p className="font-mono">{copyright}</p>
          </div>

          <p
            aria-hidden="true"
            className="font-display h-[0.62em] overflow-hidden text-[clamp(4.5rem,20vw,15rem)] leading-none font-semibold tracking-tighter select-none"
          >
            {WORDMARK_PREFIX}
            <span className="text-accent font-medium italic">{WORDMARK_HIGHLIGHT}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
