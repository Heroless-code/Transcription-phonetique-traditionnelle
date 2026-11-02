# Corrections des sept défauts de la revue

Les sept familles de défauts relevées le 31 octobre 2026 sont corrigées dans le moteur et le HTML reconstruit. Le diagnostic initial est conservé : 14 réussites et 16 échecs parmi 30 contrôles sur la version `f2a3eae3…`. Les mêmes contrôles donnent maintenant **30/30**, sans modifier leurs attentes.

Livraison vérifiée : **Transcription-phonetique-traditionnelle.html**, 10 497 229 octets ; SHA-256 `15b054c4dcb5d1cabe4c98ae1f0ff6053bd3d0d78227d99961ca2c816e119c4c`.

| Défaut | Correction | Exemple après correction |
| --- | --- | --- |
| Fragments de locutions | Reconnaissance de l'expression entière et de chaque séparateur, avant d'autoriser une exception de liaison. | `mot à traduire` → `/mo a…/` ; `mot à mot` conserve `/mo.t‿a mo/`. |
| Famille sous-évaluer | Couche lexicale relue avec `/suz/`, alternance `/y–ɥ/` bornée à cette famille et lectures grammaticales corrigées. | `sous-évaluer` → `/su.ze.va.lɥe/` ; `nous sous-évaluons` n'est plus remplacé par une lecture fautive du lexique brut. |
| Pluriel de os | Recherche du déterminant à travers les adjectifs et leurs intensifieurs. | `les petits os` → `/le pə.ti.z‿o/` ; `un petit os` garde `/ɔs/`. |
| Milliers écrits avec espaces | Le découpage reconnaît les groupes conventionnels de trois chiffres avant de développer le nombre. | `1 000`, `1 000` et `1 000` sont tous lus « mille ». |
| Cardinal ou identifiant | Le rôle syntaxique du nombre précède le garde-fou des intitulés numérotés. | `Je donne à cette classe 21 tulipes` → « vingt et une » ; `page 21 blanche` garde « vingt et un ». |
| Accents décomposés | Correspondance explicite entre positions normalisées et positions originales, sans découper une séquence de marques combinées. | Les mêmes couleurs et phonèmes sont obtenus pour les versions NFC et NFD de `élève`, tout en préservant exactement la saisie. |
| Repli -tien inaccessible | Règle limitée au suffixe nominal/adjectival et à ses flexions ; seul `t` est consommé, puis `ien` conserve son noyau. | En règles forcées, `martien` → `/maʁ.sjɛ̃/` ; les familles de tenir, chrétien et les contextes après s/x sont protégés. |

Les fichiers de données lexicales massives restent inchangés. Le correctif sous-évaluer prend priorité à l'exécution et corrige aussi les candidats grammaticaux, afin que le contexte ne restaure pas l'ancienne forme erronée. Aucun serveur ni ressource distante n'est ajouté au fonctionnement de l'application.

**Validation.**

Les cinq nouvelles suites exécutent **943 contrôles**, tous réussis :

- 30 reproductions originales de la revue ;
- 70 contrôles des locutions, des frontières et du nombre de os ;
- 37 contrôles des cardinaux, destinataires, identifiants et ambiguïtés ;
- 85 contrôles des familles lexicales, flexions et exceptions de -tien ;
- 721 contrôles des graphies équivalentes, couleurs, positions originales et nombres groupés.

Le lanceur général exécute désormais **23 suites**, toutes réussies, dont les anciens contrôles linguistiques, l'intégrité du lexique et les contrôles approfondis de couleur. Les premières erreurs restent visibles dans le diagnostic historique ; une réussite après correction ne devient pas une nouvelle évaluation indépendante de précision.

Le navigateur hors ligne vérifie le HTML isolé : **34 contrôles réussis**, dont les reproductions dans le résultat réellement affiché et l'égalité des couleurs NFC/NFD dans chacune des huit sélections. La planche complémentaire réussit **99 contrôles** aux largeurs 320, 390, 768 et 1 280 px, avec copie, API stable, segments muets, placement des accents nasaux et texte long. Aucun accès HTTP ni erreur du navigateur n'a été observé.

**Limites conservées.**

Le contexte reste une analyse grammaticale locale. Un fragment comme « classe 21 petites fleurs », sans rattachement syntaxique établi, est signalé ambigu plutôt que corrigé arbitrairement au féminin. Le genre des noms inconnus ou épicènes n'est pas inventé. Les mots nouveaux reçoivent encore une hypothèse de prononciation. Le repli de -tien ne certifie pas à lui seul toute la prononciation d'un mot complexe : un autre graphème peut conserver une limite indépendante. Les correspondances orthographiques impossibles à établir restent neutres.

Les références de la correction lexicale et du repli sont notamment le [TLFi, sous-évaluer](https://www.cnrtl.fr/definition/sous-%C3%A9valuer), le [TLFi, chrétien](https://www.cnrtl.fr/definition/chr%C3%A9tiens), [martien](https://fr.wiktionary.org/wiki/martien) et [tahitien](https://fr.wiktionary.org/wiki/tahitien). Le [rapport de validation](RAPPORT_VALIDATION.md) porte les contrôles détaillés et l'empreinte du fichier livré.

Pour reproduire : `node tools/build.mjs`, puis `node tools/test.mjs`. Les vérifications de navigateur restent des outils de développement ; elles ne sont jamais nécessaires pour ouvrir le HTML livré.
