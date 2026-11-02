import {phones,isVowel,GLIDES,syllabify} from './phonology.js';
import {align} from './alignment.js';
import {contextInternals} from './context.js';

/* Explicit, assisted classical reading. This module never selects a metre or
 * mutates the prose result. Its small, documented hiatus list proposes choices;
 * it does not infer etymology for every French word. */
export const poetryPolicy=Object.freeze({
  id:'classical-assisted',label:'Lecture classique',
  finalCaduc:'omitted',freeCaducBeforeVowel:'elided',
  blockedCaduc:'retained-inside-line',optionalLiaisons:'not-generalized',
  hiatus:'attested-local-choices',metre:'not-inferred'
});
const SOURCES=[
  {title:'Gérald Purnelle, La langue des vers (Université de Liège, JADT 2006)',url:'https://orbi.uliege.be/bitstream/2268/33658/1/Purnelle29.pdf'},
  {title:'Laurent Jenny, Versification, I.2.2 (Université de Genève)',url:'https://www.unige.ch/lettres/framo/enseignements/methodes/versification/vrintegr.html'},
  {title:'Larousse, diérèse',url:'https://www.larousse.fr/dictionnaires/francais/di%C3%A9r%C3%A8se/25391'}
];
const HIATUS=[
  [/^lions?$/u,'j'],[/^liens?$/u,'j'],[/^dictions?$/u,'j'],[/^miasmes?$/u,'j'],
  [/^supérieure?s?$/u,'j'],[/^purifier$/u,'j'],[/^hiers?$/u,'j'],
  [/^nuages?$/u,'ɥ'],[/^nuées?$/u,'ɥ'],[/^ruelles?$/u,'ɥ'],[/^duel(?:s|le|les)?$/u,'ɥ']
];
const VOWEL_GLIDE={j:'i','ɥ':'y',w:'u'};
const GRAMMATICAL_SCHWA=new Set(['le','de','ce','que','ne','me','te','se','je']);
const clean=ipa=>phones(ipa).filter(p=>p!=='.'&&p!=='‿');
const key=ipa=>clean(ipa).join('');
const lower=text=>String(text||'').normalize('NFC').toLocaleLowerCase('fr').replace(/[’ʼ]/gu,"'");
const clone=value=>typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));
const parts=ipa=>(ipa.normalize('NFD').match(/[aɑeɛəioɔuyøœ](?:\u0303)?ː?|./gu)||[]).map(phone=>({text:phone,phone}));

