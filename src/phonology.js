/** Traditional inventory. Length belongs to the vowel; nasal marks are not nuclei. */
export const VOWELS = new Set(['a','ɑ','e','ɛ','ə','i','o','ɔ','u','y','ø','œ','ɑ̃','ɔ̃','ɛ̃','œ̃']);
export const GLIDES = new Set(['j','w','ɥ']);
export function phones(ipa) {
  return (ipa.normalize('NFD').match(/[aɑeɛəioɔuyøœ](?:\u0303)?[ː]?|[bdfɡgklmnɲŋpʁrsʃtvzʒjwɥhʔ]|[.‿]/gu) || []).map(p=>p==='g'?'ɡ':p==='r'?'ʁ':p);
}
export function isVowel(p) { return VOWELS.has(p.replace(/ː/g,'')); }
const ONSETS = new Set(['pʁ','bʁ','tʁ','dʁ','kʁ','ɡʁ','fʁ','vʁ','pl','bl','kl','ɡl','fl']);
/** Maximal onset within a word, conservatively restricted to French clusters. */
export function syllabify(ipa) {
  const ps = phones(ipa).filter(p=>p!=='.' && p!=='‿');
  const nuclei=[];
  ps.forEach((p,i)=>{if(isVowel(p))nuclei.push(i);});
  const boundaries=new Set();
  for(let n=1;n<nuclei.length;n++) {
    const a=nuclei[n-1],b=nuclei[n];
    if(b===a+1){boundaries.add(b);continue;}
    let start=b;
    while(start>a+1&&GLIDES.has(ps[start-1]))start--;
    if(start>a+1)start--;
    if(start>a+1&&ONSETS.has(ps[start-1]+ps[start]))start--;
    boundaries.add(start);
  }
  return ps.map((p,i)=>(boundaries.has(i)?'.':'')+p).join('');
}
