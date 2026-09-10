# Bon Sang

**Bon Sang** est un site d'information et d'incitation au don du sang : comprendre à quoi sert
un don et qui il aide, tester son éligibilité, trouver une collecte près de chez soi et être
rappelé dès qu'on peut redonner.

Projet de portfolio. Plan de développement : [`ROADMAP.md`](./ROADMAP.md).

## Fonctionnalités

- **Comprendre** — à quoi sert un don, le parcours d'une poche, chiffres clés.
- **Qui ça aide** — fiches drépanocytose / mucoviscidose / maladie de Steinert.
- **Puis-je donner ?** — quiz d'éligibilité multi-étapes (13 règles d'après les critères EFS),
  verdict : éligible / à patienter (+ date calculée) / à vérifier avec le médecin /
  contre-indication.
- **Collectes** — recherche par ville, carte MapLibre + liste synchronisées, filtres par type
  de don et par période, « autour de moi » (géoloc). Source : API Carto de l'EFS.
- **Mon suivi** — journal de dons, prochaine date d'éligibilité, badges, export `.ics` et JSON,
  **100 % local** (aucun serveur, aucun compte).
- Bilingue **FR / EN**, thème clair / sombre automatique, accessible au clavier.

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) + **TypeScript** strict
- **Tailwind CSS v4**
- **next-intl** v4 — FR par défaut sans préfixe, EN sous `/en`
- **MapLibre GL** + fonds **CARTO** (`voyager` / `dark-matter`, sans clé)
- **Vitest** (logique pure) + **Playwright** (parcours E2E)

## Démarrage

```bash
npm install
npm run dev
```

Le site tourne sur [http://localhost:3000](http://localhost:3000). Aucune variable
d'environnement n'est requise ; `.env.example` liste les surcharges facultatives.

## Scripts

| Script              | Rôle                                 |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Serveur de développement (Turbopack) |
| `npm run build`     | Build de production                  |
| `npm run start`     | Sert le build de production          |
| `npm run lint`      | ESLint (flat config + jsx-a11y)      |
| `npm run typecheck` | Vérification TypeScript              |
| `npm test`          | Tests unitaires (Vitest)             |
| `npm run e2e`       | Tests de bout en bout (Playwright)   |
| `npm run format`    | Formate le code avec Prettier        |

## Tests

- **Unitaires** (`npm test`) — moteur d'éligibilité, calcul de la prochaine date, badges,
  génération `.ics`, normalisation des collectes EFS, filtres. Aucune dépendance réseau.
- **E2E** (`npm run e2e`) — accueil + navigation + bascule de langue, parcours complet du quiz
  (éligible / contre-indication / à patienter), persistance du journal de dons, page collectes.
  Playwright lance un build de production ; `npx playwright install chromium` au premier usage.

La CI (GitHub Actions) exécute lint + typecheck + unitaires + build, puis les tests E2E.

## Déploiement (Vercel)

1. Importer le dépôt sur [Vercel](https://vercel.com/new) — Next.js est détecté automatiquement.
2. Définir la variable `NEXT_PUBLIC_SITE_URL` avec l'URL de production (métadonnées, sitemap,
   OpenGraph).
3. Chaque push sur `main` déclenche un déploiement ; chaque PR obtient un aperçu.

## Données & mentions

Les collectes proviennent de l'**API Carto de l'EFS** (Établissement français du sang). Les
critères d'éligibilité sont repris de la documentation grand public de l'EFS. Ce site n'est
**pas affilié** à l'EFS — voir la page « À propos ».

Aucune donnée personnelle n'est envoyée à un serveur : le journal de dons, le rappel
d'éligibilité et le résultat du quiz restent dans le navigateur (`localStorage`).
