# Dépôt GitHub — version actuelle

Le programme et son lexique embarqué sont identiques à la version actuelle. Ouvrir index.html dans un navigateur : il fonctionne seul et hors ligne. Les copies Transcription-phonetique-traditionnelle.html et dist/index.html sont identiques.

## Déposer le projet

Décompresser cette archive puis déposer son contenu dans le dépôt, avec index.html à la racine. Déposer uniquement le ZIP ne publie pas l'application comme site. Le dossier racine est prêt pour un hébergement statique.

## Développement

Les sources, outils, tests, rapports et notices sont inclus. Node.js récent suffit pour reconstruire le HTML, sans dépendance npm à installer :

```text
node tools/build.mjs --note "Description de la modification"
```

L'outil garde l'historique et n'invente pas de version si le HTML ne change pas. Après génération, recopier dist/index.html vers index.html pour actualiser la page d'accueil du dépôt. La création des ZIP numérotés utilise PowerShell uniquement en développement.

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

SHA-256 du HTML : f15264feec385e5aaea46a883d19c89a3e5fedcf40ab94376e78ae006eb596b7.
