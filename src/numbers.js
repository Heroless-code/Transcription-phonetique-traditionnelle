const SMALL=['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
const TENS={20:'vingt',30:'trente',40:'quarante',50:'cinquante',60:'soixante'};
import {syllabify} from './phonology.js';
import {nounGender} from './lexicon.js';
export function numberWords(text) {
  const digits=text.replace(/[\u202f\u00a0 ]/g,'');
  if(!/^\d+(?:[,.]\d+)?$/u.test(digits))return null;
  if(digits.length>15||/^0\d/u.test(digits))return [...digits].map(c=>SMALL[+c]||'virgule').join(' ');
  function n(v){
    if(v<17)return SMALL[v];if(v<20)return 'dix '+n(v-10);
    if(v<70){const t=Math.floor(v/10)*10,r=v%10;return TENS[t]+(r===1?' et un':r?' '+n(r):'');}
    if(v<80)return 'soixante '+(v===71?'et ':'')+n(v-60);
    if(v<100)return 'quatre vingt'+(v===80?'s':' '+n(v-80));
    if(v<1000){const a=Math.floor(v/100),r=v%100;return (a>1?n(a)+' ':'')+'cent'+(a>1&&!r?'s':'')+(r?' '+n(r):'');}
    for(const [scale,label]of [[1e12,'billion'],[1e9,'milliard'],[1e6,'million'],[1000,'mille']])if(v>=scale){const a=Math.floor(v/scale),r=v%scale;return (scale===1000&&a===1?'':n(a)+' ')+label+(a>1&&scale>1000?'s':'')+(r?' '+n(r):'');}
    return '';
  }
  const [whole,frac]=digits.split(/[,.]/);return n(Number(whole))+(frac?' virgule '+[...frac].map(x=>SMALL[+x]).join(' '):'');
}

const NUMBER_IPA={zéro:'zeʁo',un:'œ̃',une:'yn',deux:'dø',trois:'tʁwɑ',quatre:'katʁ',cinq:'sɛ̃k',six:'sis',sept:'sɛt',huit:'ɥit',neuf:'nœf',dix:'dis',onze:'ɔ̃z',douze:'duz',treize:'tʁɛz',quatorze:'katɔʁz',quinze:'kɛ̃z',seize:'sɛz',vingt:'vɛ̃',vingts:'vɛ̃',trente:'tʁɑ̃t',quarante:'kaʁɑ̃t',cinquante:'sɛ̃kɑ̃t',soixante:'swasɑ̃t',cent:'sɑ̃',cents:'sɑ̃',mille:'mil',milles:'mil',million:'miljɔ̃',millions:'miljɔ̃',milliard:'miljaʁ',milliards:'miljaʁ',billion:'biljɔ̃',billions:'biljɔ̃',et:'e'};
const UNITS=new Set(['un','une','deux','trois','quatre','cinq','six','sept','huit','neuf']);
const NOT_NOUN=new Set(['à','a','au','aux','avec','après','avant','chez','dans','de','du','des','et','en','mais','ou','où','par','pour','sans','selon','sous','sur','vers','aussi','ici','là','ailleurs','encore','environ','arrivent','arrive']);
// These nouns license an identifier, but do not prove that it is present.
// A recipient (« à cette classe 21 tulipes ») precedes a cardinal instead.
const NUMERIC_LABELS=new Set('page pages ligne lignes chapitre chapitres leçon leçons exercice exercices question questions numéro numéros figure figures tableau tableaux tome tomes volume volumes acte actes scène scènes article articles paragraphe paragraphes section sections annexe annexes classe classes case cases chambre chambres porte portes route routes borne bornes sortie sorties année années'.split(' '));
const RECIPIENT_PREPOSITIONS=new Set(['à','au','aux','pour']);
const NOUN_PHRASE_DETERMINERS=new Set('le la les un une des ce cet cette ces mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs chaque'.split(' '));
const cleanIPA=ipa=>String(ipa||'').replace(/[.‿\s]/gu,'');
function numericParts(token){
  if(token?.type!=='word')return null;
  const parts=String(token.lower||token.text).toLocaleLowerCase('fr').split(/[-‐‑\s]+/u).filter(Boolean);
  return parts.length&&parts.every(w=>Object.hasOwn(NUMBER_IPA,w))?parts:null;
}
function nominalNumberComplement(token){
  if(!token||NOT_NOUN.has(token.lower)||token.posHint==='verb')return false;
  if(token.pos?.includes('NOM')||token.pos?.includes('ADJ'))return true;
  if(token.pos?.length)return false;
  return token.source==='rules'||token.source==='morphology';
}
function numericVowel(token){
  if(!token||token.h==='aspire'||token.h==='ambiguous'||/^(?:huit|onze|oui|yaourt|yacht|whisk|watt)/u.test(token.lower))return false;
  if(token.lower.startsWith('h')&&token.h!=='muet')return false;
  const p=cleanIPA(token.ipa);
  return /^[aɑeɛəioɔuyøœ]/u.test(p)||/^[jwɥ]/u.test(p)&&/^(?:yeux|oise|ouat|huil|huîtr|huitr)/u.test(token.lower);
}
function numberLink(phone,reason,realized=true){return{phone,kind:realized?'obligatoire':'interdite',realized,reason,numberContext:true};}
function feminineNumericHead(tokens,indices,end,separator){
  for(let wi=end;wi<Math.min(end+4,indices.length);wi++){
    if(wi>end&&!/^[\t \u00a0\u202f]+$/u.test(separator(indices[wi-1],indices[wi])))return null;
    const token=tokens[indices[wi]],next=wi+1<indices.length?tokens[indices[wi+1]]:null;
    // An adjective can precede the head. A noun/adjective homograph is skipped
    // only with positive evidence for another nominal head to its right.
    const nextContiguous=next&&/^[\t \u00a0\u202f]+$/u.test(separator(indices[wi],indices[wi+1]));
    if(token.pos?.includes('ADJ')&&nextContiguous&&(next.pos?.includes('NOM')||next.pos?.includes('ADJ')))continue;
    return nominalNumberComplement(token)&&nounGender(token.lower)==='f'?token:null;
  }
  return null;
}

function postposedNumberRole(tokens,indices,first,head,separator){
  const adjacent=(a,b)=>/^[\t \u00a0\u202f]*$/u.test(separator(indices[a],indices[b]));
  const prior=first>0?tokens[indices[first-1]]:null;
  if(!prior||!adjacent(first-1,first)||!NUMERIC_LABELS.has(prior.lower)||prior.posHint==='verb')return 'cardinal';
  // An adjective after the number can describe its label: page 21 blanche.
  // A separate nominal quantity is positive evidence only when its head is
  // a noun, rather than another noun/adjective homograph such as blanche.
  if(!head||!head.pos?.includes('NOM')||head.pos.includes('ADJ'))return 'identifier';
  let prep=-1;
  for(let j=first-2;j>=Math.max(0,first-6);j--){
    if(!adjacent(j,j+1))break;
    const t=tokens[indices[j]];
    if(RECIPIENT_PREPOSITIONS.has(t.lower)){prep=j;break;}
    if(!NOUN_PHRASE_DETERMINERS.has(t.lower)&&!t.pos?.includes('ADJ'))break;
  }
  if(prep>=0)for(let j=prep-1;j>=Math.max(0,prep-9);j--){
    if(!adjacent(j,j+1))break;
    const t=tokens[indices[j]];
    if(['et','ou','mais','car','que','qui','dont','où'].includes(t.lower))break;
    if(t.posHint==='verb'||t.pos?.includes('VER')&&!t.pos.includes('NOM'))return 'cardinal';
  }
  // In a fragment such as « classe 21 petites fleurs », both attachments
  // remain possible. Keep the identifier reading but expose that uncertainty.
  return 'ambiguous';
}

/** Cardinal composition and the productive consonant alternations of numbers.
 * Grammar/word analysis has already run. Only fully numeric spellings enter
 * a run; punctuation always ends it. A hyphenated lexical number may remain
 * one original token: its virtual constituents are kept inside that token.
 */
export function applyNumberContext(tokens){
  const wordIndices=tokens.flatMap((t,i)=>t.type==='word'?[i]:[]);
  const separator=(a,b)=>tokens.slice(a+1,b).map(t=>t.text||'').join('');
  for(let wi=0;wi<wordIndices.length;){
    const first=wi,parts=numericParts(tokens[wordIndices[wi]]);
    if(!parts||parts.every(w=>w==='et')){wi++;continue;}
    const atoms=[];let end=wi;
    for(;end<wordIndices.length;end++){
      const index=wordIndices[end],token=tokens[index],p=numericParts(token);
      if(!p||end>first&&!/^[\t \u00a0\u202f‐‑-]*$/u.test(separator(wordIndices[end-1],index)))break;
      if(p.length===1&&p[0]==='et'){
        const following=end+1<wordIndices.length?numericParts(tokens[wordIndices[end+1]]):null;
        if(!atoms.length||!following)break;
      }
      for(const word of p)atoms.push({word,host:index,body:NUMBER_IPA[word],link:null});
    }
    wi=end;
    if(!atoms.length)continue;
    const nextIndex=end<wordIndices.length?wordIndices[end]:null;
    const external=nextIndex!==null&&/^[\t \u00a0\u202f]+$/u.test(separator(wordIndices[end-1],nextIndex))?tokens[nextIndex]:null;
    const nominal=nominalNumberComplement(external),vowel=numericVowel(external);
    const finalAtom=atoms[atoms.length-1],finalToken=tokens[finalAtom.host];
    const genderHead=finalAtom.word==='un'&&finalToken.source==='number'&&external?feminineNumericHead(tokens,wordIndices,end,separator):null;
    const numericRole=postposedNumberRole(tokens,wordIndices,first,genderHead,separator);
    const feminine=numericRole==='cardinal'?genderHead:null;
    if(feminine){finalAtom.word='une';finalAtom.body='yn';finalAtom.link=null;}
    for(let i=0;i<atoms.length;i++){
      const a=atoms[i],previous=atoms[i-1],next=atoms[i+1],word=a.word;
      if(word==='quatre'&&next&&/^vingts?$/u.test(next.word))a.body='katʁə';
      if(/^vingts?$/u.test(word)){
        const multiplied=previous?.word==='quatre';
        if(next){
          if(!multiplied&&next.word==='et'&&['un','une'].includes(atoms[i+2]?.word))a.link=numberLink('t','Composition de vingt et un.');
          else if(!multiplied&&UNITS.has(next.word)){
            if(next.word==='huit')a.link=numberLink('t','Le t de vingt se réalise dans vingt-huit.');
            else a.body='vɛ̃t';
          }else a.link=numberLink('t','Pas de t après vingt multiplié ou devant un autre groupe numérique.',false);
        }else if(nominal&&vowel)a.link=numberLink(multiplied||word==='vingts'?'z':'t','Déterminant numéral devant un nom vocalique.');
        else a.link=numberLink('t','Vingt isolé ou devant une consonne : t muet.',false);
      }
      if(word==='cent'||word==='cents'){
        if(next)a.link=numberLink('t','Pas de liaison entre cent et un autre numéral.',false);
        else if(nominal&&vowel)a.link=numberLink(word==='cents'?'z':'t','Cent déterminant devant un nom vocalique.');
      }
      if(word==='dix'&&next&&['huit','neuf'].includes(next.word)){
        if(next.word==='huit'){a.body='di';a.link=numberLink('z','Composition de dix-huit.');}
        else a.body='diz';
      }
      if(next&&['six','dix'].includes(word)&&(['cent','cents','mille','milles','million','millions','milliard','milliards','billion','billions'].includes(next.word)||word==='dix'&&next.word==='sept'))a.body=word==='six'?'si':'di';
      if(!next&&['six','dix'].includes(word)){
        const stem=word==='six'?'si':'di';
        if(nominal){a.body=stem;if(vowel)a.link=numberLink('z','Six ou dix déterminant devant une voyelle.');}
        else a.body=stem+'s';
      }
      if(word==='huit'){
        if(next||nominal&&!vowel)a.body='ɥi';
        else if(nominal&&vowel){a.body='ɥi';a.link=numberLink('t','Huit déterminant devant une voyelle.');}
      }
      if(!next&&word==='un'&&nominal&&vowel)a.link=numberLink('n','Un dans un cardinal déterminant devant une voyelle.');
      if(!next&&['deux','trois'].includes(word)&&nominal&&vowel)a.link=numberLink('z','Déterminant numéral devant une voyelle.');
      if(!next&&word==='neuf'&&external&&['an','ans','heure','heures'].includes(external.lower)){a.body='nœ';a.link=numberLink('v','Neuf devant ans ou heures.');}
      if(!next&&['millions','milliards','billions'].includes(word)&&nominal&&vowel)a.link=numberLink('z','Nom numéral pluriel devant son complément vocalique.');
    }
    const hosts=[...new Set(atoms.map(a=>a.host))];
    for(const host of hosts){
      const token=tokens[host],own=atoms.filter(a=>a.host===host);let output='';
      for(let i=0;i<own.length;i++){
        const a=own[i];output+=syllabify(a.body);
        if(i+1<own.length)output+=a.link?.realized?'.'+a.link.phone+'‿':' ';
      }
      token.ipa=output;token.numberContext={rule:'composition des cardinaux',parts:own.map(a=>a.word),role:numericRole,...(feminine&&host===finalAtom.host?{gender:'f',genderHead:feminine.text,genderReference:'Lexique 4.1'}:{})};
      if(numericRole==='ambiguous'){
        token.confidence='ambiguous';
        const message='Nombre postposé : numéro ou cardinal déterminant ; lecture du numéro retenue faute de rattachement syntaxique certain.';
        if(!token.notes.includes(message))token.notes.push(message);
      }
      if(own.length>1||token.source==='number')token.expanded=own.map(a=>a.word).join(' ');
      if(feminine&&token.source==='number')token.notes=token.notes.map(n=>n.startsWith('Nombre lu :')?'Nombre lu : '+token.expanded+'.':n);
      const final=own[own.length-1];
      if(final.link)token.liaison=final.link;
      else if(token.liaison?.realized)delete token.liaison;
      // A compound internal liaison may consume a written hyphen, just like
      // a cross-word liaison. Non-liaison hyphens carry no IPA value either.
      const nextHost=hosts[hosts.indexOf(host)+1];
      if(nextHost!==undefined)for(let j=host+1;j<nextHost;j++)if(tokens[j].type==='separator'&&/^[-‐‑]$/u.test(tokens[j].text))tokens[j].displayPhonetic=' ';
    }
  }
  return tokens;
}
