import fs from 'node:fs';
import {initialize,transcribe} from '../src/engine.js';
import fixtures from './numeric-fixtures.js';
await initialize();
const clean=ipa=>ipa.normalize('NFD').replace(/[.‿\s\-\/]/gu,'');
const cases=fixtures.map(([text,expected])=>{
  const output=transcribe(text).lines[0].ipa;
  return {text,expected,output,pass:clean(output)===clean(expected)};
});
const report={method:'Post-fix regression. Initial43 and additional scale-composition outputs are preserved separately; these cases no longer constitute an independent evaluation.',summary:{probes:cases.length,passed:cases.filter(c=>c.pass).length,failed:cases.filter(c=>!c.pass).length},cases};
fs.writeFileSync(new URL('../validation/numeric-gold-regression.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({summary:report.summary,failures:cases.filter(c=>!c.pass)},null,2));
if(report.summary.failed)process.exitCode=1;
