import { defineConfig, globalIgnores } from "eslint/config";

import { createNextJsConfig } from "@forthtilliath/eslint-config/nextjs";

const eslintConfig = defineConfig([
  // strict: false — this app previously ran eslint-config-next's looser
  // "recommended" preset; keep that baseline rather than jumping straight to
  // typescript-eslint's strictTypeChecked. turbo: false — standalone repo,
  // not a Turborepo. i18n: true — every visible string must go through
  // next-intl (see the i18next/no-literal-string rationale below).
  ...createNextJsConfig({ strict: false, turbo: false, i18n: true }),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/label-has-associated-control": "error",
      // Tout texte visible doit passer par next-intl (`useTranslations`/`getTranslations`) :
      // interdit le texte FR/EN en dur entre balises JSX (`mode: "jsx-text-only"`, le
      // défaut du plugin — les attributs comme `aria-label` ne sont pas couverts).
      // Les rares exceptions légitimes (nom de marque, nom d'auteur) sont hissées en
      // constante hors JSX plutôt que contournées : le plugin ne vérifie que les
      // littéraux réellement situés dans l'arbre JSX.
      "i18next/no-literal-string": "error",
    },
  },
  {
    // Not part of the package's tsconfig (only **/*.ts/tsx/mts are
    // included), so keep it out of type-aware linting.
    ignores: ["scripts/strip-claude-attribution.mjs"],
  },
  {
    // shadcn/ui-style co-location: a `xxxClasses`/`xxxVariants` helper next
    // to the component it styles, so consumers can reuse the same classes on
    // a custom element. Breaks Fast Refresh's "one component per file"
    // assumption, but it's a deliberate convention, not a bug.
    files: ["src/components/ui/**/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // Test infrastructure (custom `render` wrapper, RTL re-exports) — never
    // hot-reloaded via Fast Refresh in the first place.
    files: ["src/test/**"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    // Purely count-based skeleton (`Array.from({ length: N })`), no other
    // identity, never reordered/filtered — an index key is safe.
    files: ["src/features/collectes/results-skeleton.tsx"],
    rules: {
      "@eslint-react/no-array-index-key": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);

export default eslintConfig;
