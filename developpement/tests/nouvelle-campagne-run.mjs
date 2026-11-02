import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {initialize,transcribe} from '../src/engine.js';
import {wordProbes,contextualProbes,liaisonProbes,numericProbes} from './nouvelle-campagne-fixtures.js';
await initialize();
const normalize=p=>p.normalize('NFD').replace(/[.ː‿\s,;:!?\-—()/]/gu,'');
const wordStem=t=>{let result=normalize(t?.ipa||'');if(t?.liaison?.realized)result=result.slice(0,-t.liaison.phone.length);return result;};
const cases=[];
for(const f of wordProbes){const line=transcribe(f.word).lines[0];const actual=normalize(line.ipa);cases.push({type:f.category,text:f.word,expected:f.ipa,actual,output:line.ipa,passed:f.ipa.includes(actual)});}
for(const f of contextualProbes){const line=transcribe(f.text).lines[0],token=line.tokens.find(t=>t.type==='word'&&t.lower===f.word),actual=wordStem(token),expected=Array.isArray(f.ipa)?f.ipa:[f.ipa];cases.push({type:'context',...f,actual,output:line.ipa,token,passed:expected.includes(actual)});}
for(const [text,left,right,expected] of liaisonProbes){const line=transcribe(text).lines[0],words=line.tokens.filter(t=>t.type==='word'),token=words.find((t,i)=>t.lower===left&&words[i+1]?.lower===right),actual=Boolean(token?.liaison?.realized);cases.push({type:'liaison',text,left,right,expected,actual,output:line.ipa,decision:token?.liaison,passed:Boolean(token)&&actual===expected});}
for(const [text,expected] of numericProbes){const line=transcribe(text).lines[0],actual=normalize(line.ipa);cases.push({type:'numeric',text,expected,actual,output:line.ipa,passed:actual===expected});}
const report={method:'Preregistered targeted linguistic probes before inspecting engine output. Not a random or frequency-weighted benchmark.',fixtureSha256:crypto.createHash('sha256').update(fs.readFileSync(new URL('./nouvelle-campagne-fixtures.js',import.meta.url))).digest('hex'),cases,summary:{total:cases.length,passed:cases.filter(c=>c.passed).length,failed:cases.filter(c=>!c.passed).length}};
const initial=new URL('../validation/nouvelle-campagne-initial.json',import.meta.url);
if(process.argv.includes('--initial')){assert.ok(!fs.existsSync(initial),'Do not replace initial evidence.');fs.writeFileSync(initial,JSON.stringify(report,null,2)+'\n');}
else{report.initialSha256=crypto.createHash('sha256').update(fs.readFileSync(initial)).digest('hex');fs.writeFileSync(new URL('../validation/nouvelle-campagne-regression.json',import.meta.url),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({summary:report.summary,failures:cases.filter(c=>!c.passed).map(({token,...c})=>c)},null,2));
if(report.summary.failed)process.exitCode=1;
