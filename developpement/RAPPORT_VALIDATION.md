# Validation — Transcription phonétique traditionnelle v3

La livraison est le HTML autonome contenu dans **Transcription phonétique traditionnelle v3.zip**.

- HTML : 10 539 860 octets ; SHA-256 d787c9941d8dc540e0bb658d915f60dc2284d9700320bd88c66a949dd727b927.
- ZIP : 7 768 498 octets ; SHA-256 5f4f0903a92c1d069632a4697e6a4963d75f0ea4db167981424e750b974d3d95.
- Écart du HTML avec la v1 : 14 675 octets retirés. Le lexique reste intact et constitue l’essentiel du poids.
- Lexique : 1 632 485 graphies.
- Dépendance nécessaire à l’exécution : aucune ; aucune requête HTTP observée.

## Comportement de la version livrée

Le mode Afficher les couleurs, ses contrôles, ses familles et accents, son code de composition et ses styles ont été retirés du programme livré. Seuls les calculs de contraste et de mélange perceptuel nécessaires à Sonorités subsistent dans color-math.js. Le HTML ne contient plus composeColors, styleForPhone, phonemeStyle ni les anciens identifiants de contrôle.

Activer Sonorités masque la ligne API de chaque vers et ne produit plus ses anciens éléments de coloration. Le calcul phonétique reste disponible pour les décomptes, les variantes et Copier l’API. Désactiver Sonorités réaffiche exactement la même transcription. Les filtres par vers et globaux, les états partiels, les sons ×1 facultatifs et le cycle des pastilles restent opérationnels.

« Pour faire défiler les ptits culs » donne trois /e/ et trois surbrillances. « Ptits » est lu /pti/. Les assonances /wa/, /wɑ/ et /ɥi/ regroupent les deux sons dans une syllabe. La sélection surligne leurs deux composantes graphiques et le compte des voyelles seules exclut celles de la séquence.

## Contrôles exécutés

| Ensemble | Résultat | Portée |
| --- | ---: | --- |
| Suites actives du moteur | 25 réussies | Lexique, repli, contexte, morphologie, nombres, alignement, Unicode, lecture classique et sonorités. |
| Suite principale | 1723 contrôles | Dont 226 cas lexicaux ; les anciens tests des familles de couleurs ont été retirés. |
| Sept corrections de la revue | 30/30 | Le contrôle lit le HTML réellement livré. |
| Analyse des répétitions | 72 réussis | Sons exacts, séquences « oi » et « ui », mots graphiques, nasales, longueurs et liaisons. |
| Lecture classique assistée | 73 réussis | E caducs, élisions, diérèses/synérèses et limites explicites. |
| Palette Sonorités | 137 réussis | Teintes, contrastes, sons isolés et graphèmes partagés. |
| Inventaire complet des sons | 14 réussis | Seuil de répétition conservé malgré l’option ×1. |
| Navigateur général hors ligne | 16 réussis | Contrôles retirés, API visible/masquée/restaurée, copie, texte long et sécurité du texte. |
| Navigateur Sonorités hors ligne | 42 réussis | Racine, catégories locales/globales, trois états, x1, graphèmes partagés, variantes, clavier et quatre largeurs. |

Les quatre anciennes suites consacrées au mode Couleurs ne sont plus actives. Les références et résultats v1 restent conservés dans tests/legacy et validation/v1 ; ils ne sont pas présentés comme des validations du nouveau programme. Les régressions Unicode comparent désormais les compositions de la palette Sonorités.

## Vue compacte et performances

Les huit vers de contrôle occupent en moyenne 58 px chacun sur ordinateur, contre 71 px dans la dernière vue v1 par défaut. Les rendus bureau et mobile ont été ouverts et examinés. La disparition des lignes API est contrôlée dans le navigateur ; leur contenu reste identique au résultat copié.

Mesures sur cette machine : démarrage 821 ms ; 120 lignes 180 ms ; analyse de 70 vers 218 ms. Ce sont des observations, sans garantie de durée sur tous les appareils.

- [Vue Sonorités sur ordinateur](validation/v2-sonorities-desktop.png)
- [Vue Sonorités sur mobile](validation/v2-sonorities-mobile.png)
- [Transcription seule sur ordinateur](validation/v2-transcription-desktop.png)

## Limites et références

Les contrôles sont des régressions et des invariants, pas une certification universelle de chaque mot français. Les catégories grammaticales et liaisons reposent sur une analyse locale ; les mots inconnus et certaines ambiguïtés restent signalés. Les correspondances orthographiques incertaines ne sont pas inventées, même lorsque le son est compté correctement. Le mode Sonorités signale ces limites dans les précisions.

La lecture classique conserve une liste bornée de variantes et ne décide pas d’un mètre. Les distinctions traditionnelles restent celles du référentiel demandé ; aucun regroupement de timbres ou de longueurs n’est introduit. Les détails et attributions sont dans docs/SONORITES.md, docs/LECTURE_POETIQUE.md, docs/LINGUISTIQUE.md et dans le HTML. Les sources synchronisées restent inchangées.

Les ZIP précédents ne sont jamais écrasés ni recréés après suppression. Consulter HISTORIQUE_VERSIONS.md et versions.json pour la mémoire du projet.
