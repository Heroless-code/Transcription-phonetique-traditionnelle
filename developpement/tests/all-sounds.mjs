import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
import {analyzeLine,analyzeSonorities} from '../src/sonorities.js';
import {applyPoeticReading} from '../src/poetry.js';
await initialize();
const report={purpose:'Complete per-verse inventory includes isolated phones while repetition detection retains its two-occurrence threshold.',passed:0,failed:0,failures:[]};
const check=(name,fn)=>{try{fn();report.passed++;}catch(error){report.failed++;report.failures.push({name,error:error.message});}};
const groups=a=>[...a.soundGroups.alliterations,...a.soundGroups.assonances];
for(const text of ['sac','eau','sac sac','abracadabra','l’élément','21 21','Un brin brun.','Pour qui sont ces serpents qui sifflent sur vos têtes ?','La lune brille.','plourimètre','élève élève'.normalize('NFD'),'oui oui loin'])check('complete exact inventory: '+text,()=>{
  const line=applyPoeticReading(transcribe(text)).lines[0],before=JSON.stringify(line),a=analyzeLine(line),all=groups(a);
  assert.equal(JSON.stringify(line),before);assert.equal(all.reduce((n,g)=>n+g.count,0),a.occurrences.length);
  assert.equal(all.length,new Set(a.occurrences.map(o=>o.phone)).size);
  for(const g of all){
    assert.equal(g.singleton,g.count===1);assert.equal(g.repeated,g.count>=2);
    if(g.singleton){assert.equal(g.wordCount,1);assert.equal(g.internalOnly,false);assert.equal(g.prominent,false);}
    for(const value of Object.values(g.metrics))assert.ok(Number.isFinite(value));
  }
  for(const kind of ['alliterations','assonances']){
    assert.deepEqual(a.groups[kind],a.soundGroups[kind].filter(g=>g.repeated));
    const firstSingle=a.soundGroups[kind].findIndex(g=>g.singleton);
    if(firstSingle>=0)assert.ok(a.soundGroups[kind].slice(firstSingle).every(g=>g.singleton));
  }
});
check('separate verses never turn isolated sounds into repetitions',()=>{
  const a=analyzeSonorities(applyPoeticReading(transcribe('sac\n\nsac')));
  for(const i of [0,2]){assert.equal(groups(a.lines[i]).length,3);assert.ok(groups(a.lines[i]).every(g=>g.count===1));assert.equal(a.lines[i].groups.alliterations.length,0);assert.equal(a.lines[i].groups.assonances.length,0);}
  assert.equal(groups(a.lines[1]).length,0);assert.equal(a.stats.alliterations,0);assert.equal(a.stats.assonances,0);
});
check('an inventory with a single phone has finite zero-distance metrics',()=>{
  const a=analyzeLine({original:'eau',ipa:'o',tokens:[{type:'word',text:'eau',ipa:'o',segments:[{text:'eau',phones:['o']}],confidence:'lexical'}]});
  const g=groups(a)[0];assert.equal(g.count,1);assert.equal(g.metrics.averageGap,0);assert.equal(g.metrics.proximity,0);assert.equal(g.metrics.spread,0);assert.ok(Number.isFinite(g.rankScore));
});
fs.writeFileSync(new URL('../validation/all-sounds.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
