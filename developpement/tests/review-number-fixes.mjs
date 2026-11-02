import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
await initialize();
const clean=p=>p.normalize('NFD').replace(/[.ː‿\s]/gu,'');
const report={purpose:'Regression and opposing contexts for the numeric identifier/recipient defect found in code review; not an independent accuracy estimate.',passed:0,failed:0,failures:[]};
function check(label,fn){try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({label,error:e.message});}}
function number(text){return transcribe(text).lines[0].tokens.find(t=>t.source==='number');}
for(const text of [
  'Je donne à cette classe 21 tulipes.',
  'Il offre à la classe 21 belles tulipes.',
  'Je donne pour cette classe 21 tulipes.',
  'Nous offrons à la petite classe 21 belles fleurs.',
  'Je donne aux classes 21 tulipes.',
  'Je donne à cette classe, 21 tulipes.',
  'Je donne à cette classe. 21 tulipes.',
  'Je donne à cette équipe 21 fleurs.',
  'Je donne à sa sœur 21 fleurs.'
])check('cardinal recipient: '+text,()=>{
  const t=number(text);assert.equal(clean(t.ipa),'vɛ̃teyn');assert.equal(t.numberContext.gender,'f');assert.equal(t.numberContext.role,'cardinal');
});
for(const [text,expected]of [
  ['page 21 blanche','vɛ̃teœ̃'],
  ['pages 21 blanches','vɛ̃teœ̃'],
  ['leçon 21 complète','vɛ̃teœ̃'],
  ['classe 21 blanche','vɛ̃teœ̃'],
  ['À la classe 21 blanche.','vɛ̃teœ̃'],
  ['Je pense à cette classe 21 blanche.','vɛ̃teœ̃'],
  ['Consulte la page 21 blanche.','vɛ̃teœ̃'],
  ['La classe 21.','vɛ̃teœ̃']
])check('identifier preserved: '+text,()=>{
  const t=number(text);assert.equal(clean(t.ipa),expected);assert.equal(t.numberContext.role,'identifier');assert.equal(t.numberContext.gender,undefined);
});
for(const text of ['classe 21 tulipes','classe 21 petites fleurs','Pour cette classe 21 tulipes'])check('attachment uncertainty: '+text,()=>{
  const t=number(text);assert.equal(t.numberContext.role,'ambiguous');assert.equal(t.confidence,'ambiguous');assert.ok(t.notes.some(n=>n.includes('rattachement syntaxique')));assert.equal(clean(t.ipa),'vɛ̃teœ̃');
});
for(const [text,expected]of [['21 amies','vɛ̃teyn'],['21 amis','vɛ̃teœ̃n'],['1 amie','yn'],['1 ami','œ̃n'],['21 mille femmes','vɛ̃teœ̃']])check('existing cardinal: '+text,()=>assert.equal(clean(number(text).ipa),expected));
for(let i=0;i<12;i++)check('opposing cached contexts '+i,()=>{
  const text=i%2?'Je donne à cette classe 21 tulipes.':'classe 21 blanche';
  assert.equal(clean(number(text).ipa),i%2?'vɛ̃teyn':'vɛ̃teœ̃');
});
fs.writeFileSync(new URL('../validation/review-number-fixes.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
