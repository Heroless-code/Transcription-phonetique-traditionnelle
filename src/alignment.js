import {phones} from './phonology.js';

/* Alignment is constrained by graph/phone pairs, not by letter colors.
   Unresolved spans remain neutral. Several phones may share a grapheme. */
const GRAPHS={
  eau:['o'],au:['o','ɔ'],ai:['ɛ','e','ə'],aî:['ɛ'],ei:['ɛ','e'],eî:['ɛ'],
  ain:['ɛ̃'],aim:['ɛ̃'],ein:['ɛ̃'],eim:['ɛ̃'],oin:['wɛ̃'],ien:['jɛ̃','ijɛ̃'],
  an:['ɑ̃','an','ɑn'],am:['ɑ̃','am'],en:['ɑ̃','ɑ̃n','ɛ̃','ɛn','ən','an','in'],em:['ɑ̃','ɛm','əm'],
  on:['ɔ̃','ɔn','ən','ə'],om:['ɔ̃','ɔm'],in:['ɛ̃','in'],im:['ɛ̃','im'],ïn:['ɛ̃','in'],ïm:['ɛ̃','im'],un:['œ̃','yn','œ̃n','œn'],um:['œ̃','ɔm','ym'],
  yn:['ɛ̃','in'],ym:['ɛ̃','im'],ent:[''],aient:['ɛ'],er:['e','ɛʁ','əʁ'],ez:['e'],et:['ɛ','e'],
  eu:['ø','œ','y'],œu:['œ','ø'],oeu:['œ','ø'],œ:['œ','e','ø'],oe:['œ','e','ø'],
  ou:['u','w'],oû:['u','w'],oi:['wa','wɑ','ɔ'],oî:['wa','wɑ'],oy:['waj','wɑj'],ay:['ɛj','ej'],oo:['u','ɔ','o','ɔɔ','oo'],aoû:['u','au'],aon:['ɑ̃'],
  uë:['y'],uï:['ɥi','yi'],üi:['ɥi','yi'],ueil:['œj'],ueill:['œj'],
  ill:['j','ij','il'],il:['j','il'],ll:['l','j'],gn:['ɲ','ɡn'],ng:['ŋ','nɡ'],
  ch:['ʃ','k'],chs:['ʃ','ks'],sch:['ʃ','sk'],sh:['ʃ'],ph:['f'],th:['t'],rh:['ʁ'],
  qu:['k','kw'],cqu:['k'],gu:['ɡ','ɡw'],ge:['ʒ'],cc:['k','ks'],ck:['k'],xc:['ks'],sc:['s','sk'],
  ti:['sj','si','tj','ti'],ss:['s'],bb:['b'],dd:['d'],ff:['f'],gg:['ɡ'],kk:['k'],mm:['m'],nn:['n'],pp:['p'],rr:['ʁ'],tt:['t'],zz:['z','dz','ts'],
  a:['a','ɑ','ɛ'],à:['a','ɑ'],â:['ɑ','a'],ä:['a'],e:['ə','ɛ','e','a',''],é:['e','ɛ'],è:['ɛ','e'],ê:['ɛ'],ë:['ə','ɛ','e'],
  i:['i','j','ij'],î:['i'],ï:['i','j'],y:['i','j','ij'],ÿ:['i'],o:['o','ɔ','u'],ô:['o','ɔ'],ö:['ɔ','o'],
  u:['y','ɥ','w','u','œ'],ù:['y'],û:['y'],ü:['y','ɥ'],æ:['e','ɛ'],
  b:['b','p'],c:['k','s','ɡ'],ç:['s'],d:['d','t'],f:['f','v'],g:['ɡ','ʒ'],h:['','h'],j:['ʒ','dʒ'],k:['k'],l:['l'],m:['m'],n:['n'],p:['p'],q:['k'],r:['ʁ'],s:['s','z'],t:['t','s'],v:['v'],w:['w','v'],x:['ks','ɡz','s','z'],z:['z','s'],"'":[''], '-':['']
};
const SPLIT_CACHE=new Map();
function canonical(ipa){return phones(ipa).filter(p=>p!=='.'&&p!=='‿').map(p=>p.replace(/ː/g,''));}
function mappings(graph){if(!SPLIT_CACHE.has(graph))SPLIT_CACHE.set(graph,(GRAPHS[graph]||[]).map(canonical));return SPLIT_CACHE.get(graph);}
function same(a,b,offset){return a.every((p,k)=>b[offset+k]===p);}
function silentCost(w,i,len){
  const s=w.slice(i,i+len),end=i+len===w.length;
  if(s==='h'||s==="'"||s==='-')return .12;
  if(end&&/^(?:e|es|s|x|z|t|d|p|g|ts|ds|ps|gs|nt|ent)$/u.test(s))return .14;
  // A caduc e may be absent in the chosen pronunciation. This only aligns
  // an already omitted schwa; it never removes a vowel from the transcription.
  if(s==='e'&&i>0&&/[bcdfghjklmnpqrstvwxzç]/u.test(w[i+len]||''))return .45;
  if(/^[bcdfgklmnprstz]$/u.test(s)&&w[i+len]===s)return .2;
  if(w==='fils'&&s==='l')return .2;
  if(/^(?:œufs|oeufs|bœufs|boeufs|nerfs|cerfs)$/u.test(w)&&s==='f')return .15;
  if(w==='automne'&&s==='m')return .2;
  if(s==='p'&&(w.slice(i-3,i+2)==='compt'||w.slice(i-4,i+2)==='sculpt'||w.slice(i-2,i+2)==='bapt'||w.slice(i-2,i+2)==='sept'))return .2;
  if(w==='sculpteur'&&s==='p')return .2;
  return 3;
}

