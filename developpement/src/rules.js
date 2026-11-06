import {syllabify} from './phonology.js';
import {lookup as localLookup} from './lexicon.js';

/* A small reviewed layer takes precedence over the unlabelled extraction. Values
   retain the traditional distinctions; this is not a phonetic alphabet shortcut. */
const REVIEWED = Object.create(null);
function add(ipa, words, extra={}) {for(const w of words.split('|'))REVIEWED[w.toLocaleLowerCase('fr')]={ipa,...extra};}
add('a','a|à|as'); add('ɑːm','âme|âmes'); add('ɑːn','âne|ânes');
add('ɑːʒ','âge|âges'); add('tɑːʃ','tâche|tâches'); add('taʃ','tache|taches');
add('pɑːt','pâte|pâtes'); add('pat','patte|pattes');
add('bɑ','bas'); add('bɑːz','base|bases'); add('fʁɑz','phrase|phrases');
add('ɡɑ.to','gâteau|gâteaux'); add('ʃɑ.to','château|châteaux');
add('mɑːl','mâle|mâles'); add('mal','mal|malle|malles');
add('mɑː','mât|mâts'); add('ma','ma'); add('lɑ','las'); add('la','la|là');
add('ɛːtʁ','être|êtres'); add('mɛːtʁ','maître|maîtres'); add('mɛtʁ','mettre');
add('tɛːt','tête|têtes'); add('fɛːt','fête|fêtes'); add('ʁɛːv','rêve|rêves|rêvent');
add('pʁɛ','prêt|prêts'); add('pʁɛːt','prête|prêtes|prêtent');
add('fɔʁɛ','forêt|forêts'); add('ɑ̃.kɛːt','enquête|enquêtes');
add('kɛːs','caisse|caisses'); add('ʁɛːn','reine|reines'); add('sɛːn','scène|scènes');
add('pʁɛːs','presse|presses|pressent'); add('nɛːʒ','neige|neiges|neigent');
add('oːt','hôte|hôtes',{h:'muet'}); add('koːt','côte|côtes'); add('kɔt','cote|cotes');
add('ʁoz','rose|roses'); add('ʒøːn','jeûne|jeûnes|jeûnent'); add('ʒœn','jeune|jeunes');
add('œ̃','un'); add('yn','une|unes'); add('dy','du'); add('bʁœ̃','brun|bruns'); add('bʁɛ̃','brin|brins');
add('ɑ̃','en|an|ans'); add('ɔ̃','on|ont'); add('ɛ̃','in'); add('nɔ̃','non|nom|noms');
add('mɔ̃','mon|mont|monts'); add('tɔ̃','ton|tons'); add('sɔ̃','son|sons|sont');
add('vɑ̃','vent|vents|vend|vends'); add('sud','soude|soudes|soudent');
add('fam','femme|femmes'); add('mə.sjø','monsieur'); add('me.sjø','messieurs');
add('madam','madame'); add('me.dam','mesdames');
add('lə','le'); add('le','les|lès'); add('de','des|dés'); add('də','de');
add('dø','deux'); add('se',"ces|ses"); add('sə','ce|se');
add('me','mes'); add('te','tes'); add('no','nos'); add('vo','vos');
add('sɛt','cet|cette');
add('ʒə','je'); add('ty','tu'); add('il','il|ils'); add('ɛl','elle|elles');
add('nu','nous'); add('vu','vous'); add('ʒe',"j'ai"); add('e','et|ai'); add('ɛ','est|es');
add('sɛ','sais|sait'); add('avɛk','avec'); add('dɑ̃','dans|dent|dents');
add('puʁ','pour'); add('paʁ','par|part|parts'); add('syʁ','sur'); add('syːʁ','sûr|sûrs');
add('tʁɛ','très'); add('ply','plus'); add('tu','tout|toux'); add('tus','tous');
add('ni','ni|nid|nids'); add('u','ou|où'); add('ki','qui'); add('kə','que');
add('kɑ̃','quand|quant|camp|camps'); add('kɔm','comme'); add('si','si');
add('də.dɑ̃','dedans'); add('də.ɔʁ','dehors'); add('pʁə.mje','premier');
add('ɔ.ɲɔ̃','oignon|oignons|ognon|ognons'); add('sə.ɡɔ̃','second|seconds'); add('sə.ɡɔ̃d','seconde|secondes');
add('mɛs','Metz'); add('ʁɛ̃s','Reims'); add('pa.ʁi','Paris'); add('li.jɔ̃','Lyon',{alternatives:['ljɔ̃']});
add('bʁy.sɛl','Bruxelles'); add('lil','Lille'); add('ʁu.ɑ̃','Rouen'); add('ka','Caen');
add('kɑ̃','Caen'); add('kɑ̃','camp'); add('nju.jɔʁk','New-York');
add('ka.ɔ','chaos'); add('kœʁ','cœur|cœurs'); add('œj','œil'); add('jø','yeux');
add('œf','œuf'); add('ø','œufs|eux'); add('bœf','bœuf'); add('bø','bœufs');
add('ɔs','os'); add('sɑ̃','sang|sans|cent|cents'); add('sɛt','sept'); add('ɥit','huit',{h:'aspire'});
add('nœf','neuf'); add('dis','dix'); add('sis','six'); add('vɛ̃','vingt|vingts');
add('ze.ʁo','zéro'); add('katʁ','quatre'); add('sɛ̃k','cinq'); add('ɔ̃z','onze');
add('duz','douze'); add('tʁɛz','treize'); add('ka.tɔʁz','quatorze'); add('kɛ̃z','quinze'); add('sɛz','seize');
add('tʁɑ̃t','trente'); add('ka.ʁɑ̃t','quarante'); add('sɛ̃.kɑ̃t','cinquante'); add('swa.sɑ̃t','soixante');
add('viʁ.ɡyl','virgule');
add('mil','mille|milles'); add('ɑ̃.fɑ̃','enfant|enfants'); add('ʒaʁ.dɛ̃','jardin|jardins');
add('ʒu','joue|joues|jouent|joug'); add('ʒu.e','jouer|jouez');
add('nɥi','nuit|nuits'); add('plɥi','pluie|pluies'); add('fʁɥi','fruit|fruits');
add('fɥiʁ','fuir'); add('lɥi','lui|luis|luit'); add('bʁɥi','bruit|bruits');
add('ɥil','huile|huiles',{h:'muet'}); add('wi','oui'); add('wɛst','ouest');
add('o','eau|eaux|au|aux|haut|hauts'); add('o','haut|hauts',{h:'aspire'});
add('ʃo','chaud|chauds'); add('fo','faux|faut'); add('so','sot|sots|saut|sauts|seau|seaux');
add('mwa','moi|mois'); add('tʁwɑ','trois'); add('fwa','fois|foi|foie'); add('ʁwa','roi|rois');
// Familiar spellings mark the loss of the schwa in petit and its inflections.
add('pti',"ptit|ptits|p'tit|p'tits");
add('ptit',"ptite|ptites|p'tite|p'tites");
add('ʁwa.jom','royaume|royaumes'); add('va.ɡɔ̃','wagon|wagons');
add('paʁ.kiŋ','parking|parkings'); add('dʒɛz','jazz'); add('klœb','club|clubs');
add('ʃɔʁt','short|shorts'); add('fut.bol','football'); add('wi.kɛnd','week-end|weekend');
add('a.ʁi.ko','haricot|haricots',{h:'aspire'}); add('e.ʁo','héros',{h:'aspire'});
add('e.ʁɔ.in','héroïne|héroïnes',{h:'muet'}); add('e.ʁɔ.ik','héroïque|héroïques',{h:'muet'});
add('ɔm','homme|hommes',{h:'muet'}); add('ɔ.ʁœʁ','horreur|horreurs',{h:'muet'});
add('ɛːn','haine|haines',{h:'aspire'}); add('ɔ̃t','honte|hontes',{h:'aspire'});
add('i.bu','hibou|hiboux',{h:'aspire'});
add('ɔ.pi.tal','hôpital|hopital',{h:'muet'}); add('ɔ.pi.to','hôpitaux',{h:'muet'});
add('dɔ̃','don|dons|dont');
add('bə.zwɛ̃','besoin|besoins');
add('fe.tys','fœtus|foetus'); add('se.la.kɑ̃t','cœlacanthe|cœlacanthes');
add('fe.niks','phœnix|phénix'); add('tʁɑ̃.zak.sjɔ̃','transaction|transactions');
add('bɔ̃.ʒuʁ','bonjour'); add('o.ʁə.vwaʁ','au revoir');
add('ʒɛːn','gène|gènes|gêne|gênes|gênent');
add('u','août',{alternatives:['ut','a.u']}); add('tɑ̃','taon|taons');
add('pœ.zœl','puzzle|puzzles',{alternatives:['pœzl','pyzl']});
add('pwal','poêle|poêles');

