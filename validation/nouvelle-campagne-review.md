# Nouvelle campagne phonétique : provenance et relecture

Les attentes de `tests/nouvelle-campagne-fixtures.js` ont été fixées avant le premier passage du moteur. Le fichier initial, conservé dans `nouvelle-campagne-initial.json`, compte **127 vérifications, 110 réussites et 17 écarts**. Il s’agit d’un défi ciblé, sans mesure de précision représentative du français.

## Défauts du moteur constatés

Douze écarts demandaient une correction :

- Le nom « désertions » avait masqué la flexion régulière de déserter malgré le sujet « nous » ; un infinitif attesté et l’accord explicite nous/vous peuvent maintenant compléter une étiquette grammaticale manquante du lexique.
- Quatre coordinations après complément et deux reprises de principale après une relative simple étaient mal analysées. Les nouvelles règles sont bornées : coordination avec argument explicite à droite, relative simple dont le verbe fini est identifié, sans saut aveugle de groupes imbriqués. Les contre-exemples préservent les groupes nominaux et les adjectifs coordonnés.
- Cinq cardinaux écrits en chiffres avaient conservé « un » devant un nom féminin attesté. Un petit index de 23 371 noms féminins non ambigus est extrait de Lexique 4.1, source déjà attribuée. Il permet « 1 amie », « 21 amies », « 81 personnes », « 2001 nuits », « 101 héroïnes ». Les noms de genre inconnu ou épicène ne reçoivent pas de genre deviné par suffixe. Les chiffres postposés à un nom servant d’étiquette et les « un » internes devant mille ne sont pas féminisés automatiquement.

L’accord du cardinal est documenté par le [Portail linguistique du Canada, un (nombre cardinal)](https://nos-langues.canada.ca/fr/cles-de-la-redaction/un-nombre-cardinal) et [Larousse, un](https://www.larousse.fr/dictionnaires/francais/un/80515). La règle grammaticale n’importe aucune réalisation vocalique québécoise.

## Attentes revues après consultation

Les cinq autres écarts ne sont pas comptés comme des corrections du moteur :

| Cas | Vérification |
| --- | --- |
| psychologue | Le [Wiktionnaire](https://fr.wiktionary.org/wiki/psychologue) atteste /o/ prétonique dans la citation nominale et /ɔ/ ailleurs dans la même entrée ; les deux timbres prétoniques sont admis. |
| équanimité | Le [Wiktionnaire](https://fr.wiktionary.org/wiki/équanimité) confirme /kwa/. L’attente sans /w/ était incorrecte. |
| duel | Le [Wiktionnaire](https://fr.wiktionary.org/wiki/duel) donne la semi-voyelle /ɥ/ comme citation. Le hiatus, également documenté, n’est pas imposé. |
| dualité | Le [Wiktionnaire](https://fr.wiktionary.org/wiki/dualité) donne explicitement les deux réalisations, avec semi-voyelle ou hiatus. |
| riez | Le [manuel universitaire de Jean-Michel Kalmbach](https://research.jyu.fi/phonfr/Manuel_2011.html) décrit les deux réalisations contractée et non contractée. La lecture contractée du moteur est donc admise. |

Le résultat après correction devient un test de régression. Il ne remplace jamais les preuves du premier passage et n’est pas présenté comme une nouvelle évaluation indépendante.

## Limites du nouvel accord et du contexte

L’index de genre ne contient que les noms féminins non ambigus attestés dans Lexique 4.1. Un prénom, un mot inventé, un nom rare absent ou un épicène peut rester au masculin de lecture par défaut ; le nombre développé reste une hypothèse signalée. Les identifiants, dates et lectures ordinales implicites ne sont pas tous résolus. Les relatives complexes et les coordinations sans indice syntaxique suffisamment fort restent susceptibles d’ambiguïté.

La relecture des garde-fous a découvert que traiter tout nom précédant un chiffre comme une étiquette était trop large : « Je donne à mon amie 1 tulipe » et « Elle offre à sa sœur 21 fleurs » doivent conserver le féminin. La protection ordinale est maintenant limitée à une classe explicite d’étiquettes (page, chapitre, numéro, leçon, etc.). Les trois cas « page 21 blanche », « pages 21 blanches » et « leçon 21 complète » conservent la lecture masculine du nombre postposé.

Le premier contre-exemple proposé à la relecture utilisait « 1 rose ». Il ne permettait pas d’isoler cette régression : [rose](https://fr.wiktionary.org/wiki/rose) désigne une fleur au féminin et une couleur au masculin, et Lexique 4.1 code son genre nominal par e. Exiger automatiquement le féminin aurait donc été une attente trop stricte. La version avec tulipe vérifie le cas non ambigu ; le cas rose reste comme garde-fou de l’hypothèse par défaut, sans règle sémantique ad hoc.
