import fs from 'node:fs';
import assert from 'node:assert/strict';
import {initialize,transcribe} from '../src/engine.js';
import {phones,isVowel} from '../src/phonology.js';
import {applyPoeticReading,poetryPolicy} from '../src/poetry.js';
await initialize();
const report={purpose:'Assisted classical reading: sourced caduc-e rules, explicit hiatus choices, immutability and representation guards. Not a metre-identification or universal pronunciation benchmark.',passed:0,failed:0,failures:[]};
const check=(label,fn)=>{try{fn();report.passed++;}catch(e){report.failed++;report.failures.push({label,error:e.message});}};
const clean=p=>phones(p).filter(p=>p!=='.'&&p!=='‿').join('');
const word=(r,w)=>r.lines.flatMap(l=>l.tokens).find(t=>t.type==='word'&&t.lower===w);
const read=text=>applyPoeticReading(transcribe(text));
for(const [text,target,expected]of [
  ['La lune brille.','lune','lynə'],
  ['La lune arrive.','lune','lyn'],
  ['La lune honore la nuit.','lune','lyn'],
  ['La lune hante la nuit.','lune','lynə'],
  ['La bonne huile.','bonne','bɔn'],
  ['Une petite huitième.','petite','pətitə'],
  ['La lune.','lune','lyn'],
  ['La lune blanche.','lune','lynə'],
  ['La lune blanche.','blanche','blɑ̃ʃ'],
  ['Il chante encore.','chante','ʃɑ̃t'],
  ['Tu chantes encore.','chantes','ʃɑ̃təz'],
  ['Les enfants chantent un air.','chantent','ʃɑ̃tət'],
  ['Ils soudent le métal.','soudent','sudə'],
  ['Ils soudent.','soudent','sud'],
  ['Le couvent est là.','couvent','kuvɑ̃'],
  ['Le président arrive.','président','pʁezidɑ̃'],
  ['Ils avaient des amis.','avaient','avɛ'],
  ['Ils seraient des amis.','seraient','səʁɛ'],
  ['Les belles amies arrivent.','belles','bɛləz']
])check(text+' : '+target,()=>assert.equal(clean(word(read(text),target).ipa),expected));
for(const [text,target]of [
  ['Les amies viennent.','amies'],['Les aimées viennent.','aimées'],['Les vues changent.','vues'],
  ['Ils prient le ciel.','prient'],['Ils jouent le soir.','jouent'],['La vie continue.','vie']
])check('no invented postvocalic schwa: '+text,()=>{
  const before=word(transcribe(text),target),after=word(read(text),target);
  assert.equal(clean(after.ipa).replace(/[zt]$/u,''),clean(before.ipa).replace(/[zt]$/u,''));
  assert.ok(!phones(after.ipa).includes('ə'));assert.ok(after.poetryHypothesis);
  assert.ok(read(text).lines[0].poetry.ambiguities.some(a=>a.word===after.text&&a.reason.includes('postvocalique')));
});
for(const [text,target]of [['Les enfants.','les'],['Des enfants.','des'],['Mes amis.','mes'],['Ces amis.','ces'],['Tu es là.','es']])check('fully pronounced e is not caduc: '+text,()=>{
  const t=word(read(text),target);assert.equal(t.poetryHypothesis,false);assert.equal(t.poetryReason,'');
});
for(const [text,target]of [['Les amies.','amies'],['Les aimées.','aimées'],['Les vues.','vues']])check('postvocalic endings at rhyme are left intact: '+text,()=>assert.equal(word(read(text),target).poetryHypothesis,false));
check('Racine keeps five s and restores the internal -ent caduc',()=>{
  const line=read('Pour qui sont ces serpents qui sifflent sur vos têtes ?').lines[0];
  assert.equal(line.tokens.filter(t=>t.type==='word').flatMap(t=>phones(t.ipa)).filter(p=>p==='s').length,5);
  assert.equal(clean(word({lines:[line]},'sifflent').ipa),'siflə');
  assert.equal(line.tokens.filter(t=>t.type==='word').flatMap(t=>phones(t.ipa)).filter(isVowel).length,12);
});
check('Purnelle gold: entravé before vowel counts as an extra nucleus',()=>{
  const r=read('Les enfants chantent un air.');const t=word(r,'chantent');
  assert.equal(t.liaison.phone,'t');assert.equal(t.liaison.poetic,true);
  assert.equal(r.lines[0].tokens.filter(t=>t.type==='word').flatMap(t=>phones(t.ipa)).filter(isVowel).length,7);
});
for(const text of ['Le lion dort.','Ces liens sont forts.','Une diction claire.','Un miasme profond.','Une supérieure parle.','Il faut purifier.','Hier le jour.','Un nuage passe.','Une nuée passe.','La ruelle sombre.','Un duel commence.'])check('attested hiatus choices are explicit: '+text,()=>{
  const r=read(text),t=r.lines[0].tokens.find(t=>t.poetryAlternatives?.length>1);assert.ok(t,text);
  assert.ok(t.poetryHypothesis);assert.ok(t.poetryAlternatives.some(v=>v.label==='Diérèse'||v.label==='Synérèse'));
  assert.ok(t.poetryAlternatives.some(v=>v.ipa===t.ipa));
  const index=r.lines[0].tokens.indexOf(t),other=t.poetryAlternatives.find(v=>v.ipa!==t.ipa);
  const chosen=applyPoeticReading(transcribe(text),{choices:{0:{[index]:other.ipa}}});
  assert.equal(chosen.lines[0].tokens[index].ipa,other.ipa);assert.equal(chosen.lines[0].poetry.ambiguities.find(a=>a.tokenIndex===index).explicit,true);
});
check('both occurrences of lion can be chosen separately',()=>{
  const base=transcribe('Le lion dort, le lion dort.'),automatic=applyPoeticReading(base);
  const lions=automatic.lines[0].tokens.map((t,i)=>[t,i]).filter(([t])=>t.lower==='lion');
  const choices=Object.fromEntries(lions.map(([t,i])=>[i,t.poetryAlternatives.find(a=>a.label==='Diérèse').ipa]));
  const chosen=applyPoeticReading(base,{choices:{0:choices}});
  assert.equal(chosen.lines[0].tokens.flatMap(t=>phones(t.ipa||'')).filter(p=>p==='i').length,2);
  assert.equal(chosen.lines[0].tokens.flatMap(t=>phones(t.ipa||'')).filter(p=>p==='j').length,0);
  assert.equal(base.lines[0].tokens.flatMap(t=>phones(t.ipa||'')).filter(p=>p==='j').length,2);
});
check('no arbitrary user IPA injection',()=>assert.throws(()=>applyPoeticReading(transcribe('Le lion dort.'),{choices:{0:{2:'ʃɑ̃t'}}}),RangeError));
check('unlisted words are not contracted for a target metre',()=>{
  const base=transcribe('Une famille de millions de fleurs.'),r=applyPoeticReading(base);
  assert.ok(r.lines[0].tokens.every(t=>!t.poetryAlternatives?.length));assert.equal(r.reading.metre,'not-inferred');
});
check('strong written pause retains an uncertainty note',()=>{
  const r=read('La rose ! amie du jour.');assert.ok(word(r,'rose').poetryHypothesis);
  assert.ok(r.lines[0].poetry.ambiguities.some(a=>a.reason.includes('ponctuation forte')));
});
check('caduc does not cross a line or a blank stanza',()=>{
  const r=read('La lune\n\nBrille dans la nuit.');assert.equal(clean(word(r,'lune').ipa),'lyn');
  assert.equal(r.lines.length,3);assert.equal(r.lines[1].ipa,'');assert.equal(r.lines[1].original,'');
});
check('readings keep optional prose liaisons omitted outside the strict entravé rule',()=>{
  const b=transcribe('Ils sont arrivés. Les enfants arrivent aussi.'),r=applyPoeticReading(b);
  const bs=b.lines[0].tokens,rs=r.lines[0].tokens;
  for(let i=0;i<bs.length;i++)if(bs[i].liaison?.kind==='facultative'&&!rs[i].liaison?.poetic)assert.equal(Boolean(rs[i].liaison?.realized),false);
});
for(const separator of [', ','; ',' : ',' ! ',' — ',' « ',' » ','... '])check('new classical junction never consumes punctuation: '+separator,()=>{
  const text='Les femmes'+separator+'arrivent.',r=read(text),t=word(r,'femmes');
  assert.equal(Boolean(t.liaison?.realized),false);assert.ok(r.lines[0].ipa.includes(separator));
  assert.equal(r.lines[0].tokens.map(t=>t.text).join(''),text);
});
for(const text of ['Une pâte noire.','Un maître parle.','Une tâche longue.','Un brin brun.'])check('traditional qualities and durations survive: '+text,()=>{
  const b=transcribe(text),r=applyPoeticReading(b);
  for(let i=0;i<b.lines[0].tokens.length;i++){
    const t=b.lines[0].tokens[i],u=r.lines[0].tokens[i];if(t.type!=='word')continue;
    for(const p of phones(t.ipa).filter(p=>p.includes('ː')||p.includes('̃')||p==='ɑ'))assert.ok(phones(u.ipa).includes(p),p+' lost');
  }
});
const examples=['La lune brille.','Les enfants chantent un air.','Le lion dort, le lion dort.','Une supérieure inconnue.','1 000 petites fleurs.','L’e\u0301le\u0300ve voit une a\u0302me.','Que dis-je ?','La lune\n\nLes roses arrivent.'];
for(const text of examples)check('source, API and mapping invariants: '+text,()=>{
  const b=transcribe(text),snapshot=JSON.stringify(b);const r=applyPoeticReading(b);
  assert.equal(JSON.stringify(b),snapshot);assert.equal(b.reading,undefined);assert.equal(r.reading.id,poetryPolicy.id);
  assert.deepEqual(r.lines.map(l=>l.original),b.lines.map(l=>l.original));
  for(const line of r.lines){
    assert.equal(line.tokens.map(t=>t.text).join(''),line.original);
    assert.equal(line.tokens.map(t=>t.displayPhonetic??t.text).join(''),line.ipa);
    for(const t of line.tokens)if(t.type==='word'){
      assert.equal(t.phonemes.map(p=>p.text).join(''),t.ipa);
      assert.equal(t.segments.map(s=>s.text).join(''),t.text);
      assert.equal(clean(t.segments.flatMap(s=>s.phones).join('')),clean(t.ipa));
      for(const s of t.segments)if(s.silent)assert.equal(s.phones.length,0);
    }
  }
});
check('canonical-equivalent spellings keep the same reading',()=>{
  const text='L’élève voit une âme et une pâte noire.';
  const a=read(text),b=read(text.normalize('NFD'));assert.equal(a.lines[0].ipa,b.lines[0].ipa);
  assert.equal(b.lines[0].tokens.map(t=>t.text).join(''),text.normalize('NFD'));
});
fs.writeFileSync(new URL('../validation/poetry.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
