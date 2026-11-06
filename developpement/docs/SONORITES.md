# Sonorités — fonctionnement et conventions

Le mode **Sonorités** ajoute un inventaire complet des sons et un relevé de répétitions aux transcriptions. Chaque ligne non vide est un vers indépendant. Les lignes vides sont conservées. Aucun groupe de répétitions n'est constitué en réunissant plusieurs vers.

Pour l'utiliser, transcrire le texte puis cocher **Sonorités**. La ligne API disparaît : seuls le vers, ses surbrillances et son détail sont affichés. Le calcul phonétique reste complet en arrière-plan et Copier l'API conserve son résultat. Désactiver Sonorités réaffiche la même transcription. Les sons isolés ×1 sont masqués par défaut ; leur bouton les ajoute aux pastilles et aux surbrillances du vers avec une teinte plus pâle. Chaque pastille conserve le cycle mettre en évidence, masquer sa couleur, rétablir sa couleur. Les masques individuels et les filtres locaux restent mémorisés entre les deux vues ; Transcrire réinitialise les masques du texte.

Le mode Afficher les couleurs a été retiré dans la v2 avec ses contrôles, sa palette de familles, ses compositions et ses styles dédiés. Seule la palette propre aux sonorités subsiste, sans changement de timbre ni de décompte. Le programme n'utilise plus d'unités visuelles API colorées : les surbrillances sont appliquées aux segments orthographiques certains. Les contrastes et les bandes des graphèmes partagés restent contrôlés.

Les précisions sont réunies derrière le « ? » à droite de chaque vers. Le panneau contient les variantes de lecture, leur incidence phonétique, les décomptes complets et les notes de prononciation. Son ouverture ne modifie pas la hauteur du vers. Il peut défiler indépendamment et se ferme avec Échap ou un clic extérieur. Le bouton reçoit une teinte ambrée lorsqu'une ambiguïté de lecture ou une prononciation hypothétique est signalée.

**Unités comptées.**

L'analyse s'appuie sur l'API finale de chaque mot, après les décisions grammaticales, les nombres et les liaisons. Elle compte donc les consonnes de liaison réalisées une seule fois, ignore les liaisons omises et suit les dénasalisations. Les lettres muettes, les espaces, la ponctuation, les frontières syllabiques et le symbole de liaison ne constituent pas des occurrences sonores.

- Assonances : voyelles orales et nasales, avec trois séquences traitées comme des unités dans ce relevé. Le son « oi » donne /wa/ ou /wɑ/ selon la prononciation, et le son « ui » donne /ɥi/. Les variantes longues restent distinctes.
- Allitérations : consonnes ; les semi-voyelles `/j w ɥ/` y sont rattachées avec la mention « semi-consonne ».
- Les timbres traditionnels restent séparés, notamment `/a–ɑ/`, `/e–ɛ/`, `/o–ɔ/`, `/ø–œ/` et `/ɛ̃–œ̃/`.
- Une voyelle longue demeure distincte de sa correspondante brève : `/ɛː/` ne fusionne pas avec `/ɛ/`.
- La nasalisation et la longueur restent attachées à la voyelle. Elles ne sont jamais comptées seules.
- Les représentations Unicode canoniquement équivalentes sont normalisées, sans transformer la graphie originale.

Tous les sons sont consultables dès une occurrence. Le seuil de **répétition** reste fixé à deux : un « ×1 » est un son isolé, jamais une répétition interne ou une figure littéraire. Les répétitions précèdent les sons isolés dans le classement. Une répétition répartie dans au moins trois mots reçoit un relief supplémentaire, sans preuve d'intention stylistique.

**Occurrences et mots.**

Chaque occurrence conserve l'index du mot analysé, l'index exact de l'unité API, son rang phonétique dans le vers, l'identifiant du mot graphique et, si possible, son ancrage dans l'écriture.

Les mots graphiques sont définis par leurs occurrences originales :

- Les morceaux d'une élision comme `l’` et `homme` sont réunis en `l’homme`.
- Les parties reliées par un trait d'union simple, y compris U+2010 et U+2011, appartiennent au même composé. Un double tiret ou un tiret cadratin constitue une séparation.
- Un nombre écrit comme `21` reste une seule occurrence graphique, même lorsqu'il se prononce en plusieurs mots. Un nombre groupé comme `1 000` reste également une occurrence.
- Un mot écrit plusieurs fois à des positions différentes compte plusieurs fois. Il ne s'agit pas d'un décompte de vocabulaire distinct.
- Deux occurrences d'un même son dans un mot donnent bien deux occurrences dans un seul mot.

**Classement.**

Le classement emploie un indice heuristique explicable :

