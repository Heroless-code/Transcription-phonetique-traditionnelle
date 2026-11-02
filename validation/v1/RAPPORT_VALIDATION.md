# Validation — Transcription phonétique traditionnelle

La livraison est le fichier **Transcription-phonetique-traditionnelle.html**. Ouvrir ce seul fichier dans un navigateur récent suffit.

- Taille : 10.55 Mo.
- SHA-256 : 970a723e90a8100b13e1a60f272f986b5c64b5ade627eac8d4f72293466b19f2.
- Lexique : 1 632 485 graphies ; catégories grammaticales pour 173 994 formes.
- Dépendance nécessaire à l’exécution : aucune. Les données et le code sont incorporés.

## Contrôles sur la version livrée

| Ensemble | Résultat | Portée |
| --- | ---: | --- |
| Mots et oppositions lexicales | 226 réussis | Exemples fixés, dont les oppositions et longueurs traditionnelles. |
| Repli sans dictionnaire | 139 réussis | Graphèmes et mécanismes réguliers avec chemin lexical désactivé. |
| Longueurs du repli | 8 réussis | Timbre conservé sans durée prétonique automatique. |
| Phrases contextuelles approfondies | 56/56 et 93/93 | Deux revues initiales distinctes, devenues tests de régression après correction. |
| Campagne de paradigmes et de phrases | 136 réussis | Flexions, phrases complètes, cache, limites de ligne, inconnus et texte long. |
| Préfixations inventées et casse | 15 réussis | Préfixes productifs, bases inconnues, indication d’hypothèse et noms propres. |
| Formes verbales en -ent | 9 532 formes ; 0 finale nasalisée à tort | Cohérence morphologique sur une source déjà utilisée dans les données. |
| Singulier/pluriel nominaux | 3 000 paires ; 0 différence(s) | Cohérence quand la source atteste une même prononciation. |
| Nombres et liaisons numériques | 51 réussis | Composés, voyelles initiales, vingt et cent. |
| Navigateur hors ligne | 34 réussis | Copie isolée du seul HTML, sans ressource voisine ni requête HTTP. |
| Nouvelle campagne ciblée | 159 réussis | Mots techniques, emprunts, schwas, coordinations, homographes et liaisons. Premier résultat conservé : 145/159. |
| Contre-exemples des règles affinées | 30 réussis | Sujets singuliers/pluriels, clitiques, coordinations, ligatures, cache et schwas palataux. |
| Extension lexicale | 3609 graphies ajoutées | 1 628 876 anciennes entrées inchangées ; contrôle de toutes les nouvelles lignes. |
| Combinaisons chromatiques | 12 484 contrôles | Huit sélections, timbres et nasalisations superposables, mélanges de groupes, contraste minimal mesuré 4.808:1. |

## Approfondissement de la dernière version

| Ensemble supplémentaire | Résultat | Portée |
| --- | ---: | --- |
| Nouveau défi linguistique | 127/127 | Premier passage : 110/127. Douze défauts corrigés ; cinq attentes revues d’après les variantes documentées. |
| Contre-exemples syntaxiques et numériques | 46 réussis | Coordination adjectivale/verbale, relatives simples, genres inconnus ou épicènes, noms masculins, étiquettes et grands nombres. |
| Inventaire phonétique et couleurs | 66 réussis | Correction des consonnes rares /h/ et /ʔ/ oubliées ; maintien des h orthographiques muets. |
| Compositions de trois sons | 64 136 contrôles | Huit sélections, permutations, Unicode, inventaire et calcul indépendant du contraste. |
| Accents nasaux adaptatifs | 2 808 contrôles | Contraste minimal du texte 4.802:1 et de l’accent 3.215:1 sur son fond explicite. |
| Planche réelle dans le navigateur | 99 réussis | Huit réglages, quatre largeurs (320, 390, 768 et 1 280 px), copie, API, segments muets, accents dans leur fond et texte long coloré. |

La suite principale contient 1739 contrôles réussis et 0 échec. Elle inclut aussi les liaisons, homographes, couleurs, graphèmes, syllabes, schwas et Unicode. Les 1 000 invariants générés vérifient la représentation et la stabilité ; ils ne sont pas 1 000 prononciations indépendamment certifiées.

Mesures sur le navigateur testé : préparation 803 ms ; paragraphe de 1 100 mots 187 ms. Ce sont des observations sur cette machine, pas une garantie de durée sur tous les appareils.

## Méthode et traces des erreurs

Les premiers résultats sont conservés avant correction. Le diagnostic lexical initial était de 197/226. Le premier repli contrôlé était de 90/128. Une première revue de 25 phrases comportait 4 échecs parmi 56 vérifications ciblées, avec deux autres familles de défauts trouvées à la relecture. La deuxième revue de 40 phrases avait 8 échecs parmi 93 vérifications. Leurs fichiers initiaux gardent les sorties et leur provenance ; les réussites ultérieures sur les mêmes phrases sont des régressions après amélioration, sans valeur de nouvelle évaluation indépendante.

