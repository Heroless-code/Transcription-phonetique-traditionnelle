# Revue visuelle indépendante des huit sélections

## Première version observée

La planche `color-matrix-initial.png` juxtapose des captures du rendu réel de l’application ; ses couleurs ne sont pas recréées dans un autre outil. L’empreinte de la version observée et les résultats sont dans `color-matrix-initial.json`. Les huit modes ont été parcourus aux largeurs 320, 390, 768 et 1280 px.

Les 83 contrôles initiaux réussissent : stabilité des lignes originales et de l’API, sélection des catégories, lettres muettes et associations incertaines neutres, contraste du texte des segments, séparation original/API, largeur du menu, absence de défilement horizontal, fonctionnement hors ligne, copie et fluidité. La copie est vérifiée en interceptant la valeur transmise à l’interface presse-papiers du navigateur ; il ne s’agit pas d’un contrôle du presse-papiers du système.

La revue de la planche et du rendu mobile montre une palette globalement cohérente : fonds pâles proches, saturation modérée des consonnes, accent nasal ambré commun, glyphes de base gris foncé. Le E blanc nécessite un fond sombre et attire davantage l’œil, mais les autres fonds restent suffisamment discrets pour conserver la hiérarchie du texte. Les teintes partagées de lien, loin et taxi s’insèrent dans la même gamme. L’API et les graphèmes restent reconnaissables et sélectionnables dans les huit réglages.

La qualité harmonieuse ou élégante demeure une appréciation visuelle, distincte d’une réussite arithmétique des contrastes. Le contraste des accents et bandes informatifs est examiné séparément du contraste des glyphes par l’audit de palette ; le premier contrôle navigateur ne certifiait que les glyphes.

Le paragraphe coloré représente **2 800 mots** (14 mots × 200 lignes), soumis en 336 ms sur le navigateur observé. Le nom de mesure historique `colored3400WordsMs` est inexact ; sa valeur reste conservée dans le rapport initial. Les douze changements de sélection sur ce texte prennent 241 à 721 ms. L’outil de contrôle final calcule désormais le nombre de mots et emploie le nom `coloredParagraphMs`.

## Compléments prévus pour la version finale

Le script réutilisable `tests/color-visual-matrix.mjs` ajoute le contraste entre h effectivement prononcé (aha, bahaï, Bihar) et h aspiré de haricots, qui n’est pas un phonème /h/. Les vérifications finales doivent également examiner le fond et le placement de l’accent nasal corrigé. Le rapport initial reste immuable ; les nouveaux résultats et captures utilisent le préfixe `color-matrix-final`.

## Revue intermédiaire après correction des accents

La version `b9156745…` est enregistrée dans `color-matrix-color-adjusted.json` avec 99/99 contrôles réussis. Les deux traits nasaux sont maintenant des gradients internes sur un fond solide ; leur contraste rendu atteint au moins 3,2:1 dans les exemples de la planche. Les segments simples réservent 4 px et les segments partagés 8 px, ce qui sépare les bandes phonémiques des deux traits nasaux.

La capture `color-matrix-color-adjusted-mode-7.png` et le rendu mobile correspondant ont été ouverts et examinés. Les traits restent dans leurs fonds, les lignes originales et API ne se chevauchent pas et les signes nasaux restent distincts des bandes propres aux groupes partagés. Le traitement demeure discret à la taille réelle. Les h prononcés sont colorés avec Consonnes ; le h de haricots reste muet et neutre dans toutes les sélections.

Sur cette exécution, le paragraphe de 2 800 mots avec les trois options prend 412 ms et les changements de sélection 297 à 791 ms. Ces mesures comprennent les interactions automatiques et dépendent de la machine. La version définitive doit encore être liée à son empreinte et contrôlée après les dernières modifications de la palette et du moteur.

## Version finale vérifiée

Le contrôle final concerne exactement le HTML d’empreinte **970a723e90a8100b13e1a60f272f986b5c64b5ade627eac8d4f72293466b19f2**. Les 99 contrôles chromatiques réussissent, sans réseau ni erreur navigateur. La palette et le mode Couleurs restent inchangés ; le nouveau bouton ×1 concerne uniquement Sonorités.

Les huit sélections restent cohérentes ensemble et séparément. La nouvelle répartition des consonnes (olive, pétrole, indigo, vieux rose et charbon pour les familles modifiées) réduit leur proximité visuelle sans augmenter la saturation générale. Les fonds pâles suivent une même gamme ; le charbon du E blanc et les fonds composés restent délibérés et lisibles. Le double accent nasal ambré occupe son espace interne, tandis que les bandes d’un groupe comme ien ou oin gardent une position distincte. Les h prononcés de la phrase complémentaire se repèrent sans colorer le h muet de haricots. À cette taille et sur ces exemples, aucune retouche esthétique supplémentaire n’est nécessaire.

Le contraste minimal mesuré dans les exemples réellement rendus est de **4,88:1 pour le texte des segments** et **3,24:1 pour l’accent nasal**. Ces chiffres portent sur la planche représentative, à distinguer de l’exploration combinatoire exhaustive du modèle. Les quatre largeurs vérifiées n’ont montré ni coupure, ni débordement horizontal, ni collision du fond des segments originaux avec la transcription suivante. Le menu reste contenu dans la fenêtre.

Mesures finales : préparation 874 ms ; soumission colorée de 2 800 mots 844 ms ; changements de sélection entre 265 et 1145 ms. L’API et la valeur copiée restent stables.

La vérification a été renouvelée après les sept corrections de la revue de code. Le mot élève saisi avec des accents décomposés est maintenant aligné et coloré dans l’original comme sa graphie NFC ; la planche finale et la capture mobile ci-dessus ont été rouvertes. La palette demeure cohérente et les marques restent contenues dans leur fond. Le contrôle navigateur complémentaire compare explicitement les couleurs de deux lignes canoniquement équivalentes dans les huit sélections.

Vérification renouvelée le 1er novembre 2026 après intégration de Sonorités. Le rapport final et sa planche portent la nouvelle empreinte. Les huit couleurs restent vérifiées indépendamment du nouveau mode ; celui-ci les désactive et conserve leurs préférences. La régression de fermeture du menu lors de la désactivation des couleurs a été corrigée et les tests historiques réussissent.

La compaction suivante a d'abord produit huit chevauchements de fonds colorés aux largeurs de bureau ; ce diagnostic reste dans `compact-classical-colors-initial.json`. Le mode Couleurs conserve maintenant son propre espacement entre original et API, protégeant les traits nasaux et les graphèmes partagés sans rétablir les grands espaces entre vers. Le passage final ci-dessus ne présente plus de collision aux quatre largeurs.
