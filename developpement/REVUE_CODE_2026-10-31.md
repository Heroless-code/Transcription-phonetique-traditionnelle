# Revue du moteur — 31 octobre 2026

**Statut après correction :** ce document conserve le diagnostic de la version initiale. Les sept défauts sont désormais corrigés et les 30 reproductions réussissent. Voir [les corrections et leurs validations](CORRECTIONS_REVUE_2026-10-31.md). Les indications « reste à corriger » ci-dessous décrivent exclusivement l'état observé lors de la revue.

Revue de `src/engine.js`, `rules.js`, `lexicon.js`, `phonology.js`, `context.js`, `numbers.js`, `alignment.js`, `color-model.js`, de leur intégration et des outils de construction et de validation. Le moteur et le HTML livré n'ont pas été modifiés pendant cette revue. Les fichiers synchronisés sous `sources/` restent intacts.

Version examinée : SHA-256 du HTML `f2a3eae3e1811b689182c070ea799bece5cbac153fcdf29d00a5484528594189`.

**Résultat.** Sept défauts distincts reproduits. Les 30 sondes ciblées de cette revue donnent 14 réussites et 16 échecs ; plusieurs échecs relèvent d'un même défaut. Cet échantillon a été choisi pour examiner des risques repérés dans le code et ne mesure donc pas la précision générale du moteur.

Les 1 739 contrôles principaux et les 12 484 contrôles de combinaison des couleurs ont aussi été relancés : tous réussissent. Ces résultats coexistent avec les échecs nouveaux parce que ces contre-exemples n'étaient pas vérifiés par les tests précédents. Les autres suites historiques n'ont pas été relancées pendant cette revue.

Les points suivants restent à corriger. Le classement indique une priorité relative de correction ; tous affectent des cas particuliers, sans empêcher l'application de fonctionner.

**1. Des fragments de locutions autorisent des liaisons injustifiées.**

Code : [context.js:445](src/context.js:445), [context.js:511](src/context.js:511).

La table `PAIRS` contient `mot à`, `petit à`, `nuit et`, `pied à`, etc. La correspondance sur cette paire suffit à imposer une liaison, avant plusieurs contrôles grammaticaux. Elle confond ainsi une expression entière avec son début :

| Entrée | Sortie actuelle, segment fautif | Attendu |
| --- | --- | --- |
| Le mot à traduire est rare. | `mo.t‿a` | `mo a` |
| Le petit à lunettes arrive. | `pə.ti.t‿a` | `pə.ti a` |
| La nuit et la pluie arrivent. | `nɥi.t‿e` | `nɥi e` |
| Je pose mon pied à la fenêtre. | `pje.t‿a` | `pje a` |

