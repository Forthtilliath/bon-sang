import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import i18next from "eslint-plugin-i18next";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-config-next enregistre déjà le plugin jsx-a11y : on ne fait qu'ajuster des règles.
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/label-has-associated-control": "error",
    },
  },
  {
    // Tout texte visible doit passer par next-intl (`useTranslations`/`getTranslations`) :
    // interdit le texte FR/EN en dur entre balises JSX (`mode: "jsx-text-only"`, le
    // défaut du plugin — les attributs comme `aria-label` ne sont pas couverts).
    // Les rares exceptions légitimes (nom de marque, nom d'auteur) sont hissées en
    // constante hors JSX plutôt que contournées : le plugin ne vérifie que les
    // littéraux réellement situés dans l'arbre JSX.
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);

export default eslintConfig;