Les corrections concernent les catégories grammaticales des homographes, les sujets nominaux avec compléments, les relatives, des sujets postposés, les adjectifs antéposés et leurs pluriels, les mots grammaticaux, la cohérence des familles lexicales, les graphèmes palataux, les préfixes productifs et les nombres. Les variantes attestées ont été vérifiées séparément des erreurs ; les attentes ajustées sont expliquées dans validation/fixture-reference-corrections.md.

Les audits de stockage contrôlent le décodage et l’intégrité. Ils ne certifient pas linguistiquement chaque transcription. L’accord avec Lexique 4.1, utilisé pendant la construction, ne constitue pas non plus une évaluation indépendante. La référence de prononciation reste le français moderne traditionnel demandé.

La campagne supplémentaire comporte initialement 14 écarts. Sept ont demandé des corrections du moteur ; sept concernaient des attentes incorrectes ou trop étroites au regard des variantes attestées. La relecture et ses sources sont consignées dans validation/extended-fixture-review.md. La régression réussie sur ces mêmes cas ne constitue pas une nouvelle mesure indépendante.

## Correspondance et coloration

Un audit déterministe porte sur 1 800 mots. Il vérifie la reconstruction exacte des graphies et la correspondance avec les seuls sons calculés, puis des cas explicites de graphèmes et de liaisons. Les graphèmes partagés par plusieurs phonèmes ont des bandes distinctes et une explication au survol. Les lettres muettes restent sans couleur phonétique. Les associations opaques ou suspectes restent signalées et neutres ; elles ne sont pas considérées comme des réussites linguistiques. Le rapport détaillé est validation/alignment-audit-final.json.

Les couleurs sont maintenant composables. Une voyelle nasale peut recevoir sa couleur de famille, le seul accent nasal ambré, ou les deux ensemble. Les graphèmes partagés peuvent mélanger les contributions sélectionnées en espace perceptuel OKLab, tout en gardant une bande par son. Les sons individuels conservent les couleurs imposées. Le navigateur vérifie les huit sélections, les catégories exclues, le contraste réel des couleurs produites et la stabilité de l’API.

La dernière revue remplace l’accent nasal fixe par deux nuances d’ambre adaptées au fond. Ses deux traits sont peints à l’intérieur du fond explicite ; les bandes d’un graphème partagé sont remontées afin de ne pas se confondre avec cet accent. La marge de contraste du texte composé est portée à 4,8:1. Les familles t/d, k/ɡ, f/v et s/z ont été légèrement espacées par des teintes pétrole ardoise, indigo, vieux rose et olive, avec un charbon violet pour les consonnes rares h/ʔ. Les associations vocaliques imposées restent identiques. La distance colorimétrique est un diagnostic comparatif, sans seuil universel d’identification. L’harmonie est aussi revue sur les captures réelles, sans prétendre mesurer objectivement les préférences esthétiques.

La [planche des huit réglages](validation/color-matrix-final.png) et la revue validation/color-matrix-review.md conservent ce contrôle visuel. Les rapports initiaux des inventaires et des triples restent intacts.

## Complément lexical

Les 3609 nouvelles graphies viennent de GLÀFF 1.2.2, Sajous, Hathout et Calderone (CLLE), sous CC BY-SA 3.0. Les entrées existantes gardent leur priorité et leur contenu. La sélection écarte les formes non alignables et plusieurs incohérences phonotactiques ou morphologiques ; elle ne transforme pas une source imparfaite en référence certifiée. Les mots inconnus continuent à passer par les règles. L’attribution et la notice originales sont incorporées au HTML et documentées dans data/references/GLAFF_ATTRIBUTION.md.

Un index comprimé de 23 371 noms féminins non ambigus, dérivé de Lexique 4.1 déjà attribué, complète désormais les métadonnées. Il sert à lire les cardinaux en chiffres comme 21 devant un nom féminin attesté. Les genres inconnus, épicènes et certaines lectures ordinales restent hors de cette inférence. Les limites, les sources grammaticales et les 17 écarts du premier passage sont détaillés dans validation/nouvelle-campagne-review.md.

## Corrections consécutives à la revue de code

La revue de code du 31 octobre a relevé sept défauts supplémentaires sur la version précédente, dont le diagnostic initial (14 réussites, 16 échecs sur 30 contrôles) est conservé dans validation/revue-code-2026-10-31.json. La version livrée corrige ces sept familles : locutions complètes avant liaison, groupe nominal de os, famille sous-évaluer et lectures grammaticales, séparateurs de milliers, rôle cardinal ou identifiant, positions Unicode originales et règle de repli -tien.

La régression des contrôles de la revue réussit 30/30. Les gardes supplémentaires réussissent : 70 pour le contexte, 37 pour les nombres, 85 pour les familles et règles, 721 pour les graphies et groupements numériques. Le lanceur général exécute 29 suites, toutes réussies. Le contrôle navigateur inclut maintenant les couleurs NFC/NFD identiques dans les huit sélections et les corrections visibles dans le HTML isolé. La trace des causes et des limites est dans CORRECTIONS_REVUE_2026-10-31.md. Ces régressions après correction ne sont pas une nouvelle estimation indépendante de précision.

## Sonorités et lecture classique

