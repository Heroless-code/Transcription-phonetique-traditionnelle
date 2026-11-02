import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe,analyzeWord} from '../src/engine.js';
import {g2p} from '../src/rules.js';
await initialize();
const rows=[
 ['Il nous convient.','convient','kɔ̃vjɛ̃'],
 ['Ils nous convient.','convient','kɔ̃vi'],
 ['Le père de ces enfants nous convient.','convient','kɔ̃vjɛ̃'],
 ['Les amis de cette dame nous convient.','convient','kɔ̃vi'],
 ['Mes sœurs content une histoire.','content','kɔ̃t'],
 ['Mes soeurs content une histoire.','content','kɔ̃t'],
 ['Les poules pondent et couvent.','couvent','kuv'],
 ['Les moines visitent un couvent.','couvent','kuvɑ̃'],
 ['Les moines visitent un couvent et un président.','président','pʁezidɑ̃'],
 ['Un résident italien arrive.','résident','ʁezidɑ̃',false],
 ['Un parent éloigné arrive.','parent','paʁɑ̃',false],
 ['Un violent orage arrive.','violent','vjɔlɑ̃',true],
 ['Un excellent acteur arrive.','excellent','ɛksɛlɑ̃',true],
 ['Le résident arrive.','résident','ʁezidɑ̃',false]
];
const report={purpose:'Contrasts protecting the revised number, liaison, coordination, aliases and caduc-vowel rules. These are post-fix regressions.',passed:0,failed:0,failures:[]};
function check(label,fn){try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({label,error:e.message});}}
for(const [text,word,ipa,liaison]of rows)check(text,()=>{
 const token=transcribe(text).lines[0].tokens.find(t=>t.lower===word);let actual=token.ipa.replace(/[.ː‿]/gu,'');
 if(token.liaison?.realized)actual=actual.slice(0,-token.liaison.phone.length);
 assert.equal(actual,ipa);if(liaison!==undefined)assert.equal(Boolean(token.liaison?.realized),liaison);
});
for(let i=0;i<12;i++)check('alternating-cache '+i,()=>{
 const text=i%2?'Les amis nous convient.':'Cette solution nous convient.';
 const token=transcribe(text).lines[0].tokens.find(t=>t.lower==='convient');
 assert.equal(token.ipa.replace(/\./gu,''),i%2?'kɔ̃vi':'kɔ̃vjɛ̃');
});
for(const word of ['tressaillement','bâillement','fourmillement','chatouillement'])check(word,()=>{
 assert.match(analyzeWord(word).ipa.replace(/\./gu,''),/jmɑ̃$/u);
 assert.match(g2p(word).ipa.replace(/\./gu,''),/jmɑ̃$/u);
});
fs.writeFileSync(new URL('../validation/context-refinement-regression.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
