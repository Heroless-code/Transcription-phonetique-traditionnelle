/** Add attested GLÀFF readings only where the baseline has no entry. */
import fs from 'node:fs';
import readline from 'node:readline';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import {loadLexicon,lookup} from '../src/lexicon.js';
import {align} from '../src/alignment.js';
import {syllabify} from '../src/phonology.js';
import {verbFromLexicon} from '../src/rules.js';
const root=new URL('../',import.meta.url);
const file=name=>new URL(name,root);
const original=file('data/before-glaff/lexicon-data.js');
fs.mkdirSync(new URL('data/before-glaff/',root),{recursive:true});
if(!fs.existsSync(original))fs.copyFileSync(file('src/lexicon-data.js'),original);
const {LEXICON_B64,LEXICON_HEADS,LEXICON_STATS}=await import(original.href);
const decode=zlib.gunzipSync(Buffer.from(LEXICON_B64,'base64')).toString('utf8');
const baselineKeys=new Set();
let previous='',index=0;
for(const line of decode.split('\n')){
 if(!line)continue;if(index++%LEXICON_STATS.blockSize===0)previous='';
 const pipe=line.indexOf('|'),tab=line.indexOf('\t');
 previous=previous.slice(0,parseInt(line.slice(0,pipe),36))+line.slice(pipe+1,tab);baselineKeys.add(previous);
}
const extra=new Map(),summary={source:'GLÀFF 1.2.2',url:'https://redac.univ-tlse2.fr/lexiques/glaff.html',license:'CC BY-SA 3.0',baselineEntries:LEXICON_STATS.lexicalEntries,sourceRows:0,existingRows:0,rejectedOpaque:0,addedEntries:0,readings:0};
summary.rejectedPhonotactics=0;summary.rejectedTraditional=0;summary.rejectedParadigm=0;summary.projectedPlurals=0;
const POS={VER:'V',NOM:'N',ADJ:'A',ADV:'D',ART:'T',PRO:'P',PRE:'R',CON:'C',ONO:'I'};
await loadLexicon();
const quality=p=>p.replace(/[.ː]/gu,'').replace(/ɑ(?!̃)/gu,'a').replace(/[eɛ](?!̃)/gu,'E').replace(/[oɔ](?!̃)/gu,'O');
for await(const line of readline.createInterface({input:fs.createReadStream(file('data/references/glaff-candidates.jsonl')),crlfDelay:Infinity})){
 const entry=JSON.parse(line);summary.sourceRows++;
 if(baselineKeys.has(entry.word)){summary.existingRows++;continue;}
 const valid=entry.ipa.filter(ipa=>{
  if(/(?:i?ennes?|onnes?|annes?|innes?)$/u.test(entry.word)&&/[ɛɑɔ]̃n/u.test(ipa)){summary.rejectedPhonotactics++;return false;}
  if(/gu[eéèê]/u.test(entry.word)&&/ɡ[.]*y/u.test(ipa)){summary.rejectedPhonotactics++;return false;}
  if(/â/u.test(entry.word)&&!/ɑ(?!̃)/u.test(ipa)){summary.rejectedTraditional++;return false;}
  const verb=entry.pos==='VER'?verbFromLexicon(entry.word,w=>baselineKeys.has(w)?lookup(w):null):null;
  if(verb&&quality(verb.ipa)!==quality(ipa)){summary.rejectedParadigm++;return false;}
  return !align(entry.word,ipa).some(s=>s.uncertain);
 }).map(ipa=>{
  if(['NOM','ADJ'].includes(entry.pos)&&entry.word!==entry.lemma.toLocaleLowerCase('fr')&&/[sx]$/u.test(entry.word)){
   const lemma=baselineKeys.has(entry.lemma.toLocaleLowerCase('fr'))?lookup(entry.lemma):null;
   if(lemma?.pos?.includes(entry.pos)&&quality(lemma.ipa)===quality(ipa)&&lemma.ipa!==ipa){summary.projectedPlurals++;return lemma.ipa;}
  }
  return ipa;
 });
 if(!valid.length){summary.rejectedOpaque++;continue;}
 if(!extra.has(entry.word))extra.set(entry.word,[]);
 for(const ipa of valid)if(!extra.get(entry.word).some(e=>e.ipa===ipa&&e.pos===entry.pos))extra.get(entry.word).push({...entry,ipa});
}
const additions=[...extra].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([word,readings])=>({word,readings}));
summary.addedEntries=additions.length;summary.readings=additions.reduce((n,e)=>n+e.readings.length,0);
summary.examples=additions.filter((_,i)=>i%Math.max(1,Math.floor(additions.length/40))===0).slice(0,40);
fs.writeFileSync(file('data/glaff-additions.jsonl'),additions.map(e=>JSON.stringify(e)).join('\n')+'\n');
fs.writeFileSync(file('data/glaff-extension-audit.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,examples:summary.examples.slice(0,8)},null,2));
if(process.argv.includes('--select'))process.exit(0);
// Preserve every baseline record verbatim after prefix decoding. New rows get
// POS readings and a source field. No existing traditional vowel is overwritten.
const additional=additions.map(({word,readings})=>{
 const ipas=[...new Set(readings.map(r=>syllabify(r.ipa)))].slice(0,3);
 const pos=[...new Set(readings.map(r=>POS[r.pos]))].sort().join('');
 const gram=readings.map(r=>syllabify(r.ipa)+'@'+POS[r.pos]);
 const heterogeneous=new Set(readings.map(r=>r.ipa.replace(/\./gu,''))).size>1;
 return {word,body:ipas.join('~')+'\t\t'+pos+'\t'+(heterogeneous?[...new Set(gram)].join('~'):'')+'\tG'};
});
let cursor=0,word='',row=0,last='',offset=0,baselineIndex=0;
const chunks=[],heads=[];
function emit(word,body){
 if(row%LEXICON_STATS.blockSize===0){heads.push([word,offset]);last='';}
 let common=0;while(common<last.length&&common<word.length&&last[common]===word[common])common++;
 const line=common.toString(36)+'|'+word.slice(common)+'\t'+body+'\n';
 chunks.push(line);offset+=line.length;last=word;row++;
}
for(const line of decode.split('\n')){
 if(!line)continue;
 // Source block boundaries follow their own index, independent of inserted rows.
 if(baselineIndex++%LEXICON_STATS.blockSize===0)word='';
 const pipe=line.indexOf('|'),tab=line.indexOf('\t');
 word=word.slice(0,parseInt(line.slice(0,pipe),36))+line.slice(pipe+1,tab);
 while(cursor<additional.length&&additional[cursor].word<word){const e=additional[cursor++];emit(e.word,e.body);}
 emit(word,line.slice(tab+1));
}
while(cursor<additional.length){const e=additional[cursor++];emit(e.word,e.body);}
const encoded=chunks.join(''),compressed=zlib.gzipSync(Buffer.from(encoded),{level:9});
summary.additionsSha256=crypto.createHash('sha256').update(fs.readFileSync(file('data/glaff-additions.jsonl'))).digest('hex');
const extraAmbiguous=additions.filter(e=>new Set(e.readings.map(r=>r.ipa.replace(/\./gu,''))).size>1).length;
const stats={...LEXICON_STATS,lexicalEntries:row,ambiguousEntries:LEXICON_STATS.ambiguousEntries+extraAmbiguous,blockCount:heads.length,rawCharacters:encoded.length,gzipBytes:compressed.length,extension:summary};
fs.writeFileSync(file('src/lexicon-data.js'),`// Generated by tools/extend-lexicon.mjs after build-lexicon.mjs --lexique.\nexport const LEXICON_B64=${JSON.stringify(compressed.toString('base64'))};\nexport const LEXICON_HEADS=${JSON.stringify(heads)};\nexport const LEXICON_STATS=${JSON.stringify(stats)};\n`);
fs.writeFileSync(file('data/glaff-extension-audit.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({entries:row,added:additional.length,gzipBytes:compressed.length}));
