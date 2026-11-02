# Transcription phonétique traditionnelle

Ouvrir **Transcription-phonetique-traditionnelle.html** dans un navigateur récent. Ce fichier contient l’interface, le moteur et le lexique. Il peut être copié seul sur un autre ordinateur. Aucun serveur, compte, téléchargement ou installation n’est nécessaire pour l’utiliser. La copie de développement dans dist/index.html contient exactement les mêmes octets.

Saisir le texte puis cliquer sur **Transcrire**, ou utiliser Ctrl + Entrée. Par défaut, chaque ligne originale apparaît au-dessus de sa transcription API. Il ne reste qu'une option visuelle : **Sonorités**. Les précisions et variantes s'ouvrent dans le « ? » à droite du vers, sans augmenter sa hauteur.

**Sonorités** masque la ligne API pour afficher une vue plus compacte du texte et de ses répétitions. La transcription reste calculée pour l'analyse et reste copiable ; désactiver Sonorités la réaffiche à l'identique. Les titres Allitérations et Assonances près du vers filtrent ce vers ; ceux de la barre du haut filtrent tout le texte. Les sons ×1 sont masqués par défaut et peuvent être affichés avec leur bouton. Les pastilles conservent leur cycle mettre en évidence, masquer la couleur, rétablir la couleur.

La **lecture classique est la seule lecture proposée**. Elle conserve les e caducs à l'intérieur du vers selon la politique classique, avec les élisions et le traitement de fin de vers appropriés. Les ambiguïtés de diérèse/synérèse restent accessibles dans le « ? », séparément pour chaque occurrence. Les répétitions sont recalculées pour la variante choisie. Aucun mètre n'est imposé. Les changements de mode visuel conservent cette lecture et ses choix. Les conventions sont dans [Sonorités](docs/SONORITES.md) et [Lecture poétique](docs/LECTURE_POETIQUE.md).

## Architecture

1. **Lexique local** : filtrage du JSONL fourni, classement des variantes, contrôle croisé avec Lexique 4.1, stockage trié par blocs à préfixes communs et compression gzip. Le navigateur décompresse une fois, puis ne décode que les blocs consultés. Les transcriptions du JSONL ne portent pas d’étiquettes grammaticales ou régionales : leur classement est une sélection argumentée, pas une certification de chaque entrée. Lexique apporte des indications grammaticales, tout en conservant la priorité des oppositions et longueurs traditionnelles sur ses formes contemporaines.
2. **Références lexicales revues** : mots grammaticaux, exceptions fréquentes et oppositions traditionnelles prennent priorité sur l’extraction non étiquetée.
3. **Morphologie et repli** : recherche d’une base lexicale pour les préfixations, pluriels, adverbes et paradigmes réguliers ; règles graphophonologiques contextuelles lorsque cette base manque. Les préfixes productifs longs gardent leur prononciation dans des néologismes, y compris avec une base inconnue ou un second préfixe. Un mot inconnu produit une hypothèse signalée.
4. **Contexte** : sélection locale des homographes, désinences verbales, numéraux, schwas lexicaux et h disjonctifs. Les liaisons ont un type et une justification grammaticale ; seules les obligatoires identifiées et les locutions reconnues sont réalisées. Les facultatives sont omises.
5. **Phonologie et alignement** : segmentation de l’API en unités, syllabification, puis alignement contraint des graphèmes avec les seuls phonèmes retenus. La longueur et la nasalisation restent attachées à leur voyelle. Les lettres muettes restent sans couleur phonétique ; les correspondances non résolues restent neutres.
6. **Présentation** : HTML/CSS et JavaScript sans bibliothèque d’exécution. Le texte est inséré par les interfaces DOM de texte, jamais interprété comme du HTML. Une politique de contenu bloque les connexions réseau.

## Convention de lecture