```text
4 × mots concernés
+ 2 × log₂(occurrences)
+ 2 × couverture des mots
+ 2 × densité phonétique
+ proximité moyenne
+ étendue dans le vers
```

La couverture est la proportion de mots concernés. La densité est la proportion de ce phonème parmi les phonèmes du vers. La proximité mesure l'inverse de l'écart moyen entre occurrences, et l'étendue leur répartition entre la première et la dernière position. Le schwa reçoit un facteur prudent de 0,70 et `/ʁ/` un facteur de 0,85 afin de ne pas privilégier leur fréquence ordinaire sur le seul total. Ces pondérations ne modifient jamais les décomptes affichés.

Cet indice est une décision de présentation, sans pourcentage de certitude littéraire ni validation universelle. Le programme propose des figures possibles et laisse l'interprétation à la personne qui lit.

**Sélection et incertitudes.**

Les groupes de lettres sont repérés à partir de la prononciation finale. Le moteur compte /wa/, /wɑ/ et /ɥi/ quand les deux sons se suivent dans la même syllabe. La voyelle de la séquence entre uniquement dans le compte de cette assonance. Les semi-consonnes /w/ et /ɥ/ restent dans le relevé des allitérations. Ainsi, /wa/ peut relier « moi » à « envoyer », et « oui » /wi/ reste distinct de « nuit » /nɥi/.

Sélectionner une séquence surligne les lettres qui portent ses deux sons, par exemple « oi » dans « parfois » ou « ui » dans « nuit ». Un graphème portant plusieurs sons affichés garde leurs bandes respectives. Masquer un son retire sa contribution. Les correspondances incertaines restent neutres.

Les associations graphiques opaques ne sont pas inventées. Un son peut être correctement compté sans être localisable avec certitude dans les lettres ; une note dans les précisions explique cette limite. L'API complète reste accessible par copie ou en désactivant Sonorités. Une incertitude d'alignement reste distincte d'une prononciation hypothétique.

L'exemple de contrôle est le vers de Racine « Pour qui sont ces serpents qui sifflent sur vos têtes ? ». Il donne `/s/ — 5 occurrences dans 5 mots` : sont, ces, serpents, sifflent et sur. Le `c` de ces est bien repéré. [Dictionnaire de l'Académie française](https://www.dictionnaire-academie.fr/article/A9A1240).

**Lecture choisie.**

L'application utilise désormais uniquement la **lecture classique**, dans tous les modes visuels. Le sélecteur Courante/Classique a été retiré. Les e caducs sont conservés à l'intérieur du vers selon la politique classique documentée, avec élisions et traitement de fin de vers. Le résultat de prose est conservé uniquement comme étape interne du moteur et référence pour les écarts entre lectures.

La lecture classique assiste le traitement des e caducs et propose une liste bornée de variantes de diérèse/synérèse, sans décider du mètre. Les ambiguïtés restent proposées dans « ? », avec un choix distinct pour chaque occurrence. Les décomptes sont recalculés et l'incidence sur les phonèmes est indiquée. Voir [la politique de lecture et ses limites](LECTURE_POETIQUE.md).

**Architecture et vérifications.**

`sonorities.js` calcule `soundGroups`, inventaire complet, et `groups`, répétitions d'au moins deux occurrences. Les métriques d'un son isolé restent finies, avec proximité et écart nuls. `poetry.js` produit la lecture classique sur une copie du résultat de base. `sonority-colors.js` fournit les teintes exactes et leurs versions discrètes pour les « ×1 ». `sonorities-view.js` présente les sons et leurs sélections ; `ui.js` coordonne les modes, les filtres globaux et les « ? ». Les données lexicales restent intactes.

Les suites vérifient les comptes exacts, les oppositions, longueurs et nasales, les mots graphiques, les positions et ancrages, le repli sans métadonnées, la non-mutation, les choix de lecture, le masquage/restauration de l’API et le HTML isolé dans un navigateur hors ligne. Les résultats détaillés et l'empreinte du fichier livré sont dans le [rapport de validation](../RAPPORT_VALIDATION.md).

**Filtres par vers et globaux.** Les titres Allitérations et Assonances placés à côté d'un vers n'agissent que sur **ce vers**. Les boutons correspondants dans la barre du haut agissent sur **tout le texte**. Les deux catégories restent indépendantes. La barre reste visible pendant le défilement et indique un état partiel quand seuls certains vers affichent une catégorie ; cliquer sur cet état réactive cette catégorie partout. Masquer une catégorie retire sa sélection éventuelle, sans changer les comptes ou l'API. Les sons masqués individuellement le restent lorsqu'on réactive leur catégorie, jusqu'au troisième clic sur leur pastille. Les préférences locales survivent aux changements de mode et de variante de lecture. Le texte reste à 16 px et l'API à 14 px pour garder la vue d'ensemble compacte.
