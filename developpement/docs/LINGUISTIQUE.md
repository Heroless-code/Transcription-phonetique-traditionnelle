# Analyse contextuelle et liaisons

Le module `src/context.js` sélectionne une lecture parmi les candidats lexicaux et morphologiques avant la syllabification. Il sépare le choix du phonème de liaison de son rendu ; aucune consonne n’est ajoutée par une simple recherche de consonne finale écrite.

## Références

- [Wiktionnaire : français moderne traditionnel](https://fr.wiktionary.org/wiki/Annexe:Prononciation/fran%C3%A7ais#Fran%C3%A7ais_moderne_traditionnel), référentiel vocalique et consonantique demandé.
- [Wiktionnaire : liaisons](https://fr.wiktionary.org/wiki/Annexe:Prononciation/fran%C3%A7ais#Liaisons), dépendance de la liaison à la fonction grammaticale.
- [Académie française : questions de langue, liaisons](https://www.dictionnaire-academie.fr/article/QDL046), règles grammaticales et liaisons fautives.
- [Académie française : plus](https://www.dictionnaire-academie.fr/article/A9P2988), variation du s selon le sens.
- [OQLF : liaisons obligatoires](https://vitrinelinguistique.oqlf.gouv.qc.ca/23549/la-prononciation/liaisons/contextes-de-liaisons-obligatoires), [facultatives](https://vitrinelinguistique.oqlf.gouv.qc.ca/23550/la-prononciation/liaisons/contextes-de-liaisons-facultatives) et [interdites](https://vitrinelinguistique.oqlf.gouv.qc.ca/23552/la-prononciation/liaisons/contextes-de-liaisons-interdites), utilisées pour la grammaire des jonctions, sans reprendre les réalisations vocaliques québécoises.
- [OQLF : changements phoniques](https://vitrinelinguistique.oqlf.gouv.qc.ca/23545/la-prononciation/liaisons/changements-phoniques-dans-les-liaisons), alternances consonantiques et dénasalisation.
- [Université de Jyväskylä, Jean-Michel Kalmbach : types de liaison](https://research.jyu.fi/phonfr/20a.html), notamment tous pronom, les pronoms inversés, les groupes figés et les semi-voyelles initiales.
- [OQLF : six et dix](https://vitrinelinguistique.oqlf.gouv.qc.ca/23137/la-prononciation/prononciation-des-nombres/prononciation-de-six-et-dix), distinction déterminant/pronom/nom.

## Politique de diction

Les liaisons obligatoires reconnues sont réalisées. Les facultatives sont omises de manière cohérente, y compris après les auxiliaires être et avoir. Les expressions lexicalisées reconnues constituent un cas distinct. Ce choix correspond à une lecture naturelle mesurée ; il ne prétend pas restituer toute diction soutenue possible.

Les déterminants, les pronoms conjoints, certaines prépositions et les adjectifs antéposés disposent de règles propres. Les noms singuliers, la conjonction et, les initiales disjonctives et les pauses écrites bloquent la liaison. Une inversion reconnue peut établir une jonction malgré le trait d’union. La consonne euphonique écrite est distinguée d’une nouvelle consonne de liaison.

## Choix et limites d’implémentation

Le lexique reçu n’identifie pas les catégories grammaticales. L’analyse utilise des indices locaux et des classes lexicales explicites ; ce n’est pas un analyseur syntaxique complet. Les homographes verbaux en -ent sont traités par paradigmes, jamais par effacement général de leur finale. Les formes inconnues peuvent fournir un candidat verbal au module.

Le complément Lexique 4.1 apporte des catégories grammaticales attestées. Quand des lectures hétérophones sont disponibles, le module choisit parmi elles selon les indices de sujet, de déterminant et d’attribut. Les formes en -ions, par exemple portions (porter ou portion), ne sont donc pas distinguées par substitution globale de ti. Cette sélection conserve la longueur et /ɑ/ d’une entrée traditionnelle revue lorsque les deux lectures ne diffèrent que par ces conventions. Une catégorie grammaticale seule ne tranche pas tous les sens ; plusieurs lectures de même catégorie restent signalées.

Les sens indécidables, notamment plus, fils et savant employé comme nom ou adjectif, conservent des alternatives ou une note. Le classement `facultative` peut alors porter `ambiguousGrammar: true` : il désigne une décision suspendue entre analyses différentes, et non une facultativité assurée dans chaque analyse. Le programme ne remplace pas le contexte sémantique absent du texte.

Le statut des h est tiré des données et de familles lexicales revues. Un h non classé n’autorise pas une liaison par défaut. Les préfixations inconnues, les noms propres non documentés et les phrases elliptiques peuvent demander une vérification humaine.

Pour fils, une classe sémantique finie de matières (notamment nylon, polyester, acier, cuivre, coton, soie, laine et carbone) s’applique seulement à un complément immédiatement attaché, comme fils de nylon, fils d’acier ou fils en caoutchouc. Des descriptions physiques au pluriel et des compléments fonctionnels comme fils à coudre sont également reconnus. Une occurrence de cuivre ailleurs dans une phrase ne suffit pas : mon fils travaille le cuivre conserve /fis/. Un déterminant singulier fournit un garde-fou grammatical, puisque le singulier matériel s’écrit fil. Le complément de matière inconnu laisse l’ambiguïté visible. Ces classes sont déclarées dans le code et ne constituent pas une compréhension générale du sens.

Les tests `tests/context-fixtures.js` et `tests/run-context.mjs` vérifient les lectures et les décisions de jonction sur des phrases contrôlées, y compris des cas adversariaux ; leur réussite n’établit pas une précision universelle sur tous les textes français.

## Cardinaux

`applyNumberContext`, dans `src/numbers.js`, applique la composition aux mots numériques, aux composés à traits d’union et aux chiffres développés. Les séparateurs de ponctuation terminent le groupe. Le t de vingt est maintenu dans 21–29, mais reste muet après multiplication par quatre. Cent ne se lie pas à un autre numéral. Le h de huit permet une jonction dans dix-huit et vingt-huit, avec les exceptions cent huit et quatre-vingt-huit. Le t final de huit dépend de sa fonction et de l’initiale suivante. Les écritures ordinales, les identifiants, les dates et les emplois métalinguistiques ne sont pas tous désambiguïsés automatiquement.

Ces règles grammaticales s’appuient sur [OQLF, vingt](https://vitrinelinguistique.oqlf.gouv.qc.ca/23141/la-prononciation/prononciation-des-nombres/prononciation-de-vingt), [Larousse, vingt](https://www.larousse.fr/dictionnaires/francais/vingt/82033), [OQLF, huit](https://vitrinelinguistique.oqlf.gouv.qc.ca/23149/la-prononciation/prononciation-des-nombres/prononciation-de-huit) et [Académie française, huit](https://dictionnaire-academie.fr/article/A9H1074). L’inventaire API traditionnel du projet demeure utilisé. Les résultats initiaux des tests numériques et leurs régressions sont conservés séparément dans `validation/`.
