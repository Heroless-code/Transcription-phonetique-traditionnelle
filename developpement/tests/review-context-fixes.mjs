import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
await initialize();
const report={method:'Regression and counterexamples for complete liaison expressions and nominal-head number after code review. Not an accuracy estimate.',passed:0,failed:0,failures:[]};
const check=(label,fn)=>{try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({label,error:e.message});}};
const words=text=>transcribe(text).lines.flatMap(l=>l.tokens.filter(t=>t.type==='word'));
for(const [text,left,right,expected]of [
  ['Le mot à traduire est rare.','mot','à',false],
  ['Le petit à lunettes arrive.','petit','à',false],
  ['La nuit et la pluie arrivent.','nuit','et',false],
  ['Je pose mon pied à la fenêtre.','pied','à',false],
  ['Le nez à la fenêtre.','nez','à',false],
  ['La vis à tête plate.','vis','à',false],
  ['Le fond en verre.','fond','en',false],
  ['Le haut en coton.','haut','en',false],
  ['Le temps en hiver.','temps','en',false],
  ['Le temps à attendre.','temps','à',false],
  ['Mot à mot.','mot','à',true],
  ['Petit à petit.','petit','à',true],
  ['Nuit et jour.','nuit','et',true],
  ['Pied à terre.','pied','à',true],
  ['Il défend pied à pied.','pied','à',true],
  ['Il est armé de pied en cap.','pied','en',true],
  ['De fond en comble.','fond','en',true],
  ['De haut en bas.','haut','en',true],
  ['De temps en temps.','temps','en',true],
  ['De temps à autre.','temps','à',true],
  ['Ils sont nez à nez.','nez','à',true],
  ['Vis à vis.','vis','à',true],
  ['Tout à fait.','tout','à',true],
  ['Tout à coup.','tout','à',true],
  ["Tout à l’heure.",'tout','à',true],
  ['Tout au plus.','tout','au',true],
  ['De plus en plus.','plus','en',true],
  ['Comment allez-vous ?','comment','allez',true],
  ['Il était une fois.','était','une',true],
  ['Toujours est-il.','toujours','est',true],
  ['Rien à dire.','rien','à',true],
  ['Mot à, mot.','mot','à',false],
  ['Petit à, petit.','petit','à',false],
  ['La nuit et, jour après jour, la pluie.','nuit','et',false],
  ['De temps en, temps.','temps','en',false],
  ['De temps, en temps.','temps','en',false],
  ['De fond en, comble.','fond','en',false],
  ['De pied en, cap.','pied','en',false],
  ['Il défend pied à, pied.','pied','à',false],
  ['Ils sont nez à, nez.','nez','à',false],
  ['Mot à\nmot.','mot','à',false],
  ['Nuit et\njour.','nuit','et',false],
  ['Les enfants arrivent.','les','enfants',true],
  ['Les héros arrivent.','les','héros',false],
  ['Un os ancien.','os','ancien',false]
])check(text,()=>{const ts=words(text),t=ts.find((t,i)=>t.lower===left&&ts[i+1]?.lower===right);assert.ok(t,'boundary found');assert.equal(Boolean(t.liaison?.realized),expected,JSON.stringify(t.liaison));});
for(const [text,expected]of [
  ['Les petits os sont solides.','o'],['Deux gros os sont là.','o'],['Les vieux os sont fragiles.','o'],
  ['Les très vieux os.','o'],['Ces très anciens petits os.','o'],['Aux vieux os.','o'],
  ['Leurs petits os.','o'],['Tous ces petits os.','o'],['Les os sont solides.','o'],
  ['Un petit os.','ɔs'],['Un très gros os.','ɔs'],['Chaque petit os.','ɔs'],["L’os.",'ɔs'],['Du petit os.','ɔs'],['Au petit os.','ɔs'],
  ['Les enfants touchent un petit os.','ɔs'],['En chair et en os.','ɔs']
])check(text,()=>assert.equal(words(text).find(t=>t.lower==='os').ipa.replace(/[.‿]/gu,''),expected));
for(const text of ['Du petit os.','Au petit os.'])check('singular contracted determiner: '+text,()=>assert.equal(words(text).find(t=>t.lower==='os').confidence,'lexical'));
for(const [word,ipa]of [['vis-à-vis','vizavi'],['pied-à-terre','pjetatɛʁ']])check('lexical compound: '+word,()=>{const ts=words(word);assert.equal(ts.length,1);assert.equal(ts[0].text,word);assert.equal(ts[0].ipa.replace(/[.‿]/gu,''),ipa);});
for(const text of ['Os.','Les enfants, os anciens.','Des enfants. Os anciens.'])check('unresolved number: '+text,()=>assert.equal(words(text).find(t=>t.lower==='os').confidence,'ambiguous'));
check('cached context independence',()=>{for(let i=0;i<12;i++){assert.equal(words('Les petits os.').find(t=>t.lower==='os').ipa,'o');assert.equal(words('Un petit os.').find(t=>t.lower==='os').ipa,'ɔs');}});
fs.writeFileSync(new URL('../validation/review-context-fixes.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
