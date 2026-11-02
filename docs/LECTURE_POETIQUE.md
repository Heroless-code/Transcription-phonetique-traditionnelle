# Lecture classique — politique et limites

À la demande de l'utilisateur, l'application propose désormais uniquement la **lecture classique**. Elle transforme le résultat du moteur de base et conserve les e caducs dans le vers selon les règles ci-dessous ; les élisions classiques et l'absence de e post-tonique prononcé à la fin du vers restent appliquées. Les ambiguïtés de diérèse/synérèse sont conservées dans le bouton « ? » du vers. Ce traitement ne choisit aucun nombre de syllabes, ne reconnaît pas automatiquement un alexandrin et ne construit ni césure ni schéma de rimes. Les sonorités sont recomptées sur la lecture et les variantes effectivement retenues. Le caractère partiel de l'assistance reste le même malgré le retrait du sélecteur.

Le module `poetry.js` travaille sur une copie : les tokens et la transcription de prose restent disponibles en interne, sans mode Courante dans l'interface. Il recalcule les unités API et les correspondances graphémiques après chaque modification. Les changements de mode visuel ne doivent pas modifier la lecture classique ni les choix déjà faits pour le texte courant.

**E caduc final et contexte.**

La politique distingue un e final libre et un e post-tonique suivi des consonnes graphiques de `-es` ou du `-ent` verbal. L'article de Gérald Purnelle, *La langue des vers : le cas des e post-toniques entravés*, Université de Liège, JADT 2006, pages 805–808, expose les conventions classiques et leur distance avec la langue courante : [article original](https://orbi.uliege.be/bitstream/2268/33658/1/Purnelle29.pdf).

- En fin de ligne, l'e post-tonique n'est pas réalisé.
- À l'intérieur, l'e libre s'élide devant une initiale vocalique autorisant cette jonction et se conserve devant une initiale consonantique ou disjonctive.
- L'e entravé en `-es` ou `-ent` reste un noyau à l'intérieur du vers, y compris avant voyelle. Dans une lecture strictement classique continue, la consonne graphique correspondante peut être réalisée en `/z/` ou `/t/`.
- Les finales postvocaliques telles que `amies`, `aimées`, `vues`, `prient` ou `jouent` ont des contraintes historiques particulières. Le module ne leur invente pas un schwa ; il signale les constructions internes concernées. Les terminaisons `-aient` et `-oient` ne reçoivent pas ce schwa supplémentaire.

Ces conventions représentent une politique historique sélectionnée, pas une prédiction acoustique de toute déclamation. La nouvelle jonction classique exige une frontière composée uniquement d'espaces compatibles. Elle ne traverse pas une virgule, un tiret ou une autre ponctuation et n'efface jamais ces signes. Elle ne généralise pas toutes les liaisons facultatives de la prose.

Les finales dont l'e appartient déjà à une voyelle prononcée, par exemple `les`, `des` ou `es`, sont protégées par les correspondances lexicales. Les mots grammaticaux monosyllabiques `le`, `de`, `ce`, `que`, `ne`, `me`, `te`, `se`, `je` conservent leur noyau de lecture courante : leur e n'est pas automatiquement un e post-tonique. L'inversion `dis-je`, où `je` est explicitement postposé après un trait d'union, suit la règle post-tonique distincte.

Le pronom `le` postposé à un impératif conserve également sa voyelle, en fin de vers comme devant voyelle : `Dis-le` ne peut pas être réduit à `/di-l/` et `Dis-le encore` ne devient pas `/di-l ɑ̃.kɔʁ/`. Le module conserve la valeur de la lecture courante sans imposer un autre timbre. Voir les principes d'accentuation et les pronoms postposés dans [Prosodie, intonation et grammaire, chapitre 4.10](https://refubium.fu-berlin.de/bitstream/handle/fub188/25560/ProsodieEtGrammaire.pdf?isAllowed=y&save=y&sequence=1).

**H et ponctuation.**

Le module reprend les statuts du moteur : h muet, h aspiré ou statut indéterminé. Le h aspiré est disjonctif. Une initiale h non classée ne permet pas une élision déclarée certaine. Les initiales semi-vocaliques et les mots disjonctifs passent aussi par la politique contextuelle existante ; la simple présence d'une lettre-voyelle ne suffit pas.