/** Choose an attested non-caduc citation in the palatal -(ill)ement family. */
export function refineCitation(word,data){
  const shape=p=>p.replace(/[.ː]/gu,'').replace(/ɑ(?!̃)/gu,'a');
  if(/illements?$/u.test(word)&&/jəmɑ̃$/u.test(shape(data.ipa))){
    const target=shape(data.ipa).replace(/jəmɑ̃$/u,'jmɑ̃');
    const alternate=data.alternatives?.find(p=>shape(p)===target);
    if(alternate)return {...data,ipa:alternate,alternatives:[data.ipa,...data.alternatives.filter(p=>p!==alternate)]};
  }
  return data;
}

export function reviewed(word) {
  const w=word.normalize('NFC').replace(/[’ʼ]/g,"'").toLocaleLowerCase('fr');
  if(REVIEWED[w])return REVIEWED[w];
  // TLFi: sous-évaluer /suzevalɥe/, sous-évalue /suzevaly/. Some source
  // records lose /z/ or promote an inconsistent hiatus. Use the attested
  // unprefixed family, including its inflectional /y ~ ɥ/ alternation, rather
  // than replacing every written "sous" or contracting every /y/ globally.
  const evaluation=w.match(/^sous-?(évalu[\p{L}]+)$/u);
  if(evaluation){
    const base=localLookup(evaluation[1]);
    if(base&&/^eval/u.test(base.ipa.replace(/\./gu,''))){
      // Some unprefixed source records also select /yV/. In this reviewed
      // family, /y/ contracts before an oral/nasal a/e/o nucleus, but stays
      // vocalic before /j/ (évaluions) or /ʁ/ (évaluerai).
      const prefixed=ipa=>syllabify('suz'+ipa.replace(/\./gu,'').replace(/^evaly(?=[aɑeɛoɔ])/u,'evalɥ'));
      const ipa=prefixed(base.ipa),alternatives=(base.alternatives||[]).map(prefixed);
      const finite=/^évalu(?:e|es|ent|ons|ez|ais|ait|aient|ions|iez|ai|as|a|âmes|âtes|èrent|asse|asses|ât|assions|assiez|assent|er|erai|eras|era|erons|erez|eront|erais|erait|erions|eriez|eraient|ant|é|ée|és|ées)$/u.test(evaluation[1]);
      const pos=base.pos?.length?base.pos:finite?['VER']:undefined;
      // Override grammatical readings as well: context must not restore a
      // malformed pronunciation from the prefixed source record afterwards.
      const grammaticalReadings=base.grammaticalReadings?.length
        ?base.grammaticalReadings.map(reading=>({...reading,ipa:prefixed(reading.ipa)}))
        :(pos||[]).map(category=>({ipa,pos:category}));
      return {ipa,alternatives,...(pos?{pos}:{}),grammaticalReadings,
        reference:'TLFi : famille sous-évaluer ; flexions de la base locale',
        rule:'famille lexicale sous-évaluer et base '+evaluation[1]};
    }
  }
  // The stem efficient keeps /e/ under co- and in its regular gender/number
  // derivatives. Do not generalize this lexical stem to every double f.
  const efficient=w.match(/^(co)?efficien(t|ts|te|tes|ce|ces)$/u);
  if(efficient){
    const ending=efficient[2],tail=/^t(?:s)?$/u.test(ending)?'sjɑ̃':/^te/u.test(ending)?'sjɑ̃t':'sjɑ̃s';
    return {ipa:(efficient[1]?'kɔ.':'')+'e.fi.'+tail,alternatives:efficient[1]?['ko.e.fi.'+tail]:[],rule:'famille lexicale efficient et préfixation co-'};
  }
  return null;
}

