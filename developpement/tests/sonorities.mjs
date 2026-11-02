import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
import {phones} from '../src/phonology.js';
import {align} from '../src/alignment.js';
import {analyzeLine,analyzeSonorities,sonoritiesPolicy} from '../src/sonorities.js';
await initialize();
const report={method:'Phonetic repetition invariants and preregistered exact counts. The ranking is a documented heuristic, not a literary-intent probability.',passed:0,failed:0,failures:[]};
function check(label,fn){try{fn();report.passed++;}catch(error){report.failed++;report.failures.push({label,error:error.message});}}
const line=text=>analyzeLine(transcribe(text).lines[0]);
const group=(analysis,phone)=>[...analysis.groups.alliterations,...analysis.groups.assonances].find(g=>g.phone===phone);
function artificial(entries){
  const tokens=[];
  entries.forEach(([text,ipa,extra={}],i)=>{
    if(i)tokens.push({type:'separator',text:' '});
    const units=(ipa.normalize('NFD').match(/[aɑeɛəioɔuyøœ](?:\u0303)?[ː]?|./gu)||[]).map(text=>({text,phone:text}));
    tokens.push({type:'word',text,ipa,phonemes:units,segments:align(text,ipa),source:'reviewed',confidence:'lexical',...extra});
  });
  return {original:tokens.map(t=>t.text).join(''),ipa:tokens.map(t=>t.ipa||t.text).join(''),tokens};
}
check('Racine: five /s/ in five source words, including c in ces',()=>{
  const a=line('Pour qui sont ces serpents qui sifflent sur vos têtes ?'),s=group(a,'s');
  assert.equal(s.count,5);assert.equal(s.wordCount,5);assert.deepEqual(s.words.map(w=>w.text),['sont','ces','serpents','sifflent','sur']);
  assert.equal(s.kind,'alliteration');assert.equal(s.prominent,true);assert.equal(s.internalOnly,false);
  const ces=s.occurrences.find(o=>o.wordText==='ces');assert.equal(ces.graphSpans[0].text,'c');
  assert.equal(s.occurrences.some(o=>o.graphSpans.some(g=>g.text==='ts')),false);
});
check('different graphemes eau/au/haut have one /o/ group',()=>{
  const a=line('eau au haut'),o=group(a,'o');assert.equal(o.count,3);assert.equal(o.wordCount,3);assert.equal(o.kind,'assonance');
  assert.deepEqual(o.occurrences.map(x=>x.graphSpans.map(s=>s.text).join('')),['eau','au','au']);
  assert.equal(a.occurrences.some(o=>o.phone==='h'),false);
});
for(const [first,second]of [['e','ɛ'],['o','ɔ'],['ø','œ'],['a','ɑ'],['ɛ̃','œ̃'],['ɛ','ɛː'],['ɑ','ɑː'],['ɑ̃','ɔ̃'],['i','j'],['u','w'],['y','ɥ'],['s','z'],['p','b']])check('strict phone distinction '+first+' / '+second,()=>{
  const a=analyzeLine(artificial([['a',first],['b',second],['c',first],['d',second]]));
  assert.equal(group(a,first).count,2);assert.equal(group(a,second).count,2);
  assert.equal(a.occurrences.length,4);
});
check('nasal and length modifiers remain attached, never independent sounds',()=>{
  const a=analyzeLine(artificial([['un','œ̃ː'],['un','œ̃ː'],['maître','mɛːtʁ'],['maître','mɛːtʁ']]));
  assert.equal(group(a,'œ̃ː').count,2);assert.equal(group(a,'ɛː').count,2);
  assert.ok(a.occurrences.every(o=>o.phone!=='ː'&&o.phone!=='̃'));
});
for(const phone of ['j','w','ɥ'])check('semi-consonant explicit policy '+phone,()=>{
  const a=analyzeLine(artificial([['a',phone],['b',phone]])),g=group(a,phone);
  assert.equal(g.kind,'alliteration');assert.equal(g.semiConsonant,true);assert.equal(a.groups.assonances.length,0);
});
check('same written letters may belong to different sound groups',()=>{
  const a=analyzeLine(artificial([['s','s'],['s','z'],['s','s'],['s','z']]));
  assert.equal(group(a,'s').count,2);assert.equal(group(a,'z').count,2);
});
check('double letters, mute finals and forbidden aspirated-h liaison',()=>{
  const a=line('sifflent sifflent les héros les héros');
  assert.equal(group(a,'f').count,2);assert.equal(a.occurrences.filter(o=>o.phone==='z').length,0);
  assert.equal(a.occurrences.filter(o=>o.phone==='h').length,0);
  assert.equal(a.occurrences.filter(o=>o.phone==='t').length,0);
});
check('realized liaison contributes once, no second metadata insertion',()=>{
  const r=transcribe('les enfants les enfants'),a=analyzeLine(r.lines[0]);
  assert.equal(r.lines[0].tokens.filter(t=>t.liaison?.realized&&t.liaison.phone==='z').length,2);
  assert.equal(group(a,'z').count,2);assert.equal(group(a,'z').wordCount,2);
  assert.deepEqual(group(a,'z').words.map(w=>w.text),['les','les']);
});
check('denasalization follows final IPA',()=>{
  const a=line('bon ami bon ami');assert.equal(group(a,'ɔ').count,2);assert.equal(group(a,'n').count,2);
  assert.equal(a.occurrences.some(o=>o.phone==='ɔ̃'),false);
});
check('repetition inside a single word keeps occurrence and word counts separate',()=>{
  const a=analyzeLine(artificial([['sassas','sasas']])),g=group(a,'s');
  assert.equal(g.count,3);assert.equal(g.wordCount,1);assert.equal(g.internalOnly,true);assert.equal(g.prominent,false);
});
check('repeated spellings at different positions are different graphic words',()=>{
  const a=line('si si si'),s=group(a,'s');assert.equal(s.count,3);assert.equal(s.wordCount,3);
  assert.deepEqual(s.wordIds,[0,1,2]);assert.deepEqual(s.words.map(w=>w.text),['si','si','si']);
});
check('no accumulation across verse boundaries, including blank stanza line',()=>{
  const a=analyzeSonorities(transcribe('si\n\nsi'));
  assert.equal(a.lines.length,3);assert.equal(a.stats.verses,2);
  assert.ok(a.lines.every(l=>l.groups.alliterations.length===0&&l.groups.assonances.length===0));
});
for(const text of ['l’élément','l\'élément'])check('elision is one original graphic word: '+text,()=>{
  const a=line(text),g=group(a,'l');assert.equal(a.words.length,1);assert.equal(g.count,2);assert.equal(g.wordCount,1);assert.equal(g.words[0].text,text);
});
for(const text of ['vis-à-vis','pied-à-terre','sous-évaluer','donne-t-il'])check('hyphen compound or inversion remains one graphic word: '+text,()=>{
  const a=line(text);assert.equal(a.words.length,1);assert.equal(a.words[0].text,text);
});
check('split unknown hyphenated components merge by position',()=>{
  const a=line('plour-plour');assert.equal(a.words.length,1);assert.equal(a.words[0].text,'plour-plour');
  assert.equal(group(a,'p').wordCount,1);assert.equal(group(a,'p').count,2);
});
check('numeric expansion and grouping spaces preserve one source number word',()=>{
  const a=line('1 001');assert.equal(a.words.length,1);assert.equal(a.words[0].text,'1 001');
  assert.ok(a.occurrences.length>1);assert.ok(a.occurrences.every(o=>o.wordId===0&&o.uncertain));
  assert.ok(a.occurrences.every(o=>o.graphSpans.length===0));
});
check('repeated numeric spellings stay distinct source occurrences',()=>{
  const a=line('1001 1001');assert.equal(a.words.length,2);assert.equal(group(a,'m').wordCount,2);
});
for(const word of ['élève','école','maître','pâte','ambiguïté','brûlé'])check('Unicode canonical count and source-span equivalence: '+word,()=>{
  const raw=word+' '+word,nfd=raw.normalize('NFD'),a=line(raw),b=line(nfd);
  const counts=x=>[...x.groups.alliterations,...x.groups.assonances].map(g=>[g.phone,g.count,g.wordCount]).sort();
  assert.deepEqual(counts(a),counts(b));
  for(const o of b.occurrences)for(const span of o.graphSpans)assert.equal(nfd.slice(span.start,span.end),span.text);
  assert.deepEqual(a.occurrences.map(o=>o.graphSpans.map(g=>g.text.normalize('NFC'))),b.occurrences.map(o=>o.graphSpans.map(g=>g.text.normalize('NFC'))));
});
check('unknown pronunciations retain uncertainty',()=>{
  const a=line('Ils plouriment plouriment.'),p=group(a,'p');assert.equal(p.count,2);assert.equal(p.uncertain,true);assert.equal(p.uncertainCount,2);
  assert.ok(p.occurrences.every(o=>o.reasons.length));
});
check('lexical ambiguity remains visible',()=>{
  const a=analyzeLine(artificial([['as','as',{confidence:'ambiguous'}],['as','as']]));
  assert.equal(group(a,'s').uncertainCount,1);assert.equal(group(a,'s').uncertain,true);
});
check('poetic hypothesis flag is propagated independently',()=>{
  const a=analyzeLine(artificial([['a','a',{poetryHypothesis:true,poetryReason:'Diérèse proposée.'}],['a','a']]));
  assert.equal(group(a,'a').uncertainCount,1);assert.ok(group(a,'a').occurrences[0].reasons.includes('Diérèse proposée.'));
});
check('a shared x grapheme anchors each real phoneme without copying counts',()=>{
  const a=line('taxi taxi');assert.equal(group(a,'k').count,2);assert.equal(group(a,'s').count,2);
  for(const p of ['k','s'])assert.ok(group(a,p).occurrences.every(o=>o.graphSpans.length===1&&o.graphSpans[0].text==='x'));
});
check('uncertain alignment leaves API events but never invents a source anchor',()=>{
  const a=analyzeLine(artificial([['nuit','ʒuʁ'],['nuit','ʒuʁ']]));
  assert.equal(group(a,'ʒ').count,2);assert.ok(a.occurrences.some(o=>!o.alignmentCertain));
  for(const o of a.occurrences.filter(o=>!o.alignmentCertain)){assert.equal(o.sourceStart,null);assert.equal(o.sourceEnd,null);assert.deepEqual(o.graphSpans,[]);}
});
check('phoneme indexes include syllable dots and liaison markers',()=>{
  const r=transcribe('les enfants les enfants').lines[0],a=analyzeLine(r);
  for(const o of a.occurrences){const unit=r.tokens[o.tokenIndex].phonemes[o.phonemeIndex];assert.equal(phones(unit.phone)[0],o.phone);}
  const z=group(a,'z').occurrences[0];assert.equal(z.phonemeIndex,3);
});
check('fallback API indexing includes marks when phonemes metadata absent',()=>{
  const l=artificial([['les','le.z‿'],['les','le.z‿']]);for(const t of l.tokens)delete t.phonemes;
  const a=analyzeLine(l);assert.deepEqual(group(a,'z').occurrences.map(o=>o.phonemeIndex),[3,3]);
});
check('stale auxiliary metadata cannot insert an unpronounced phone',()=>{
  const l=artificial([['s','s'],['s','s']]);for(const t of l.tokens)if(t.phonemes)t.phonemes.forEach(u=>{u.phone='z';});
  const a=analyzeLine(l);assert.equal(group(a,'s').count,2);assert.equal(group(a,'z'),undefined);
});
for(const text of ['si,si','si;si','si — si','si--si','si - si'])check('punctuation does not merge graphic words: '+text,()=>{
  const a=line(text);assert.equal(a.words.length,2);assert.equal(group(a,'s').wordCount,2);
});
for(const text of ['l’élément l’élément','vis-à-vis vis-à-vis','1 001 1 001'])check('all exact grapheme anchors address the source slice: '+text,()=>{
  const a=line(text);for(const o of a.occurrences)for(const span of o.graphSpans)assert.equal(text.slice(span.start,span.end),span.text);
  for(const w of a.words)assert.equal(text.slice(w.start,w.end),w.text);
});
check('ranking combines distinct-word distribution and normalized metrics',()=>{
  const a=analyzeLine(artificial([['s','ssssa'],['b','ba'],['b','ba'],['b','ba']])),s=group(a,'s'),b=group(a,'b');
  assert.ok(b.rankScore>s.rankScore);assert.equal(s.internalOnly,true);assert.equal(b.prominent,true);
  for(const g of [...a.groups.alliterations,...a.groups.assonances])for(const key of ['density','proximity','spread','coverage'])assert.ok(g.metrics[key]>=0&&g.metrics[key]<=1);
});
check('frequent schwa/r ranking weighting never alters actual counts',()=>{
  const a=analyzeLine(artificial([['a','əʁs'],['b','əʁs'],['c','əʁs']]));
  for(const p of ['ə','ʁ','s'])assert.equal(group(a,p).count,3);
  assert.ok(group(a,'s').rankScore>group(a,'ʁ').rankScore);assert.ok(group(a,'ʁ').rankingReason.includes('décompte inchangé'));
  assert.ok(sonoritiesPolicy.ranking.includes('not probability'));
});
for(const text of ['', '   ','. ! ?', 'a', 'si'])check('empty or non-repeated line stays valid: '+text,()=>{
  const a=line(text);assert.equal(a.groups.alliterations.length,0);assert.equal(a.groups.assonances.length,0);
});
check('analysis never mutates original transcription or nested token data',()=>{
  const r=transcribe('Les enfants voient l’école.\n\nUn bon ami.'),snapshot=JSON.stringify(r),a=analyzeSonorities(r);
  assert.equal(JSON.stringify(r),snapshot);a.lines[0].words[0].text='modified';
  const item=a.lines[0].occurrences[0];item.reasons.push('modified');if(item.graphSpans[0])item.graphSpans[0].text='modified';
  assert.equal(JSON.stringify(r),snapshot);assert.deepEqual(analyzeSonorities(r),analyzeSonorities(r));
});
check('inexact source reconstruction cannot fabricate offsets',()=>{
  const l=artificial([['eau','o'],['eau','o']]);l.original='autre';const a=analyzeLine(l);
  assert.equal(a.warnings.length,1);assert.ok(a.occurrences.every(o=>o.sourceStart===null&&o.graphSpans.length===0));
});
fs.writeFileSync(new URL('../validation/sonorities.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