Les contrôles positifs `mot à mot` et `petit à petit` se lient correctement. Il faut vérifier la locution entière avant de permettre l'exception à l'interdiction après un nom singulier. [Académie française, Liaisons](https://www.academie-francaise.fr/questions-de-langue).

**2. Une ancre lexicale erronée prend priorité dans la famille sous-évaluer.**

Code : [build-lexicon.mjs:282](tools/build-lexicon.mjs:282), particulièrement lignes 293 et 299 ; [engine.js:30](src/engine.js:30).

`sous-évaluer` donne `/su.e.va.ly.e/` au lieu de `/su.ze.va.lɥe/`. La bonne variante de l'infinitif est déjà enregistrée comme alternative. `sous-évaluation` donne `/su.e.va.ly.a.sjɔ̃/`, sans alternative et avec la confiance « lexical ». Le participe `sous-évalué` est, lui, correct.

L'import favorise ici une entrée fautive de Lexique 4.1, y compris devant une variante exploitable de la source initiale. Une référence lexicale attestée ne garantit pas l'absence d'erreur dans chaque ligne. Corriger la famille après validation et faire remonter les contradictions entre sources, sans appliquer une substitution générale à tous les préfixes. [Wiktionnaire, sous-évaluer](https://fr.wiktionary.org/wiki/sous-%C3%A9valuer).

**3. Le pluriel de os ne traverse pas un adjectif.**

Code : [context.js:383](src/context.js:383).

`Les os sont solides` donne bien `/le.z‿o…/`, mais `Les petits os sont solides` donne `/le pə.ti.z‿ɔs…/`. Même erreur après `deux gros` et `les vieux`. Le code n'examine que le mot immédiatement précédent et annonce « Os au singulier » avec la confiance « lexical ». Il faut reconnaître le groupe nominal portant le nombre ; si ce rattachement reste indécidable, conserver une ambiguïté plutôt qu'une justification certaine. [Académie française, os](https://www.dictionnaire-academie.fr/article/A9O0832), [Larousse junior, os](https://www.larousse.fr/dictionnaires/junior/os/13023).

**4. Les séparateurs de milliers sont perdus avant la lecture du nombre.**

Code : [engine.js:76](src/engine.js:76), [numbers.js:6](src/numbers.js:6).

`1000 euros` donne `/mil ø.ʁo/`, mais `1 000 euros` donne « un zéro zéro zéro euros ». Le défaut est aussi reproduit avec l'espace insécable U+00A0 et l'espace fine insécable U+202F.

`numberWords` sait supprimer ces séparateurs lorsqu'il reçoit le nombre entier. Le découpage préalable ne lui transmet toutefois que `1` puis `000`. Reconnaître les groupements numériques pendant le découpage, en conservant leurs positions originales et en distinguant les suites de nombres indépendants.

**5. Le garde-fou des numéros bloque parfois l'accord du cardinal.**

Code : [numbers.js:88](src/numbers.js:88).

`Je donne à cette classe 21 tulipes` produit « vingt et un tulipes », alors que `Je donne à sa sœur 21 fleurs` produit correctement « vingt et une fleurs ». Le mot `classe` appartient à `NUMERIC_LABELS` et est pris pour un intitulé numéroté. Ici, il désigne le destinataire. L'appartenance à cette liste ne suffit pas à établir le rattachement syntaxique. Conserver le contrôle positif `page 21 blanche`, mais examiner aussi la construction du complément.

**6. Les accents Unicode décomposés font perdre la coloration de l'original.**

Code : [alignment.js:44](src/alignment.js:44), [alignment.js:72](src/alignment.js:72), [engine.js:107](src/engine.js:107).

`élève` et la même chaîne passée par `.normalize('NFD')` ont la même transcription `/e.lɛv/`. La première est correctement alignée ; la seconde devient un segment entier incertain et reste neutre. Même résultat pour `école`.

L'alignement découpe une graphie normalisée en NFC, puis le moteur la compare à la saisie brute. Les octets diffèrent et le garde-fou neutralise la coloration. Conserver une correspondance des positions normalisées vers les positions originales permettrait de résoudre ce défaut sans altérer la saisie. [Unicode, normalisation](https://www.unicode.org/reports/tr15/).

**7. Une branche de palatalisation ne peut jamais s'exécuter.**

Code : [rules.js:223](src/rules.js:223).

```js
if (/^tien/u.test(tail) && /* autre condition */
    !/^(?:tien|retien)/u.test(tail)) {
  // ...
}
```

Si le premier test est vrai, le dernier est nécessairement faux. En règles forcées, `martien` donne `/maʁ.tjɛ̃/` au lieu de `/maʁ.sjɛ̃/`. La lecture normale de ce mot reste correcte grâce au lexique. Ce défaut touche donc le mécanisme de repli, pas le mot connu dans l'usage ordinaire. Définir les conditions morphologiques de la palatalisation et leurs exceptions avant de réécrire la condition. Supprimer simplement la négation généraliserait trop la règle.

**Points confirmés à la lecture.**

- Les responsabilités du lexique, des règles, du contexte, de la phonologie et des couleurs sont séparées.
- La sélection d'une prononciation précède la couleur. Les options chromatiques ne modifient pas l'API calculée.
- Les voyelles nasales et les voyelles longues restent des unités phonétiques ; la nasalisation n'est pas un phonème ajouté artificiellement.
- Le lexique utilise une recherche dichotomique et un décodage par blocs avec cache limité.
- Les analyses lexicales sont copiées avant les décisions propres à la phrase : une lecture contextuelle ne remplace pas directement le mot dans le cache général.
- La composition des huit options n'a révélé aucun nouveau défaut de mélange ou de contraste dans les contrôles exécutés. Le défaut Unicode ci-dessus concerne le passage de la graphie à ses segments.

**Limites structurelles.**

Le moteur repose sur des données lexicales et des règles déterministes, avec des reconnaissances grammaticales locales. Il ne calcule pas une analyse syntaxique et sémantique complète. La confiance « lexical » indique une origine de données, pas une probabilité d'exactitude. Le repli graphophonologique parcourt des règles ordonnées ; il ne compare pas globalement toutes les prononciations possibles. L'alignement, lui, compare des chemins au coût minimal, mais ce coût ne prouve pas l'unicité linguistique du découpage. Les mots inconnus restent des hypothèses.

**Reproduction.**

Depuis le dossier de développement :

```text
node tests/review-seven-fixes.mjs
```

Cette commande rejoue maintenant les attentes initiales et écrit un rapport de régression séparé. Le script de diagnostic historique refuse de remplacer son résultat initial. Le détail avant correction et l'empreinte du HTML initial sont conservés dans [revue-code-2026-10-31.json](validation/revue-code-2026-10-31.json).
