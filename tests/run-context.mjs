import fs from 'node:fs';
import {initialize, transcribe} from '../src/engine.js';
import fixtures from './context-fixtures.js';

await initialize();
const fails=[];
let count=0;
for (const fixture of fixtures) {
  const result=transcribe(fixture.text);
  const tokens=result.lines[0].tokens.filter(t=>t.type==='word');
  const clean=token=>{
    let ipa=token.ipa.replace(/[.‿]/gu,'');
    if (token.liaison?.realized) ipa=ipa.slice(0,-token.liaison.phone.length);
    return ipa;
  };
  for (const [word,ipa] of Object.entries(fixture.words||{})) {
    count++;
    const token=tokens.find(t=>t.lower===word);
    if (!token||clean(token)!==ipa) fails.push({text:fixture.text,word,got:token&&clean(token),expect:ipa,ipa:result.lines[0].ipa});
  }
  for (const [word,index,ipa] of fixture.wordsAt||[]) {
    count++;
    const token=tokens.filter(t=>t.lower===word)[index];
    if (!token||clean(token)!==ipa) fails.push({text:fixture.text,word,index,got:token&&clean(token),expect:ipa});
  }
  for (const [left,right,kind,phone,realized] of fixture.liaison||[]) {
    count++;
    const index=tokens.findIndex((t,i)=>t.lower===left&&tokens[i+1]?.lower===right);
    const actual=tokens[index]?.liaison;
    if (!actual||actual.kind!==kind||actual.realized!==realized||phone&&actual.phone!==phone) fails.push({text:fixture.text,left,right,expect:{kind,phone,realized},got:actual});
  }
  for (const word of fixture.ambiguous||[]) {
    count++;
    const token=tokens.find(t=>t.lower===word);
    if (token?.confidence!=='ambiguous') fails.push({text:fixture.text,word,expect:'ambiguous',got:token?.confidence});
  }
}
const report={fixtures:fixtures.length,assertions:count,failed:fails.length,fails};
fs.writeFileSync(new URL('./context-diagnostic.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if (fails.length) process.exitCode=1;
