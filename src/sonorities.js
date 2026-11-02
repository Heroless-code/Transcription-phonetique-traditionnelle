import {phones,isVowel,GLIDES} from './phonology.js';

/** Counts concern the realized API, never spelling or palette families.
 * A graphic word is one original word occurrence: adjacent elision tokens and
 * hyphen-separated parts are reunited. An expanded number (including grouping
 * spaces) remains the single original numeric token. Repeated spellings at
 * different source positions remain different words. */
export const sonoritiesPolicy=Object.freeze({
  minimumOccurrences:2,
  minimumListedOccurrences:1,
  prominentWordCount:3,
  lengths:'distinct',
  glides:'alliteration-semi-consonant',
  liaison:'count-final-IPA-once',
  wordCounting:'original-graphic-occurrences; elisions and hyphenated parts reunited; expanded numeric token counts as one',
  ranking:'4×words + 2×log2(occurrences) + 2×word coverage + 2×phone density + proximity + spread; multiplied by 0.7 for schwa or 0.85 for r. Heuristic index, not probability.'
});
const CONSONANTS=new Set(['b','d','f','ɡ','k','l','m','n','ɲ','ŋ','p','ʁ','s','ʃ','t','v','z','ʒ','j','w','ɥ','h','ʔ']);
const MARKS=new Set(['.','‿']);
const HYPOTHETICAL=new Set(['hypothesis','ambiguous','fallback']);
const rounded=n=>Math.round(n*1000000)/1000000;
function sound(raw){
  const units=phones(String(raw||''));
  if(units.length!==1||MARKS.has(units[0]))return null;
  const p=units[0];return isVowel(p)||CONSONANTS.has(p)?p:null;
}
export function phoneticUnits(token){
  if(Array.isArray(token.phonemes)&&token.phonemes.map(p=>p.text||'').join('')===String(token.ipa||''))return token.phonemes;
  // Same unit boundaries as the API renderer, including punctuation, spaces
  // and syllable/liaison marks. Indexes therefore address rendered API units.
  return (String(token.ipa||'').normalize('NFD').match(/[aɑeɛəioɔuyøœ](?:\u0303)?[ː]?|./gu)||[]).map(text=>({text,phone:text}));
}
function uncertainty(token){
  const reasons=[];
  if(token.confidence==='ambiguous')reasons.push('Lecture lexicale ou grammaticale ambiguë.');
  else if(HYPOTHETICAL.has(token.confidence)||['rules','acronym'].includes(token.source))reasons.push('Prononciation hypothétique.');
  if(token.poetryHypothesis||token.poetry?.hypothesis){
    reasons.push(typeof token.poetryReason==='string'?token.poetryReason:'Lecture poétique hypothétique.');
  }
  return reasons;
}
function sourceWords(tokens,original){
  const words=[],tokenWords=new Map(),offsets=[];
  const exactSource=tokens.map(t=>String(t.text||'')).join('')===original;
  let offset=0,previousToken=-1;
  for(let index=0;index<tokens.length;index++){
    const token=tokens[index],text=String(token.text||'');offsets[index]=offset;
    if(token.type==='word'){
      const gap=previousToken>=0?tokens.slice(previousToken+1,index).map(t=>String(t.text||'')).join(''):null;
      const join=previousToken>=0&&(gap===''||/^[-‐‑]$/u.test(gap));
      let word;
      if(join){word=words[words.length-1];word.text+=gap+text;word.end=exactSource?offset+text.length:null;word.tokenIndices.push(index);}
      else{word={id:words.length,index:words.length,text,start:exactSource?offset:null,end:exactSource?offset+text.length:null,tokenIndices:[index]};words.push(word);}
      tokenWords.set(index,word.id);previousToken=index;
    }
    offset+=text.length;
  }
  return {words,tokenWords,offsets,exactSource};
}
function graphAnchors(token,tokenIndex,tokenOffset,expected,exactSource){
  const anchors=expected.map(()=>[]),segments=token.segments;
  if(!exactSource||!Array.isArray(segments)||segments.map(s=>s.text||'').join('')!==String(token.text||''))return anchors;
  const graphPhones=segments.flatMap(s=>(s.phones||[]).map(sound).filter(Boolean));
  if(graphPhones.length!==expected.length||graphPhones.some((p,i)=>p!==expected[i]))return anchors;
  let sourceOffset=0,phoneOffset=0;
  for(let segmentIndex=0;segmentIndex<segments.length;segmentIndex++){
    const segment=segments[segmentIndex],text=String(segment.text||''),represented=(segment.phones||[]).map(sound).filter(Boolean);
    // Reconstruct offsets from exact source pieces. This also handles number
    // fallbacks and NFC/NFD maps without trusting absent or stale offsets.
    const span={tokenIndex,segmentIndex,text,start:tokenOffset+sourceOffset,end:tokenOffset+sourceOffset+text.length};
    if(!segment.silent&&!segment.uncertain&&text)for(let n=0;n<represented.length;n++)anchors[phoneOffset+n]=[{...span}];
    sourceOffset+=text.length;phoneOffset+=represented.length;
  }
  return anchors;
}
function groupOccurrences(occurrences,words,totalPhones){
  const grouped=new Map();
  for(const occurrence of occurrences){
    if(!grouped.has(occurrence.phone))grouped.set(occurrence.phone,[]);
    grouped.get(occurrence.phone).push(occurrence);
  }
  const groups={alliterations:[],assonances:[]};
  for(const [phone,items]of grouped){
    const wordIds=[...new Set(items.map(o=>o.wordId))],count=items.length,wordCount=wordIds.length;
    const first=items[0].phoneIndex,last=items[items.length-1].phoneIndex;
    const repeated=count>=sonoritiesPolicy.minimumOccurrences;
    const averageGap=count>1?(last-first)/(count-1):0;
    const metrics={density:rounded(count/Math.max(1,totalPhones)),proximity:count>1?rounded(1/Math.max(1,averageGap)):0,spread:rounded((last-first)/Math.max(1,totalPhones-1)),coverage:rounded(wordCount/Math.max(1,words.length)),averageGap:rounded(averageGap)};
    const commonWeight=phone.replace(/ː/gu,'')==='ə'?.7:phone==='ʁ'?.85:1;
    const rankScore=rounded((4*wordCount+2*Math.log2(count)+2*metrics.coverage+2*metrics.density+metrics.proximity+metrics.spread)*commonWeight);
    const uncertainCount=items.filter(o=>o.uncertain).length,unalignedCount=items.filter(o=>!o.alignmentCertain).length;
    const kind=items[0].kind;
    const group={phone,kind,semiConsonant:GLIDES.has(phone),count,wordCount,wordIds,words:wordIds.map(id=>({...words[id],tokenIndices:[...words[id].tokenIndices]})),occurrences:items,
      repeated,singleton:!repeated,prominent:wordCount>=sonoritiesPolicy.prominentWordCount,internalOnly:repeated&&wordCount===1,uncertain:uncertainCount>0,uncertainCount,unalignedCount,metrics,rankScore,
      rankingReason:'Classement par mots concernés, occurrences, couverture, densité, proximité et étendue.'+(commonWeight<1?' Pondération prudente du son fréquent /'+phone+'/ ; décompte inchangé.':'')};
    groups[kind==='assonance'?'assonances':'alliterations'].push(group);
  }
  const compare=(a,b)=>Number(b.repeated)-Number(a.repeated)||b.rankScore-a.rankScore||b.wordCount-a.wordCount||b.count-a.count||a.phone.localeCompare(b.phone,'fr');
  groups.alliterations.sort(compare);groups.assonances.sort(compare);
  return groups;
}