function stem(token){
  const ps=clean(token.ipa);
  if(token.liaison?.realized&&token.liaison.phone&&ps.at(-1)===token.liaison.phone)ps.pop();
  return ps;
}
function boundary(line,leftIndex,rightIndex){
  if(rightIndex===undefined)return {kind:'end',strong:false};
  const separator=line.tokens.slice(leftIndex+1,rightIndex).map(t=>t.text||'').join('');
  // Punctuation does not determine the metre. A strong written pause is left
  // explicitly uncertain instead of imposing an automatic spoken pause.
  return {kind:'inside',strong:/[.!?;:—–()«»]/u.test(separator),separator};
}
function onset(token){
  if(token.h==='ambiguous'||token.lower?.startsWith('h')&&!['muet','aspire'].includes(token.h))return 'unknown';
  if(token.h==='aspire')return 'consonant';
  if(token.h==='muet'&&/^[aɑeɛəioɔuyøœjwɥ]/u.test(key(token.ipa)))return 'vowel';
  return contextInternals.onsetAllowsLiaison(token)?'vowel':'consonant';
}
function ending(token,ps,posttonicJe=false){
  const w=lower(token.lower||token.text),last=ps.at(-1);
  // These monosyllables contain a grammatical nucleus, not the post-tonic e
  // targeted by the verse-final rule. In particular an imperative le remains
  // syllabic. Postposed je after inversion is the documented exception.
  if(GRAMMATICAL_SCHWA.has(w)&&!(w==='je'&&posttonicJe))return null;
  const verbal=token.posHint==='verb'||token.contextGrammar?.pos==='VER'||token.pos?.includes('VER')&&!token.pos?.includes('NOM')&&!token.pos?.includes('ADJ');
  if(/aient$|oient$/u.test(w))return null;
  const blocked=/es$/u.test(w)?'es':/ent$/u.test(w)&&verbal?'ent':null;
  if(!blocked&&!/e$/u.test(w))return null;
  if(!last)return null;
  const ePosition=w.length-(blocked==='ent'?3:blocked==='es'?2:1);
  let offset=0;
  // An e that belongs to a fully pronounced vowel (les, des, Cervantes…)
  // is not a caduc e. Existing grapheme evidence wins over its spelling.
  for(const segment of token.segments||[]){
    const length=lower(segment.text).length;
    if(offset<=ePosition&&offset+length>ePosition&&segment.phones?.some(p=>isVowel(p)&&p!=='ə'))return null;
    offset+=length;
  }
  // E after an already pronounced vowel has a different historical status.
  // Do not synthesize /ə/ in aimées, amies, vues, jouent, prient, etc.
  if(isVowel(last)&&last!=='ə')return {kind:'postvocalic',blocked};
  if(last==='ə'||!isVowel(last))return {kind:blocked?'blocked':'free',blocked};
  return null;
}
function internalCitation(token,original){
  const skeleton=ps=>ps.filter(p=>p!=='ə').join('');
  const eligible=(ps)=>ps.every((p,i)=>p!=='ə'||i===ps.length-1||i>0&&!isVowel(ps[i-1])&&!isVowel(ps[i+1]));
  const candidates=(token.alternatives||[]).map(clean).filter(ps=>skeleton(ps)===skeleton(original)&&eligible(ps));
  const count=ps=>ps.slice(0,-1).filter(p=>p==='ə').length;
  const chosen=candidates.filter(ps=>count(ps)>count(original)).sort((a,b)=>count(b)-count(a))[0];
  return chosen?{ps:chosen,reason:'Schwa intérieur conservé dans une variante lexicale attestée.'}:{ps:original,reason:null};
}
function hiatusVariants(token,ps){
  const match=HIATUS.find(([pattern])=>pattern.test(lower(token.lower||token.text)));
  if(!match)return [];
  const glide=match[1],vowel=VOWEL_GLIDE[glide],out=[];
  const found=ps.findIndex((p,i)=>p===glide&&isVowel(ps[i+1]||''));
  if(found>=0){
    const dia=[...ps];
    if(dia[found-1]===vowel)dia.splice(found,1);else dia.splice(found,1,vowel);
    out.push({ps:dia,label:'Diérèse',reason:'Lecture en deux noyaux vocaliques documentée pour cette famille.'});
  }
  for(let i=0;i<ps.length-1;i++)if(ps[i]===vowel&&isVowel(ps[i+1])){
    const syn=[...ps];syn.splice(i,1,glide);
    out.push({ps:syn,label:'Synérèse',reason:'Lecture contractée de la séquence vocalique, proposée explicitement.'});break;
  }
  return out;
}
function caducReading(ps,end,edge,right){
  if(!end)return {ps:[...ps],rule:null,warning:null};
  const result=[...ps],last=result.at(-1);
  if(end.kind==='postvocalic'){
    const problematic=edge.kind!=='end'&&(end.blocked||right!=='vowel');
    return {ps:result,rule:null,warning:problematic?'Finale avec e postvocalique : construction historiquement contrainte en vers classique ; aucun schwa artificiel ajouté.':null};
  }
  if(edge.kind==='end'){
    if(last==='ə'){result.pop();return {ps:result,rule:'E caduc final non réalisé à la fin du vers.',warning:null};}
    return {ps:result,rule:null,warning:null};
  }
  if(right==='unknown')return {ps:result,rule:null,warning:'Statut de l’initiale suivante incertain : traitement du e caduc laissé en suspens.'};
  const retain=end.kind==='blocked'||right==='consonant';
  if(retain){
    if(last!=='ə')result.push('ə');
    return {ps:result,rule:end.kind==='blocked'?'E caduc entravé en -es/-ent conservé à l’intérieur du vers.':'E caduc conservé devant une initiale consonantique ou disjonctive.',warning:edge.strong?'La ponctuation forte peut modifier la diction ; la lecture continue proposée demande vérification.':null};
  }
  if(last==='ə')result.pop();
  return {ps:result,rule:'E caduc libre élidé devant une initiale vocalique ou un h muet.',warning:edge.strong?'La ponctuation forte peut modifier la diction ; l’élision proposée demande vérification.':null};
}
function finish(ipa,liaison){return syllabify(ipa)+(liaison?.realized&&liaison.phone?'.'+liaison.phone+'‿':'');}

