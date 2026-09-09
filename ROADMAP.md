# Bon Sang — ROADMAP

**Bon Sang** — site d'information et d'incitation au don du sang. Projet de portfolio
(catégorie `react`, prolonge le « fil santé » avec Glucodose).

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

| Domaine     | Choix                                                           |
| ----------- | --------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, RSC, Turbopack), TS strict              |
| Style       | Tailwind CSS v4                                                 |
| i18n        | FR (défaut) + EN — `next-intl` v4, segment `[locale]`           |
| Carte       | MapLibre GL JS + tuiles vecteur (style clair/sombre)            |
| Données EFS | ISR (revalidate) sur un fetch de l'open data                    |
| État perso  | localStorage + petit hook `usePersistentState`                  |
| Tests       | Vitest (logique quiz / dates) + Playwright (parcours)           |
| Qualité     | ESLint (flat config) + Prettier + a11y (eslint-plugin-jsx-a11y) |
| Déploiement | Vercel (ISR natif)                                              |

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

```
src/
  app/[locale]/...          routes ci-dessus + layout, not-found, error
  components/               UI réutilisable (Button, Card, Stepper, MapView…)
  features/
    eligibility/            moteur de règles, composants du quiz
    collectes/              fetch EFS, normalisation, carte, filtres
    suivi/                  logique dates, badges, storage
  data/                     règles quiz, contenu maladies, badges (typé)
  i18n/                     config next-intl, messages/fr.json, messages/en.json
  lib/                      utils (dates, fetch, cn)
  hooks/                    usePersistentState, useGeolocation
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
2. **Critères d'éligibilité** : figer la liste de règles depuis la page officielle
   EFS à une date donnée, avec mention « critères au JJ/MM/AAAA ». _Encore à faire :
   contenu du quiz volontairement présenté comme indicatif et non exhaustif._
3. ~~**Tuiles carto**~~ ✅ **Résolu (lot 8)** : **OpenFreeMap** (`tiles.openfreemap.org`),
   styles `positron` (clair) / `dark`. Sans clé, sans variable d'env.
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
| 8 ✅  | Carte MapLibre (OpenFreeMap) + liste synchro + filtres type/période + géoloc        |
| 9 ✅  | a11y (clavier/SR, reduced-motion), OG image générée, favicon, manifest, error.tsx   |
| 10 ✅ | Playwright (11 tests E2E) + CI GitHub Actions + README + doc déploiement Vercel     |

---

## 8. Hors périmètre (pour mémoire)

Comptes utilisateurs, backend/BDD, notifications push, prise de RDV réelle,
appli mobile. Le rappel se fait via `.ics` / la page `/mon-suivi`, pas par email.
