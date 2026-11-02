import { LEXICON_B64, LEXICON_HEADS, LEXICON_STATS } from './lexicon-data.js';
import { FEMININE_NOUN_B64 } from './gender-data.js';

let lexiconText = null;
let loading = null;
let feminineNouns = null;
const blocks = new Map();
const MAX_CACHED_BLOCKS = 96;
const POS_NAMES={V:'VER',N:'NOM',A:'ADJ',D:'ADV',T:'ART',P:'PRO',R:'PRE',C:'CON',X:'AUX',I:'ONO'};

/** No network or persistent storage: all bytes are embedded in the HTML. */
export async function loadLexicon() {
  if (lexiconText !== null && feminineNouns !== null) return LEXICON_STATS;
  if (!loading) loading = (async () => {
    if (typeof DecompressionStream !== 'function') throw new Error('Ce navigateur ne prend pas en charge la décompression locale. Utilisez une version récente de Firefox, Chrome, Edge ou Safari.');
    const binary = atob(LEXICON_B64);
    const bytes = new Uint8Array(binary.length);
    for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    lexiconText = await new Response(stream).text();
    const genderBinary=atob(FEMININE_NOUN_B64),genderBytes=new Uint8Array(genderBinary.length);
    for(let i=0;i<genderBinary.length;i++)genderBytes[i]=genderBinary.charCodeAt(i);
    const genderStream=new Blob([genderBytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    feminineNouns=new Set((await new Response(genderStream).text()).split('\n'));
    return LEXICON_STATS;
  })();
  return loading;
}

export function getLexiconStats() { return LEXICON_STATS; }
export const lexiconStats = LEXICON_STATS;
/** No suffix-based gender inference; unknown and epicene nouns return null. */
export function nounGender(word) {
  if(!feminineNouns)return null;
  const key=word.normalize('NFC').toLocaleLowerCase('fr').replace(/[’ʼ]/gu,"'");
  return feminineNouns.has(key)||feminineNouns.has(key.replace(/œ/gu,'oe'))?'f':null;
}

function readBlock(number) {
  if (blocks.has(number)) return blocks.get(number);
  const start=LEXICON_HEADS[number][1];
  const end=number+1<LEXICON_HEADS.length?LEXICON_HEADS[number+1][1]:lexiconText.length;
  const records=new Map(); let previous='';
  for(const line of lexiconText.slice(start,end).split('\n')) {
    if(!line)continue;
    const pipe=line.indexOf('|'), tab=line.indexOf('\t',pipe+1);
    const word=previous.slice(0,parseInt(line.slice(0,pipe),36))+line.slice(pipe+1,tab);
    const fields=line.slice(tab+1).split('\t'),readings=fields[0].split('~');
    const h=fields[1]||'',pos=fields[2]?[...fields[2]].map(p=>POS_NAMES[p]).filter(Boolean):[];
    const grammaticalReadings=fields[3]?fields[3].split('~').map(r=>{const[p,code]=r.split('@');return {ipa:p,pos:POS_NAMES[code]};}):[];
    records.set(word,{ipa:readings[0],alternatives:readings.slice(1),h:h==='a'?'aspire':h==='m'?'muet':h==='b'?'ambiguous':null,source:'lexicon',confidence:readings.length>1||h==='b'?'ambiguous':'lexical',...(pos.length?{pos,reference:fields[4]==='G'?'GLÀFF 1.2.2':'Lexique 4.1'}:{}),...(grammaticalReadings.length?{grammaticalReadings}: {})});
    previous=word;
  }
  if(blocks.size>=MAX_CACHED_BLOCKS) blocks.delete(blocks.keys().next().value);
  blocks.set(number,records);
  return records;
}

/** loadLexicon must finish once before synchronous lookup. */
export function lookup(word) {
  if(lexiconText===null) return null;
  const key=word.normalize('NFC').toLocaleLowerCase('fr').replace(/’/gu,"'");
  let lo=0,hi=LEXICON_HEADS.length-1,block=-1;
  while(lo<=hi){const mid=(lo+hi)>>>1;if(LEXICON_HEADS[mid][0]<=key){block=mid;lo=mid+1;}else hi=mid-1;}
  if(block<0)return null;
  const result=readBlock(block).get(key);
  return result?{...result,alternatives:[...result.alternatives],...(result.pos?{pos:[...result.pos]}:{}),...(result.grammaticalReadings?{grammaticalReadings:result.grammaticalReadings.map(r=>({...r}))}:{})}:null;
}
