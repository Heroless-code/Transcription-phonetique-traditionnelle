import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {initialize,transcribe} from '../src/engine.js';
import {phones,isVowel} from '../src/phonology.js';
import {paradigmProbes,sentenceProbes,cacheIsolation,inventedInflections} from './deep-fixtures.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stage=process.argv[2]||'regression';
const report={stage,method:'Attentes ciblées enregistrées avant exécution. Les résultats initiaux restent distincts des régressions après correction. Les formes inventées ont des invariants, pas une prononciation certifiée.',checks:[],failures:[]};
await initialize();
const norm=p=>p.normalize('NFD').replace(/[.ː]/gu,'').replace(/\s+/gu,' ').trim();
function test(group,label,fn){try{const evidence=fn();report.checks.push({group,label,passed:true,...evidence});}catch(e){const f={group,label,passed:false,error:e.message};report.checks.push(f);report.failures.push(f);}}
for(const f of paradigmProbes)test(f.category,f.text,()=>{
  const r=transcribe(f.text),t=r.lines[0].tokens.find(t=>t.lower===f.word);
  assert.ok(t,'mot trouvé');
  const actual=t.liaison?.realized?t.ipa.slice(0,-(t.liaison.phone+'‿').length).replace(/[.]$/u,''):t.ipa;
  assert.ok(f.ipa.some(p=>norm(p)===norm(actual)),`/${actual}/ ; attendu ${f.ipa.join(' ou ')}`);
  return {actual,source:t.source,pos:t.pos,context:t.contextReason};
});
for(const f of sentenceProbes)test(f.category,f.text,()=>{
  const actual=transcribe(f.text).lines[0].ipa;assert.equal(norm(actual),norm(f.ipa));return {actual};
});
for(const [w,a,b]of cacheIsolation)test('isolation-du-cache',w,()=>{
  const before=transcribe(w);for(let i=0;i<100;i++){transcribe(a);transcribe(b);}
  const after=transcribe(w);assert.deepEqual(after,before);return {cycles:100,ipa:after.lines[0].ipa};
});
for(const w of inventedInflections)test('inflexion-inconnue',w,()=>{
  const text='Ils '+w+'.',r=transcribe(text),tokens=r.lines[0].tokens.filter(t=>t.type==='word'),t=tokens[1];
  assert.equal(t.confidence,'hypothesis');assert.ok(!norm(t.ipa).endsWith('ɑ̃'),'désinence verbale non nasalisée');
  assert.equal(tokens[0].liaison?.realized,true,'liaison du pronom sujet à un verbe vocalique inconnu');
  assert.equal(tokens[0].liaison?.phone,'z');return {actual:r.lines[0].ipa};
});
for(const text of ['les\namis','un\nhomme','deux\nenfants','ils\narrivent'])test('frontiere-de-ligne',text,()=>{const r=transcribe(text);assert.equal(r.lines.length,2);assert.ok(r.lines.every(l=>!l.ipa.includes('‿')));return {actual:r.lines.map(l=>l.ipa)};});
test('texte-long','500 lignes indépendantes',()=>{
  const line='Les enfants jouent dans le jardin.',r=transcribe(Array(500).fill(line).join('\n'));
  assert.equal(r.lines.length,500);assert.ok(r.lines.every(l=>l.ipa===r.lines[0].ipa));assert.equal(r.lines.map(l=>l.original).join('\n'),Array(500).fill(line).join('\n'));
});
test('noyaux','longueur et nasalité ne doublent pas les noyaux',()=>{
  for(const [word,n]of [['tâche',1],['maître',1],['brun',1],['brin',1],['huile',1],['aïeul',2]])assert.equal(phones(transcribe(word).lines[0].ipa).filter(isVowel).length,n,word);
});
report.sourceHash=createHash('sha256').update(fs.readFileSync(path.join(root,'tests/deep-fixtures.js'))).digest('hex');
report.passed=report.checks.filter(c=>c.passed).length;report.failed=report.failures.length;
const filename=path.join(root,'validation/deep-campaign-'+stage+'.json');
if(stage==='initial'&&fs.existsSync(filename))throw new Error('Le diagnostic initial est conservé sans écrasement.');
fs.writeFileSync(filename,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({stage,passed:report.passed,failed:report.failed,failures:report.failures},null,2));
if(report.failed)process.exitCode=1;
