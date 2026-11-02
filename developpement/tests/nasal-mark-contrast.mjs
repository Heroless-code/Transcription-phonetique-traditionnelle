import fs from 'node:fs';
import assert from 'node:assert/strict';
import {composeColors} from './legacy/color-model-v1.mjs';
// Independent sRGB contrast calculation, applied to the finished hexadecimal colors.
const lum=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const inventory=['a','ɑ','e','ɛ','ə','i','y','u','o','ɔ','ø','œ','ɑ̃','ɔ̃','ɛ̃','œ̃','p','b','t','d','k','ɡ','f','v','s','z','ʃ','ʒ','m','n','ɲ','ŋ','l','ʁ','j','w','ɥ','h','ʔ'];
const groups=inventory.map(p=>[p]);
for(const nasal of ['ɑ̃','ɔ̃','ɛ̃','œ̃'])for(const other of inventory){groups.push([other,nasal],[other,'j',nasal]);}
const report={purpose:'Independent contrast of adaptive nasal accents against their explicit painted background, all eight selections, single vowels and shared graphs.',passed:0,failed:0,failures:[],minimumText:100,minimumAccent:100};
for(let mask=0;mask<8;mask++)for(const group of groups){
 try{
  const result=composeColors(group,{enabled:true,vowel:Boolean(mask&1),consonant:Boolean(mask&2),nasal:Boolean(mask&4)});
  if(result.active){
   const text=ratio(result.color,result.background);report.minimumText=Math.min(report.minimumText,text);assert.ok(text>=4.8,'Text contrast margin');
   if(result.nasal){const accent=ratio(result.nasalAccent,result.background);report.minimumAccent=Math.min(report.minimumAccent,accent);assert.ok(accent>=3.2,'Nasal accent contrast');}
   else assert.equal(result.nasalAccent,null);
   if(!(mask&4))assert.equal(result.nasal,false);
  }
  report.passed++;
 }catch(e){report.failed++;report.failures.push({mask,group,error:e.message});}
}
fs.writeFileSync(new URL('../validation/nasal-mark-contrast.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