export function normalizeWord(word) {return word.normalize('NFC').replace(/[’ʼ]/g,"'").toLocaleLowerCase('fr');}

const PREFIXES=['anti','archi','auto','bio','chrono','co','cyber','dé','dés','éco','extra','hyper','hypo','inter','intra','macro','méta','micro','mini','mono','multi','néo','para','péri','poly','post','pré','proto','pseudo','re','ré','semi','sous','super','sur','télé','trans','ultra'];
const PREFIX_PHONES={anti:'ɑ̃.ti',archi:'aʁ.ʃi',auto:'o.to',bio:'bi.o',chrono:'kʁɔ.no',co:'ko',cyber:'si.bɛʁ',dé:'de',dés:'de',éco:'e.ko',extra:'ɛks.tʁa',hyper:'i.pɛʁ',hypo:'i.po',inter:'ɛ̃.tɛʁ',intra:'ɛ̃.tʁa',macro:'ma.kʁo',méta:'me.ta',micro:'mi.kʁo',mini:'mi.ni',mono:'mɔ.no',multi:'myl.ti',néo:'ne.o',para:'pa.ʁa',péri:'pe.ʁi',poly:'pɔ.li',post:'pɔst',pré:'pʁe',proto:'pʁɔ.to',pseudo:'psø.do',re:'ʁə',ré:'ʁe',semi:'sə.mi',sous:'su',super:'sy.pɛʁ',sur:'syʁ',télé:'te.le',trans:'tʁɑ̃s',ultra:'yl.tʁa'};

