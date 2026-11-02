import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
/** Load a staged generated lexicon without touching the working application. */
export async function loadAuditLexicon(staged=false){
  if(!staged)return import('../src/lexicon.js');
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const data=pathToFileURL(path.join(root,'src/lexicon-data-anchored.js')).href;
  const gender=pathToFileURL(path.join(root,'src/gender-data.js')).href;
  const source=fs.readFileSync(path.join(root,'src/lexicon.js'),'utf8').replace("'./lexicon-data.js'",JSON.stringify(data)).replace("'./gender-data.js'",JSON.stringify(gender));
  return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
