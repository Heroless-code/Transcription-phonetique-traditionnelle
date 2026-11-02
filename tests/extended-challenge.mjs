import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {initialize,transcribe} from '../src/engine.js';
import {challengeWords,challengeSentences} from './extended-challenge-fixtures.js';
await initialize();
const normalize=p=>p.replace(/[.ː‿]/gu,'');
const report={method:'Targeted lexical and syntactic challenge fixed before inspecting output; not a representative accuracy benchmark.',cases:[]};
const stem=t=>{let p=normalize(t?.ipa||'');if(t?.liaison?.realized)p=p.slice(0,-t.liaison.phone.length);return p;};
for(const f of challengeWords){const line=transcribe(f.word).lines[0];report.cases.push({type:'word',text:f.word,output:line.ipa,expected:f.ipa,pass:f.ipa.includes(normalize(line.ipa))});}
for(const f of challengeSentences){
 const line=transcribe(f.text).lines[0],words=line.tokens.filter(t=>t.type==='word');
 for(const [word,i,expected] of [...Object.entries(f.words||{}).map(([w,p])=>[w,0,p]),...(f.at||[])]){
  const actual=stem(words.filter(t=>t.lower===word)[i]);
  report.cases.push({type:'context',text:f.text,word,index:i,output:line.ipa,expected,actual,pass:actual===expected});
 }
 for(const [left,right,expected]of f.liaisons||[]){
  const token=words.find((t,i)=>t.lower===left&&words[i+1]?.lower===right);
  const actual=Boolean(token?.liaison?.realized);
  report.cases.push({type:'liaison',text:f.text,left,right,output:line.ipa,expected,actual,pass:Boolean(token)&&actual===expected});
 }
}
report.passed=report.cases.filter(c=>c.pass).length;report.failed=report.cases.length-report.passed;
const initial=new URL('../validation/extended-challenge-initial.json',import.meta.url);
if(process.argv.includes('--initial')){assert.ok(!fs.existsSync(initial),'Initial campaign already recorded.');fs.writeFileSync(initial,JSON.stringify(report,null,2)+'\n');}
else{report.initialSha256=crypto.createHash('sha256').update(fs.readFileSync(initial)).digest('hex');fs.writeFileSync(new URL('../validation/extended-challenge-regression.json',import.meta.url),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:report.cases.filter(c=>!c.pass)},null,2));
if(report.failed)process.exitCode=1;
