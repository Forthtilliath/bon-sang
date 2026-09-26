# Bon Sang — ROADMAP

**Bon Sang** — site d'information et d'incitation au don du sang. Projet de portfolio
(catégorie `react`, prolonge le « fil santé » avec Glucodose).

> **Statut : terminé** — v1.0.0 le 2026-09-27 (voir [`CHANGELOG.md`](./CHANGELOG.md)). Les
> 10 lots ci-dessous sont livrés, suivis d'un audit d'améliorations et d'une refonte
> graphique (§9). Ce document est conservé comme trace du plan initial.

---

## 1. Objectif & angle

Faire passer un visiteur de « je ne sais pas si je peux / à quoi ça sert » à
« je sais que je suis éligible et je sais où aller ». Trois piliers :

1. **Comprendre** — à quoi sert un don, qui il aide (témoignages patients).
2. **Se tester** — quiz d'éligibilité « Puis-je donner ? ».
3. **Agir** — carte des collectes (open data EFS) + rappel « à nouveau éligible le… ».

Pas de collecte de données personnelles côté serveur : tout ce qui est « perso »
(journal de dons, rappel, résultat du quiz) vit en **localStorage**. C'est un choix
produit assumé (pas de compte, pas de RGPD lourd) et un argument à mettre en avant.

---

## 2. Stack technique

| Domaine     | Choix                                                              |
| ----------- | ------------------------------------------------------------------ |
| Framework   | Next.js 16 (App Router, RSC, Turbopack), React 19, TS 6 strict     |
| Style       | Tailwind CSS v4, thème « Plasma & Globule » (tokens `@theme`)      |
| i18n        | FR (défaut) + EN — `next-intl` v4, segment `[locale]`              |
| Carte       | MapLibre GL JS + tuiles vecteur (style clair/sombre)               |
| Données EFS | ISR (revalidate) sur un fetch de l'open data                       |
| État perso  | localStorage via `usePersistentState` (`@forthtilliath/react-kit`) |
| Tests       | Vitest + Testing Library, Playwright + axe, Lighthouse CI          |
| Qualité     | ESLint (`@forthtilliath/eslint-config`) + Prettier + lefthook      |
| Déploiement | Vercel (ISR natif)                                                 |

---

## 3. Pages & routes

```
/[locale]
  /                 Accueil — pitch, CTA « Puis-je donner ? » + « Trouver une collecte »
  /comprendre       À quoi sert un don, le parcours d'une poche, chiffres clés
  /qui-ca-aide      Témoignages : mucoviscidose, maladie de Steinert, drépanocytose
  /eligibilite      Quiz « Puis-je donner ? » (multi-étapes, résultat + délais)
  /collectes        Carte MapLibre + liste filtrable (ville, date, type de don)
  /mon-suivi        Journal de dons + badges + prochaine date d'éligibilité
  /a-propos         Sources, méthodo, mentions (données EFS, non affilié)
```

- **SEO** : metadata par page, `sitemap.ts`, `robots.ts`, OpenGraph, JSON-LD
  (`MedicalWebPage` / `FAQPage` sur `/eligibilite`).
- **a11y** : navigation clavier complète, focus visible, `prefers-reduced-motion`,
  contraste AA, quiz utilisable sans souris, carte doublée d'une liste.

---

## 4. Fonctionnalités — détail

### 4.1 Quiz d'éligibilité `/eligibilite`

- Questions basées sur les **critères officiels EFS** (âge 18–70, poids ≥ 50 kg,
  délais voyage/tatouage/piercing/soins dentaires, grossesse, traitements…).
- Moteur de règles en données (`src/data/eligibility-rules.ts`) → testable unitairement.
- Résultat : **éligible** / **éligible après une date** / **contre-indication** /
  « à vérifier avec le médecin de collecte ».
- Disclaimer visible : indicatif, l'entretien pré-don fait foi.
- Bouton « M'en souvenir » → enregistre la date de ré-éligibilité dans `/mon-suivi`.

### 4.2 Carte des collectes `/collectes`

- Source : **API Carto EFS v3** (cf. §6). Fetch côté serveur avec `revalidate` 1 h,
  normalisation vers `Collecte { id, nom, adresse, ville, codePostal, lat, lng, date,
heureDebut, heureFin, horaires, typesDon[], fixe, rdvUrl, placesRestantes }`.
- Carte MapLibre (clusters), panneau latéral liste synchronisée, filtres :
  ville / code postal, plage de dates, type de don (sang / plasma / plaquettes).
- Géoloc navigateur optionnelle (« près de chez moi ») — jamais bloquante.
- Fallback total si l'API EFS est indisponible : message + lien vers le site EFS.

### 4.3 Mon suivi `/mon-suivi`

- Ajout manuel d'un don (date, type, lieu libre).
- Calcul de la **prochaine date d'éligibilité** selon le type et le sexe
  (sang total : 8 semaines ; plasma : 2 semaines ; plaquettes : 4 semaines ;
  plafonds annuels H/F).
- Compteur « prochain don dans X jours » + option rappel calendrier (`.ics`).
- **Badges** : premier don, 3 dons, 1 an de régularité, « donneur universel » (O-),
  etc. — purement locaux, ludiques.
- Export / import JSON du journal.

### 4.4 Qui ça aide `/qui-ca-aide`

