import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
import {align} from '../src/alignment.js';
import {phones} from '../src/phonology.js';
import {applySonorityStyle} from '../src/sonority-colors.js';
import {explicitAlignmentCases,opaqueAlignmentCases} from './alignment-cases.js';
await initialize();
const report={purpose:'Regressions for grouping spaces and canonical-equivalent spellings; not an independent phonetic accuracy estimate.',passed:0,failed:0,failures:[]};
function check(label,fn){try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({label,error:e.message});}}
const words=line=>line.tokens.filter(t=>t.type==='word');
const semantic=segments=>segments.map(({text,phones,silent,uncertain})=>({text:text.normalize('NFC'),phones,silent,uncertain}));
const composition=(ps,single)=>{const out={};applySonorityStyle({style:{setProperty:(k,v)=>{out[k]=v;},removeProperty:k=>{delete out[k];}}},ps,{singlePhones:single?ps:[]});return out;};
for(const f of explicitAlignmentCases){
  const nfc=f.word.normalize('NFC'),nfd=f.word.normalize('NFD');
  const base=align(nfc,f.ipa),decomposed=align(nfd,f.ipa);
  check('same canonical graph/phone mapping: '+f.word,()=>{
    assert.equal(decomposed.map(s=>s.text).join(''),nfd);
    assert.deepEqual(semantic(decomposed),semantic(base));
    assert.deepEqual(decomposed.flatMap(s=>s.phones),phones(f.ipa).filter(p=>p!=='.'&&p!=='‿'));
    for(const s of decomposed)if(s.start!==undefined)assert.equal(nfd.slice(s.start,s.end),s.text);
  });
  for(let mask=0;mask<2;mask++)check('same sonority tint composition: '+f.word+' / '+mask,()=>{
    assert.deepEqual(decomposed.map(s=>s.silent||s.uncertain?null:composition(s.phones,Boolean(mask))),base.map(s=>s.silent||s.uncertain?null:composition(s.phones,Boolean(mask))));
  });
}
for(const word of ['élève','école','âme','pâte','maître','hôte','brûler','ambiguïté','cœur','oïl']){
  const a=transcribe(word).lines[0],b=transcribe(word.normalize('NFD')).lines[0];
  check('full-engine accent equivalence: '+word,()=>{
    assert.equal(a.ipa,b.ipa);assert.equal(b.original,word.normalize('NFD'));
    assert.deepEqual(semantic(words(a)[0].segments),semantic(words(b)[0].segments));
    if(words(a)[0].alignmentCertain)assert.equal(words(b)[0].alignmentCertain,true);
  });
}
for(const f of opaqueAlignmentCases)check('opaque remains opaque after decomposition: '+f.word,()=>{
  const result=align(f.word.normalize('NFD'),f.ipa);
  assert.equal(result.map(s=>s.text).join(''),f.word.normalize('NFD'));
  assert.ok(result.some(s=>s.uncertain));
});
for(const raw of ['a\u0301\u0323','\u0301a','q\u0301','\u0130','\u1100\u1161'])check('unsupported or reordered spelling preserves raw text: '+raw,()=>{
  const result=align(raw,'a');assert.equal(result.map(s=>s.text).join(''),raw);
  assert.deepEqual(result.flatMap(s=>s.phones),['a']);
});
for(const text of ["L’e\u0301le\u0300ve voit une a\u0302me.","  E\u0301COLE — mai\u0302tre  ","e\u0301le\u0300ve\n\na\u0302me"]){
  check('line and exact source preservation: '+text,()=>{
    const a=transcribe(text),b=transcribe(text.normalize('NFC'));
    assert.deepEqual(a.lines.map(l=>l.original),text.split('\n'));
    assert.deepEqual(a.lines.map(l=>l.ipa),b.lines.map(l=>l.ipa));
    for(const l of a.lines){assert.equal(l.tokens.map(t=>t.text).join(''),l.original);for(const t of words(l))assert.equal(t.segments.map(s=>s.text).join(''),t.text);}
  });
}
for(const [whole,grouped]of [
  ['1000','1 000'],['1000','1\u00a0000'],['1000','1\u202f000'],
  ['1234567','1 234 567'],['1234567','1\u202f234\u00a0567'],
  ['12345678','12 345 678'],['123456789','123 456 789'],
  ['1000,05','1\u202f000,05'],['1000.50','1 000.50'],
  ['1001','1 001'],['21001','21 001']
])for(const tail of [' euros',' personnes',' amies'])check('grouped cardinal equivalence: '+grouped+tail,()=>{
  const input=grouped+tail,result=transcribe(input).lines[0],compact=transcribe(whole+tail).lines[0];
  assert.equal(result.ipa,compact.ipa);assert.equal(result.original,input);
  assert.equal(result.tokens.map(t=>t.text).join(''),input);
  const numeric=words(result).filter(t=>t.source==='number');assert.equal(numeric.length,1);assert.equal(numeric[0].text,grouped);
});
check('independent gold for grouped thousand',()=>assert.equal(transcribe('1\u202f000 euros').lines[0].ipa,'mil ø.ʁo'));
for(const [text,count]of [['1 00 euros',2],['12 34 56',3],['1  000',2],['1234 567',2],['1\t000',2],['1 0000',2],['1 000000',2]])check('separate or malformed number groups: '+text,()=>{
  const result=transcribe(text).lines[0];assert.equal(words(result).filter(t=>t.source==='number').length,count);
  assert.equal(result.tokens.map(t=>t.text).join(''),text);
});
check('grouping does not cross newlines or punctuation',()=>{
  const r=transcribe('1\n000, 2 ; 000');assert.equal(r.lines.length,2);
  assert.equal(words(r.lines[0]).length,1);assert.equal(words(r.lines[1]).length,3);
});
fs.writeFileSync(new URL('../validation/review-spelling-fixes.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
