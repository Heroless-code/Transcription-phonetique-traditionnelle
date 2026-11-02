/** Reproducible, conservative extraction. The unlabelled input is never edited. */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { align } from '../src/alignment.js';
import { phones, isVowel } from '../src/phonology.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.resolve(ROOT, '../analyse-projet/ressources/extracted/extracted.jsonl');
const USE_LEXIQUE=process.argv.includes('--lexique');
const STAGE=process.argv.includes('--stage');
const LEXIQUE_PATH=path.join(ROOT,'data/references/Lexique4.1/Lexique4.1.tsv');
const BLOCK = 128;
const counts = { inputRows: 0, inputTranscriptions: 0, rejectedWordForms: 0, rejectedCandidates: 0, emptyRows: 0, mergedCaseRows: 0, markedH: 0, lexicalEntries: 0, ambiguousEntries: 0 };
const VOWEL = /[aɑeɛəioɔuyøœ]/u;
const ALLOWED = /^[aɑeɛəioɔuyøœbpdtkɡfvszmnlʃʒʁɲŋjwɥh.ː\u0303]+$/u;
const words = new Map();
const rejected = [];
const POS_CODES={VER:'V',NOM:'N',ADJ:'A',ADV:'D',ART:'T',PRO:'P',PRE:'R',CON:'C',AUX:'X',ONO:'I'};
const anchors=new Map();
const anchorStats={source:'Lexique 4.1',url:'https://www.lexique.org/databases/Lexique410/Lexique4.1.zip',license:'CC BY-SA 4.0',rows:0,invalidRows:0,forms:0,covered:0,rawExactMatches:0,traditionalQualityPreserved:0,rawTraditionalDistinctionsPreserved:0,nativeCorrections:0,addedForms:0,heterophones:0,familyQualityForms:0,pretonicFamilyForms:0,pluralCitationForms:0};
const familyExamples=[],familyForms=new Set(),pretonicForms=new Set(),pluralForms=new Set(),lemmaCache=new Map();
const fold=p=>p.replace(/[.ː]/gu,'').replace(/ɑ(?!̃)/gu,'a');
const qualityFold=(p,word='')=>{
  let q=fold(p).replace(/[eɛ](?!̃)/gu,'E').replace(/[oɔ](?!̃)/gu,'O').replace(/[øœ](?!̃)/gu,'Q');
  // Matching only: plain written e can have a modern [ø] realization of /ə/.
  // Written eu/œ keeps its lexical round-vowel evidence. Output is never folded.
  if(word&&/e/u.test(word)&&!/eu|œ|oeu/u.test(word))q=q.replace(/ə/gu,'Q');
  return q;
};
function qualityPreferenceAllowed(raw,native,word){
  if(/[oô]|au|eau/u.test(word))return true;
  // Loan spelling without an o-family graph is not evidence for opening the
  // authoritative lexical vowel merely because a raw regional form exists.
  const a=phones(raw).filter(p=>p!=='.').map(p=>p.replace(/ː/gu,''));
  const b=phones(native).filter(p=>p!=='.').map(p=>p.replace(/ː/gu,''));
  return !a.some((p,i)=>['o','ɔ'].includes(p)&&['o','ɔ'].includes(b[i])&&p!==b[i]);
}
if(USE_LEXIQUE){
  const file=fs.readFileSync(LEXIQUE_PATH);
  anchorStats.tsvSha256=crypto.createHash('sha256').update(file).digest('hex');
  for(const line of file.toString('utf8').split(/\r?\n/u).slice(1)){
    if(!line)continue;anchorStats.rows++;
    const fields=line.split('\t');
    const [raw,,nativeIpa,,rawPos]=fields;
    // ASCII g is an IPA typographic variant, and ':' denotes length here.
    // Other undecoded legacy symbols are rejected rather than guessed.
    const ipa=nativeIpa?.normalize('NFC').replace(/g/gu,'ɡ').replace(/:/gu,'ː').replace(/r/gu,'ʁ').replace(/'/gu,'');
    const pos=rawPos?.split(':')[0];
    const word=raw?.normalize('NFC').toLocaleLowerCase('fr').replace(/’/gu,"'");
    if(fields.length!==37||!POS_CODES[pos]||!word||!/^[a-zà-öø-ÿœæ]+(?:[-'][a-zà-öø-ÿœæ]+)*$/u.test(word)||!ipa||!ALLOWED.test(ipa)||!VOWEL.test(ipa)){anchorStats.invalidRows++;continue;}
    if(!anchors.has(word))anchors.set(word,[]);
    const lemma=fields[3].normalize('NFC').toLocaleLowerCase('fr').replace(/’/gu,"'");
    const gender=fields[6],number=fields[7];
    const entries=anchors.get(word),existing=entries.find(e=>e.ipa===ipa&&e.pos===pos&&e.lemma===lemma);
    const freq=Number(fields[9])||0;
    if(existing)existing.freq+=freq;else entries.push({ipa,pos,freq,lemma,gender,number});
  }
  for(const entries of anchors.values())entries.sort((a,b)=>b.freq-a.freq);
  anchorStats.forms=anchors.size;
}

function consonants(word) {
  return word
    .replace(/[mn](?=$|[bcdfgjklpqrstvwxz])/gu,'')
    .replace(/(?:e[rz]|[dtsxzg])$/u,'')
    .replace(/sch|ch/gu,'ʃ').replace(/ph/gu,'f').replace(/gn/gu,'ɲ')
    .replace(/qu|ck/gu,'k').replace(/gu(?=[eéèêëiîïy])/gu,'ɡ')
    .replace(/g(?=[eéèêëiîïy])/gu,'ʒ').replace(/c(?=[eéèêëiîïy])/gu,'s')
    .replace(/ç/gu,'s').replace(/c/gu,'k').replace(/g/gu,'ɡ').replace(/j/gu,'ʒ')
    .replace(/([aeiouyéèêàâîôûœ])s(?=[aeiouyéèêàâîôûœ])/gu,'$1z')
    .replace(/r/gu,'ʁ').replace(/x/gu,'ks').replace(/[^bpdtkɡfvszmnlʃʒʁɲŋ]/gu,'')
    .replace(/(.)\1/gu,'$1');
}

function consonantDistance(expected, ipa) {
  const actual=ipa.replace(/[^bpdtkɡfvszmnlʃʒʁɲŋ]/gu,'').replace(/(.)\1/gu,'$1');
  let previous=Array.from({length:actual.length+1},(_,i)=>i);
  for(let i=1;i<=expected.length;i++){
    const current=[i];
    for(let j=1;j<=actual.length;j++)current[j]=Math.min(previous[j]+1,current[j-1]+1,previous[j-1]+(expected[i-1]===actual[j-1]?0:1.5));
    previous=current;
  }
  return previous[actual.length];
}

function clean(value, word) {
  let text = value.normalize('NFC').trim(), h = '';
  const marker = text.match(/^\^\(\(h (aspiré|muet)\)\)/u);
  if (marker) { h = marker[1] === 'aspiré' ? 'a' : 'm'; text = text.slice(marker[0].length); }
  // Only remove a complete outer transcription wrapper; never concatenate phrases.
  if (text.startsWith('\\') && text.endsWith('\\')) text = text.slice(1,-1);
  if (text.startsWith('/') && text.endsWith('/')) text = text.slice(1,-1);
  if (text.startsWith('[') && text.endsWith(']')) text = text.slice(1,-1);
  if (/\s|‿|\[|\]|\\|\/|\^/u.test(text)) return null;
  // Parentheses in the data denote optional phones, not another lexical word.
  if (/\([^()]*\)/u.test(text)) {
    if (/\([^aɑeɛəioɔuyøœbpdtkɡfvszmnlʃʒʁɲŋjwɥ.ː\u0303)]/u.test(text)) return null;
    text = text.replace(/[()]/gu, '');
  }
  text = text.replace(/[ˈˌ]/gu, '').replace(/g/gu,'ɡ').replace(/\.\.+/gu,'.');
  if (!text || !ALLOWED.test(text) || !VOWEL.test(text)) return null;
  if (text.startsWith('.') || text.endsWith('.') || text.includes('ːː')) return null;
  if (text.split('.').some(s => !VOWEL.test(s))) return null;
  // A nasalization mark attaches only to the traditional four nasal nuclei.
  if (/(?:^|[^ɑɛɔœ])\u0303/u.test(text)) return null;
  if (/(?:^|[^aɑeɛəioɔuyøœ\u0303])ː/u.test(text)) return null;
  if (text.length > word.length * 3 + 10) return null;
  return { ipa: text, h };
}

function score(ipa, word) {
  let value = -2 * consonantDistance(consonants(word),ipa);
  // Prefer ordinary metropolitan citation forms over regional final schwas.
  if (ipa.endsWith('ə') && !/^(?:je|me|te|se|le|de|ne|que|ce)$/u.test(word)) value -= 8;
  if (ipa.includes('h')) value -= 4;
  if (ipa.includes('ŋ') && !/(?:ng|n[gk]|ing)/u.test(word)) value -= 5;
  const backA = /(?:â|(?:^|[^a-zà-ÿ])trois$)/u.test(word);
  if (/ɑ(?!̃)/u.test(ipa)) value += backA ? 8 : -0.6;
  if (backA && ipa.includes('ɑː')) value += 7;
  if (/(?:aî|eî|ê)/u.test(word) && ipa.includes('ɛː')) value += 9;
  if (/ô/u.test(word) && ipa.includes('oː')) value += 8;
  if (/ô/u.test(word) && ipa.includes('o')) value += 3;
  if (/eû/u.test(word) && ipa.includes('øː')) value += 8;
  if (ipa.includes('ː') && !/[âêîôû]|aî|eî/u.test(word)) value -= 0.3;
  if (/(?:^|[^aeiouyàâäéèêëîïôöùûüœ])un(?:$|[bcdfgjklmpqrstvwxz])/u.test(word)) {
    if (ipa.includes('œ̃')) value += 8;
    if (ipa.includes('ɛ̃')) value -= 3;
  }
  if (/jeune/u.test(word) && !/jeûne/u.test(word)) { if (ipa.includes('œ')) value += 4; }
  // A written e cannot normally explain /a/; retain the attested irregular families.
  if (!/[aàâä]|oi/u.test(word) && /a(?!̃)/u.test(ipa) && !/femm|solenn|évidemm|prudemm|emment/u.test(word)) value -= 4;
  if (/oi/u.test(word) && /w[aɑ]/u.test(ipa)) value += 3;
  if (/ou/u.test(word) && !/ouou/u.test(word) && /u\.?w/u.test(ipa)) value -= 4;
  if (/au|eau/u.test(word) && ipa.includes('o')) value += 2;
  const plain=ipa.replace(/[.ː]/gu,'');
  // Weak citation-form priors resolve otherwise unlabelled open/closed ties.
  // Keep competing readings: pretonic quality can be lexically or regionally variable.
  if(/ai|ay|ei/u.test(word)&&/ɛ(?!̃)/u.test(plain))value+=0.8;
  if(/o/u.test(word)&&!/au|eau|ô/u.test(word)&&/ɔ(?!̃)/u.test(plain))value+=0.65;
  // Word-final open stressed syllables license /o/, not a regional open /ɔ/;
  // /z/ likewise closes the traditional o/ø series rather than opening it.
  if(/ɔ$/u.test(plain))value-=3;
  if(/ɔz$/u.test(plain))value-=3;
  if(/œz$/u.test(plain))value-=3;
  if(word.length>2&&/(?<!é)e(?:s)?$/u.test(word)&&plain.endsWith('e'))value-=5;
  if(word.length>2&&/et(?:s)?$/u.test(word)){
    if(plain.endsWith('ɛ'))value+=3;
    if(plain.endsWith('e'))value-=2;
  }
  if(/(?:ais|ait)$/u.test(word) && !/^(?:sais|sait)$/u.test(word)) {
    if(plain.endsWith('ɛ'))value+=5;
    if(plain.endsWith('e'))value-=3;
  }
  if(/ail(?:s)?$/u.test(word) && !/(?:mail|cocktail)$/u.test(word)) {
    if(/[aɑ]j$/u.test(plain))value+=5;
    else value-=3;
  }
  if(/a[tds]?$/u.test(word)) {
    if(/a$/u.test(plain))value+=3;
    if(/ɔ$/u.test(plain))value-=3;
  }
  // Closed /e/ is not a metropolitan citation-form reading. For /o/ this is
  // only weak evidence: lexical closed /o/ remains possible (au, ô, -osse...).
  for(const syllable of ipa.split('.')) {
    if(/e[bdfɡklmnɲŋpʁsʃtvzʒ]+$/u.test(syllable))value-=3;
    if(!/au|eau|ô|oss/u.test(word)&&/o(?!ː)[bdfɡklmnɲŋpʁsʃtvʒ]+$/u.test(syllable))value-=2;
  }
  // Orthographic nasal clusters are weak evidence; morphology remains contextual.
  if (/(?:in|im|ain|ein|yn|ym)(?:$|[bcdfgjklpqrstvwxz])/u.test(word) && ipa.includes('ɛ̃')) value += 2;
  if (/(?:an|am|en|em)(?:$|[bcdfgjklpqrstvwxz])/u.test(word) && ipa.includes('ɑ̃')) value += 1;
  if (/(?:on|om)(?:$|[bcdfgjklpqrstvwxz])/u.test(word) && ipa.includes('ɔ̃')) value += 1;
  // Keep conventional lexical syllable marks, without scoring their count as certainty.
  if (ipa.includes('.')) value += 0.1;
  return value;
}

function rankedRaw(word,record){
  const sourceShapes=new Set([...record.p.keys()].map(p=>p.replace(/\./gu,'')));
  return [...record.p].map(([ipa,base])=>{
    if(record.p.size===1)return [ipa,base];
    const nuclei=[...ipa.matchAll(/[aɑeɛəioɔuyøœ](?:\u0303)?ː?/gu)];
    const pretonic=nuclei.slice(0,-1).filter(m=>m[0].endsWith('ː'));
    if(pretonic.length){
      let counterpart=ipa;
      for(const m of [...pretonic].reverse())counterpart=counterpart.slice(0,m.index)+m[0].slice(0,-1)+counterpart.slice(m.index+m[0].length);
      if(sourceShapes.has(counterpart.replace(/\./gu,'')))base-=10*pretonic.length;
    }
    const opaque=align(word,ipa).filter(s=>s.uncertain).length;
    return [ipa,base-Math.min(12,opaque*5)];
  }).sort((a,b)=>b[1]-a[1]||a[0].length-b[0].length||a[0].localeCompare(b[0]));
}

function projectedLemma(lemma,native){
  const record=words.get(lemma);
  if(!record)return null;
  if(record.nativeOnly)return native.ipa;
  if(!lemmaCache.has(lemma))lemmaCache.set(lemma,rankedRaw(lemma,record));
  const ranked=lemmaCache.get(lemma);
  // Reproduce the lemma's final same-POS anchor projection. An incompatible
  // raw consonant or missing nucleus cannot lend its vowel to an inflection.
  return ranked.find(([p])=>qualityFold(p,lemma)===qualityFold(native.ipa,lemma)&&qualityPreferenceAllowed(p,native.ipa,lemma))?.[0]||native.ipa;
}

function traditionalFamily(ipa,word,entry){
  if(!entry.lemma||entry.lemma===word)return ipa;
  const lemmaEntries=anchors.get(entry.lemma);
  if(!lemmaEntries)return ipa;
  const lemmaEntry=lemmaEntries.find(e=>e.pos===entry.pos&&e.gender===entry.gender&&e.ipa===entry.ipa)||lemmaEntries.find(e=>e.pos===entry.pos);
  if(!lemmaEntry)return ipa;
  const lemmaIpa=projectedLemma(entry.lemma,lemmaEntry);
  if(!lemmaIpa)return ipa;
  let result=ipa,rule='';
  // Citation-form plurals copy only when POS, gender and native pronunciation
  // are identical. Different native plurals (œuf/œufs, mal/maux...) stay out.
  if(entry.number==='p'&&['NOM','ADJ'].includes(entry.pos)&&lemmaEntry.gender===entry.gender&&lemmaEntry.ipa===entry.ipa&&qualityFold(ipa,word)===qualityFold(lemmaIpa,entry.lemma)){
    result=lemmaIpa;rule='same-native-IPA plural';
  }else{
    const source=phones(lemmaIpa).filter(p=>p!=='.'&&p!=='‿');
    const target=phones(ipa).filter(p=>p!=='.'&&p!=='‿');
    const last=target.findLastIndex(isVowel),changes=new Map();
    for(let i=0;i<Math.min(source.length,target.length);i++){
      if(['o','ɔ'].includes(source[i])&&['o','ɔ'].includes(target[i])){
        if(i<last&&source[i]!==target[i])changes.set(i,source[i]);
      }else if(source[i]!==target[i])break;
    }
    if(changes.size){let n=0;result=phones(ipa).map(p=>p==='.'||p==='‿'?p:changes.get(n++)||target[n-1]).join('');rule='shared-prefix pretonic o/ɔ';}
  }
  if(result.replace(/\./gu,'')===ipa.replace(/\./gu,''))return ipa;
  if(result!==ipa){
    familyForms.add(word);
    (rule==='same-native-IPA plural'?pluralForms:pretonicForms).add(word);
    if(familyExamples.length<200)familyExamples.push({word,lemma:entry.lemma,pos:entry.pos,before:ipa,after:result,rule});
  }
  return result;
}

const hash = crypto.createHash('sha256');
const stream = fs.createReadStream(SOURCE);
stream.on('data', chunk => hash.update(chunk));
const lines = readline.createInterface({input:stream,crlfDelay:Infinity});
for await (const line of lines) {
  const row = JSON.parse(line); counts.inputRows++;
  counts.inputTranscriptions += row.phonetic.length;
  const word = row.word.normalize('NFC').toLocaleLowerCase('fr').replace(/’/gu,"'");
  if (!/^[a-zà-öø-ÿœæ]+(?:[-'][a-zà-öø-ÿœæ]+)*$/u.test(word)) {counts.rejectedWordForms++; continue;}
  const candidates = new Map(); const hs = new Set();
  for (const raw of row.phonetic) {
    const candidate = clean(raw,word);
    if (!candidate) {counts.rejectedCandidates++; if(rejected.length<40) rejected.push({word,raw}); continue;}
    if(candidate.h) hs.add(candidate.h);
    candidates.set(candidate.ipa, score(candidate.ipa,word));
  }
  if (!candidates.size) {counts.emptyRows++;continue;}
  const existing = words.get(word);
  if (existing) {counts.mergedCaseRows++; for(const [p,s] of existing.p) candidates.set(p,Math.max(candidates.get(p)??-Infinity,s)); for(const h of existing.h)hs.add(h);}
  words.set(word,{p:candidates,h:hs});
}

const sorted = [...words.keys()].sort();
if(USE_LEXIQUE){
  for(const [word,entries]of anchors)if(!words.has(word)){
    words.set(word,{p:new Map(entries.map(e=>[e.ipa,score(e.ipa,word)])),h:new Set(),nativeOnly:true});
    sorted.push(word);anchorStats.addedForms++;
  }
  sorted.sort();
}
const chunks = [], heads = []; let offset = 0, previous = '';
for(let i=0;i<sorted.length;i++){
  const word=sorted[i], record=words.get(word);
  // Resolve ambiguous extractions before the three-reading compression cap.
  // Full graph/phone evidence rejects joined articles, wrong consonants and
  // phones that cannot be anchored. This is an orthographic plausibility score,
  // not independent phonetic validation of the unlabelled source.
  const candidates=rankedRaw(word,record);
  let pos='',gram='';
  if(USE_LEXIQUE&&anchors.has(word)){
    anchorStats.covered++;
    const native=anchors.get(word),bestNative=native[0];
    // Match only a/ɑ and length for selection; never collapse output phones.
    const project=target=>candidates.find(([p])=>qualityFold(p,word)===qualityFold(target,word)&&qualityPreferenceAllowed(p,target,word))||candidates.find(([p])=>fold(p)===fold(target));
    const exact=candidates.find(([p])=>fold(p)===fold(bestNative.ipa));
    const compatible=candidates.find(([p])=>qualityFold(p,word)===qualityFold(bestNative.ipa,word)&&qualityPreferenceAllowed(p,bestNative.ipa,word));
    let chosen;
    if(compatible&&fold(compatible[0])!==fold(bestNative.ipa)){
      chosen=compatible[0];anchorStats.traditionalQualityPreserved++;
    }
    else if(exact){chosen=exact[0];anchorStats.rawExactMatches++;if(chosen.replace(/\./gu,'')!==bestNative.ipa)anchorStats.rawTraditionalDistinctionsPreserved++;}
    else if(compatible){chosen=compatible[0];anchorStats.traditionalQualityPreserved++;}
    else{chosen=bestNative.ipa;anchorStats.nativeCorrections++;}
    chosen=traditionalFamily(chosen,word,bestNative);
    // An authoritative anchor can recover a clean reading discarded by raw
    // extraction heuristics. Existing traditional counterparts keep priority.
    const found=candidates.find(c=>c[0]===chosen);
    const best=candidates[0][1];
    if(found)found[1]=Math.max(found[1],best+2);else candidates.push([chosen,best+2]);
    candidates.sort((a,b)=>b[1]-a[1]||a[0].length-b[0].length);
    pos=[...new Set(native.map(e=>POS_CODES[e.pos]))].sort().join('');
    const readings=[];
    for(const entry of native){
      const projected=traditionalFamily(project(entry.ipa)?.[0]||entry.ipa,word,entry);
      const code=POS_CODES[entry.pos];
      if(!readings.some(r=>r[0]===projected&&r[1]===code))readings.push([projected,code]);
    }
    if(new Set(readings.map(r=>fold(r[0]))).size>1){gram=readings.map(r=>r.join('@')).join('~');anchorStats.heterophones++;}
  }
  const primary=candidates[0];
  // Keep only credible close competitors, at most three readings in total.
  const readings=[],seenShapes=new Set();
  for(const [p,s] of candidates){
    if(s<primary[1]-3)continue;
    const shape=p.replace(/\./gu,'');
    if(seenShapes.has(shape))continue;
    seenShapes.add(shape);readings.push(p);
    if(readings.length===3)break;
  }
  let common=0;
  if(i%BLOCK===0){heads.push([word,offset]);previous='';}
  while(common<previous.length && common<word.length && previous[common]===word[common])common++;
  const h=record.h.size>1?'b':record.h.size?[...record.h][0]:'';
  if(h)counts.markedH++;
  if(readings.length>1)counts.ambiguousEntries++;
  const line=common.toString(36)+'|'+word.slice(common)+'\t'+readings.join('~')+'\t'+h+(pos||gram?'\t'+pos+(gram?'\t'+gram:''):'')+'\n';
  chunks.push(line); offset+=line.length; previous=word;
}
counts.lexicalEntries=sorted.length;
anchorStats.familyQualityForms=familyForms.size;
anchorStats.pretonicFamilyForms=pretonicForms.size;
anchorStats.pluralCitationForms=pluralForms.size;
const text=chunks.join('');
const compressed=zlib.gzipSync(Buffer.from(text),{level:9});
const stats={...counts,blockSize:BLOCK,blockCount:heads.length,rawCharacters:text.length,gzipBytes:compressed.length,sourceSha256:hash.digest('hex'),selection:'Conservative filtering and heuristic ranking of unlabelled source variants; not independently validated lexical truth.'};
if(USE_LEXIQUE)stats.referenceAnchor=anchorStats;
fs.mkdirSync(path.join(ROOT,'data'),{recursive:true});
fs.mkdirSync(path.join(ROOT,'src'),{recursive:true});
fs.writeFileSync(path.join(ROOT,STAGE?'src/lexicon-data-anchored.js':'src/lexicon-data.js'),`// Generated by tools/build-lexicon.mjs; source remains unchanged.\nexport const LEXICON_B64=${JSON.stringify(compressed.toString('base64'))};\nexport const LEXICON_HEADS=${JSON.stringify(heads)};\nexport const LEXICON_STATS=${JSON.stringify(stats)};\n`);
fs.writeFileSync(path.join(ROOT,STAGE?'data/lexicon-audit-anchored.json':'data/lexicon-audit.json'),JSON.stringify({...stats,rejectedExamples:rejected,familyExamples},null,2)+'\n');
console.log(JSON.stringify(stats,null,2));
