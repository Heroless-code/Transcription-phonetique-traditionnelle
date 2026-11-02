# Contrôle des attentes de tests

Des attentes initialement trop restrictives ont été corrigées après consultation des références, sans remplacer le moteur pour satisfaire artificiellement ces attentes :

- [Lyon](https://fr.wiktionary.org/wiki/Lyon) donne les réalisations /li.jɔ̃/ et /ljɔ̃/. Le test accepte les deux.
- [Aimer](https://fr.wiktionary.org/wiki/aimer) donne /e.me/ et /ɛ.me/. Le test accepte les deux.
- [Aiguille](https://fr.wiktionary.org/wiki/aiguille) donne /e.ɡɥij/ et /ɛ.ɡɥij/. Le test accepte les deux.
- [Pays](https://fr.wiktionary.org/wiki/pays) donne /pe.i/ et /pɛ.i/. Le test de syllabification conserve deux noyaux et accepte les deux qualités initiales, comme le test lexical le faisait déjà.

Ces variantes ne suppriment pas les oppositions traditionnelles de l’inventaire. Les tests de longueur stricte et les décisions grammaticales restent distincts. Les premiers diagnostics sont conservés ; les réussites après correction constituent des régressions contrôlées et non une nouvelle mesure indépendante.

La campagne approfondie a également contrôlé [interrompre](https://fr.wiktionary.org/wiki/interrompre) : /ɛ̃.te.ʁɔ̃pʁ/ figure sur la ligne lexicale et /ɛ̃.tɛ.ʁɔ̃pʁ/ dans la section de prononciation. Les deux qualités sont admises dans sa famille ; la première sortie ne constituait donc pas une erreur certaine. En revanche, [coefficient](https://fr.wiktionary.org/wiki/coefficient) est composé de co- et efficient et garde /e/ dans ce dernier segment : la famille efficience/efficient/coefficient reçoit une référence lexicale explicite, sans règle globale sur toutes les lettres e devant ff.
