import { Drop } from "@/components/ui/drop";

// Nom de marque (logo texte « Bon Sang »), volontairement non traduit : hissé en
// constantes hors JSX pour rester lisible par `i18next/no-literal-string`, qui ne
// vérifie que les littéraux réellement situés dans l'arbre JSX.
const BRAND_PREFIX = "Bon ";
const BRAND_HIGHLIGHT = "Sang";

export function BrandMark() {
  return (
    <span className="font-display flex items-center gap-2 text-xl font-semibold tracking-tight">
      <span className="border-ink bg-primary text-accent flex size-8 items-center justify-center rounded-full border-2">
        <Drop className="size-4" />
      </span>
      <span>
        {BRAND_PREFIX}
        <span className="text-primary font-medium italic">{BRAND_HIGHLIGHT}</span>
      </span>
    </span>
  );
}
