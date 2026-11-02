import fs from 'node:fs';
import {initialize,transcribe,analyzeWord} from '../src/engine.js';
import {wordFixtures} from './phonetic-fixtures.js';
await initialize();
const norm=(x,length=false)=>x.replace(/[.\s]/gu,'').replace(length?/$^/u:/ː/gu,'');
const failures=[];
for(const f of wordFixtures){const r=transcribe(f.word),t=r.lines[0].tokens.find(t=>t.type==='word');if(!f.ipa.some(p=>norm(p,f.strictLength)===norm(r.lines[0].ipa,f.strictLength)))failures.push({word:f.word,expected:f.ipa,actual:r.lines[0].ipa,source:t.source,alternatives:t.alternatives});}
fs.mkdirSync(new URL('../validation/',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../validation/'+(process.argv[2]||'initial-word-diagnostic.json'),import.meta.url),JSON.stringify({total:wordFixtures.length,passed:wordFixtures.length-failures.length,failures},null,2));
console.log(JSON.stringify({total:wordFixtures.length,passed:wordFixtures.length-failures.length,failures},null,2));
for(const text of ['Les enfants jouent dans le jardin.','Ils soudent. Le vent souffle.','Les poules couvent au couvent.','Il est plus grand. Il en veut plus.','Un bon ami et un grand homme.','Cet enfant a neuf ans.','Les héros et les hommes.','Peut-on entrer ?','A-t-il une idée ?','Ils microzorbent les ploruchons.','2026 et 71,5'])console.log(text+' => /'+transcribe(text).lines[0].ipa+'/');
