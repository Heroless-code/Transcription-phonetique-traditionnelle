import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const build=read('dist/build.json'),history=read('versions.json'),version=history.versions.at(-1);
const browser=read('validation/browser-report.json'),sonBrowser=read('validation/sonorities-browser.json'),suites=read('validation/all-suites.json');
const engine=read('validation/engine-report.json'),son=read('validation/sonorities.json'),poetry=read('validation/poetry.json'),palette=read('validation/sonority-palette.json'),sounds=read('validation/all-sounds.json'),seven=read('validation/review-seven-regression.json');
for(const r of [browser,sonBrowser])if(r.sha256!==build.sha256||r.failed)throw Error('La QA navigateur ne correspond pas au HTML livré.');
if(version.html.sha256!==build.sha256||seven.deliverySha256!==build.sha256)throw Error('Archive ou régression non reliée au HTML final.');
for(const r of [engine,son,poetry,palette,sounds,suites])if(r.failed)throw Error('Une suite active reste en échec.');
const lexicon=read('data/reference-anchor-final-audit.json'),v1=history.versions.find(v=>v.version===1),saved=v1.html.bytes-build.bytes;
const count=suite=>engine.suites[suite]?.passed||0;
const lines=[
'# Validation — Transcription phonétique traditionnelle v'+version.version,'',
'La livraison est le HTML autonome contenu dans **'+version.archive.filename+'**.','',
'- HTML : '+build.bytes.toLocaleString('fr-FR')+' octets ; SHA-256 '+build.sha256+'.',
'- ZIP : '+version.archive.bytes.toLocaleString('fr-FR')+' octets ; SHA-256 '+version.archive.sha256+'.',
'- Écart du HTML avec la v1 : '+saved.toLocaleString('fr-FR')+' octets retirés. Le lexique reste intact et constitue l’essentiel du poids.',
'- Lexique : '+lexicon.lexiconStats.lexicalEntries.toLocaleString('fr-FR')+' graphies.',
'- Dépendance nécessaire à l’exécution : aucune ; aucune requête HTTP observée.','',
'## Comportement de la version livrée','',
'Le mode Afficher les couleurs, ses contrôles, ses familles et accents, son code de composition et ses styles ont été retirés du programme livré. Seuls les calculs de contraste et de mélange perceptuel nécessaires à Sonorités subsistent dans color-math.js. Le HTML ne contient plus composeColors, styleForPhone, phonemeStyle ni les anciens identifiants de contrôle.','',
'Activer Sonorités masque la ligne API de chaque vers et ne produit plus ses anciens éléments de coloration. Le calcul phonétique reste disponible pour les décomptes, les variantes et Copier l’API. Désactiver Sonorités réaffiche exactement la même transcription. Les filtres par vers et globaux, les états partiels, les sons ×1 facultatifs et le cycle des pastilles restent opérationnels.','',
'« Pour faire défiler les ptits culs » donne trois /e/ et trois surbrillances. « Ptits » est lu /pti/. Les assonances /wa/, /wɑ/ et /ɥi/ regroupent les deux sons dans une syllabe. La sélection surligne leurs deux composantes graphiques et le compte des voyelles seules exclut celles de la séquence.','',
'## Contrôles exécutés','',
'| Ensemble | Résultat | Portée |','| --- | ---: | --- |',
'| Suites actives du moteur | '+suites.checks.length+' réussies | Lexique, repli, contexte, morphologie, nombres, alignement, Unicode, lecture classique et sonorités. |',
'| Suite principale | '+engine.passed+' contrôles | Dont '+count('lexical')+' cas lexicaux ; les anciens tests des familles de couleurs ont été retirés. |',
'| Sept corrections de la revue | '+seven.summary.passed+'/'+seven.summary.total+' | Le contrôle lit le HTML réellement livré. |',
'| Analyse des répétitions | '+son.passed+' réussis | Sons exacts, séquences « oi » et « ui », mots graphiques, nasales, longueurs et liaisons. |',
'| Lecture classique assistée | '+poetry.passed+' réussis | E caducs, élisions, diérèses/synérèses et limites explicites. |',
'| Palette Sonorités | '+palette.passed+' réussis | Teintes, contrastes, sons isolés et graphèmes partagés. |',
'| Inventaire complet des sons | '+sounds.passed+' réussis | Seuil de répétition conservé malgré l’option ×1. |',
'| Navigateur général hors ligne | '+browser.passed+' réussis | Contrôles retirés, API visible/masquée/restaurée, copie, texte long et sécurité du texte. |',
'| Navigateur Sonorités hors ligne | '+sonBrowser.passed+' réussis | Racine, catégories locales/globales, trois états, x1, graphèmes partagés, variantes, clavier et quatre largeurs. |','',
'Les quatre anciennes suites consacrées au mode Couleurs ne sont plus actives. Les références et résultats v1 restent conservés dans tests/legacy et validation/v1 ; ils ne sont pas présentés comme des validations du nouveau programme. Les régressions Unicode comparent désormais les compositions de la palette Sonorités.','',
'## Vue compacte et performances','',
'Les huit vers de contrôle occupent en moyenne '+sonBrowser.metrics.compactMeanVerseHeight+' px chacun sur ordinateur, contre 71 px dans la dernière vue v1 par défaut. Les rendus bureau et mobile ont été ouverts et examinés. La disparition des lignes API est contrôlée dans le navigateur ; leur contenu reste identique au résultat copié.','',
'Mesures sur cette machine : démarrage '+browser.metrics.startupMs+' ms ; 120 lignes '+browser.metrics.multiline120Ms+' ms ; analyse de 70 vers '+sonBrowser.metrics.seventyVersesMs+' ms. Ce sont des observations, sans garantie de durée sur tous les appareils.','',
'- [Vue Sonorités sur ordinateur](validation/v2-sonorities-desktop.png)',
'- [Vue Sonorités sur mobile](validation/v2-sonorities-mobile.png)',
'- [Transcription seule sur ordinateur](validation/v2-transcription-desktop.png)','',
'## Limites et références','',
'Les contrôles sont des régressions et des invariants, pas une certification universelle de chaque mot français. Les catégories grammaticales et liaisons reposent sur une analyse locale ; les mots inconnus et certaines ambiguïtés restent signalés. Les correspondances orthographiques incertaines ne sont pas inventées, même lorsque le son est compté correctement. Le mode Sonorités signale ces limites dans les précisions.','',
'La lecture classique conserve une liste bornée de variantes et ne décide pas d’un mètre. Les distinctions traditionnelles restent celles du référentiel demandé ; aucun regroupement de timbres ou de longueurs n’est introduit. Les détails et attributions sont dans docs/SONORITES.md, docs/LECTURE_POETIQUE.md, docs/LINGUISTIQUE.md et dans le HTML. Les sources synchronisées restent inchangées.','',
'Les ZIP précédents ne sont jamais écrasés ni recréés après suppression. Consulter HISTORIQUE_VERSIONS.md et versions.json pour la mémoire du projet.',''
];
fs.writeFileSync(path.join(root,'RAPPORT_VALIDATION.md'),lines.join('\n'));
console.log('Rapport de validation de la v'+version.version+' actualisé.');
