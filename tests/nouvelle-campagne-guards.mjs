import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
import {nounGender} from '../src/lexicon.js';
await initialize();
const clean=p=>p.replace(/[.ː‿\s]/gu,'');
const report={method:'Post-fix guards for the new linguistic rules, not an independent accuracy estimate.',passed:0,failed:0,failures:[]};
const check=(label,fn)=>{try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({label,error:e.message});}};
const word=(text,target)=>{const t=transcribe(text).lines[0].tokens.find(t=>t.lower===target);let p=clean(t.ipa);if(t.liaison?.realized)p=p.slice(0,-t.liaison.phone.length);return p;};
for(const [text,target,expected]of [
 ['Les enfants trouvent cet élève excellent et content.','content','kɔ̃tɑ̃'],
 ['Les touristes visitent un couvent et un président.','président','pʁezidɑ̃'],
 ['Les poules mangent des graines et couvent leurs œufs.','couvent','kuv'],
 ['Les enfants jouent et content leur aventure.','content','kɔ̃t'],
 ['Les enfants que nous invitons content une histoire.','content','kɔ̃t'],
 ['Les enfants qui arrivent couvent ce projet.','couvent','kuv'],
 ['Les enfants qui trouvent le président arrivent.','président','pʁezidɑ̃'],
 ['Les enfants qui visitent un couvent arrivent.','couvent','kuvɑ̃'],
 ['Ces désertions sont inquiétantes.','désertions','dezɛʁsjɔ̃'],
 ['Nous désertions le village.','désertions','dezɛʁtjɔ̃'],
 ['Vous désertiez le village.','désertiez','dezɛʁtje'],
])check(text,()=>assert.equal(word(text,target),expected));
for(const [text,expected]of [
 ['1 amie','ynami'],['1 ami','œ̃nami'],['21 amies','vɛ̃teynami'],['21 amis','vɛ̃teœ̃nami'],
 ['21 bonnes amies','vɛ̃teynbɔnzami'],['21 jeunes hommes','vɛ̃teœ̃ʒœnɔm'],
 ['21 jeunes femmes','vɛ̃teynʒœnfam'],['21 euros','vɛ̃teœ̃nøʁo'],
 ['1 million de personnes','œ̃miljɔ̃dəpɛʁsɔn'],
 ['21 mille femmes','vɛ̃teœ̃milfam'],['101 histoires','sɑ̃ynistwaʁ']
])check(text,()=>assert.equal(clean(transcribe(text).lines[0].ipa),expected));
for(const text of ['page 21 blanche','pages 21 blanches','leçon 21 complète'])check('postposed ordinal label stays masculine: '+text,()=>{const t=transcribe(text).lines[0].tokens.find(t=>t.text==='21');assert.equal(clean(t.ipa),'vɛ̃teœ̃');});
for(const [text,digits,expected]of [
 ['Je donne à mon amie 1 tulipe.','1','yn'],
 ['Elle offre à sa sœur 21 fleurs.','21','vɛ̃teyn']
])check('recipient noun does not become a numeric label: '+text,()=>{const t=transcribe(text).lines[0].tokens.find(t=>t.text===digits);assert.equal(clean(t.ipa),expected);});
check('rose has no certified lexical gender: default reading remains a hypothesis',()=>{const t=transcribe('Je donne à mon amie 1 rose.').lines[0].tokens.find(t=>t.text==='1');assert.equal(clean(t.ipa),'œ̃');assert.equal(t.confidence,'hypothesis');assert.equal(t.numberContext.gender,undefined);});
check('attested/unknown gender distinction',()=>{assert.equal(nounGender('amie'),'f');assert.equal(nounGender('nuit'),'f');assert.equal(nounGender('élève'),null);assert.equal(nounGender('garçon'),null);assert.equal(nounGender('ploruchette'),null);});
check('unknown feminine-looking invented noun is not certified',()=>{const t=transcribe('1 ploruchette').lines[0].tokens.find(t=>t.text==='1');assert.equal(clean(t.ipa),'œ̃');assert.equal(t.numberContext.gender,undefined);});
for(let i=0;i<16;i++)check('cache contexts '+i,()=>{
 const text=i%2?'Nous désertions le village.':'Ces désertions sont inquiétantes.';
 assert.equal(word(text,'désertions'),i%2?'dezɛʁtjɔ̃':'dezɛʁsjɔ̃');
});
fs.writeFileSync(new URL('../validation/nouvelle-campagne-guards.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
