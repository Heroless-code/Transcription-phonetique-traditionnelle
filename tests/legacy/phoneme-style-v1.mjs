import {isVowel} from '../../src/phonology.js';
export function phonemeStyle(phone) {
  const p=phone.replace(/ː/g,'');
  if(!p||p==='.'||p==='‿'||/\s/u.test(p))return {category:'mark',family:null};
  const base=p.replace(/\u0303/g,'');
  const family=/[aɑ]/u.test(base)?'A':/[eɛə]/u.test(base)?'E':/[øœ]/u.test(base)?'EU':base==='i'?'I':/[yu]/u.test(base)?'U':/[oɔ]/u.test(base)?'O':null;
  return {category:p.includes('\u0303')?'nasal':isVowel(p)?'vowel':'consonant',family};
}
