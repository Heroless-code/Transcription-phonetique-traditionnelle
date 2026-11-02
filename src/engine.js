import {loadLexicon,lookup,getLexiconStats} from './lexicon.js';
import {reviewed,normalizeWord,morphology,verbFromLexicon,g2p,refineCitation} from './rules.js';
import {applyContext} from './context.js';
import {phones,syllabify} from './phonology.js';
import {align} from './alignment.js';
import {numberWords,applyNumberContext} from './numbers.js';

let ready=false;
const wordCache=new Map();
const CLITICS={"l'":'l',"d'":'d',"j'":'ʒ',"m'":'m',"t'":'t',"s'":'s',"n'":'n',"c'":'s',"qu'":'k',"jusqu'":'ʒysk',"lorsqu'":'lɔʁsk',"puisqu'":'pɥisk',"quoiqu'":'kwak',"presqu'":'pʁɛsk'};
const LETTERS={a:'a',b:'be',c:'se',d:'de',e:'ø',f:'ɛf',g:'ʒe',h:'aʃ',i:'i',j:'ʒi',k:'ka',l:'ɛl',m:'ɛm',n:'ɛn',o:'o',p:'pe',q:'ky',r:'ɛʁ',s:'ɛs',t:'te',u:'y',v:'ve',w:'du.blə.ve',x:'iks',y:'i.ɡʁɛk',z:'zɛd'};

export async function initialize() {await loadLexicon();ready=true;return getLexiconStats();}

function lexical(word) {return reviewed(word)||lookup(word)||lookup(normalizeWord(word));}

export function analyzeWord(text, options={}) {
  const lower=normalizeWord(text);
  if(!options.forceRules&&wordCache.has(text))return {...wordCache.get(text),notes:[...wordCache.get(text).notes],alternatives:[...wordCache.get(text).alternatives]};
  let data,notes=[];
  if(CLITICS[lower])data={ipa:CLITICS[lower],source:'reviewed',confidence:'lexical',h:null};
  else if(options.forceRules)data=g2p(lower,options);
  else {
    const checked=reviewed(text);let extracted=lookup(text)||lookup(lower);
    // Typographic œ/oe aliases share grammar, while keeping their own IPA.
    if(extracted&&!extracted.pos?.length&&lower.includes('œ')){
      const alias=lookup(lower.replace(/œ/gu,'oe'));
      if(alias?.pos?.length)extracted={...extracted,pos:alias.pos,grammaticalReadings:alias.grammaticalReadings,reference:alias.reference};
    }
    const entry=checked?{pos:extracted?.pos,grammaticalReadings:extracted?.grammaticalReadings,reference:extracted?.reference,...checked}:extracted;
    if(entry)data={...entry,source:checked?'reviewed':'lexicon',confidence:checked?'lexical':entry.confidence};
    else data=morphology(lower,lexical)||g2p(lower,options);
  }
  data=refineCitation(lower,data);
  const seenReadings=new Set([phones(data.ipa).filter(p=>p!=='.').join('')]);
  const alternatives=(data.alternatives||[]).filter(p=>{const key=phones(p).filter(p=>p!=='.').join('');if(!p||seenReadings.has(key))return false;seenReadings.add(key);return true;});
  if(alternatives.length)notes.push('Prononciations lexicales possibles : /'+[data.ipa,...alternatives].join('/, /')+'/. Les variantes du lexique ne sont pas étiquetées.');
  if(data.source==='morphology')notes.push('Prononciation déduite : '+data.rule+'.');
  if(data.source==='rules')notes.push('Mot absent du lexique retenu : hypothèse de prononciation par les règles.');
  const confidence=data.confidence==='ambiguous'&&!alternatives.length&&data.h!=='ambiguous'?'lexical':data.confidence;
  const token={type:'word',text,lower,ipa:data.ipa,h:data.h||null,alternatives,source:data.source||'lexicon',confidence:confidence||(data.source==='morphology'?'hypothesis':'lexical'),notes,rule:data.rule};
  if(data.pos)token.pos=[...data.pos];
  if(data.grammaticalReadings)token.grammaticalReadings=data.grammaticalReadings.map(r=>({...r}));
  if(data.reference)token.reference=data.reference;
  if(!CLITICS[lower]&&/[a-zàâéèêîïôùûçœ]/iu.test(lower)){
    const grammaticalVerb=token.grammaticalReadings?.find(r=>r.pos==='VER'||r.pos==='AUX');
    const verb=verbFromLexicon(lower,lexical);
    if(verb)token.regularVerbCandidate=true;
    if(grammaticalVerb)token.verbIpa=grammaticalVerb.ipa;
    else if(token.pos?.includes('VER')&&!token.grammaticalReadings?.length)token.verbIpa=token.ipa;
    else if(verb)token.verbIpa=verb.ipa;
    else if(/ent$/u.test(lower))token.verbIpa=(token.source==='morphology'?morphology(lower,lexical,0,{verb:true}):null)?.ipa||g2p(lower,{verb:true}).ipa;
  }
  if(!options.forceRules){if(wordCache.size>12000)wordCache.clear();wordCache.set(text,{...token,notes:[...notes],alternatives:[...alternatives]});}
  return token;
}

