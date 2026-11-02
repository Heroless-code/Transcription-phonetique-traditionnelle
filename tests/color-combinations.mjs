import fs from 'node:fs';
import assert from 'node:assert/strict';
import {composeColors,styleForPhone,contrastRatio,mixColors} from './legacy/color-model-v1.mjs';
const report={purpose:'All eight option masks, independent layers, perceptual mixes and text contrast. These are representation checks, not linguistic accuracy scores.',passed:0,failed:0,failures:[],minimumContrast:100};
function check(label,fn){try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({label,error:e.message});}}
const inventory=['a','ɑ','e','ɛ','ə','i','y','u','o','ɔ','ø','œ','ɑ̃','ɔ̃','ɛ̃','œ̃','ɑː','ɛː','p','b','t','d','k','ɡ','f','v','s','z','ʃ','ʒ','m','n','ɲ','ŋ','l','ʁ','j','w','ɥ'];
const opts=mask=>({enabled:true,vowel:Boolean(mask&1),consonant:Boolean(mask&2),nasal:Boolean(mask&4)});
for(let mask=0;mask<8;mask++)for(const phone of inventory)check(`${mask} /${phone}/`,()=>{
 const o=opts(mask),actual=composeColors([phone],o),base=styleForPhone(phone);
 const expectedActive=base.category==='nasal'?(o.vowel||o.nasal):o[base.category];
 assert.equal(actual.active,expectedActive);
 if(!expectedActive)return;
 assert.equal(actual.nasal,base.category==='nasal'&&o.nasal);
 const ratio=contrastRatio(actual.color,actual.background);report.minimumContrast=Math.min(report.minimumContrast,ratio);assert.ok(ratio>=4.5);
 if(base.category==='nasal'&&o.vowel)assert.equal(actual.color,base.color,'La couleur de famille reste exacte.');
 if(base.category==='nasal'&&!o.vowel)assert.equal(actual.color,'#885724','Nasalisation seule : teinte commune indépendante du timbre.');
});
for(let mask=0;mask<8;mask++)for(let i=0;i<inventory.length;i++)for(let j=0;j<inventory.length;j++)check(`shared ${mask} ${i},${j}`,()=>{
 const o=opts(mask),phones=[inventory[i],inventory[j]],result=composeColors(phones,o);
 const reverse=composeColors([...phones].reverse(),o);
 assert.equal(result.active,reverse.active);if(!result.active)return;
 assert.equal(result.color,reverse.color);assert.equal(result.background,reverse.background);
 const ratio=contrastRatio(result.color,result.background);report.minimumContrast=Math.min(report.minimumContrast,ratio);assert.ok(ratio>=4.5);
 for(const layer of result.layers)assert.ok(o[layer],'Une option décochée ne contribue pas à la combinaison.');
});
check('vowel/nasal composition differs from each isolated layer',()=>{
 const vowel=composeColors(['ɑ̃'],opts(1)),nasal=composeColors(['ɑ̃'],opts(4)),both=composeColors(['ɑ̃'],opts(5));
 assert.notDeepEqual(both,vowel);assert.notDeepEqual(both,nasal);
 assert.deepEqual(both.layers,['vowel','nasal']);assert.equal(both.color,'#000000');assert.equal(both.nasal,true);
});
check('one shared graph can combine all three layers',()=>{
 const all=composeColors(['j','ɛ̃'],opts(7));
 assert.equal(all.shared,true);assert.deepEqual(new Set(all.layers),new Set(['vowel','consonant','nasal']));
 assert.notEqual(all.color,composeColors(['j','ɛ̃'],opts(3)).color);
 assert.notEqual(all.background,composeColors(['j','ɛ̃'],opts(3)).background);
});
check('master disabled and silent graph have no phonetic color',()=>{
 assert.equal(composeColors(['ɑ̃'],{...opts(7),enabled:false}).active,false);
 assert.equal(composeColors([],opts(7)).active,false);
});
check('primary chromatic requirements',()=>{
 for(const[p,c]of [['a','#000000'],['e','#ffffff'],['i','#b51e32'],['u','#126535'],['o','#174bb3']])assert.equal(composeColors([p],opts(7)).color,c);
});
report.minimumContrast=+report.minimumContrast.toFixed(3);
fs.writeFileSync(new URL('../validation/color-combinations.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
