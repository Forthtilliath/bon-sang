import { useTranslations } from "next-intl";

import { Drop } from "@/components/ui/drop";

/**
 * Bandeau défilant (décoratif, masqué aux lecteurs d'écran) : le contenu est
 * dupliqué et translaté de -50 % en boucle. Figé si `prefers-reduced-motion`.
 */
export function Marquee() {
  const t = useTranslations("HomePage.marquee");
  const kinds = useTranslations("Collectes.kinds");

  const items = [
    kinds("blood"),
    t("noFactory"),
    kinds("plasma"),
    t("noStock"),
    kinds("platelets"),
    t("everyDay"),
  ];

  return (
    <div
      aria-hidden="true"
      className="border-ink bg-primary text-primary-fg overflow-hidden border-b-2 py-3"
    >
      <div className="animate-marquee flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {items.map((item) => (
              <li
                key={item}
                className="font-display flex items-center gap-6 pr-6 text-2xl font-medium whitespace-nowrap italic"
              >
                {item}
                <Drop className="text-accent size-4" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
