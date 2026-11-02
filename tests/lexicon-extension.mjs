import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {LEXICON_B64,LEXICON_STATS} from '../src/lexicon-data.js';
import * as old from '../data/before-glaff/lexicon-data.js';
import {loadLexicon,lookup} from '../src/lexicon.js';
import {align} from '../src/alignment.js';
await loadLexicon();
function* records(encoded,size){
 const text=zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8');let offset=0,row=0,word='';
 while(offset<text.length){const end=text.indexOf('\n',offset);if(end<0)break;const line=text.slice(offset,end);offset=end+1;if(!line)continue;
  if(row++%size===0)word='';const pipe=line.indexOf('|'),tab=line.indexOf('\t');
  word=word.slice(0,parseInt(line.slice(0,pipe),36))+line.slice(pipe+1,tab);yield {word,body:line.slice(tab+1)};
 }
}
const baseline=records(old.LEXICON_B64,old.LEXICON_STATS.blockSize);let previous=baseline.next(),preserved=0,added=0;
for(const current of records(LEXICON_B64,LEXICON_STATS.blockSize)){
 if(!previous.done&&current.word===previous.value.word){assert.equal(current.body,previous.value.body,current.word+' modified baseline record');preserved++;previous=baseline.next();}
 else {assert.ok(previous.done||current.word<previous.value.word,current.word+' missing original word');assert.equal(current.body.split('\t')[4],'G');added++;}
}
assert.equal(previous.done,true);assert.equal(preserved,old.LEXICON_STATS.lexicalEntries);
assert.equal(added,LEXICON_STATS.extension.addedEntries);assert.equal(preserved+added,LEXICON_STATS.lexicalEntries);
const additions=new URL('../data/glaff-additions.jsonl',import.meta.url),bytes=fs.readFileSync(additions);let checked=0;
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),LEXICON_STATS.extension.additionsSha256);
for(const line of bytes.toString('utf8').trim().split('\n')){
 const entry=JSON.parse(line),record=lookup(entry.word);
 assert.equal(record.reference,'GLÀFF 1.2.2');assert.ok(record.pos.length);
 assert.ok(entry.readings.some(r=>r.ipa.replace(/\./gu,'')===record.ipa.replace(/\./gu,'')));
 assert.equal(align(entry.word,record.ipa).some(s=>s.uncertain),false,entry.word);checked++;
}
const report={baselineRecordsUnchanged:preserved,added,checked,failed:0,purpose:'Exhaustive data integrity, source membership and orthographic alignment. This is not independent certification of the imported pronunciations.'};
fs.writeFileSync(new URL('../validation/lexicon-extension.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
