import fs from 'node:fs';
import crypto from 'node:crypto';
import {initialize,transcribe} from '../src/engine.js';
const first=process.argv.includes('--first');
const initialName=first?'context-holdout-review.json':'context-deep-holdout-initial.json';
const initialPath=new URL('../validation/'+initialName,import.meta.url);
const bytes=fs.readFileSync(initialPath),initial=JSON.parse(bytes);
const initialHash=crypto.createHash('sha256').update(bytes).digest('hex');
await initialize();
const report={method:'Post-fix regression of preregistered contextual challenge sentences. Their initial result is preserved and must not be replaced by this fitted rerun.',initialReport:initialName,initialReportSha256:initialHash,cases:[]};
for(const c of initial.cases){
  const r=transcribe(c.text),tokens=r.lines[0].tokens.filter(t=>t.type==='word');
  const item={id:c.id,text:c.text,initialOutput:c.output,output:r.lines[0].ipa,probes:[]};
  const check=(word,index,expected)=>{
    const token=tokens.filter(t=>t.lower===word)[index];
    let actual=token?.ipa.replace(/[.‿]/gu,'');
    if(token?.liaison?.realized)actual=actual.slice(0,-token.liaison.phone.length);
    item.probes.push({type:'word',word,index,expected,actual,pass:actual===expected});
  };
  for(const [word,expected] of Object.entries(c.words||{}))check(word,0,expected);
  for(const [word,index,expected] of c.wordsAt||[])check(word,index,expected);
  for(const [left,right,expected] of c.liaison||[]){
    const index=tokens.findIndex((t,i)=>t.lower===left&&tokens[i+1]?.lower===right);
    const actual=Boolean(tokens[index]?.liaison?.realized);
    item.probes.push({type:'liaison',left,right,expected,actual,pass:actual===expected});
  }
  report.cases.push(item);
}
const probes=report.cases.flatMap(c=>c.probes);
report.summary={sentences:report.cases.length,probes:probes.length,passed:probes.filter(p=>p.pass).length,failed:probes.filter(p=>!p.pass).length};
report.initialReportUnchanged=crypto.createHash('sha256').update(fs.readFileSync(initialPath)).digest('hex')===initialHash;
fs.writeFileSync(new URL('../validation/'+(first?'context-first-holdout-regression.json':'context-deep-holdout-regression.json'),import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({summary:report.summary,initialReportUnchanged:report.initialReportUnchanged,failures:report.cases.filter(c=>c.probes.some(p=>!p.pass))},null,2));
if(report.summary.failed||!report.initialReportUnchanged)process.exitCode=1;
