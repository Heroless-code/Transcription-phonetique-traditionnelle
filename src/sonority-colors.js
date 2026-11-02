import {VOWELS} from './phonology.js';
import {contrastRatio,mixColors} from './color-math.js';

// Frequent sounds are interleaved so neighbouring entries have distant hues.
// An exact phone keeps its own style across verses, modes and reading choices.
export const SONORITY_PHONES=Object.freeze([
  's','ə','ʁ','a','l','e','t','ɛ','n','i','d','ɑ̃','k','ɔ̃','m','ɔ',
  'p','u','f','y','v','o','ʃ','ɛ̃','z','œ','b','ø','ʒ','ɑ','ɡ','œ̃',
  'j','w','ɥ','ɲ','ŋ','h','ʔ',
  ...[...VOWELS].map(p=>p+'ː')
]);
function hexHsl(h,s,l){
  s/=100;l/=100;
  const a=s*Math.min(l,1-l),channel=n=>{
    const k=(n+h/30)%12;
    return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');
  };
  return '#'+channel(0)+channel(8)+channel(4);
}
const styles=new Map(SONORITY_PHONES.map((phone,index)=>{
  const hue=(215+index*137.507764)%360;
  const saturation=38+(index%3)*8;
  const background=hexHsl(hue,saturation,89-(index%3)*2);
  let lightness=30,ink=hexHsl(hue,saturation,lightness);
  while(contrastRatio(ink,background)<5&&lightness>10)ink=hexHsl(hue,saturation,--lightness);
  const accent=hexHsl(hue,saturation,42);
  return [phone,Object.freeze({background,ink,accent})];
}));
const singleStyles=new Map([...styles].map(([phone,style])=>[phone,Object.freeze({
  background:mixColors([style.background,'#f6f7f5'],[1,2]),
  ink:mixColors([style.ink,'#657174'],[1,1]),
  accent:mixColors([style.accent,'#a7b1aa'],[1,2])
})]));
export function sonorityStyle(phone,{single=false}={}){
  const normalized=String(phone).normalize('NFD').replace(/g/gu,'ɡ').replace(/r/gu,'ʁ');
  return (single?singleStyles:styles).get(normalized)||null;
}

/** Shared graphemes retain a band per exact repeated sound, never a fake phone. */
export function applySonorityStyle(node,phones,{singlePhones=[]}={}){
  const unique=[...new Set(phones.map(p=>p.normalize('NFD')))];
  const singles=new Set(singlePhones.map(p=>p.normalize('NFD')));
  const palette=unique.map(phone=>sonorityStyle(phone,{single:singles.has(phone)})).filter(Boolean);
  if(!palette.length)return;
  node.style.setProperty('--sonority-background',palette[0].background);
  node.style.setProperty('--sonority-ink',palette[0].ink);
  node.style.setProperty('--sonority-accent',palette[0].accent);
  if(palette.length>1){
    node.style.setProperty('--sonority-ink','#41494b');
    const bands=palette.flatMap((color,i)=>[color.background+' '+i/palette.length*100+'%',color.background+' '+(i+1)/palette.length*100+'%']);
    node.style.setProperty('--sonority-bands','linear-gradient(to bottom,'+bands.join(',')+')');
  }else node.style.removeProperty('--sonority-bands');
}
