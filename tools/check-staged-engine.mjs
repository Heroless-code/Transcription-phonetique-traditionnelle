/** Run existing regression checks against staged data without replacing the app. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stage=path.join(root,'tests/reference-anchor-stage');
fs.mkdirSync(path.join(stage,'src'),{recursive:true});
for(const entry of fs.readdirSync(path.join(root,'src'))){
  if(!entry.endsWith('.js')||entry.startsWith('lexicon-data'))continue;
  fs.copyFileSync(path.join(root,'src',entry),path.join(stage,'src',entry));
}
fs.writeFileSync(path.join(stage,'src/lexicon-data.js'),`export * from ${JSON.stringify(pathToFileURL(path.join(root,'src/lexicon-data-anchored.js')).href)};\n`);
const morphology=process.argv.includes('--morphology');
let script=fs.readFileSync(path.join(root,'tests',morphology?'source-morphology-audit.mjs':'run.mjs'),'utf8');
script=script.replace(/'\.\.\/src\//gu,"'./src/").replace(/from '\.\/(?!src\/)/gu,"from '../");
script=script.replace(/const root=path\.resolve\(path\.dirname\(fileURLToPath\(import\.meta\.url\)\),'\.\.'\);/u,'const root='+JSON.stringify(root)+';');
script=script.replace('validation/engine-report.json','validation/engine-report-reference-anchor-staged.json');
if(morphology)script=script.replace("const stage=process.argv[2]||'regression';","const stage='family-staged';");
const file=path.join(stage,morphology?'morphology.mjs':'run.mjs');
fs.writeFileSync(file,script);
await import(pathToFileURL(file).href);