/** Keep source offsets when a base plus combining accents becomes one NFC
 * letter. Interior positions in a combining sequence are not valid cuts.
 * Unusual cross-cluster compositions remain opaque instead of losing text. */
function spellingOffsets(word,canonical) {
  if(word===canonical&&!/\p{M}/u.test(word))return null;
  const offsets=[0];let normalized='',sourceOffset=0;
  for(const match of word.matchAll(/\P{M}\p{M}*|\p{M}+/gu)){
    const part=match[0].normalize('NFC'),start=normalized.length;
    normalized+=part;sourceOffset+=match[0].length;
    for(let i=start+1;i<normalized.length;i++)offsets[i]=null;
    offsets[normalized.length]=sourceOffset;
  }
  return normalized===canonical?offsets:false;
}

export function align(word,ipa) {
  const canonicalWord=word.normalize('NFC'),w=canonicalWord.toLocaleLowerCase('fr').replace(/[’ʼ]/g,"'");
  const target=phones(ipa).filter(p=>p!=='.'&&p!=='‿');const normalized=target.map(p=>p.replace(/ː/g,''));
  const offsets=spellingOffsets(word,canonicalWord);
  if(w.length>160||target.length>160||offsets===false||w.length!==canonicalWord.length)return [{text:word,phones:target,silent:false,uncertain:true}];
  const sourcePosition=i=>offsets?offsets[i]:i;
  const width=target.length+1,total=(w.length+1)*width,dp=new Float64Array(total);dp.fill(Infinity);dp[0]=0;
  const back=new Array(total);
  function relax(i,j,ni,nj,cost,uncertain=false){
    if(sourcePosition(i)==null||sourcePosition(ni)==null)return;
    const from=i*width+j,to=ni*width+nj,v=dp[from]+cost;
    if(v<dp[to]){dp[to]=v;back[to]={i,j,ni,nj,uncertain};}
  }
  for(let i=0;i<=w.length;i++)for(let j=0;j<=target.length;j++){
    if(!Number.isFinite(dp[i*width+j]))continue;
    if(i<w.length){
      for(let len=1;len<=Math.min(5,w.length-i);len++){
        const graph=w.slice(i,i+len);
        for(const mapped of mappings(graph))if(j+mapped.length<=target.length&&same(mapped,normalized,j)){
          const cost=mapped.length? .12 + .01*len:silentCost(w,i,len);
          relax(i,j,i+len,j+mapped.length,cost,cost>=3);
        }
        const silent=silentCost(w,i,len);
        if(silent<3)relax(i,j,i+len,j,silent);
      }
      // Last-resort opaque evidence. Never color this inferred association.
      for(let len=1;len<=Math.min(3,w.length-i);len++){
        if(j<target.length)relax(i,j,i+len,j+1,4+len*.1,true);
      }
      relax(i,j,i+1,j,4,true);
    }
    if(j<target.length)relax(i,j,i,j+1,5,true);
  }
  let i=w.length,j=target.length;const segments=[];
  while(i||j){const b=back[i*width+j];if(!b)return [{text:word,phones:target,silent:false,uncertain:true}];
    const start=sourcePosition(b.i),end=sourcePosition(b.ni);
    segments.push({text:word.slice(start,end),phones:target.slice(b.j,b.nj),silent:b.j===b.nj,uncertain:b.uncertain,start,end});i=b.i;j=b.j;
  }
  segments.reverse();
  // An epenthetic phone cannot be assigned arbitrarily to its neighbor.
  const unanchored=segments.some(s=>!s.text&&s.phones.length);
  if(unanchored)return [{text:word,phones:target,silent:false,uncertain:true}];
  return segments;
}
