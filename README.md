# Don du sang

Site d'information et d'incitation au don du sang : comprendre à quoi sert un don et qui il
aide, tester son éligibilité, trouver une collecte près de chez soi (données ouvertes EFS) et
être rappelé dès qu'on peut redonner.

Projet de portfolio. Le plan de développement détaillé est dans [`ROADMAP.md`](./ROADMAP.md).

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) + **TypeScript** strict
- **Tailwind CSS v4**
- **next-intl** (FR / EN) — _lot 2_
- **MapLibre GL** pour la carte des collectes — _lot 8_
- **Vitest** + **Playwright** — _lots 5 & 10_

## Démarrage

```bash
npm install
cp .env.example .env.local   # renseigner les variables au fil des lots
npm run dev
```

Le site tourne sur [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | Rôle                                 |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Serveur de développement (Turbopack) |
| `npm run build`        | Build de production                  |
| `npm run start`        | Sert le build de production          |
| `npm run lint`         | ESLint (flat config + jsx-a11y)      |
| `npm run typecheck`    | Vérification TypeScript              |
| `npm run format`       | Formate le code avec Prettier        |
| `npm run format:check` | Vérifie le formatage sans écrire     |

## Données & sources

Les collectes proviennent de l'open data de l'EFS (Établissement français du sang). Les
critères d'éligibilité sont repris de la documentation officielle EFS. Ce site n'est **pas
affilié** à l'EFS — voir la page « À propos ».

Aucune donnée personnelle n'est envoyée à un serveur : le journal de dons, le rappel
d'éligibilité et le résultat du quiz restent dans le navigateur (`localStorage`).