/** Analyze one final transcription, without changing tokens, IPA or source. */
export function analyzeLine(line){
  const tokens=Array.isArray(line?.tokens)?line.tokens:[];
  const original=String(line?.original??tokens.map(t=>t.text||'').join(''));
  const {words,tokenWords,offsets,exactSource}=sourceWords(tokens,original);
  const occurrences=[];
  for(let tokenIndex=0;tokenIndex<tokens.length;tokenIndex++){
    const token=tokens[tokenIndex];if(token.type!=='word')continue;
    // The visible API text is authoritative; auxiliary phone metadata must
    // never introduce a sound absent from the final pronunciation.
    const units=phoneticUnits(token),recognized=units.map((unit,phonemeIndex)=>({phone:sound(unit.text),phonemeIndex})).filter(p=>p.phone);
    const anchors=graphAnchors(token,tokenIndex,offsets[tokenIndex],recognized.map(p=>p.phone),exactSource);
    const wordId=tokenWords.get(tokenIndex),word=words[wordId],reasons=uncertainty(token);
    for(let i=0;i<recognized.length;i++){
      const {phone,phonemeIndex}=recognized[i],graphSpans=anchors[i];
      occurrences.push({phone,kind:isVowel(phone)?'assonance':'alliteration',semiConsonant:GLIDES.has(phone),
        tokenIndex,phonemeIndex,phoneIndex:occurrences.length,wordId,wordText:word.text,wordStart:word.start,wordEnd:word.end,
        sourceStart:graphSpans.length?graphSpans[0].start:null,sourceEnd:graphSpans.length?graphSpans[graphSpans.length-1].end:null,graphSpans,
        alignmentCertain:graphSpans.length>0,uncertain:reasons.length>0,reasons:[...reasons]});
    }
  }
  // The complete inventory is displayed, while literary repetition statistics
  // continue to require at least two occurrences within the same verse.
  const soundGroups=groupOccurrences(occurrences,words,occurrences.length);
  const groups=Object.fromEntries(Object.entries(soundGroups).map(([kind,sounds])=>[kind,sounds.filter(g=>g.repeated)]));
  return {original,ipa:String(line?.ipa||''),words,occurrences,groups,soundGroups,
    stats:{words:words.length,phones:occurrences.length,alliterations:groups.alliterations.length,assonances:groups.assonances.length,uncertainOccurrences:occurrences.filter(o=>o.uncertain).length,unalignedOccurrences:occurrences.filter(o=>!o.alignmentCertain).length},
    warnings:exactSource?[]:['Les positions de la graphie originale ne peuvent pas être établies sur ces données.']};
}

/** No cross-line aggregation of sounds: each verse owns its own groups. */
export function analyzeSonorities(result){
  const lines=(result?.lines||[]).map((line,lineIndex)=>({...analyzeLine(line),lineIndex}));
  return {lines,stats:{verses:lines.filter(l=>l.original.trim()).length,phones:lines.reduce((n,l)=>n+l.stats.phones,0),alliterations:lines.reduce((n,l)=>n+l.groups.alliterations.length,0),assonances:lines.reduce((n,l)=>n+l.groups.assonances.length,0)}};
}
