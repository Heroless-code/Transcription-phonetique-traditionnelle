import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadLexicon,lookup} from '../src/lexicon.js';
import {wordFixtures} from '../tests/phonetic-fixtures.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await loadLexicon();
const canonical=(p,strict)=>p.replace(/[.]/gu,'').replace(strict?/$^/u:/ː/gu,'');
const results=wordFixtures.map(f=>{
  const entry=lookup(f.word),expected=f.ipa.map(p=>canonical(p,f.strictLength));
  const match=p=>expected.includes(canonical(p,f.strictLength));
  return {word:f.word,category:f.category,expected:f.ipa,retained:!!entry,primary:entry?.ipa??null,alternatives:entry?.alternatives??[],primaryMatch:!!entry&&match(entry.ipa),candidateMatch:!!entry&&[entry.ipa,...entry.alternatives].some(match)};
});
const report={purpose:'Descriptive comparison of raw lexicon alone with the independently authored regression fixture list. Reviewed overrides and context are deliberately excluded. This is not a representative accuracy benchmark.',total:results.length,retained:results.filter(r=>r.retained).length,primaryMatches:results.filter(r=>r.primaryMatch).length,candidateMatches:results.filter(r=>r.candidateMatch).length,primaryDifferences:results.filter(r=>!r.primaryMatch),results};
fs.writeFileSync(path.join(root,'data/fixture-lexicon-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:report.total,retained:report.retained,primaryMatches:report.primaryMatches,candidateMatches:report.candidateMatches,primaryDifferences:report.primaryDifferences},null,2));
