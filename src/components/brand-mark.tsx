// Nom de marque (logo texte « Bon Sang »), volontairement non traduit : hissé en
// constantes hors JSX pour rester lisible par `i18next/no-literal-string`, qui ne
// vérifie que les littéraux réellement situés dans l'arbre JSX.
const BRAND_PREFIX = "Bon ";
const BRAND_HIGHLIGHT = "Sang";

export function BrandMark() {
  return (
    <>
      {BRAND_PREFIX}
      <span className="text-primary">{BRAND_HIGHLIGHT}</span>
    </>
  );
}
