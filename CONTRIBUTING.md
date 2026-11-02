# Contribuer / Contributing

## Français

Les corrections, suggestions, améliorations de documentation et propositions de code sont bienvenues. Un compte GitHub suffit pour ouvrir une issue ou proposer une pull request. Les contributions sont examinées avant intégration ; les visiteurs ne modifient pas directement la branche principale.

### Signaler une erreur de prononciation

Indiquer le texte exact, le résultat obtenu, le résultat attendu en API, le contexte grammatical et une référence linguistique vérifiable. Préciser les choix de lecture dans « ? » et la version utilisée. Une variante régionale ou une préférence personnelle ne suffit pas à établir une erreur : la cible est le français moderne traditionnel, avec la lecture classique décrite dans la documentation.

### Proposer une modification

1. Créer un fork du dépôt, puis une branche consacrée à une seule correction.
2. Modifier les sources dans `src/`, plutôt que les trois copies du HTML à la main.
3. Ajouter un cas de régression pertinent pour une correction du moteur.
4. Lancer les vérifications adaptées, par exemple :

   ```sh
   node tests/run.mjs
   node tests/sonorities.mjs
   node tests/poetry.mjs
   node tests/sonority-palette.mjs
   ```

5. Si le HTML change, suivre [AGENTS.md](AGENTS.md) et conserver `versions.json` et l'historique. Construire avec `node tools/build.mjs --note "Description de la modification"`, puis synchroniser `index.html` avec `dist/index.html`. Ne pas écraser les anciennes archives ni réutiliser un numéro. Une modification de documentation seule ne nécessite pas une nouvelle version du HTML.
6. Ouvrir une pull request décrivant le problème, la solution, les références et les vérifications. Joindre des captures pour une modification d'interface.

La suite complète `npm test` nécessite des données externes décrites dans [GITHUB.md](GITHUB.md). Les tests navigateur nécessitent Playwright. Ne pas annoncer une suite réussie si ses ressources sont absentes. Ne pas ajouter de dépendance réseau au fonctionnement de l'application, ni de données sans provenance et conditions d'utilisation documentées. Les règles propres aux ressources tierces restent applicables.

## English

Bug reports, documentation improvements and code proposals are welcome. Use a GitHub account to open an issue or submit a pull request. Contributions are reviewed before merging; visitors do not write directly to the main branch.

### Report a pronunciation issue

Include the exact French input, actual IPA output, expected IPA output, grammatical context and a verifiable linguistic reference. Specify any reading choices made through “?” and the version used. Regional variants or personal preferences alone do not establish an error: the target is traditional modern French, using the documented classical reading policy.

### Submit a change

1. Fork the repository and create a branch for one focused change.
2. Edit `src/` rather than manually editing the three standalone HTML copies.
3. Add a meaningful regression case for changes to the transcription engine.
4. Run the relevant checks, such as the four commands shown above.
5. When the generated HTML changes, follow [AGENTS.md](AGENTS.md), preserve `versions.json` and the version history, build with `node tools/build.mjs --note "Description of the change"`, then copy `dist/index.html` to `index.html`. Never overwrite older archives or reuse their numbers. Documentation-only changes do not require a new HTML version.
6. Open a pull request explaining the problem, solution, references and checks. Include screenshots for interface changes.

The complete `npm test` suite requires external datasets described in [GITHUB.md](GITHUB.md). Browser tests require Playwright. Do not claim unavailable checks passed. Preserve offline operation and document the origin and terms of any added data. Third-party resource terms continue to apply.