Le mode Sonorités recense les phonèmes finaux par vers sans utiliser les familles de couleurs. Les 66 contrôles de décompte et 29 gardes finaux réussissent. Les 73 contrôles de lecture classique et 31 gardes supplémentaires réussissent aussi. La QA Sonorités du HTML isolé comporte 70 contrôles réussis, dont l’exclusivité des modes, les cinq /s/ du vers de Racine, la sélection locale et les choix poétiques. Les couleurs et Sonorités ne s’activent jamais simultanément ; changer de mode visuel conserve l’API et les préférences.

Les sons répétés sont visibles par défaut ; le bouton ×1 affiche ou masque les sons isolés dans les pastilles, le vers et l’API. Chaque phonème exact conserve sa teinte. Les sons isolés ×1 gardent une version plus pâle de cette teinte, sans être présentés comme des répétitions. Les 125 contrôles de palette réussissent : 55 teintes avec contraste encre/fond d’au moins 5:1 et leurs 55 versions discrètes d’au moins 4,8:1, Unicode, distinctions traditionnelles et graphèmes partagés. Les 14 contrôles de l’inventaire complet vérifient son exhaustivité et le maintien du seuil de répétition à deux, sans division par zéro pour les sons isolés.

Tous les sons des catégories actives apparaissent sans repli à gauche du vers. Les titres proches du vers filtrent uniquement ce vers ; les boutons du haut filtrent tout le texte, avec un état partiel quand les vers diffèrent. Le cycle des pastilles est mettre en évidence, masquer la couleur, rétablir la couleur. Plusieurs sons peuvent rester masqués indépendamment, avec pastilles grisées et barrées. Les masques préservent les comptes, la copie API et les autres sons des graphèmes partagés ; ils survivent aux changements de modes et de filtres. Les tests couvrent les quatre combinaisons, les commandes au clavier et le maintien des choix des autres vers. Options ne paraît que lorsque les couleurs sont activées. Le texte reste à 16 px et l’API à 14 px ; les huit vers de contrôle occupent en moyenne 71 pixels par vers sur le navigateur de bureau testé. Les précisions restent dans « ? », sans augmenter cette hauteur.

Les voyelles nasales et longues restent des unités distinctes ; /j w ɥ/ sont classés comme semi-consonnes. Les élisions et parties reliées par un trait d’union constituent un mot graphique ; un nombre développé conserve son occurrence graphique initiale. Le classement est un indice heuristique documenté, sans probabilité d’intention littéraire. La lecture classique est désormais la seule lecture proposée par l’application : les e caducs intérieurs suivent la politique classique de conservation et d’élision, les fins de vers gardent leur traitement propre. Les ambiguïtés de diérèse/synérèse restent sélectionnables par occurrence dans « ? ». Le moteur de base demeure une étape interne et la liste de variantes reste bornée ; aucune analyse métrique exhaustive n’est annoncée. Les mots grammaticaux à schwa non posttonique, dont « le » dans « dis-le », conservent leur voyelle. Les politiques et sources sont détaillées dans docs/SONORITES.md et docs/LECTURE_POETIQUE.md.

Le premier contrôle de cette compaction est conservé dans validation/compact-classical-colors-initial.json : huit chevauchements de fonds colorés ont nécessité de préserver l’espacement original/API propre au mode Couleurs. Le rapport validation/compact-classical-browser-initial.json conserve une attente historique de prose devenue incompatible avec la lecture classique obligatoire ; l’attente de « cette classe » a été mise à jour pour ses deux e caducs intérieurs, sans supprimer le contrôle des sept corrections antérieures.

Le premier ajout de tous les sons portait la hauteur moyenne à 138 px, au-delà du seuil de compaction précédent. Le diagnostic est conservé dans validation/overview-all-sounds-initial.json. Regrouper titres et pastilles sur les mêmes lignes, avec les polices réduites, a permis d’afficher davantage de sons tout en abaissant la hauteur moyenne finale.

## Limites restantes

Le contexte repose sur des classes grammaticales et des règles syntaxiques locales. Certaines phrases longues, elliptiques ou sémantiquement ambiguës demandent une vérification humaine. Le JSONL original ne distingue pas ses variantes par région ou catégorie : des timbres prétoniques, noms propres et emprunts peuvent rester discutables. Les prononciations conjecturales sont signalées. Un mot inventé ne possède pas nécessairement une prononciation unique certifiable.

Le cas examen illustre une limite documentée du repli : le chemin lexical choisit la bonne lecture, mais les règles seules proposent la nasale ordinaire de en et se trompent sur ce mot exceptionnel. Ce contre-exemple reste enregistré et ne compte pas comme une réussite du repli.

Aucun résultat n’établit 100 % de précision sur tout texte français. Les rapports distinguent données attestées, régressions corrigées, hypothèses et ambiguïtés.

## Sources et reproduction

Le [guide](README.md) décrit l’architecture et les commandes. [La note linguistique](docs/LINGUISTIQUE.md) donne les sources grammaticales. Les attributions de Lexique 4.1 sont dans data/references/LEXIQUE_ATTRIBUTION.md et dans le HTML. Les ressources d’origine ne sont jamais modifiées.