/** Derivational evidence must actually find a lexical base. It is not suffix guessing. */
export function morphology(word, lookup, depth=0, options={}) {
  const w=normalizeWord(word); if(depth>2||w.length<4)return null;
  if(w.endsWith('s')||w.endsWith('x')) {
    const bases=[w.slice(0,-1)];
    if(w.endsWith('aux'))bases.push(w.slice(0,-3)+'al',w.slice(0,-3)+'ail');
    for(const b of bases){const base=reviewed(b)||lookup(b);if(base&&b.length>2)return {ipa:base.ipa,h:base.h,source:'morphology',rule:'pluriel sur une base lexicale',alternatives:base.alternatives||[]};}
  }
  for(const p of PREFIXES)if(w.startsWith(p)&&w.length>p.length+3){
    const rest=w.slice(p.length);const base=reviewed(rest)||lookup(rest);
    if(base) return {ipa:syllabify(PREFIX_PHONES[p]+base.ipa),h:null,source:'morphology',rule:'préfixe '+p+' + base '+rest,alternatives:[]};
  }
  if(w.endsWith('ment')) {
    const stem=w.slice(0,-4);const base=reviewed(stem)||lookup(stem);
    if(base)return {ipa:syllabify(base.ipa.replace(/ə$/,'')+'mɑ̃'),source:'morphology',rule:'adverbe en -ment sur une base lexicale',alternatives:[]};
  }
  const verbal=verbFromLexicon(w,lookup);
  if(verbal)return {...verbal,source:'morphology'};
  // Long productive prefixes keep their own pronunciation even when the
  // invented base is unknown. Short ambiguous re-/dé-/co- need lexical evidence.
  const productive=['anti','auto','bio','chrono','cyber','éco','extra','hyper','hypo','inter','intra','macro','méta','micro','multi','néo','péri','poly','post','pré','proto','pseudo','super','télé','ultra'];
  if(depth<2)for(const p of productive)if(w.startsWith(p)&&w.length>p.length+3){
    const rest=w.slice(p.length);
    const base=morphology(rest,lookup,depth+1,options)||g2p(rest,options);
    return {ipa:syllabify(PREFIX_PHONES[p]+base.ipa),h:null,source:'morphology',confidence:'hypothesis',rule:'préfixe productif '+p+' + hypothèse sur la base '+rest,alternatives:[]};
  }
  return null;
}

