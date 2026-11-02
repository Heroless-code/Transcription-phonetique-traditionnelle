/** Independent structural/contrast audit. It does not quantify aesthetic taste. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {composeColors,styleForPhone} from './legacy/color-model-v1.mjs';
import {phones} from '../src/phonology.js';
import {phonemeStyle} from './legacy/phoneme-style-v1.mjs';

const mode=process.argv.includes('--initial')?'initial':'current';
const report={purpose:'Additional independent audit: three-phone compositions, orthogonal option masks, Unicode, full recognized consonant inventory and accents. Taste remains a visual judgement.',sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(new URL('./legacy/color-model-v1.mjs',import.meta.url))).digest('hex'),passed:0,failed:0,failures:[],metrics:{minimumTextContrast:100},advisories:[]};
const options=mask=>({enabled:true,vowel:Boolean(mask&1),consonant:Boolean(mask&2),nasal:Boolean(mask&4)});
function check(label,fn){try{fn();report.passed++;}catch(e){report.failed++;if(report.failures.length<60)report.failures.push({label,error:e.message});}}
// Separate contrast implementation: no import of the production contrast function.
const luminance=hex=>{
 const c=hex.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(s=>s<=0.04045?s/12.92:Math.pow((s+0.055)/1.055,2.4));
 return .2126*c[0]+.7152*c[1]+.0722*c[2];
};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
check('contrast reference endpoints',()=>assert.equal(contrast('#000000','#ffffff'),21));
const reps=['a','e','i','y','o','œ','ɑ̃','ɛ̃','ɔ̃','œ̃','p','t','k','f','s','ʃ','m','l','ʁ','j'];
for(let mask=0;mask<8;mask++)for(const a of reps)for(const b of reps)for(const c of reps)check(`triple ${mask} ${a},${b},${c}`,()=>{
 const opts=options(mask),sequence=[a,b,c],actual=composeColors(sequence,opts);
 const expectedLayers=new Set();
 for(const phone of sequence){
  const category=phonemeStyle(phone).category;
  if(category==='nasal'){if(opts.vowel)expectedLayers.add('vowel');if(opts.nasal)expectedLayers.add('nasal');}
  else if(opts[category])expectedLayers.add(category);
 }
 assert.equal(actual.active,expectedLayers.size>0);
 if(!actual.active)return;
 assert.deepEqual(new Set(actual.layers),expectedLayers);
 const cr=contrast(actual.color,actual.background);report.metrics.minimumTextContrast=Math.min(report.metrics.minimumTextContrast,cr);assert.ok(cr>=4.5,`Independent text contrast ${cr}`);
 const rotated=composeColors([b,c,a],opts);
 assert.equal(rotated.color,actual.color,'Rotating sounds must not change mixed ink.');
 assert.equal(rotated.background,actual.background,'Rotating sounds must not change mixed background.');
 assert.equal(actual.nasal,opts.nasal&&sequence.some(p=>p.includes('\u0303')));
});
const inventory=['a','ɑ','e','ɛ','ə','i','y','u','o','ɔ','ø','œ','ɑ̃','ɔ̃','ɛ̃','œ̃','p','b','t','d','k','ɡ','f','v','s','z','ʃ','ʒ','m','n','ɲ','ŋ','l','ʁ','j','w','ɥ','h','ʔ'];
for(const phone of inventory)check('complete recognized inventory /'+phone+'/',()=>{
 assert.ok(phones(phone).includes(phone),'Phone actually belongs to engine inventory.');
 assert.equal(styleForPhone(phone).category,phonemeStyle(phone).category);
 assert.equal(composeColors([phone],options(7)).active,true);
});
for(const phone of ['ɑ̃','ɛ̃','ɔ̃','œ̃','ɑː','ɛː','ɡ'])for(let mask=0;mask<8;mask++)check(`Unicode canonical ${mask} ${phone}`,()=>{
 assert.deepEqual(composeColors([phone.normalize('NFC')],options(mask)),composeColors([phone.normalize('NFD')],options(mask)));
});
for(let mask=0;mask<8;mask++)for(const sequence of [[],['.'],['‿'],['.','‿'],['a','j','ɛ̃']])check(`master disabled ${mask} ${sequence.join('')}`,()=>{
 assert.equal(composeColors(sequence,{...options(mask),enabled:false}).active,false);
 if(sequence.every(p=>['.','‿'].includes(p)))assert.equal(composeColors(sequence,options(mask)).active,false);
});
const css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const fixedAccent=css.match(/\.sound-nasal\{[^}]*text-decoration-color:(#[a-f\d]{6})/i)?.[1]||'#c07a28';
report.metrics.nasalAccent=[];
for(const phone of ['ɑ̃','ɛ̃','ɔ̃','œ̃'])for(const mask of [4,5,6,7]){
 const style=composeColors([phone],options(mask));
 const accent=style.nasalAccent||style.accent||fixedAccent;
 const againstOwn=contrast(accent,style.background),againstPage=contrast(accent,'#f6f7f5');
 report.metrics.nasalAccent.push({phone,mask,accent,background:style.background,againstOwn:+againstOwn.toFixed(3),againstPage:+againstPage.toFixed(3)});
}
report.advisories.push('The initial fixed amber nasal underline has insufficient contrast against some chip backgrounds; confirm its exact geometry in a browser and either back it or adapt its shade to the substrate.');
report.advisories.push('Grey bands for deselected components intentionally have lower contrast; they must not contribute chromatic ink or be mistaken for selected sounds.');
report.metrics.minimumTextContrast=+report.metrics.minimumTextContrast.toFixed(6);
const output=new URL(`../validation/color-review-deep-${mode}.json`,import.meta.url);
if(mode==='initial')assert.equal(fs.existsSync(output),false,'Do not replace the initial audit.');
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:report.failures,metrics:report.metrics},null,2));
if(report.failed)process.exitCode=1;
