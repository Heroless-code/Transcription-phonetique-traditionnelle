# Dépôt GitHub — version actuelle

Ouvrir [Application.html](../Application.html) dans un navigateur. Le fichier contient l’application et son lexique pour un usage hors ligne. Les copies Transcription-phonetique-traditionnelle.html et dist/index.html dans ce dossier sont identiques.

## Déposer le projet

Le fichier Application.html se trouve à la racine du dépôt. Le dossier developpement contient les sources et les tests.

## Développement

Les sources, outils, tests, rapports et notices sont inclus. Node.js récent suffit pour reconstruire le HTML, sans dépendance npm à installer :

```text
node tools/build.mjs --note "Description de la modification"
```

L'outil garde l'historique et n'invente pas de version si le HTML ne change pas. La génération actualise aussi le fichier Application.html à la racine du dépôt. La création des ZIP numérotés utilise PowerShell uniquement en développement.

Contrôles autonomes :

```text
node tests/run.mjs
node tests/sonorities.mjs
node tests/poetry.mjs
node tests/sonority-palette.mjs
```

Les tests de navigateur nécessitent Playwright et un navigateur de développement. Ces outils ne sont pas nécessaires pour utiliser le HTML.

## Données brutes et archives

Les anciennes archives ZIP, les copies HTML temporaires et les gros téléchargements bruts sont exclus. Le lexique généré nécessaire est entièrement intégré à src/lexicon-data.js et au HTML. Les données brutes ne sont nécessaires ni au fonctionnement ni à la génération du HTML.

L'audit externe tests/source-morphology-audit.mjs, appelé par npm test, exige data/references/Lexique4.1/Lexique4.1.tsv, à restaurer depuis la source indiquée dans data/references/LEXIQUE_ATTRIBUTION.md. Les outils de reconstruction du lexique depuis zéro exigent aussi le JSONL original fourni par l'utilisateur, non compris dans ce dépôt. Les candidats bruts GLÀFF peuvent être régénérés selon data/README.md. Les tests d'alignement disposent de leur échantillon inclus. Les rapports existants sont conservés.

Les attributions et conditions connues figurent dans data/references et dans le HTML. Aucune origine ni licence supplémentaire n'est inventée pour le JSONL initial. L'historique des versions est conservé ; les anciennes archives ne sont pas incluses ni recréées.

SHA-256 du HTML : d787c9941d8dc540e0bb658d915f60dc2284d9700320bd88c66a949dd727b927.
