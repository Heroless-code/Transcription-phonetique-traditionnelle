# Vérification finale de Sonorités — vue d’ensemble

HTML examiné : SHA-256 970a723e90a8100b13e1a60f272f986b5c64b5ade627eac8d4f72293466b19f2 ; 10 554 535 octets. Les tests utilisent une copie isolée du seul HTML, avec réseau désactivé.

Les captures compactes bureau et mobile documentent désormais la vue par défaut sans ×1. Le rendu bureau a été ouvert et examiné : le bouton ×1 apparaît dans la barre, désactivé, sans pastille ni surbrillance de son isolé. Les huit vers testés occupent en moyenne 71 px chacun. L'affichage optionnel des ×1 conserve la palette discrète déjà revue. La barre est vérifiée dans la fenêtre sur le texte court et ancrée en haut pendant le défilement du texte de 70 vers.

Allitérations et Assonances ont maintenant deux portées : les titres à côté du vers ne commandent que ce vers ; la barre du haut commande tout le texte. Les états partiels du haut sont signalés par un cercle à demi rempli et le statut accessible mixed. Les quatre combinaisons, les deux catégories locales, la conservation de la sélection des autres vers et le clavier sont testés. Aucun de ces changements ne modifie l'API.

La palette garde une teinte par phonème exact, avec une version plus pâle pour les ×1. Les répétitions restent plus présentes visuellement ; un son isolé sélectionné reçoit la teinte pleine pour rester facile à localiser. Les titres, symboles et compteurs complètent les couleurs. Les pointillés des pastilles concernent les lectures incertaines, pas le seul fait d’être isolé. Le jugement d’harmonie est visuel, sans garantie universelle de discrimination de toutes les teintes proches.

Les 125 contrôles de palette réussissent : 55 fonds de répétitions distincts et 55 versions discrètes distinctes, contraste encre/fond minimal de 5,01:1 pour les répétitions et 4,93:1 pour les ×1. Les bandes partagées ont une encre grise lisible sur tous les fonds. Les 14 contrôles d’inventaire vérifient qu’aucun son n’est perdu, qu’un ×1 n’est pas qualifié de répétition interne et qu’aucune division par zéro n’apparaît. Les oppositions, longueurs et nasales restent distinctes.

La lecture classique demeure la seule lecture. Les ambiguïtés de diérèse/synérèse restent proposées dans le « ? » et les choix conservent leur incidence phonétique. Le panneau n’augmente pas la hauteur du vers. Les Options des couleurs ne sont visibles que lorsque ce mode est activé ; les préférences demeurent mémorisées. Les couleurs et Sonorités restent exclusifs.

Validation finale du HTML : 70 contrôles navigateur Sonorités, 34 contrôles historiques et 99 contrôles de couleurs réussis, sans HTTP ni erreur navigateur. Les contrôles supplémentaires vérifient le défaut sans ×1, le clic sur ce libellé, le clavier, les catégories locales ou globales, les fréquences propres à chaque vers, les sélections, les masques et la stabilité de la copie API. Les suites internes et le moteur restent inchangés.

- [Vue compacte sur ordinateur](../sonorities-compact-desktop.png)
- [Vue compacte sur mobile](../sonorities-compact-mobile.png)
- [Variantes dans le panneau de précisions](../sonorities-poetry-mobile.png)

La capture sonorities-hidden-sounds.png a été ouverte et examinée : les pastilles des sons masqués restent visibles, grisées et barrées, et ces couleurs disparaissent de l'original et de l'API du seul vers concerné. Le cycle de la pastille est mettre en évidence, masquer la couleur, rétablir la couleur. Plusieurs sons peuvent être masqués indépendamment. Un graphème partagé garde les couleurs de ses autres phonèmes ; quand sa dernière contribution est masquée, aucun ancien fond ni bande ne persiste. Les nouveaux contrôles vérifient la copie API, les changements de modes et de filtres, la réinitialisation par Transcrire et l'utilisation au clavier.

Le premier passage est conservé dans singletons-default-browser-initial.json : 69 contrôles réussis, une attente de position de barre inadaptée à la nouvelle hauteur plus courte. Aucune correction applicative n'a été nécessaire ; le contrôle de l'ancrage est maintenant exécuté sur le long texte, où la page peut réellement défiler jusqu'à cette position.
