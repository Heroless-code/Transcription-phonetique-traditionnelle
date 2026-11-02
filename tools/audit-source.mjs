/** Descriptive source coverage, explicitly NOT an accuracy evaluation. */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {fileURLToPath} from 'node:url';
import {loadLexicon,lookup} from '../src/lexicon.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const reviewedWords=new Set([...fs.readFileSync(path.join(root,'src/rules.js'),'utf8').matchAll(/\badd\([^,]+,\s*(['"])(.*?)\1/gu)].flatMap(m=>m[2].split('|').map(w=>w.toLocaleLowerCase('fr'))));
const reviewed=word=>reviewedWords.has(word.toLocaleLowerCase('fr'));
await loadLexicon();
const words='français toujours pourtant apprentissage attention examen maison premier parler silence délicieux alcool accueil cueillir gentil mieux aujourd’hui aussi beaucoup maintenant souvent pendant personne jamais pourquoi lorsque quelque puisque cependant seulement vraiment ensuite ensemble presque alors ainsi avoir faire aller savoir pouvoir vouloir devoir prendre donner trouver penser regarder aimer comprendre demander sembler rester venir vivre temps chose monde travail histoire enfant problème question service famille gouvernement important nouveau ancien beau petit grand bon mauvais heureux souvenir printemps automne hiver été auteur théâtre science pays patience accent aiguille amygdale héros banque fait chantier chocolat oiseau gagner lundi mardi dimanche orange pêche'.split(' ');
const spot=words.map(word=>({word,reviewed:!!reviewed(word),...lookup(word)}));
function normalized(raw){
  let p=raw.normalize('NFC').trim().replace(/^\^\(\(h (?:aspiré|muet)\)\)/u,'');
  if(p.startsWith('\\')&&p.endsWith('\\'))p=p.slice(1,-1);
  if(p.startsWith('/')&&p.endsWith('/'))p=p.slice(1,-1);
  if(p.startsWith('[')&&p.endsWith(']'))p=p.slice(1,-1);
  return p.replace(/[ˈˌ()]/gu,'').replace(/g/gu,'ɡ').replace(/\.\.+/gu,'.');
}
const rows=[];let n=0;
const source=readline.createInterface({input:fs.createReadStream(path.resolve(root,'../analyse-projet/ressources/extracted/extracted.jsonl')),crlfDelay:Infinity});
for await(const line of source){
  n++;
  if(n%967!==0||rows.length>=2000)continue;
  const row=JSON.parse(line);
  if(reviewed(row.word))continue;
  const lexical=lookup(row.word),sourcePhones=new Set(row.phonetic.map(normalized));
  rows.push({row:n,word:row.word,sourceHasPronunciation:row.phonetic.length>0,retained:!!lexical,primaryInThisRawRow:lexical?sourcePhones.has(lexical.ipa):null,primary:lexical?.ipa??null});
}
const retained=rows.filter(x=>x.retained),consistent=retained.filter(x=>x.primaryInThisRawRow);
const report={
  purpose:'Coverage and source membership only. Unlabelled raw pronunciations are not phonetic ground truth. No held-out correctness score is claimed.',
  sampling:'Every 967th source row, skipping root-reviewed forms; first 2,000 selected rows. No selection by expected pronunciation.',
  rowsScanned:n,sampled:rows.length,sourceWithPronunciation:rows.filter(x=>x.sourceHasPronunciation).length,retained:retained.length,primaryPresentInOwnRawRow:consistent.length,
  note:'Case-folded duplicate graphies or the independent Lexique 4.1 anchor can contribute a selected reading absent from this raw row; these are listed as membership differences, not linguistic failures.',
  sourceMembershipDifferences:retained.filter(x=>!x.primaryInThisRawRow),spotAudit:spot,heldOutRows:rows
};
fs.writeFileSync(path.join(root,'data/source-coverage-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sampled:report.sampled,retained:report.retained,sourceWithPronunciation:report.sourceWithPronunciation,primaryPresentInOwnRawRow:report.primaryPresentInOwnRawRow,spotCount:spot.length,membershipDifferences:report.sourceMembershipDifferences.length},null,2));
for(const r of spot)console.log(r.word,r.reviewed?'[reviewed]':'',JSON.stringify({ipa:r.ipa,alternatives:r.alternatives}));