Référentiel demandé : [Wiktionnaire, français moderne traditionnel](https://fr.wiktionary.org/wiki/Annexe:Prononciation/fran%C3%A7ais#Fran%C3%A7ais_moderne_traditionnel). Les distinctions /a–ɑ/, /ɛ̃–œ̃/, /e–ɛ/, /o–ɔ/, /ø–œ/ et les longueurs documentées sont conservées. La lecture classique est une étape phonologique distincte du moteur de base, sans importation d'un compte métrique à atteindre.

La diction conserve les schwas lexicaux pertinents, sans simuler toutes les réductions de la conversation spontanée. L’API constitue une lecture phonémique avec les longueurs lexicales retenues, et non une prédiction acoustique de chaque locuteur. Les frontières syllabiques sont recalculées à l’intérieur des mots ; la jonction effectivement réalisée porte `‿`. Les signes de ponctuation et les retours à la ligne sont préservés.

La v2 retire intégralement le mode Afficher les couleurs, ses options et son moteur de composition par familles. Les seules teintes conservées sont celles de Sonorités, une par phonème exact avec une version plus pâle pour les ×1. Le petit module color-math.js conserve uniquement les calculs de contraste et de mélange utiles à cette palette. Les anciens contrôles des couleurs sont historiques, hors des sources embarquées.

Le lexique enrichi contient 1 632 485 graphies, dont 3 609 ajouts sélectionnés dans [GLÀFF 1.2.2](https://redac.univ-tlse2.fr/lexiques/glaff.html). Les 1 628 876 anciennes entrées sont conservées intégralement. Les provenances et [attributions](data/references/GLAFF_ATTRIBUTION.md) sont documentées et la notice originale GLÀFF est incorporée au HTML.

Un index local comprimé de 23 371 noms féminins non ambigus, extrait de Lexique 4.1, sert à l’accord de certains cardinaux écrits en chiffres : « 21 amies » est développé avec « une ». Les noms épicènes et inconnus ne reçoivent pas de genre deviné. La nouvelle analyse reconnaît aussi certaines coordinations après complément et principales après une relative simple. Les limites et les premiers résultats conservés sont dans [la relecture de campagne](validation/nouvelle-campagne-review.md).

La dernière revue visuelle compare [les huit réglages](validation/color-matrix-final.png) aux largeurs 320, 390, 768 et 1 280 px. Les accents nasaux sont entièrement contenus dans leur fond. Quatre familles de consonnes auparavant proches ont été espacées par des teintes olive, pétrole ardoise, indigo et vieux rose ; les consonnes rares prononcées /h/ et /ʔ/ ont une teinte charbon violet. Les différences colorimétriques restent des diagnostics, pas une garantie universelle d’identification par couleur seule.

## Validation et limites

Les sept défauts de la revue du 31 octobre 2026 sont corrigés. Les 30 reproductions initiales et 913 contrôles voisins réussissent ; le lanceur général exécute 23 suites. La correction conserve les locutions complètes, les accords, les positions originales des accents décomposés et les groupements de chiffres. Les causes, les contrôles et les limites figurent dans [les corrections de la revue](CORRECTIONS_REVUE_2026-10-31.md).

Le [rapport de validation](RAPPORT_VALIDATION.md) distingue les régressions linguistiques, les invariants techniques, l’intégrité du lexique et les essais du fichier isolé dans un navigateur hors ligne. Les résultats détaillés sont conservés dans `validation/` et `data/`.

Les limites restantes concernent surtout les variantes lexicales sans provenance, les homographes qui exigent le sens de la phrase, les noms propres non documentés, les emprunts nouveaux et les analyses syntaxiques longues ou elliptiques. Le contexte repose sur des classes lexicales et des indices locaux ; aucun modèle syntaxique lourd n’est embarqué. Les mots inventés ne possèdent pas une prononciation objectivement certifiable. L’alignement peut rester partiel pour les graphies très irrégulières. L’application rend ces incertitudes consultables et ne prétend pas atteindre 100 % sur tout texte français.

Les ressources d’origine restent intactes. Le lexique provient du fichier fourni par l’utilisateur, dont les champs n’explicitent ni provenance complète ni licence ; ce projet documente cette origine sans inventer une attribution.

Complément : [Lexique 4.1](https://www.lexique.org/), Boris New, Christophe Pallier et collaborateurs, données adaptées sous [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.fr). L’archive de référence a été téléchargée pendant le développement ; elle n’est jamais consultée à l’exécution. Les adaptations consistent à sélectionner les champs utiles, convertir les métadonnées en classes compactes et confronter les transcriptions aux distinctions traditionnelles du projet. Les notices sont aussi intégrées au HTML.

## Reproduire le développement

Ces commandes concernent seulement les sources de développement ; elles ne sont pas nécessaires pour ouvrir le HTML livré.

```text
node tools/build.mjs --note "Description de la modification"
node tests/run.mjs
node tests/run-context.mjs
node tests/lexicon-audit.mjs
node tests/deep-campaign.mjs
node tests/run-context-deep.mjs
node tests/source-morphology-audit.mjs
node tests/productive-morphology.mjs
node tests/run-numeric.mjs
node tests/alignment-audit.mjs
node tests/browser-qa.mjs
node tests/extended-challenge.mjs
node tests/lexicon-extension.mjs
node tests/nouvelle-campagne-run.mjs
node tests/nouvelle-campagne-guards.mjs
node tests/review-seven-fixes.mjs
node tests/review-context-fixes.mjs
node tests/review-number-fixes.mjs
node tests/review-rules-fixes.mjs
node tests/review-spelling-fixes.mjs
node tests/sonorities.mjs
node tests/poetry.mjs
node tests/sonorities-final-guards.mjs
node tests/poetry-final-guards.mjs
node tests/sonorities-browser.mjs
node tests/sonority-palette.mjs
node tests/all-sounds.mjs
node tests/versioning.mjs
```

Le test navigateur utilise Playwright uniquement pendant le développement. Le fichier livré ne l’embarque pas. Pour reconstruire les données, `tools/build-lexicon.mjs` lit le JSONL original en lecture seule ; le chemin et l’empreinte sont consignés dans les audits. Les autres sources linguistiques et la politique contextuelle sont dans [docs/LINGUISTIQUE.md](docs/LINGUISTIQUE.md).

Pour reproduire l’extension : conserver la source de base générée dans `data/before-glaff/lexicon-data.js`, télécharger l’archive officielle GLÀFF citée, lancer `python tools/import-glaff.py`, puis `node tools/extend-lexicon.mjs`. Le second outil prend toujours la même base et n’ajoute jamais deux fois les entrées. Les contrôles vérifient toutes les anciennes lignes décodées et toutes les nouvelles entrées. Les tests de cohérence technique ne certifient pas chaque prononciation de cette source.

## Conservation des versions

Chaque HTML modifié est archivé automatiquement lors de sa génération dans un nouveau ZIP numéroté : Transcription phonétique traditionnelle v2.zip, v3.zip, etc. Les archives précédentes ne sont jamais écrasées. Une génération donnant exactement le même HTML conserve le numéro existant, sans ZIP supplémentaire.

Le fichier versions.json conserve les numéros, résumés, dates et empreintes des versions. HISTORIQUE_VERSIONS.md fournit leur liste lisible. Les instructions de reprise sont dans AGENTS.md. Le point de départ est la v1 déjà livrée ; ses octets et son archive sont inchangés.

L’utilisateur peut supprimer les ZIP librement. Une archive absente ne sera pas recréée automatiquement et son numéro ne sera pas réutilisé. L’historique conserve sa trace. Conserver versions.json pour préserver cette mémoire des numéros et des changements.

Après une modification directe du HTML, lancer node tools/versions.mjs --note "Description de la modification". Les tests du mécanisme se lancent avec node tests/versioning.mjs, sur des fichiers temporaires isolés. La création et la vérification des ZIP utilisent PowerShell uniquement pendant le développement ; le HTML livré conserve son autonomie complète.