export function applyPoeticReading(baseResult,{choices={}}={}){
  const result=clone(baseResult);
  result.reading={...poetryPolicy,sources:SOURCES.map(s=>({...s}))};
  for(let li=0;li<result.lines.length;li++){
    const line=result.lines[li],indices=line.tokens.flatMap((t,i)=>t.type==='word'?[i]:[]);
    line.poetry={policy:poetryPolicy.id,rules:[],ambiguities:[],notes:['Lecture classique : aucun mètre, césure ou schéma de rimes n’est imposé.']};
    for(let wi=0;wi<indices.length;wi++){
      const ti=indices[wi],token=line.tokens[ti],original=token.ipa;
      token.poetryAlternatives=[];token.poetryHypothesis=false;
      if(token.source==='number'||token.expanded||!/[\p{L}]/u.test(token.text))continue;
      const initial=stem(token),citation=internalCitation(token,initial),edge=boundary(line,ti,indices[wi+1]),right=edge.kind==='end'?null:onset(line.tokens[indices[wi+1]]);
      const prior=line.tokens[ti-2];
      const posttonicJe=token.lower==='je'&&/^[-‐‑]$/u.test(line.tokens[ti-1]?.text||'')&&prior?.type==='word'&&(prior.posHint==='verb'||prior.pos?.includes('VER')||prior.pos?.includes('AUX'));
      const end=ending(token,citation.ps,posttonicJe),reading=caducReading(citation.ps,end,edge,right);
      const liaison=token.liaison?{...token.liaison}:null;
      // A strictly classical e entravé before a vowel has its own documented
      // junction. This rule does not turn all optional prose liaisons on.
      if(end?.kind==='blocked'&&edge.kind==='inside'&&right==='vowel'&&/^[\t \u00a0\u202f]+$/u.test(edge.separator||'')){
        token.liaison={phone:end.blocked==='es'?'z':'t',kind:'obligatoire',realized:true,reason:'Jonction classique après e caduc entravé en -es/-ent.',poetic:true};
        if(line.tokens[ti+1]?.type==='separator'&&/^[\t \u00a0\u202f]+$/u.test(line.tokens[ti+1].text))line.tokens[ti+1].displayPhonetic='';
      }else if(liaison)token.liaison=liaison;
      const candidates=[{ps:reading.ps,label:'Lecture proposée',reason:reading.rule||'Prononciation de base conservée.'},...hiatusVariants(token,citation.ps).map(v=>({...v,ps:caducReading(v.ps,ending(token,v.ps,posttonicJe),edge,right).ps}))];
      const unique=new Map();for(const candidate of candidates){const ipa=finish(candidate.ps.join(''),token.liaison);if(!unique.has(key(ipa)))unique.set(key(ipa),{ipa,label:candidate.label,reason:candidate.reason});}
      const options=[...unique.values()];let selected=options[0];
      const choice=choices?.[li]?.[ti];
      if(choice!==undefined){selected=options.find(o=>key(o.ipa)===key(choice));if(!selected)throw new RangeError('Variante poétique non proposée pour « '+token.text+' ».');}
      token.ipa=selected.ipa;token.displayPhonetic=token.ipa;
      const reasons=[citation.reason,reading.rule,reading.warning,options.length>1?'Diérèse/synérèse à choisir selon l’œuvre, l’époque et la lecture.':null].filter(Boolean);
      token.poetryReason=reasons.join(' ');
      token.poetryChanged=key(original)!==key(token.ipa);
      token.poetryHypothesis=Boolean(reading.warning||options.length>1||citation.reason);
      if(options.length>1){
        token.poetryAlternatives=options;
        line.poetry.ambiguities.push({tokenIndex:ti,word:token.text,reason:'Plusieurs lectures de la séquence vocalique sont possibles ; aucun compte métrique ne décide à votre place.',options,selected:token.ipa,explicit:choice!==undefined});
      }
      if(reading.warning)line.poetry.ambiguities.push({tokenIndex:ti,word:token.text,reason:reading.warning,options:[],selected:token.ipa,explicit:false});
      if(token.poetryChanged||reading.rule||citation.reason)line.poetry.rules.push({tokenIndex:ti,word:token.text,rule:token.poetryReason,before:original,after:token.ipa});
      if(token.poetryReason)token.notes=[...(token.notes||[]),'Lecture poétique : '+token.poetryReason];
      token.phonemes=parts(token.ipa);
      token.segments=align(token.text,clean(token.ipa).join(''));
      token.alignmentCertain=token.segments.every(s=>!s.uncertain);
    }
    line.ipa=line.tokens.map(t=>t.type==='word'?t.displayPhonetic:t.displayPhonetic===undefined?t.text:t.displayPhonetic).join('');
    line.notes=[...(line.notes||[]),...line.poetry.ambiguities.map(a=>'« '+a.word+' » : '+a.reason)];
  }
  const words=result.lines.flatMap(l=>l.tokens.filter(t=>t.type==='word'));
  result.stats={...result.stats,ambiguous:words.filter(t=>t.confidence==='ambiguous'||t.poetryHypothesis).length,unaligned:words.filter(t=>!t.alignmentCertain).length,poeticHypotheses:words.filter(t=>t.poetryHypothesis).length};
  return result;
}
