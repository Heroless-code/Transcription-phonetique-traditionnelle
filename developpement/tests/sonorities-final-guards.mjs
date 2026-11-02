import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
import {analyzeLine,analyzeSonorities,phoneticUnits} from '../src/sonorities.js';
import {applyPoeticReading} from '../src/poetry.js';
await initialize();
const report={purpose:'Independent final source-position, graphic-word, fallback and reading-integration guards. Not a literary-intent or general accuracy score.',passed:0,failed:0,failures:[]};
function check(label,fn){try{fn();report.passed++;}catch(error){report.failed++;report.failures.push({label,error:error.message});}}
const groups=a=>[...a.groups.alliterations,...a.groups.assonances];
const group=(a,p)=>groups(a).find(g=>g.phone===p);
const corpus=[
  ["l’homme l'homme",["l’homme","l'homme"],'l',2,2],
  ['sac‐sac sac‑sac',['sac‐sac','sac‑sac'],'s',4,2],
  ['si—si si--si',['si','si','si','si'],'s',4,4],
  ['21\t21',['21','21'],'v',2,2],
  ['1\u202f000 1\u00a0000',['1\u202f000','1\u00a0000'],'m',2,2],
  ['abracadabra',['abracadabra'],'a',5,1],
  ['🙂 l’école—l’école 👩🏽‍🔬',['l’école','l’école'],'l',4,2],
  ['ÉLÈVE ÉLÈVE',['ÉLÈVE','ÉLÈVE'],'ɛ',2,2]
];
for(const [text,expectedWords,phone,count,wordCount] of corpus){
  const line=transcribe(text).lines[0],a=analyzeLine(line);
  check('graphic occurrence gold: '+text,()=>{
    assert.deepEqual(a.words.map(w=>w.text),expectedWords);
    assert.equal(group(a,phone).count,count);assert.equal(group(a,phone).wordCount,wordCount);
  });
  check('exact source slices: '+text,()=>{
    for(const w of a.words)assert.equal(text.slice(w.start,w.end),w.text);
    for(const o of a.occurrences){
      assert.equal(text.slice(o.wordStart,o.wordEnd),o.wordText);
      for(const span of o.graphSpans)assert.equal(text.slice(span.start,span.end),span.text);
    }
  });
  check('unit indexes and raw cardinality: '+text,()=>{
    assert.deepEqual(a.occurrences.map(o=>o.phoneIndex),a.occurrences.map((_,i)=>i));
    for(const o of a.occurrences)assert.equal(phoneticUnits(line.tokens[o.tokenIndex])[o.phonemeIndex].text.normalize('NFD').replace(/^g$/u,'ɡ').replace(/^r$/u,'ʁ'),o.phone);
    for(const g of groups(a)){
      assert.equal(g.count,g.occurrences.length);assert.equal(g.wordCount,new Set(g.occurrences.map(o=>o.wordId)).size);
    }
  });
}
check('fallback and stale units address visible IPA without inserting sounds',()=>{
  const line={original:'les les',ipa:'le.z‿ le.z‿',tokens:[
    {type:'word',text:'les',ipa:'le.z‿',phonemes:[{text:'fake',phone:'z'}],segments:[],confidence:'lexical'},
    {type:'separator',text:' '},
    {type:'word',text:'les',ipa:'le.z‿',segments:[],confidence:'lexical'}
  ]};
  const a=analyzeLine(line);assert.equal(group(a,'z').count,2);
  assert.deepEqual(group(a,'z').occurrences.map(o=>o.phonemeIndex),[3,3]);
  assert.equal(phoneticUnits(line.tokens[0]).map(u=>u.text).join(''),'le.z‿');
  assert.ok(a.occurrences.every(o=>!o.graphSpans.length));
});
check('new API without matching segments never inherits stale graph anchors',()=>{
  const r=transcribe('sac sac'),line=r.lines[0];
  for(const t of line.tokens)if(t.type==='word'){t.ipa='z';t.phonemes=[{text:'z',phone:'z'}];}
  const a=analyzeLine(line);assert.equal(group(a,'z').count,2);assert.ok(a.occurrences.every(o=>!o.alignmentCertain));
});
check('frozen prose and nested data remain untouched by repeated analyses',()=>{
  const r=transcribe("L’élément voit l’école.\n\nUn bon ami."),snapshot=JSON.stringify(r);
  const freeze=value=>{if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}};
  freeze(r);assert.deepEqual(analyzeSonorities(r),analyzeSonorities(r));assert.equal(JSON.stringify(r),snapshot);
});
check('assisted reading counts restored schwas from its actual IPA only',()=>{
  const base=transcribe('La lune brille, la lune brille.'),snapshot=JSON.stringify(base),projected=applyPoeticReading(base);
  const a=analyzeSonorities(base).lines[0],b=analyzeSonorities(projected).lines[0];
  assert.equal(group(a,'ə'),undefined);assert.equal(group(b,'ə').count,3);assert.equal(group(b,'ə').wordCount,3);
  assert.equal(JSON.stringify(base),snapshot);
});
check('two explicit hiatus choices change the counted groups independently',()=>{
  const base=transcribe('Le lion dort, le lion dort.'),snapshot=JSON.stringify(base),choices={0:{}};
  const projected=applyPoeticReading(base),lionIndices=projected.lines[0].tokens.flatMap((t,i)=>t.lower==='lion'?[i]:[]);
  assert.equal(lionIndices.length,2);assert.equal(group(analyzeLine(projected.lines[0]),'j').count,2);
  for(const ti of lionIndices)choices[0][ti]='li.ɔ̃';
  const selected=applyPoeticReading(base,{choices}),a=analyzeLine(selected.lines[0]);
  assert.equal(group(a,'i').count,2);assert.equal(group(a,'j'),undefined);assert.equal(JSON.stringify(base),snapshot);
});
fs.writeFileSync(new URL('../validation/sonorities-final-guards.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
