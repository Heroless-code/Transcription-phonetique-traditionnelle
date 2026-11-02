import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const commands=[
 ['tests/run.mjs'],
 ['tests/deep-campaign.mjs'],
 ['tests/run-context-deep.mjs'],
 ['tests/run-context-deep.mjs','--first'],
 ['tests/source-morphology-audit.mjs'],
 ['tests/productive-morphology.mjs'],
 ['tests/lexicon-audit.mjs'],
 ['tests/lexique-anchor-audit.mjs'],
 ['tests/alignment-audit.mjs'],
 ['tests/extended-challenge.mjs'],
 ['tests/lexicon-extension.mjs'],
 ['tests/context-refinement-regression.mjs'],
 ['tests/nouvelle-campagne-run.mjs'],
 ['tests/nouvelle-campagne-guards.mjs'],
 ['tests/review-seven-fixes.mjs'],
 ['tests/review-context-fixes.mjs'],
 ['tests/review-number-fixes.mjs'],
 ['tests/review-rules-fixes.mjs'],
 ['tests/review-spelling-fixes.mjs'],
 ['tests/sonorities.mjs'],
 ['tests/poetry.mjs'],
 ['tests/sonorities-final-guards.mjs'],
 ['tests/poetry-final-guards.mjs'],
 ['tests/sonority-palette.mjs'],
 ['tests/all-sounds.mjs']
];
const report={checks:[],failed:0};
for(const args of commands){
  const start=performance.now(),result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:10*1024*1024});
  const ok=result.status===0&&!result.error;
  report.checks.push({command:'node '+args.join(' '),passed:ok,elapsedMs:Math.round(performance.now()-start),...(ok?{}:{error:String(result.error||result.stderr||result.stdout)})});
  console.log((ok?'PASS ':'FAIL ')+args.join(' '));
  if(!ok){report.failed++;console.error((result.stderr||result.stdout||'').slice(0,4000));}
}
fs.writeFileSync(path.join(root,'validation/all-suites.json'),JSON.stringify(report,null,2)+'\n');
if(report.failed)process.exitCode=1;
