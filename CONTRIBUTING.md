# Contribuer / Contributing

## Français

Les signalements et les pull requests sont bienvenus. Pour une erreur de prononciation, fournir le texte exact, l’API obtenue, l’API attendue et une référence linguistique.

Créer un fork, modifier les sources dans `developpement/src/`, puis proposer une pull request. Depuis `developpement/`, les contrôles courants sont `node tests/run.mjs`, `node tests/sonorities.mjs` et `node tests/poetry.mjs`. Les tests navigateur nécessitent Playwright ; certaines suites nécessitent des données externes documentées dans `developpement/GITHUB.md`.

Conserver le fonctionnement hors ligne et les notices des ressources. Pour reconstruire, depuis `developpement/`, utiliser `node tools/build.mjs --note "Description"`. Ce script actualise aussi `Application.html` à la racine. Suivre les règles de conservation dans [AGENTS.md](developpement/AGENTS.md). Les propositions sont examinées avant intégration.

## English

Bug reports and pull requests are welcome. Pronunciation reports should include the exact input, actual IPA, expected IPA and a linguistic reference.

Fork the project, edit `developpement/src/`, and submit a pull request. Run the relevant checks from `developpement/` using the commands above. Browser tests require Playwright; some suites need documented external data.

Preserve offline operation, data notices and version history. The build command also updates the root `Application.html`. Proposals are reviewed before merging.
