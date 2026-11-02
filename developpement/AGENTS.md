# Conservation des versions — instruction de l’utilisateur

- Chaque modification du HTML autonome doit produire un nouveau ZIP : « Transcription phonétique traditionnelle v2.zip », puis v3, v4, etc. La v1 est le point de départ déjà livré.
- Ne jamais écraser une archive précédente ni réutiliser un numéro de version.
- L’utilisateur reste libre de supprimer les ZIP dans le dossier. Ne pas les verrouiller et ne jamais recréer automatiquement une archive supprimée, même si elle est mentionnée dans l’historique.
- Garder les informations de toutes les versions, y compris les archives absentes, dans versions.json et HISTORIQUE_VERSIONS.md. Consulter ces fichiers à chaque reprise du travail.
- Utiliser node tools/build.mjs --note "Résumé de la modification" : il archive automatiquement chaque HTML dont le contenu a changé. Une reconstruction identique ne crée pas de version supplémentaire.
- Si le HTML a été modifié directement, utiliser node tools/versions.mjs --note "Résumé de la modification" avant de livrer.
- Vérifier le contenu de l’archive et fournir le lien vers le nouveau ZIP dans la réponse de livraison.
- Ne pas modifier les fichiers synchronisés ou de référence sous sources/. Cette règle de conservation concerne les sorties de cette application.