- 3 fiches maladies avec témoignage (contenu rédigé, sourcé, pas de vraie identité
  sans accord — personas illustratifs clairement étiquetés).
- Lien vers associations (AFM-Téléthon, Vaincre la Mucoviscidose, SOS Globi).

---

## 5. Architecture dossiers

Arborescence réelle en fin de projet (le plan initial prévoyait `features/suivi/` et
`hooks/` ; le hook de persistance vit désormais dans `@forthtilliath/react-kit`) :

```
src/
  app/[locale]/...          routes ci-dessus + layout, not-found, error, icône, image OG
  components/
    ui/                     primitives du thème (button, card, input, chip, eyebrow, drop, wave…)
    home/                   sections de l'accueil (hero, poche de sang, bandeau, étapes…)
    …                       en-tête, pied de page, bascules thème / langue, en-tête de page
  features/
    eligibility/            moteur de règles, quiz et ses champs, résultat
    collectes/              fetch EFS, normalisation, filtres, explorateur, carte MapLibre
    tracker/                journal, prochaine date, statistiques, badges, import/export
  data/                     contenu typé (chiffres clés, maladies)
  i18n/                     config next-intl, navigation, routing
  lib/                      utilitaires (dates, .ics, SEO, cn, uuid…)
  test/                     helpers Vitest
messages/                   fr.json, en.json
```

---

> **Note i18n** : Next 16 propose une i18n native (segment `[lang]` + `next/root-params`),
> mais elle ne couvre pas les Client Components (quiz, carte, suivi). On garde donc
> `next-intl` v4 qui fournit `useTranslations` côté serveur **et** client, plus le
> formatage nombres/dates (utile pour « prochain don dans X jours »).

## 6. Points à confirmer avant / pendant le dev

1. ~~**Dataset EFS**~~ ✅ **Résolu (lot 7)** : API Carto EFS v3
   `https://oudonner.api.efs.sante.fr/carto-api/v3` (`/city/searchbyinput` pour géocoder,
   `/samplingcollection/searchbycityname` et `/searchinsquare` pour les collectes). Pas de
   clé requise. Peu fiable côté serveur EFS → cache ISR + fallback en place.
2. ~~**Critères d'éligibilité**~~ ✅ **Résolu** : règles figées à une date
   (`CRITERIA_UPDATED_AT`), mention « critères au JJ/MM/AAAA » sous le résultat du quiz et
   dans « À propos ». Le quiz reste présenté comme indicatif et non exhaustif.
3. ~~**Tuiles carto**~~ ✅ **Résolu (lot 8)** : fonds **CARTO** (`basemaps.cartocdn.com`),
   styles `voyager` (clair) / `dark-matter` (sombre). Sans clé, sans variable d'env.
4. **Contenu témoignages** : rédigé par nos soins, personas illustratifs.

---

## 7. Découpage en lots (commits / PR)

| Lot   | Contenu                                                                             |
| ----- | ----------------------------------------------------------------------------------- |
| 1 ✅  | Scaffold Next.js + TS + Tailwind + ESLint/Prettier + structure dossiers             |
| 2 ✅  | i18n next-intl (segment `[locale]`, fr/en, proxy, switcher)                         |
| 3 ✅  | Design tokens, header/footer, page d'accueil, pages stub par section                |
| 4 ✅  | Contenu `/comprendre` `/qui-ca-aide` `/a-propos` + sitemap/robots/hreflang/JSON-LD  |
| 5 ✅  | Quiz éligibilité : moteur de règles + Vitest (24 tests) + UI multi-étapes + FAQ     |
| 6 ✅  | `usePersistentState` + `/mon-suivi` (journal, prochaine date, badges, .ics, export) |
| 7 ✅  | Collectes : API Carto EFS v3 + normalisation + tests + recherche par ville          |
| 8 ✅  | Carte MapLibre (fonds CARTO) + liste synchro + filtres type/période + géoloc        |
| 9 ✅  | a11y (clavier/SR, reduced-motion), OG image générée, favicon, manifest, error.tsx   |
| 10 ✅ | Playwright (11 tests E2E) + CI GitHub Actions + README + doc déploiement Vercel     |

---

## 8. Hors périmètre (pour mémoire)

Comptes utilisateurs, backend/BDD, notifications push, prise de RDV réelle,
appli mobile. Le rappel se fait via `.ics` / la page `/mon-suivi`, pas par email.

---

## 9. Après les lots — jusqu'à la v1.0.0

- **Audit d'améliorations** (septembre 2026) : en-têtes de sécurité, validation des imports,
  tests de composants et d'accessibilité (axe), clavier et focus (quiz, menu, carte), carte
  clusterisée et chargée à la demande, persistance du quiz, partage d'une collecte, service
  worker, Lighthouse CI, analytics sans cookie.
- **Refonte graphique « Plasma & Globule »** : identité propre (palette sang / plasma / veine,
  Fraunces + Bricolage Grotesque + JetBrains Mono, composants « sticker », poche de sang
  illustrée), fichiers de plus de 300 lignes découpés.
- **Maintenance** : dépendances à jour, montées majeures incompatibles ignorées par
  Dependabot (maplibre-gl 6, eslint 10, typescript ≥ 6.1, @types/node majeure).

Restes connus, hors v1.0.0 : migration vers maplibre-gl 6 (corrige un avis de sécurité non
exploitable ici, mais casse les tuiles CARTO), E2E sur viewport mobile et WebKit.
