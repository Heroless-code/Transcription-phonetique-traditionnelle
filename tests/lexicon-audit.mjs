import assert from 'node:assert/strict';
import zlib from 'node:zlib';
import {loadLexicon,lookup,lexiconStats} from '../src/lexicon.js';
import {LEXICON_B64,LEXICON_HEADS} from '../src/lexicon-data.js';

const started=performance.now();
await loadLexicon();
const loadMs=performance.now()-started;
const text=zlib.gunzipSync(Buffer.from(LEXICON_B64,'base64')).toString('utf8');
let checked=0,word='',index=0;
// Independent sequential decoder checks every block head and spread interior rows.
for(const line of text.split('\n')) {
  if(!line)continue;
  if(index%lexiconStats.blockSize===0)word='';
  const pipe=line.indexOf('|'),tab=line.indexOf('\t',pipe+1),second=line.indexOf('\t',tab+1);
  word=word.slice(0,parseInt(line.slice(0,pipe),36))+line.slice(pipe+1,tab);
  if(index%lexiconStats.blockSize===0 || index%997===0 || index===lexiconStats.lexicalEntries-1){
    const record=lookup(word);
    assert.ok(record,word);
    assert.equal(record.ipa,line.slice(tab+1,second).split('~')[0],word);
    checked++;
  }
  index++;
}
assert.equal(index,lexiconStats.lexicalEntries);
assert.equal(LEXICON_HEADS.length,lexiconStats.blockCount);
assert.equal(lookup('zzzzmotinexistantfictifzzzz'),null);
assert.equal(lookup('Paris').ipa,lookup('paris').ipa);
const reference={tache:'taʃ','tâche':'tɑːʃ',mettre:'mɛtʁ','maître':'mɛːtʁ',brin:'bʁɛ̃',brun:'bʁœ̃',jeune:'ʒœn','jeûne':'ʒøːn','hôte':'oːt',vent:'vɑ̃',soudent:'sud',eau:'o',femme:'fam','œuf':'œf',nuit:'nɥi'};
for(const [word,ipa] of Object.entries(reference))assert.equal(lookup(word).ipa,ipa,word);
assert.equal(lookup('haricot').h,'aspire');
assert.equal(lookup('homme').h,'muet');
console.log(JSON.stringify({integrityRows:checked,referenceWords:Object.keys(reference).length,entries:index,loadMs:Math.round(loadMs),gzipBytes:lexiconStats.gzipBytes},null,2));
