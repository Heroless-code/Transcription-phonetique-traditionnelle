import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadAuditLexicon} from '../tools/load-audit-lexicon.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const staged=process.argv.includes('--staged');
const {loadLexicon,lookup,lexiconStats}=await loadAuditLexicon(staged);await loadLexicon();
const bare=p=>p.replace(/\./gu,'');
const expected={occuper:'ɔkype',occupent:'ɔkyp',occupons:'ɔkypɔ̃',documents:'dɔkymɑ̃',document:'dɔkymɑ̃',poser:'poze',posent:'poz',apporter:'apɔʁte',apportent:'apɔʁt',sonner:'sɔne',sonnent:'sɔn',appellent:'apɛl',jettent:'ʒɛt','achètent':'aʃɛt'};
for(const [word,ipa]of Object.entries(expected))assert.equal(bare(lookup(word)?.ipa||''),ipa,word);
// Citation consistency covers all contrasts, not blanket opening of /o/.
const plurals=[['transgression','transgressions'],['goal','goals'],['poney','poneys'],['perruquier','perruquiers'],['staphylocoque','staphylocoques'],['taco','tacos'],['grenaille','grenailles'],['gosier','gosiers'],['vaisselle','vaisselles'],['minerai','minerais'],['rainure','rainures'],['décompression','décompressions'],['télémétrie','télémétries'],['positon','positons'],['guillemet','guillemets'],['fleurette','fleurettes']];
const pairResults=[];
plurals.push(['aphorisme','aphorismes'],['coassement','coassements'],['grommellement','grommellements'],['godelureau','godelureaux'],['trottinement','trottinements'],['métabolisme','métabolismes'],['prolongement','prolongements']);
for(const [lemma,word]of plurals){const a=lookup(lemma),b=lookup(word);assert.ok(a&&b,word);assert.equal(bare(b.ipa),bare(a.ipa),word);const nominal=b.grammaticalReadings?.filter(r=>r.pos==='NOM')||[];for(const r of nominal)assert.equal(bare(r.ipa),bare(a.ipa),word+' NOM metadata');pairResults.push({lemma,word,ipa:b.ipa});}
const report={purpose:'Morphological-family consistency and regression only, not phonetic ground truth for all lemmas.',stage:staged?'staged':'promoted',specificChecks:Object.keys(expected).length,citationPluralPairs:pairResults.length,pairs:pairResults,stats:lexiconStats.referenceAnchor};
fs.writeFileSync(path.join(root,staged?'validation/family-consistency-staged.json':'validation/family-consistency-final.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