/** Reverse a regular paradigm only when its infinitive is in the lexicon. */
export function verbFromLexicon(w,lookup) {
  const endings=[['eraient','əʁɛ'],['erions','əʁjɔ̃'],['eriez','əʁje'],['erais','əʁɛ'],['erait','əʁɛ'],['eront','əʁɔ̃'],['erons','əʁɔ̃'],['erez','əʁe'],['erai','əʁe'],['eras','əʁa'],['era','əʁa'],['aient','ɛ'],['ions','jɔ̃'],['iez','je'],['ant','ɑ̃'],['ais','ɛ'],['ait','ɛ'],['ent',''],['ons','ɔ̃'],['ez','e'],['ées','e'],['ée','e'],['és','e'],['é','e'],['es',''],['e','']];
  for(const [ending,phone]of endings){
    if(!w.endsWith(ending)||w.length<=ending.length+1)continue;
    let stem=w.slice(0,-ending.length);
    const stems=[stem];if(stem.endsWith('ge')&&/^(ons|ant|ais|ait|aient)$/.test(ending))stems.push(stem.slice(0,-1));
    if(stem.endsWith('ç'))stems.push(stem.slice(0,-1)+'c');
    if(/ll$/.test(stem))stems.push(stem.slice(0,-1));
    for(const s of stems){const inf=s+'er',entry=lookup(inf);if(!entry||!entry.ipa.replace(/[.]/g,'').endsWith('e'))continue;
      if(entry.pos?.length&&!entry.pos.includes('VER')&&!entry.pos.includes('AUX'))continue;
      return {ipa:syllabify(entry.ipa.replace(/e$/,'')+phone),alternatives:[],rule:'flexion régulière de '+inf,verb:true};}
  }
  return null;
}

const VLETTER=/[aàâäeéèêëiîïoôöuùûüyÿœæ]/u;
const HARD_CH=/^(?:archa|arché|archi?o|bacca|bacch|chaos|chao|chias|chiro|chlam|chlor|choeur|chor|chré|chri|chro|chry|écho|orch|psych|schol|tech)/u;
/** Nominal/adjectival -tien is usually /sj/, unlike tenir-family /tj/.
 * Restrict the rule to the final suffix and its gender/number forms. The
 * learned exceptions and the historic s of chrétien preserve their /t/.
 */
