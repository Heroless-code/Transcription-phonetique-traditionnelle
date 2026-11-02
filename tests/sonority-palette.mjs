import fs from 'node:fs';
import assert from 'node:assert/strict';
import {SONORITY_PHONES,sonorityStyle,applySonorityStyle} from '../src/sonority-colors.js';
import {contrastRatio} from '../src/color-math.js';
const report={purpose:'Exact-phone tints: unique styles, contrast, Unicode, shared graphemes and separation from the color-family mode.',passed:0,failed:0,failures:[]};
const check=(name,fn)=>{try{fn();report.passed++;}catch(error){report.failed++;report.failures.push({name,error:error.message});}};
check('all supported exact phones have unique backgrounds and inks',()=>{
  assert.equal(new Set(SONORITY_PHONES).size,SONORITY_PHONES.length);
  assert.equal(new Set(SONORITY_PHONES.map(p=>sonorityStyle(p).background)).size,SONORITY_PHONES.length);
  assert.equal(new Set(SONORITY_PHONES.map(p=>sonorityStyle(p).ink)).size,SONORITY_PHONES.length);
});
for(const phone of SONORITY_PHONES)check('readable exact-phone tint /'+phone+'/',()=>{
  const s=sonorityStyle(phone);assert.ok(contrastRatio(s.ink,s.background)>=5);
  assert.ok(contrastRatio('#41494b',s.background)>=4.5);
  assert.ok(Object.isFrozen(s));assert.deepEqual(sonorityStyle(phone.normalize('NFC')),s);
});
for(const phone of SONORITY_PHONES)check('readable, lighter isolated-phone tint /'+phone+'/',()=>{
  const normal=sonorityStyle(phone),single=sonorityStyle(phone,{single:true});
  assert.ok(contrastRatio(single.ink,single.background)>=4.8);
  assert.ok(contrastRatio('#41494b',single.background)>=4.5);
  assert.notEqual(single.background,normal.background);assert.ok(Object.isFrozen(single));
  assert.deepEqual(single,sonorityStyle(phone.normalize('NFC'),{single:true}));
});
check('all isolated-phone backgrounds are distinct',()=>assert.equal(new Set(SONORITY_PHONES.map(p=>sonorityStyle(p,{single:true}).background)).size,SONORITY_PHONES.length));
for(const [a,b]of [['a','ɑ'],['e','ɛ'],['o','ɔ'],['ø','œ'],['ɛ̃','œ̃'],['ɛ','ɛː'],['j','i'],['w','u'],['ɥ','y'],['s','z']])check('distinct tints for /'+a+'/ and /'+b+'/',()=>assert.notEqual(sonorityStyle(a).background,sonorityStyle(b).background));
check('markers and unknown units are not assigned a fake sound tint',()=>{for(const mark of ['.','‿','̃','ː','xyz',''])assert.equal(sonorityStyle(mark),null);});
check('shared graph keeps exact unique phone bands and clears them for a single phone',()=>{
  const props=new Map(),node={style:{setProperty:(key,value)=>props.set(key,value),removeProperty:key=>props.delete(key)}};
  applySonorityStyle(node,['w','a','w']);const bands=props.get('--sonority-bands');
  assert.ok(bands.includes(sonorityStyle('w').background));assert.ok(bands.includes(sonorityStyle('a').background));
  assert.equal(props.get('--sonority-ink'),'#41494b');
  assert.equal((bands.match(/50%/gu)||[]).length,2);
  applySonorityStyle(node,['a']);assert.equal(props.has('--sonority-bands'),false);assert.equal(props.get('--sonority-background'),sonorityStyle('a').background);
});
check('shared grapheme combines an isolated and a repeated phone without losing either tint',()=>{
  const props=new Map(),node={style:{setProperty:(key,value)=>props.set(key,value),removeProperty:key=>props.delete(key)}};
  applySonorityStyle(node,['w','a'],{singlePhones:['w']});
  assert.ok(props.get('--sonority-bands').includes(sonorityStyle('w',{single:true}).background));
  assert.ok(props.get('--sonority-bands').includes(sonorityStyle('a').background));
  assert.equal(props.get('--sonority-ink'),'#41494b');
});
fs.writeFileSync(new URL('../validation/sonority-palette.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
