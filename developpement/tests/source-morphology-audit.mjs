import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {initialize,transcribe} from '../src/engine.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stage=process.argv[2]||'regression';
const input=fs.readFileSync(path.join(root,'data/references/Lexique4.1/Lexique4.1.tsv'),'utf8');
const split=line=>line.split(line.includes('\t')?'\t':'\\t');
const norm=s=>s.normalize('NFD').replace(/[.ːˈˌ'\s]/gu,'').replace(/g/gu,'ɡ').replace(/r/gu,'ʁ');
const quality=s=>norm(s).replace(/ɑ(?!̃)/gu,'a').replace(/[eɛ](?!̃)/gu,'E').replace(/[oɔ](?!̃)/gu,'O').replace(/[øœə](?!̃)/gu,'Q');
const valid=s=>/^[aɑeɛəioɔuyøœbdfɡklmnɲŋpʁsʃtvzʒjwɥ\u0303]+$/u.test(norm(s));
const verbs=new Map(),nouns=new Map();
for(const line of input.split(/\r?\n/u).slice(1)){
  const f=split(line);if(f.length!==37)continue;
  const [word,,ipa,lemma,pos,,gender,number,inflection]=f;
  if(!/^[a-zà-öø-ÿœæ]+$/u.test(word)||!valid(ipa))continue;
  if(pos==='VER'&&/ent$/u.test(word)&&number==='p'&&/:3(?:;|$)/u.test(inflection))verbs.set(word,{word,ipa,lemma,inflection});
  if(pos==='NOM'&&['s','p'].includes(number)&&['m','f'].includes(gender)){
    const key=lemma+'|'+gender;
    if(!nouns.has(key))nouns.set(key,{singular:[],plural:[]});
    nouns.get(key)[number==='s'?'singular':'plural'].push({word,ipa,lemma,gender});
  }
}
const hash=s=>createHash('sha256').update(s).digest('hex');
const pairs=[];
for(const g of nouns.values())for(const singular of g.singular)for(const plural of g.plural){
  if(singular.word!==plural.word&&norm(singular.ipa)===norm(plural.ipa))pairs.push({singular,plural});
}
pairs.sort((a,b)=>hash(a.singular.word).localeCompare(hash(b.singular.word)));
const selected=pairs.slice(0,3000);
await initialize();
const report={stage,method:'Audit morphologique de catégories et de familles de Lexique 4.1 déjà utilisé pour construire les données : cohérence et accord entre sources, PAS une mesure indépendante de précision phonétique. Comparaison contemporaine neutralisant uniquement les timbres déclarés pour le contrôle du squelette.',sourceSha256:hash(input),totalThirdPluralForms:verbs.size,totalEligibleNounPairs:pairs.length,verbChecks:[],nounChecks:[]};
function token(word,prefix){return transcribe(prefix+' '+word+'.').lines[0].tokens.find(t=>t.lower===word);}
for(const v of [...verbs.values()].sort((a,b)=>a.word.localeCompare(b.word))){
  const t=token(v.word,'Ils'),actual=t.ipa.replace(/[.]$/u,'');
  const expected=norm(v.ipa);
  const falseEntNasal=norm(actual).endsWith('ɑ̃')&&!expected.endsWith('ɑ̃');
  report.verbChecks.push({...v,actual,source:t.source,skeletonAgreement:quality(actual)===quality(v.ipa),falseEntNasal,grammar:t.posHint});
}
for(const {singular:s,plural:p}of selected){
  const a=token(s.word,s.gender==='f'?'La':'Le'),b=token(p.word,'Les');
  report.nounChecks.push({lemma:s.lemma,singular:s.word,plural:p.word,first:a.ipa,second:b.ipa,identicalTraditional:norm(a.ipa)===norm(b.ipa),sameSkeleton:quality(a.ipa)===quality(b.ipa)});
}
report.summary={thirdPluralForms:report.verbChecks.length,falseNasalizedEnt:report.verbChecks.filter(c=>c.falseEntNasal).length,verbSourceSkeletonDifferences:report.verbChecks.filter(c=>!c.skeletonAgreement).length,nounPairs:report.nounChecks.length,nounTraditionalDifferences:report.nounChecks.filter(c=>!c.identicalTraditional).length,nounSkeletonDifferences:report.nounChecks.filter(c=>!c.sameSkeleton).length};
const file=path.join(root,'validation/source-morphology-'+stage+'.json');
if(stage==='initial'&&fs.existsSync(file))throw new Error('Diagnostic initial conservé.');
fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({summary:report.summary,nasalFailures:report.verbChecks.filter(c=>c.falseEntNasal).slice(0,20),skeletonDifferences:report.verbChecks.filter(c=>!c.skeletonAgreement).slice(0,12),nounDifferences:report.nounChecks.filter(c=>!c.identicalTraditional).slice(0,12)},null,2));
if(report.summary.falseNasalizedEnt||report.summary.nounTraditionalDifferences)process.exitCode=1;
