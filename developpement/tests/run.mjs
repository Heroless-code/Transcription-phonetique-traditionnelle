import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {initialize,transcribe,analyzeWord} from '../src/engine.js';
import {phones,isVowel,syllabify} from '../src/phonology.js';
import {wordFixtures,unknownFixtures,alignmentFixtures,structureFixtures,syllableFixtures} from './phonetic-fixtures.js';
import contextFixtures from './context-fixtures.js';
import {fallbackFixtures,inventedFallbackFixtures,morphologyFixtures,fallbackLengthFixtures,lexicalExceptionFixtures} from './fallback-fixtures.js';
import {g2p} from '../src/rules.js';
import numericFixtures from './numeric-fixtures.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const report={environment:{node:process.version,platform:process.platform},suites:{},failures:[],metrics:{},limits:['Tests de régression, sans estimation de précision universelle ni corpus de parole indépendant.','Les exemples inconnus ont des invariants, pas des prononciations certifiées.']};
const normalize=(s,strict=false)=>s.replace(/[.\s‿]/gu,'').replace(strict?/$^/u:/ː/gu,'');
let started=performance.now();await initialize();report.metrics.lexiconLoadMs=Math.round(performance.now()-started);
function check(suite,label,fn){const totals=report.suites[suite]||={passed:0,failed:0};try{fn();totals.passed++;}catch(e){totals.failed++;report.failures.push({suite,label,error:e.message});}}
function invariant(t){
  assert.equal(t.segments.map(s=>s.text).join(''),t.text,'intégrité du texte original');
  assert.equal(normalize(t.segments.flatMap(s=>s.phones).join(''),true),normalize(t.ipa,true),'alignement avec les seuls sons calculés');
  for(const s of t.segments)if(s.silent)assert.equal(s.phones.length,0,'lettre muette sans phonème');
}
for(const f of wordFixtures)check('lexical',f.word+' ['+f.category+']',()=>{
  const r=transcribe(f.word),ipa=r.lines[0].ipa;
  assert.ok(f.ipa.some(p=>normalize(p,f.strictLength)===normalize(ipa,f.strictLength)),`/${ipa}/ ; attendu ${f.ipa.join(' ou ')}`);
  r.lines[0].tokens.filter(t=>t.type==='word').forEach(invariant);
});
for(const f of unknownFixtures)check('unknown',f.word,()=>{
  const r=transcribe(f.word),t=r.lines[0].tokens.find(t=>t.type==='word');
  assert.ok(t.ipa.length);assert.ok(['hypothesis','ambiguous'].includes(t.confidence),t.confidence);
  assert.ok(t.notes.length);assert.equal(phones(t.ipa).join(''),t.ipa);
  invariant(t);
});
for(const f of alignmentFixtures)check('alignment',f.word+' : '+f.grapheme,()=>{
  const t=transcribe(f.word).lines[0].tokens.find(t=>t.type==='word');invariant(t);
  const s=t.segments.find(s=>s.text===f.grapheme);
  assert.ok(s,JSON.stringify(t.segments));
  assert.equal(Boolean(s.uncertain),false,'grapheme certain');
  if(f.phone)assert.ok(s.phones.includes(f.phone),JSON.stringify(s));
  for(const silent of f.silent)assert.ok(t.segments.some(s=>s.text===silent&&s.silent&&!s.phones.length),'lettres muettes '+silent);
});
for(const f of syllableFixtures)check('syllabification',f.word,()=>{
  const ipa=transcribe(f.word).lines[0].ipa;
  assert.equal(phones(ipa).filter(isVowel).length,f.syllables,ipa);
  assert.ok([f.ipa,...f.alternatives||[]].some(p=>normalize(p)===normalize(ipa)),ipa);
  assert.equal(syllabify(f.ipa),f.ipa);
});
for(const f of structureFixtures)check('structure',f.text,()=>{
  const r=transcribe(f.text);
  assert.deepEqual(r.lines.map(l=>l.original),f.lines||f.text.split(/\r\n|\n|\r/u));
  for(const l of r.lines)assert.equal(l.tokens.map(t=>t.text).join(''),l.original);
});
for(const f of fallbackFixtures)check('fallback-without-dictionary',f.word+' ['+f.category+']',()=>{
  const t=analyzeWord(f.word,{forceRules:true,...f.options});
  assert.equal(t.source,'rules');assert.equal(t.confidence,'hypothesis');
  assert.ok(f.ipa.some(p=>normalize(p)===normalize(t.ipa)),t.ipa);
});
for(const f of inventedFallbackFixtures)check('fallback-local-invariants',f.word,()=>{
  const t=analyzeWord(f.word,{forceRules:true,...f.options}),ipa=normalize(t.ipa);
  assert.ok(t.ipa);assert.equal(t.confidence,'hypothesis');
  for(const p of f.contains||[])assert.ok(ipa.includes(p),ipa+' ne contient pas '+p);
  for(const p of f.excludes||[])assert.ok(!ipa.includes(p),ipa+' contient '+p);
});
for(const f of morphologyFixtures)check('morphological-composition',f.word,()=>{
  const t=analyzeWord(f.word),ipa=normalize(t.ipa);
  assert.equal(t.source,'morphology');assert.equal(t.confidence,'hypothesis');
  for(const p of f.contains||[])assert.ok(ipa.includes(p),ipa+' ne contient pas '+p);
});
for(const f of fallbackLengthFixtures)check('fallback-length',f.word,()=>{
  const t=analyzeWord(f.word,{forceRules:true});
  assert.equal(normalize(t.ipa,true),f.ipa);
  assert.equal(g2p(f.word).units.map(u=>u.phones).join(''),f.ipa);
});
for(const f of lexicalExceptionFixtures)check('lexical-exception-priority',f.word,()=>{
  const known=analyzeWord(f.word),forced=analyzeWord(f.word,{forceRules:true});
  assert.equal(normalize(known.ipa),normalize(f.ipa));
  assert.equal(forced.confidence,'hypothesis');
  // The audit separately records that the default rule is wrong for this exception.
});
for(const f of contextFixtures){
  const r=transcribe(f.text),tokens=r.lines[0].tokens.filter(t=>t.type==='word');
  const stem=t=>{let p=normalize(t.ipa,true);if(t.liaison?.realized)p=p.slice(0,-t.liaison.phone.length);return p;};
  for(const [word,ipa]of Object.entries(f.words||{}))check('context-word',f.text+' : '+word,()=>{const t=tokens.find(t=>t.lower===word);assert.ok(t);assert.equal(stem(t),ipa);});
  for(const [word,index,ipa]of f.wordsAt||[])check('context-word',f.text+' : '+word+' '+index,()=>{const t=tokens.filter(t=>t.lower===word)[index];assert.ok(t);assert.equal(stem(t),ipa);});
  for(const [left,right,kind,phone,realized]of f.liaison||[])check('liaisons',f.text+' : '+left+' '+right,()=>{
    const index=tokens.findIndex((t,i)=>t.lower===left&&tokens[i+1]?.lower===right),liaison=tokens[index]?.liaison;
    assert.ok(liaison);assert.equal(liaison.kind,kind);assert.equal(liaison.realized,realized);if(phone)assert.equal(liaison.phone,phone);
    if(realized){assert.ok(tokens[index].ipa.includes('‿'));invariant(tokens[index]);}
  });
  for(const w of f.ambiguous||[])check('ambiguity',f.text+' : '+w,()=>assert.equal(tokens.find(t=>t.lower===w)?.confidence,'ambiguous'));
}

