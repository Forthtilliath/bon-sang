# Changelog

Toutes les évolutions notables de **Bon Sang**. Le format s'inspire de
[Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet suit le
[versionnage sémantique](https://semver.org/lang/fr/).

## [1.0.0] — 2026-09-27

Première version stable : le projet est **terminé**.

### Fonctionnalités

- **Comprendre** : à quoi sert un don, parcours d'une poche, chiffres clés sourcés (EFS).
- **Qui ça aide** : fiches drépanocytose, mucoviscidose et maladie de Steinert, témoignages
  (personas illustratifs) et associations de patients.
- **Puis-je donner ?** : quiz d'éligibilité multi-étapes d'après les critères EFS (version
  datée), réponses conservées localement, quatre verdicts (éligible, à patienter avec date
  calculée, à vérifier, contre-indication), lien vers le suivi.
- **Collectes** : recherche par ville via l'API Carto de l'EFS, carte MapLibre clusterisée et
  liste synchronisées, filtres par type de don, période, rayon et distance, « autour de moi »,
  lien de partage d'une collecte, repli en liste si WebGL est indisponible.
- **Mon suivi** : journal de dons (ajout, édition, suppression), prochaine date d'éligibilité
  avec plafonds annuels, statistiques, badges, export `.ics` avec rappel et import/export JSON,
  entièrement local.
- Bilingue FR / EN, thème clair / sombre (système ou manuel), service worker pour le quiz et
  le suivi hors ligne, SEO (métadonnées, sitemap, JSON-LD, image OpenGraph générée).

### Design

- Thème graphique « Plasma & Globule » : palette papier / encre bordeaux, rouge globule,
  jaune plasma, bleu veine ; thème sombre « Nuit » ; polices Fraunces, Bricolage Grotesque et
  JetBrains Mono ; cartes et boutons « sticker », grain papier, gouttes, vagues ; page
  d'accueil avec poche de sang illustrée et bandeau défilant.

### Qualité

- Accessibilité : navigation clavier complète (menu, quiz, bulles de carte), focus géré,
  `prefers-reduced-motion`, contrastes AA ; scan axe WCAG A/AA sans violation en CI.
- Sécurité : en-têtes HTTP (CSP, HSTS…), validation stricte des imports, liens de prise de
  rendez-vous restreints aux domaines EFS.
- Tests : 149 tests unitaires et de composants (Vitest, Testing Library), 18 tests E2E
  (Playwright), budget Lighthouse ; CI GitHub Actions bloquante sur `main`.
- Dépendances à jour (Next.js 16, React 19, TypeScript 6) ; montées majeures incompatibles
  ignorées par Dependabot et documentées.

### Corrigé en fin de projet

- Recherche de collectes vide quand `EFS_COLLECTES_URL` était définie mais vide.
- Bulle d'une collecte sur la carte qui s'ouvrait défilée, masquant son nom.
- Texte d'aide du quiz qui chevauchait la question ; guillemet décoratif rogné sur les
  témoignages.
- Les échecs de l'API EFS sont désormais journalisés côté serveur.

[1.0.0]: https://github.com/Forthtilliath/bon-sang/releases/tag/v1.0.0
