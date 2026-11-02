import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
import {applyPoeticReading} from '../src/poetry.js';
import {phones,isVowel} from '../src/phonology.js';
await initialize();
const report={purpose:'Independent final guards of assisted poetry: tonic imperative clitics, uncertainty, boundaries and source invariants. Not a complete scansion benchmark.',passed:0,failed:0,failures:[]};
const check=(name,fn)=>{try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({name,error:e.message});}};
const token=(result,word)=>result.lines.flatMap(l=>l.tokens).find(t=>t.type==='word'&&t.lower===word);
for(const text of ['Dis-le.','Prenez-le.','Lis-le.','Donne-le.'])check('tonic imperative le keeps its vowel: '+text,()=>{
  const base=transcribe(text),out=applyPoeticReading(base);
  const before=token(base,'le'),after=token(out,'le');
  assert.ok(phones(before.ipa).some(isVowel));
  assert.ok(phones(after.ipa).some(isVowel),'A tonic imperative pronoun cannot be reduced to /l/ at verse end.');
  assert.equal(after.ipa,before.ipa,'Conserve the attested base reading rather than inventing a different vowel.');
});
for(const text of ['Dis-le-moi.','Donne-le-nous.','Regardez-le bien.'])check('internal postposed le keeps its vowel: '+text,()=>assert.ok(phones(token(applyPoeticReading(transcribe(text)),'le').ipa).some(isVowel)));
for(const text of ['Dis-le encore.','Prenez-le ailleurs.','Donne-le à Paul.'])check('tonic le is not elided before a vowel: '+text,()=>{
  const base=transcribe(text),out=applyPoeticReading(base);
  assert.equal(token(out,'le').ipa,token(base,'le').ipa);assert.ok(phones(token(out,'le').ipa).some(isVowel));
});
for(const word of ['le','de','ce','que','ne','me','te','se','je'])check('non-posttonic grammatical monosyllable keeps its nucleus: '+word,()=>{
  const base=transcribe(word),out=applyPoeticReading(base);
  assert.equal(out.lines[0].ipa,base.lines[0].ipa);assert.ok(phones(out.lines[0].ipa).some(isVowel));
});
check('inverted je follows the separate post-tonic classical rule',()=>assert.equal(token(applyPoeticReading(transcribe('Que dis-je ?')),'je').ipa,'ʒ'));
for(const text of ['La lune arrive.','Les femmes arrivent.','Les enfants chantent un air.','Une supérieure parle.','Le lion dort.'])check('frozen base is not mutated: '+text,()=>{
  const base=transcribe(text),saved=JSON.stringify(base);
  const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  freeze(base);const out=applyPoeticReading(base);assert.equal(JSON.stringify(base),saved);
  assert.equal(out.reading.metre,'not-inferred');assert.equal(out.lines[0].original,text);
});
for(const text of ['Les femmes, arrivent.','Les femmes — arrivent.','Les femmes… arrivent.'])check('punctuation and no invented liaison: '+text,()=>{
  const out=applyPoeticReading(transcribe(text)),separator=out.lines[0].tokens.find(t=>t.type==='separator'&&/[,—…]/u.test(t.text));
  assert.ok(out.lines[0].ipa.includes(separator.text));assert.equal(Boolean(token(out,'femmes').liaison?.realized),false);
});
check('unknown h does not receive a confident caduc decision',()=>{
  const out=applyPoeticReading(transcribe('La lune hzzorphe.')),lune=token(out,'lune');
  assert.ok(lune.poetryHypothesis);assert.ok(lune.poetryReason.includes('incertain'));
});
for(const form of ['NFC','NFD'])check('explicit variant preserves Unicode source: '+form,()=>{
  const text='Le lion rêve.'.normalize(form),base=transcribe(text),proposal=applyPoeticReading(base);
  const at=proposal.lines[0].tokens.findIndex(t=>t.lower==='lion'),lion=proposal.lines[0].tokens[at];
  const alternative=lion.poetryAlternatives.find(o=>o.ipa!==lion.ipa);
  const out=applyPoeticReading(base,{choices:{0:{[at]:alternative.ipa}}});
  assert.equal(out.lines[0].tokens.map(t=>t.text).join(''),text);
  assert.equal(out.lines[0].tokens[at].ipa,alternative.ipa);
});
fs.writeFileSync(new URL('../validation/poetry-final-guards.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