let rng=20261030;
const next=n=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng%n;};
const onsets=['br','cl','fr','gl','m','n','pl','r','s','tr','v','z'];
const nuclei=['a','in','ou','an','i','eau','un','oi','u','é'];
const ends=['ton','ville','fier','nette','ger','lume','pique','ment','asse','chon'];
for(let i=0;i<1000;i++){
  const w='z'+onsets[next(onsets.length)]+nuclei[next(nuclei.length)]+ends[next(ends.length)];
  check('generated-invariants',w,()=>{const t=transcribe(w).lines[0].tokens[0];assert.ok(t.ipa);assert.equal(phones(t.ipa).join(''),t.ipa);invariant(t);});
}
check('contextual-unknown','unknown -ent is grammatical',()=>{
  const t=transcribe('Ils anuzorbent.').lines[0].tokens.find(t=>t.lower==='anuzorbent');
  assert.ok(t&&!normalize(t.ipa).endsWith('ɑ̃'));assert.equal(t.confidence,'hypothesis');
});
check('numbers','cardinals and decimal retain phrase spaces',()=>{
  const r=transcribe('2026 et 71,5').lines[0];
  assert.match(r.ipa,/dø mil vɛ̃t sis/);assert.match(r.ipa,/swa.sɑ̃t e ɔ̃z viʁ.ɡyl sɛ̃k/);
});
for(const [text,expected]of numericFixtures)check('numeric-composition',text,()=>{
  const clean=p=>p.normalize('NFD').replace(/[.‿\s\-\/]/gu,'');
  assert.equal(clean(transcribe(text).lines[0].ipa),clean(expected));
});
check('unicode','combining marks and apostrophe preserved',()=>{const s='  L’e\u0301le\u0300ve — l\'homme.  ';assert.equal(transcribe(s).lines[0].tokens.map(t=>t.text).join(''),s);});
check('large-input','very long word remains usable',()=>{const t=transcribe('plour'.repeat(150)).lines[0].tokens[0];assert.ok(t.ipa);invariant(t);});
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
check('standalone','no external scripts, styles or runtime requests',()=>{
  assert.ok(html.includes("connect-src 'none'"));assert.doesNotMatch(html,/<script[^>]+src=|<link[^>]+href=/iu);
  assert.doesNotMatch(html,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/u);
  assert.doesNotMatch(html,/^import\s/mu);
});
started=performance.now();transcribe('Les enfants jouent dans le jardin et regardent les oiseaux. '.repeat(100));report.metrics.paragraph1100WordsMs=Math.round(performance.now()-started);
report.passed=Object.values(report.suites).reduce((n,s)=>n+s.passed,0);report.failed=report.failures.length;
fs.mkdirSync(path.join(root,'validation'),{recursive:true});
fs.writeFileSync(path.join(root,'validation/engine-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
