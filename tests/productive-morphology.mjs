import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe,analyzeWord} from '../src/engine.js';
import {lookup} from '../src/lexicon.js';
await initialize();
const fixed=[['microflurasse','mikʁo'],['macroflurasse','makʁo'],['néoflurasse','neo'],['téléflurasse','tele'],['polyflurasse','pɔli'],['multiflurasse','mylti'],['protoflurasse','pʁɔto'],['hypermicroflurasse','ipɛʁmikʁo']];
const report={method:'Invariants de préfixes productifs sur des formes inventées absentes des données ; aucune prononciation intégrale certifiée.',checks:[]};
const clean=p=>p.replace(/[.ː]/gu,'');
for(const[word,prefix]of fixed){
  try{assert.equal(lookup(word),null);const t=analyzeWord(word);assert.equal(t.source,'morphology');assert.equal(t.confidence,'hypothesis');assert.ok(clean(t.ipa).startsWith(prefix),t.ipa);report.checks.push({word,ipa:t.ipa,passed:true});}
  catch(e){report.checks.push({word,passed:false,error:e.message});}
}
for(const[word,prefix]of [['microanuflent','mikʁo'],['hypermicroanuflent','ipɛʁmikʁo']]){
  try{assert.equal(lookup(word),null);const t=transcribe('Ils '+word+'.').lines[0].tokens.find(t=>t.lower===word);assert.equal(t.confidence,'hypothesis');assert.ok(clean(t.ipa).startsWith(prefix),t.ipa);assert.ok(!clean(t.ipa).endsWith('ɑ̃'),t.ipa);report.checks.push({word,ipa:t.ipa,passed:true});}
  catch(e){report.checks.push({word,passed:false,error:e.message});}
}
for(const word of ['Paris','Metz','Lyon','Bruxelles','Reims']){
  try{const variants=[word,word.toLowerCase(),word.toUpperCase()].map(w=>transcribe(w).lines[0].ipa);assert.ok(variants.every(p=>p===variants[0]));report.checks.push({word,ipa:variants[0],passed:true});}
  catch(e){report.checks.push({word,passed:false,error:e.message});}
}
report.passed=report.checks.filter(c=>c.passed).length;report.failed=report.checks.length-report.passed;
fs.writeFileSync(new URL('../validation/productive-morphology.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