function splitWord(text) {
  const apos=text.search(/['’ʼ]/u);
  if(apos>=0){const prefix=normalizeWord(text.slice(0,apos+1));if(CLITICS[prefix]&&apos<text.length-1)return [analyzeWord(text.slice(0,apos+1)),...splitWord(text.slice(apos+1))];}
  if(text.includes('-')){
    // Lexical compounds stay intact; inversion is a grammatical construction.
    if(!/-(?:t-)?(?:il|elle|on|ils|elles)$/iu.test(text)&&lexical(text))return [analyzeWord(text)];
    const a=[];text.split(/(-)/u).filter(Boolean).forEach(p=>a.push(...(p==='-'?[{type:'separator',text:p}]:splitWord(p))));return a;
  }
  const t=analyzeWord(text);
  if(t.source==='rules'&&/^[A-ZÀÂÉÈÊÎÏÔÙÛÇŒ]{2,8}$/u.test(text)){
    t.ipa=syllabify([...normalizeWord(text)].map(c=>LETTERS[c]||g2p(c).ipa).join('.'));
    t.source='acronym';t.confidence='hypothesis';t.notes=['Sigle supposé : lecture des noms de lettres.'];
  }
  return [t];
}

function tokenize(line) {
  const out=[];
  // Recognize conventional three-digit groups before the generic numeric
  // branch. Keep the exact spelling; numberWords removes grouping spaces.
  const rx=/[\p{L}\p{M}]+(?:['’ʼ-][\p{L}\p{M}]+)*['’ʼ]?|\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[,.]\d+)?(?!\d)|\d+(?:[,.]\d+)?|[^\p{L}\p{M}\d]+/gu;
  for(const match of line.matchAll(rx)){
    const text=match[0];
    if(/^\d/u.test(text)){
      const expanded=numberWords(text);
      const r=transcribe(expanded).lines[0];
      out.push({type:'word',text,lower:normalizeWord(expanded),ipa:r.ipa,alternatives:[],h:null,source:'number',confidence:'hypothesis',notes:['Nombre lu : '+expanded+'.'],expanded});
    }else if(/^[\p{L}\p{M}]/u.test(text))out.push(...splitWord(text));
    else out.push({type:'separator',text});
  }
  return out;
}

function phoneticParts(ipa) {
  return (ipa.normalize('NFD').match(/[aɑeɛəioɔuyøœ](?:\u0303)?[ː]?|./gu)||[]).map(phone=>({text:phone,phone}));
}

function finishTokens(tokens) {
  for(let i=0;i<tokens.length;i++){
    const t=tokens[i];if(t.type!=='word')continue;
    // Context may replace a lexical candidate; syllabification follows that decision.
    t.ipa=t.expanded?t.ipa:syllabify(t.ipa);
    if(t.lower==='t'&&tokens[i-1]?.text==='-'&&tokens[i+1]?.text==='-')t.ipa='t';
    let alignmentIpa=t.ipa;
    if(t.liaison?.realized){
      const p=t.liaison.phone;
      alignmentIpa+=p;
      t.ipa+=(t.ipa&& !/[.]$/u.test(t.ipa)?'.':'')+p+'‿';
      if(tokens[i+1]?.type==='separator')tokens[i+1].displayPhonetic='';
    }
    t.segments=t.expanded?[{text:t.text,phones:phones(alignmentIpa),silent:false,uncertain:true}]:align(t.text,alignmentIpa);
    if(t.segments.map(s=>s.text).join('')!==t.text)t.segments=[{text:t.text,phones:phones(alignmentIpa),silent:false,uncertain:true}];
    t.phonemes=phoneticParts(t.ipa);
    t.alignmentCertain=t.segments.every(s=>!s.uncertain);
    t.displayPhonetic=t.ipa;
    if(t.liaison?.kind==='facultative')t.notes.push('Liaison facultative non réalisée : '+t.liaison.reason+'.');
    if(t.h==='ambiguous'){
      t.confidence='ambiguous';t.notes.push('Statut du h variable ou contradictoire dans les données ; liaison bloquée par prudence.');
    }
  }
  // Euphonic t belongs to inversion, not to a separate word.
  for(let i=1;i<tokens.length-1;i++)if(tokens[i].type==='word'&&tokens[i].lower==='t'&&tokens[i-1].text==='-'&&tokens[i+1].text==='-'){
    tokens[i-1].displayPhonetic='.';tokens[i+1].displayPhonetic='‿';
  }
}

export function transcribe(text) {
  if(!ready)throw new Error('Le lexique local est encore en cours de préparation.');
  text=String(text);
  const lines=[],stats={words:0,unknown:0,ambiguous:0,morphological:0,unaligned:0};
  for(const original of text.split(/\r\n|\n|\r/u)){
    const tokens=tokenize(original);applyContext(tokens);applyNumberContext(tokens);finishTokens(tokens);
    let ipa='';const notes=[];
    for(const t of tokens){
      if(t.type==='word'){
        ipa+=t.displayPhonetic;stats.words++;
        if(t.source==='rules'||t.source==='acronym')stats.unknown++;
        if(t.source==='morphology')stats.morphological++;
        if(t.confidence==='ambiguous')stats.ambiguous++;
        if(!t.alignmentCertain)stats.unaligned++;
        if(t.confidence==='hypothesis')notes.push('« '+t.text+' » : prononciation déduite.');
        if(t.confidence==='ambiguous')notes.push('« '+t.text+' » : plusieurs lectures possibles.');
      }else ipa+=t.displayPhonetic===undefined?t.text:t.displayPhonetic;
    }
    lines.push({original,ipa,tokens,notes:[...new Set(notes)]});
  }
  return {lines,stats};
}