function palatalTien(word,index,verb){
  const before=word.slice(0,index),tail=word.slice(index);
  return !verb&&index>0&&VLETTER.test(before)&&/^tien(?:s|ne|nes)?$/u.test(tail)
    &&!/[sx]$/u.test(before)
    &&!/(?:sou|main|entre|re|con|dé|ob|appar|per|chr[eé]|kan)$/u.test(before);
}
/** Context-sensitive grapheme lattice. Output carries rule evidence for fallback. */
export function g2p(word, options={}) {
  let w=normalizeWord(word),result='';const units=[];
  const push=(length,ipa,rule)=>{units.push({text:w.slice(i,i+length),phones:ipa,rule,start:i,end:i+length});result+=ipa;i+=length;};
  // A written vowel only licenses a glide when it actually has a nucleus.
  // In amie, tortue and boue the following e is mute; in prient it is part
  // of the verbal ending, not the nasal graph ien.
  const muteFollowingE = index => /^es?$/u.test(w.slice(index)) || Boolean(options.verb && /^ent$/u.test(w.slice(index)));
  const complexLiquidOnset = before => /[bcdfgkptv]h?[lr]$/u.test(before);
  let i=0;
  while(i<w.length) {
    const tail=w.slice(i),before=w.slice(0,i),prev=w[i-1]||'',next=w[i+1]||'',end=i===w.length-1;
    if(tail[0]==="'"||tail[0]==='-'){push(1,'','séparateur');continue;}
    if(options.verb&&/^ent$/u.test(tail)){push(3,'','désinence verbale -ent');continue;}
    if(options.verb&&/^ient$/u.test(tail)){push(4,'i','i stable devant -ent verbal');continue;}
    if(/^ements?$/u.test(tail)&&/j$/u.test(result)){push(1,'','e caduc après palatale dans le suffixe -ement');continue;}
    if(/^(?:aient)$/u.test(tail)){push(5,'ɛ','imparfait');continue;}
    if(/^e(?:s)?$/u.test(tail)&&i>0){push(tail.length,'','e final caduc');continue;}
    if(/^[sxz]$/u.test(tail)&&i>0){push(1,'','finale généralement muette');continue;}
    if(/^[dtpg]s?$/u.test(tail)&&i>0){push(tail.length,'','finale généralement muette, pluriel compris');continue;}
    if(tail.startsWith('eaux')){push(4,'o','eaux');continue;}
    if(tail.startsWith('eau')){push(3,'o','eau');continue;}
    if(/^au/u.test(tail)){push(2,'o','au');continue;}
    // Long palatal graphs must precede ai/ei/eu/ou. The i belongs to the
    // graph, rather than creating an extra syllable (paille, fauteuil).
    let palatal=null;
    for(const [graph,ipa]of [['euill','œj'],['œill','œj'],['oeill','œj'],['ouill','uj'],['aill','aj'],['eill','ɛj'],['euil','œj'],['œil','œj'],['oeil','œj'],['ouil','uj'],['ail','aj'],['eil','ɛj']]) {
      if(!tail.startsWith(graph))continue;
      if(!graph.endsWith('ll')&&tail!==graph&&tail!==graph+'s')continue;
      palatal=[graph,ipa];break;
    }
    if(palatal){push(palatal[0].length,palatal[1],'groupe palatal '+palatal[0]);continue;}
    if(/^(?:oy|ay|ey|uy)/u.test(tail)&&VLETTER.test(w[i+2]||'')){
      const graph=tail.slice(0,2),ipa={oy:'waj',ay:'ɛj',ey:'ɛj',uy:'ɥij'}[graph];
      push(2,ipa,'y médian, double fonction vocalique et semi-vocalique');continue;
    }
    if(/^ings?$/u.test(tail)){push(3,'iŋ','suffixe emprunté -ing');continue;}
    if(/^œu|^oeu/u.test(tail)) {const n=tail.startsWith('œ')?2:3;push(n,/^(?:d|v|n)$/u.test(before)||i+n===w.length?'ø':'œ','œu');continue;}
    if(/^œ|^oe/u.test(tail)&&/^(?:f|c|ph)$/u.test(before)){push(tail[0]==='œ'?1:2,'e','ligature savante');continue;}
    if(/^eu/u.test(tail)){push(2,/^eu(?:x|se?s?|re?nt)?$/u.test(tail)?'ø':'œ','eu');continue;}
    if(/^o[uû]/u.test(tail)){
      const after=w[i+2]||'';const glide=VLETTER.test(after)&&!muteFollowingE(i+2)&&!/[ïî]/u.test(after)&&!/(?:jou|lou|avou|dou|clou|rou)$/u.test(before+'ou');
      push(2,glide?'w':'u',glide?'ou semi-vocalique':'ou');continue;
    }
    if(/^oin/u.test(tail)&&!VLETTER.test(w[i+3]||'')&&w[i+3]!=='n'){push(3,'wɛ̃','oin nasal');continue;}
    if(/^oi/u.test(tail)){push(2,'wa','oi');continue;}
    if(/^aî|^eî/u.test(tail)){push(2,'ɛː','voyelle longue traditionnelle');continue;}
    let nasal=null;
    for(const [graph,ipa]of [['ain','ɛ̃'],['aim','ɛ̃'],['ein','ɛ̃'],['eim','ɛ̃'],['ien','jɛ̃'],['yen','jɛ̃'],['an','ɑ̃'],['am','ɑ̃'],['en','ɑ̃'],['em','ɑ̃'],['on','ɔ̃'],['om','ɔ̃'],['in','ɛ̃'],['im','ɛ̃'],['yn','ɛ̃'],['ym','ɛ̃'],['un','œ̃'],['um','œ̃']]) {
      if(!tail.startsWith(graph))continue;
      const after=w[i+graph.length]||'';
      if(after&& (VLETTER.test(after)||after==='n'||after==='m'))continue;
      if((graph==='en'||graph==='em')&&i===0&&/^(?:enn|emm)/u.test(tail))continue;
      nasal=[graph,ipa];break;
    }
    if(nasal){push(nasal[0].length,nasal[1],'groupe nasal');continue;}
    if(/^ai|^ei/u.test(tail)){push(2,'ɛ','ai/ei');continue;}
    if(/^ill/u.test(tail)){
      const hard=/^(?:ville|village|vill|mille|milli|million|tranquill|pupill|oscill|distill|instill|bacill|maxill|capill|codicill)/u.test(w);
      push(3,hard?'il':VLETTER.test(prev)?'j':'ij',hard?'ill consonantique':'ill palatal');continue;
    }
    if(/^gn/u.test(tail)){push(2,'ɲ','gn palatal');continue;}
    if(/^ph/u.test(tail)){push(2,'f','ph');continue;}
    if(/^th/u.test(tail)){push(2,'t','th');continue;}
    if(/^rh/u.test(tail)){push(2,'ʁ','rh');continue;}
    if(/^sch/u.test(tail)){push(3,'ʃ','sch');continue;}
    if(/^sh/u.test(tail)){push(2,'ʃ','sh dans les emprunts');continue;}
    if(/^ch/u.test(tail)){push(2,HARD_CH.test(w)||/orch|tech|psych/u.test(before+'ch')?'k':'ʃ','ch lexical ou savant');continue;}
    // Consume t only: the following ien must retain its own /jɛ̃/ nucleus.
    if(palatalTien(w,i,options.verb)){push(1,'s','suffixe nominal/adjectival -tien palatal');continue;}
    if(/^tion|^tial|^tiel|^tieux/u.test(tail)&&i>0&&prev!=='s'){push(2,'sj','ti + voyelle, suffixe savant');continue;}
    if(/^tie(?:s)?$/u.test(tail)&&i>0&&!/^(?:par|sor|gar|bas|hos|ves|amnis)$/u.test(before)){push(2,'si','suffixe -tie');continue;}
    if(/^qu/u.test(tail)){push(2,/^(?:a|o)/u.test(w[i+2]||'')&&/^(?:aqua|équa|quad|quatu|quota)/u.test(w)?'kw':'k','qu');continue;}
    if(/^guë/u.test(tail)){push(3,'ɡy','tréma : u prononcé dans guë');continue;}
    if(/^g(?:uï|üi)/u.test(tail)){push(3,'ɡɥi','tréma : u prononcé devant i');continue;}
    if(/^gu/u.test(tail)&&/[eéèêëiîïy]/u.test(w[i+2]||'')){push(2,'ɡ','gu protecteur');continue;}
    if(/^ge/u.test(tail)&&/[aàâäoôöuùûü]/u.test(w[i+2]||'')){push(2,'ʒ','ge protecteur');continue;}
    if(/^cc/u.test(tail)){push(2,/[eéiiy]/u.test(w[i+2]||'')?'ks':'k','cc');continue;}
    if(next===tail[0]&&/[bcdfgklmnprstvz]/u.test(next)){const c=tail[0];push(2,({c:/[eéiiy]/u.test(w[i+2]||'')?'s':'k',g:/^ggings?$/u.test(tail)?'ɡ':/[eéiiy]/u.test(w[i+2]||'')?'ʒ':'ɡ',r:'ʁ',s:'s'}[c]||c),'consonne double');continue;}
    if(/^(?:ers?|ez)$/u.test(tail)){push(tail.length,'e','finale -er/-ers/-ez');continue;}
    if(/^et$/u.test(tail)){push(2,'ɛ','finale -et');continue;}
    const c=tail[0];
    if(c==='e') {
      const rest=w.slice(i+1);
      const onset=/^(?:[bcdfgkptv][lr]|ch[lr]?|ph[lr]?|th[lr]?|rh|sh|gn)[aàâäeéèêëiîïoôöuùûüyÿœæ]/u.test(rest);
      const laterNucleus=VLETTER.test(rest.replace(/e?s?$/u,''));
      const closed=next==='x'||(/^[^aàâäeéèêëiîïoôöuùûüyÿœæ]{2}/u.test(rest)&&!(onset&&laterNucleus));
      const forceOpen=/^[^aàâäeéèêëiîïoôöuùûüyÿœæ](?:e?s?|ent)$/u.test(rest);
      push(1,closed||forceOpen?'ɛ':'ə','e selon structure syllabique');continue;
    }
    if(c==='i'||c==='y') {
      const asGlide=VLETTER.test(next)&&!muteFollowingE(i+1)&&!/[ïî]/u.test(c)&&!complexLiquidOnset(before);
      push(1,asGlide?'j':'i','i/y vocalique ou semi-vocalique');continue;
    }
    if(c==='u') {
      const contractedUI=next==='i'&&/^(?:plui|brui|frui)/u.test(w);
      const glide=VLETTER.test(next)&&!muteFollowingE(i+1)&&!/[ïî]/u.test(next)&&(!complexLiquidOnset(before)||contractedUI);
      push(1,glide?'ɥ':'y','u vocalique ou semi-vocalique');continue;
    }
    if(c==='o') {push(1,end||/^o[sz]$/u.test(tail)?'o':'ɔ','o selon position');continue;}
    const vowels={'a':'a','à':'a','â':'ɑː','ä':'a','é':'e','è':'ɛ','ê':'ɛː','ë':'ə','î':'i','ï':'i','ô':'oː','ö':'ɔ','ù':'y','û':'y','ü':'y','ÿ':'i','œ':'œ','æ':'e'};
    if(c in vowels){push(1,vowels[c],'voyelle');continue;}
    if(c==='c'){push(1,/[eéèêëiîïy]/u.test(next)?'s':'k','c dur/doux');continue;}
    if(c==='ç'){push(1,'s','ç');continue;}
    if(c==='g'){push(1,/[eéèêëiîïy]/u.test(next)?'ʒ':'ɡ','g dur/doux');continue;}
    if(c==='s'){push(1,VLETTER.test(prev)&&VLETTER.test(next)?'z':'s','s intervocalique');continue;}
    if(c==='x'){push(1,i===0?'ɡz':/^e(?:x)/u.test(w)&&i===1&&VLETTER.test(next)?'ɡz':'ks','x');continue;}
    if(c==='h'){push(1,'','h orthographique');continue;}
    if(c==='w'){push(1,'w','w emprunt');continue;}
    if(c==='j'){push(1,'ʒ','j');continue;}
    if(c==='r'){push(1,'ʁ','r');continue;}
    if(c==='q'){push(1,'k','q');continue;}
    if(/[bdfklmnptvz]/u.test(c)){push(1,c,'consonne');continue;}
    push(1,'','caractère sans valeur déterminable');
  }
  // Circumflex-derived duration is licensed at the final pronounced nucleus.
  // Before another pronounced vowel preserve its quality, not an automatic
  // long duration (rêver /ʁɛ.ve/, côté /ko.te/). Keep unit evidence in sync.
  const lastNucleus=[...result.matchAll(/[aɑeɛəioɔuyøœ]\u0303?ː?/gu)].at(-1)?.index??0;
  let offset=0;
  for(const unit of units){const raw=unit.phones;
    unit.phones=raw.replace(/[aɑeɛəioɔuyøœ]\u0303?ː/gu,(phone,index)=>offset+index<lastNucleus?phone.replace('ː',''):phone);
    offset+=raw.length;
  }
  result=units.map(unit=>unit.phones).join('');
  return {ipa:syllabify(result),units,source:'rules',confidence:'hypothesis',alternatives:[],rule:'repli graphophonologique et morphologique'};
}
