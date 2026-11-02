import fs from 'node:fs';
import assert from 'node:assert/strict';
import {VOWELS,GLIDES,phones} from '../src/phonology.js';
import {styleForPhone,composeColors,contrastRatio} from './legacy/color-model-v1.mjs';
import {initialize,transcribe} from '../src/engine.js';
const consonants=[...'bdfɡklmnpʁrsʃtvzʒhʔ','ɲ','ŋ'];
const inventory=[...new Set([...VOWELS,...GLIDES,...consonants])];
const report={purpose:'Cross-check the phonological and chromatic inventories, including rare pronounced h and glottal stop; options must not suppress a recognized consonant.',passed:0,failed:0,failures:[]};
function check(label,fn){try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({label,error:e.message});}}
for(const phone of inventory)check('inventory /'+phone+'/',()=>{
 const canonical=phones(phone)[0];assert.ok(canonical,'recognized IPA /'+phone+'/');
 assert.notEqual(styleForPhone(canonical).category,'mark','pronounced sound omitted from palette');
 const style=composeColors([canonical],{enabled:true,vowel:true,consonant:true,nasal:true});
 assert.equal(style.active,true);assert.ok(contrastRatio(style.color,style.background)>=4.5);
});
for(const phone of VOWELS)check('length and Unicode '+phone,()=>{
 assert.deepEqual(styleForPhone(phone+'ː'),styleForPhone(phone));
 assert.deepEqual(styleForPhone(phone.normalize('NFC')),styleForPhone(phone.normalize('NFD')));
});
for(const mark of ['.','‿','ː','̃',' '])check('non-sound '+mark,()=>{
 assert.equal(composeColors([mark],{enabled:true,vowel:true,consonant:true,nasal:true}).active,false);
});
await initialize();
for(const word of ['aha','bahaï','Bihar'])check('pronounced h in '+word,()=>{
 const token=transcribe(word).lines[0].tokens.find(t=>t.type==='word');assert.ok(token.ipa.includes('h'));
 for(const unit of token.phonemes.filter(p=>p.phone==='h')){
  const c=composeColors([unit.phone],{enabled:true,vowel:false,nasal:false,consonant:true});
  assert.equal(c.active,true);assert.deepEqual(c.layers,['consonant']);
 }
});
for(const word of ['haricot','homme'])check('silent orthographic h in '+word,()=>{
 const token=transcribe(word).lines[0].tokens.find(t=>t.type==='word');assert.ok(!token.ipa.includes('h'));
 const graph=token.segments.find(s=>s.text==='h');assert.ok(graph?.silent);assert.equal(graph.phones.length,0);
});
const name=process.argv.includes('--initial')?'inventory-colors-initial.json':'inventory-colors-regression.json';
const target=new URL('../validation/'+name,import.meta.url);
if(process.argv.includes('--initial'))assert.ok(!fs.existsSync(target));
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
