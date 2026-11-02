// Read-only diagnostic campaign. Failures document the reviewed version;
// this is deliberately not added to the passing regression runner.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {initialize,transcribe} from '../src/engine.js';
import {g2p} from '../src/rules.js';
await initialize();
const clean=p=>p.normalize('NFD').replace(/[.‿\s]/gu,'');
const token=(text,word)=>transcribe(text).lines[0].tokens.find(t=>t.type==='word'&&t.lower===word);
const cases=[];
function check(family,text,actual,expected,details={}){
  cases.push({family,text,actual,expected,passed:actual===expected,...details});
}
for(const [text,left,expected] of [
  ['Le mot à traduire est rare.','mot',false],
  ['Le petit à lunettes arrive.','petit',false],
  ['La nuit et la pluie arrivent.','nuit',false],
  ['Je pose mon pied à la fenêtre.','pied',false],
  ['Mot à mot.','mot',true],
  ['Petit à petit.','petit',true],
  ['Les enfants arrivent.','les',true],
  ['Les héros arrivent.','les',false]
]){
  const t=token(text,left);
  check('liaisons',text,Boolean(t.liaison?.realized),expected,{ipa:transcribe(text).lines[0].ipa,decision:t.liaison});
}
for(const [text,expected] of [
  ['Les petits os sont solides.','o'],
  ['Deux gros os sont là.','o'],
  ['Les vieux os sont fragiles.','o'],
  ['Les os sont solides.','o'],
  ['Un petit os.','ɔs']
]){
  const t=token(text,'os');
  check('nombre-grammatical',text,clean(t.ipa),expected,{confidence:t.confidence,reason:t.contextReason});
}
for(const text of ['1 000 euros','1\u00a0000 euros','1\u202f000 euros','1000 euros']){
  const ipa=transcribe(text).lines[0].ipa;
  check('groupes-de-chiffres',text,clean(ipa),'miløʁo',{ipa});
}
for(const [text,expected] of [
  ['Je donne à cette classe 21 tulipes.','vɛ̃teyn'],
  ['Je donne à sa sœur 21 fleurs.','vɛ̃teyn'],
  ['page 21 blanche','vɛ̃teœ̃']
]){
  const t=token(text,'vingt et un');
  check('accord-du-cardinal',text,clean(t.ipa),expected,{expanded:t.expanded,confidence:t.confidence});
}
for(const word of ['élève','école'])for(const form of ['NFC','NFD']){
  const input=word.normalize(form),t=transcribe(input).lines[0].tokens[0];
  check('alignement-unicode',input,t.alignmentCertain,true,{form,ipa:t.ipa,segments:t.segments});
}
for(const [word,expected] of [
  ['sous-évaluer','suzevalɥe'],
  ['sous-évaluation','suzevalɥasjɔ̃'],
  ['sous-évaluons','suzevalɥɔ̃'],
  ['sous-évalué','suzevalɥe']
]){
  const t=transcribe(word).lines[0].tokens[0];
  check('famille-sous-évaluer',word,clean(t.ipa),expected,{confidence:t.confidence,source:t.source,alternatives:t.alternatives});
}
check('repli-tien','martien avec règles forcées',clean(g2p('martien').ipa),'maʁsjɛ̃');
check('repli-tien','martien avec lexique',clean(transcribe('martien').lines[0].ipa),'maʁsjɛ̃');
const html=fs.readFileSync(new URL('../Transcription-phonetique-traditionnelle.html',import.meta.url));
const report={
  scope:'Review diagnostics on unchanged implementation, not an accuracy estimate or a corrected regression result.',
  deliverySha256:crypto.createHash('sha256').update(html).digest('hex'),
  cases,
  summary:{total:cases.length,passed:cases.filter(c=>c.passed).length,failed:cases.filter(c=>!c.passed).length}
};
if(fs.existsSync(new URL('./revue-code-2026-10-31.json',import.meta.url)))throw new Error('Le diagnostic initial est conservé. Lancer node tests/review-seven-fixes.mjs pour la régression.');
fs.writeFileSync(new URL('./revue-code-2026-10-31.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({deliverySha256:report.deliverySha256,summary:report.summary,failures:cases.filter(c=>!c.passed)},null,2));
if(report.summary.failed)process.exitCode=1;
