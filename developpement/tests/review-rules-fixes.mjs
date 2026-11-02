import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe,analyzeWord} from '../src/engine.js';
import {g2p,reviewed} from '../src/rules.js';
import {lookup} from '../src/lexicon.js';
await initialize();
const bare=ipa=>ipa.normalize('NFD').replace(/[.‿\s]/gu,'');
const cases=[];
const check=(category,label,fn)=>{try{fn();cases.push({category,label,passed:true});}catch(e){cases.push({category,label,passed:false,error:e.message});}};
const token=(text,word)=>transcribe(text).lines[0].tokens.find(t=>t.type==='word'&&t.lower===word);
const family=[
  ['sous-évaluer','suzevalɥe'],['sousévaluer','suzevalɥe'],
  ['sous-évaluation','suzevalɥasjɔ̃'],['sous-évaluations','suzevalɥasjɔ̃'],
  ['sous-évalue','suzevaly'],['sous-évalues','suzevaly'],['sous-évaluent','suzevaly'],
  ['sous-évaluons','suzevalɥɔ̃'],['sous-évaluez','suzevalɥe'],
  ['sous-évaluais','suzevalɥɛ'],['sous-évaluait','suzevalɥɛ'],['sous-évaluaient','suzevalɥɛ'],
  ['sous-évaluions','suzevalyjɔ̃'],['sous-évaluiez','suzevalyje'],
  ['sous-évaluant','suzevalɥɑ̃'],
  ['sous-évalué','suzevalɥe'],['sous-évaluée','suzevalɥe'],
  ['sous-évalués','suzevalɥe'],['sous-évaluées','suzevalɥe'],
  ['sous-évaluerai','suzevalyʁe'],['sous-évaluerions','suzevalyʁjɔ̃'],
  ['sous-évalueriez','suzevalyʁje'],
  ['sous-évaluèrent','suzevalɥɛʁ'],['sous-évaluassions','suzevalɥasjɔ̃']
];
for(const [word,expected]of family)check('reviewed-family',word,()=>{
 const t=transcribe(word).lines[0].tokens[0];
 assert.equal(bare(t.ipa),expected);assert.equal(t.source,'reviewed');
 assert.ok(t.grammaticalReadings?.length,'corrected grammar retained');
 for(const r of t.grammaticalReadings)assert.match(bare(r.ipa),/^suzeval/u);
});
for(const [text,word,expected]of [
 ['Nous sous-évaluons le prix.','sous-évaluons','suzevalɥɔ̃'],
 ['Vous sous-évaluez le prix.','sous-évaluez','suzevalɥe'],
 ['Ils sous-évaluent le prix.','sous-évaluent','suzevaly'],
 ['Je sous-évaluais le prix.','sous-évaluais','suzevalɥɛ'],
 ['Nous sous-évaluions le prix.','sous-évaluions','suzevalyjɔ̃'],
 ['Vous sous-évaluiez le prix.','sous-évaluiez','suzevalyje'],
 ['Nous sous-évaluerions le prix.','sous-évaluerions','suzevalyʁjɔ̃'],
 ['Vous sous-évalueriez le prix.','sous-évalueriez','suzevalyʁje'],
 ['Ils sous-évaluèrent le prix.','sous-évaluèrent','suzevalɥɛʁ'],
 ['Nous sous-évaluassions le prix.','sous-évaluassions','suzevalɥasjɔ̃'],
 ['Elle est sous-évaluée.','sous-évaluée','suzevalɥe'],
 ['Les sous-évaluations sont nombreuses.','sous-évaluations','suzevalɥasjɔ̃']
])check('family-in-context',text,()=>assert.equal(bare(token(text,word).ipa),expected));
for(const word of ['évaluer','évaluons','sous-entendre','sous-marin','sous-évaluotron'])check('family-scope',word,()=>assert.equal(reviewed(word),null));
check('source-record-unchanged','raw record remains distinct from reviewed correction',()=>{
 assert.equal(bare(lookup('sous-évaluer').ipa),'suevalye');
 assert.equal(bare(analyzeWord('sous-évaluer').ipa),'suzevalɥe');
});
for(const [word,expected]of [
 ['martien','maʁsjɛ̃'],['martiens','maʁsjɛ̃'],
 ['martienne','maʁsjɛn'],['martiennes','maʁsjɛn'],
 ['tahitien','taisjɛ̃'],['tahitiens','taisjɛ̃'],
 ['tahitienne','taisjɛn'],['tahitiennes','taisjɛn'],
 ['haïtien','aisjɛ̃'],['égyptien','eʒipsjɛ̃']
])check('palatal-suffix',word,()=>{
 const r=g2p(word);assert.equal(bare(r.ipa),expected);
 assert.ok(r.units.some(u=>u.text==='t'&&u.phones==='s'&&u.rule.includes('-tien')));
 assert.equal(bare(r.units.map(u=>u.phones).join('')),expected);
});
for(const [word,expected]of [
 ['tien','tjɛ̃'],['tiens','tjɛ̃'],['tienne','tjɛn'],
 ['soutien','sutjɛ̃'],['soutiens','sutjɛ̃'],['soutienne','sutjɛn'],
 ['maintien','mɛ̃tjɛ̃'],['maintienne','mɛ̃tjɛn'],
 ['entretien','ɑ̃tʁətjɛ̃'],['entretienne','ɑ̃tʁətjɛn'],
 ['retienne','ʁətjɛn'],['contienne','kɔ̃tjɛn'],['appartienne','apaʁtjɛn'],
 ['chrétien','kʁetjɛ̃'],['chrétienne','kʁetjɛn'],
 ['kantien','kɑ̃tjɛ̃'],['contient','kɔ̃tjɛ̃'],
 ['bastien','bastjɛ̃'],['sébastien','sebastjɛ̃']
])check('hard-t-guards',word,()=>{
 const r=g2p(word);assert.equal(bare(r.ipa),expected);
 assert.ok(!r.units.some(u=>u.rule.includes('-tien')));
});
check('hard-t-guards','prefixed chrétien keeps its final /tj/, without certifying unrelated ch fallback',()=>{
 const r=g2p('antichrétien');assert.ok(bare(r.ipa).endsWith('tjɛ̃'));
 assert.ok(!r.units.some(u=>u.rule.includes('-tien')));
});
for(const word of ['contiennent','soutiennent','retiennent','appartiennent'])check('verbal-t-guards',word,()=>{
 const r=g2p(word,{verb:true});assert.ok(bare(r.ipa).includes('tj'),'t remains before glide');
 assert.ok(!r.units.some(u=>u.rule.includes('-tien')));
});
check('unknown-hypothesis','new suffix remains an explicit hypothesis',()=>{
 const r=analyzeWord('plourimartien',{forceRules:true});
 assert.equal(r.confidence,'hypothesis');assert.ok(bare(r.ipa).endsWith('sjɛ̃'));
});
for(let i=0;i<8;i++)check('cache-and-case','family cache '+i,()=>{
 const text=i%2?'Nous SOUS-ÉVALUIONS le prix.':'Vous sous-évaluez le prix.';
 const target=i%2?'sous-évaluions':'sous-évaluez';
 assert.equal(bare(token(text,target).ipa),i%2?'suzevalyjɔ̃':'suzevalɥe');
});
const report={method:'Post-review correction regression with lexical family, context, suffix and negative guards. No universal accuracy estimate.',
 sources:['https://www.cnrtl.fr/definition/sous-%C3%A9valuer','https://fr.wiktionary.org/wiki/sous-%C3%A9valuer','https://www.cnrtl.fr/definition/chr%C3%A9tiens','https://fr.wiktionary.org/wiki/martien','https://fr.wiktionary.org/wiki/tahitien'],
 cases,passed:cases.filter(c=>c.passed).length,failed:cases.filter(c=>!c.passed).length};
fs.writeFileSync(new URL('../validation/review-rules-fixes.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:cases.filter(c=>!c.passed)},null,2));
if(report.failed)process.exitCode=1;