La fin de ligne est une frontière de vers. Une ponctuation forte à l'intérieur ne fixe pas à elle seule la diction : le module propose une lecture continue des e caducs et signale cette hypothèse. Il conserve les séparateurs originaux, y compris dans l'API lorsque la ponctuation empêche une nouvelle jonction. Les lignes vides restent intactes.

**Schwas intérieurs.**

Le module peut préférer une variante lexicale contenant davantage de schwas intérieurs si elle conserve exactement les autres phonèmes de la lecture retenue. Cette opération est signalée comme une hypothèse. Elle ne reconstitue pas par étymologie tous les e intérieurs absents des données. Une variante fournie par le lexique reste une donnée de source, pas une certification de la pratique d'un poète.

**Diérèse et synérèse : choix local, liste bornée.**

La transformation de base conserve la séquence vocalique courante. Pour certains mots, elle propose explicitement une autre réalisation. Le choix appartient à l'utilisateur et peut être différent pour deux occurrences d'un même mot. Chaque variante donne son API et modifie immédiatement les comptes de sons : pour `lion`, `/ljɔ̃/` et `/li.ɔ̃/` n'ont pas le même relevé de `/j/` et de `/i/`.

La liste actuellement couverte est volontairement limitée : `lion`, `lien`, `diction`, `miasme`, `supérieur/supérieure`, `purifier`, `hier`, `nuage`, `nuée`, `ruelle`, `duel/duelle`, avec les flexions prévues dans le module. Les correspondances proposées sont `/j/ ↔ /i/` et `/ɥ/ ↔ /y/` devant une voyelle. Le module n'applique pas cette alternance à toutes les suites de lettres similaires.

Purnelle évoque notamment la lecture dissyllabique de `lion` dans la tradition classique. [Larousse, diérèse](https://www.larousse.fr/dictionnaires/francais/di%C3%A9r%C3%A8se/25391) donne l'exemple de `nuage` et souligne des conditions consonantiques historiques. Le relevé local des tableaux fournis par l'utilisateur apporte les autres familles et leurs cas variables : `REGLES_SYNERESE_DIERESE.md` (référence locale de développement non incluse). Ce relevé est un index documentaire en lecture seule ; les images originales font référence et il ne constitue pas une validation API indépendante.

La page universitaire de Laurent Jenny, *Versification*, reste une référence bibliographique : [Université de Genève](https://www.unige.ch/lettres/framo/enseignements/methodes/versification/vrintegr.html). Son accès a été refusé pendant la revue finale du 1er novembre 2026. Son contenu n'est donc pas présenté comme nouvellement vérifié à cette occasion.

Le système n'infère pas l'usage d'un auteur, l'époque d'un poème ou un nombre de syllabes attendu. Une variante offerte est une possibilité de lecture assistée ; le choix à l'intérieur d'une œuvre exige une vérification. La liste ne couvre pas l'ensemble des tableaux de synérèse/diérèse ni tous les phénomènes historiques.

**Incertitudes, durées et mots inconnus.**

Une variante de diérèse/synérèse, un schwa intérieur lexicalement variable, une ponctuation forte ou une initiale indéterminée peut rendre une occurrence poétique hypothétique. Cette indication est transmise au relevé des sonorités. Une sélection explicite indique le choix effectué ; elle ne transforme pas cette variante en vérité stylistique universelle.

Les qualités traditionnelles, voyelles nasales et longueurs existantes sont conservées. Aucune longue durée n'est ajoutée pour compléter un vers. Les mots inconnus restent des hypothèses du moteur initial. Les nombres développés conservent leur traitement numérique ; ce module ne reconstruit pas leur versification interne.

**Contrôles.**

`tests/poetry.mjs` couvre les e libres et entravés, les h, les finales postvocaliques, les terminaisons verbales, les variantes explicites, la ponctuation, les durées, l'absence de mètre imposé et l'intégrité des données initiales. `tests/poetry-final-guards.mjs` ajoute les pronoms impératifs, les données gelées, les initiales inconnues et la conservation des graphies Unicode dans les variantes. Les rapports distinguent les régressions contrôlées d'une évaluation de scansion universelle.
