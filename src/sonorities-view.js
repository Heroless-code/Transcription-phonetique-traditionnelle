import {phones} from './phonology.js';
import {applySonorityStyle,sonorityStyle} from './sonority-colors.js';

const groupsFor=analysis=>analysis.soundGroups||analysis.groups;
function markSounds(row,analysis,categories,hiddenPhones,showSingletons){
  const original=new Map();
  const add=(map,key,group)=>{if(!map.has(key))map.set(key,new Map());map.get(key).set(group.phone,group);};
  const inventory=groupsFor(analysis);
  for(const group of [...(categories.alliterations?inventory.alliterations:[]),...(categories.assonances?inventory.assonances:[])].filter(g=>!hiddenPhones.has(g.phone)&&(showSingletons||g.count>1)))for(const occurrence of group.occurrences){
    for(const span of occurrence.graphSpans)add(original,span.tokenIndex+':'+span.segmentIndex,group);
  }
  for(const node of row.querySelectorAll('.sonority-unit')){
    // Rebuild the visible phone contributions: hiding one unit of a shared
    // grapheme must retain the other units, without leaving stale colors.
    if(node.dataset.sonorityPhones)node.removeAttribute('title');
    delete node.dataset.sonorityPhones;delete node.dataset.sonoritySinglePhones;
    for(const name of ['background','ink','accent','bands'])node.style.removeProperty('--sonority-'+name);
    const groups=[...original.get(node.dataset.tokenIndex+':'+node.dataset.segmentIndex)?.values()||[]];
    const consonant=groups.some(g=>g.kind==='alliteration'),vowel=groups.some(g=>g.kind==='assonance');
    node.classList.toggle('sonority-overview',groups.length>0);
    node.classList.toggle('sonority-alliteration',consonant);
    node.classList.toggle('sonority-assonance',vowel);
    node.classList.toggle('sonority-singleton',groups.length>0&&groups.every(g=>g.count===1));
    if(groups.length){
      node.dataset.sonorityPhones=JSON.stringify(groups.map(g=>g.phone));
      const singlePhones=groups.filter(g=>g.count===1).map(g=>g.phone);
      node.dataset.sonoritySinglePhones=JSON.stringify(singlePhones);
      applySonorityStyle(node,groups.map(g=>g.phone),{singlePhones});
      node.title=groups.map(g=>(g.count===1?'Son isolé':g.kind==='alliteration'?'Allitération':'Assonance')+' /'+g.phone+'/ — '+g.count+' '+(g.count===1?'occurrence':'occurrences')+' dans '+g.wordCount+' '+(g.wordCount===1?'mot':'mots')).join('\n');
    }
  }
}

/** Presentation only. Counts and source associations come from sonorities.js. */
export function focusSonority(row,analysis,phone,{hiddenPhones=new Set(),categories={alliterations:true,assonances:true},showSingletons=false}={}){
  markSounds(row,analysis,categories,hiddenPhones,showSingletons);
  const inventory=groupsFor(analysis),all=[...inventory.alliterations,...inventory.assonances];
  const group=all.find(g=>g.phone===phone&&!hiddenPhones.has(g.phone)&&(showSingletons||g.count>1)&&categories[g.kind==='assonance'?'assonances':'alliterations']);
  const original=new Set();
  if(group)for(const occurrence of group.occurrences){
    for(const span of occurrence.graphSpans)original.add(span.tokenIndex+':'+span.segmentIndex);
  }
  row.classList.toggle('has-sonority-selection',Boolean(group));
  for(const node of row.querySelectorAll('.sonority-unit')){
    const hit=Boolean(group)&&original.has(node.dataset.tokenIndex+':'+node.dataset.segmentIndex);
    node.classList.toggle('sonority-hit',hit);
    node.classList.toggle('sonority-muted',Boolean(group)&&!hit);
    if(hit){
      node.dataset.sonorityFocus=group.kind;
      const style=sonorityStyle(group.phone);
      if(style){node.style.setProperty('--sonority-focus-background',style.background);node.style.setProperty('--sonority-focus-ink',style.ink);node.style.setProperty('--sonority-focus-accent',style.accent);}
    }else delete node.dataset.sonorityFocus;
  }
  for(const chip of row.querySelectorAll('.sonority-chip')){
    const focused=Boolean(group)&&chip.dataset.phone===group.phone,hidden=hiddenPhones.has(chip.dataset.phone);
    const sound=all.find(g=>g.phone===chip.dataset.phone),annotations=chip.dataset.annotations||'';
    const description='/'+sound.phone+'/ — '+sound.count+' '+(sound.count===1?'occurrence':'occurrences')+' dans '+sound.wordCount+' '+(sound.wordCount===1?'mot':'mots');
    const status=hidden?'Couleur masquée. Cliquez pour la rétablir.':focused?'Son mis en évidence. Cliquez pour masquer sa couleur.':'Couleur affichée. Cliquez pour isoler ce son ; un deuxième clic masque sa couleur.';
    chip.dataset.sonorityState=hidden?'hidden':focused?'focused':'visible';
    chip.classList.toggle('sonority-hidden',hidden);
    chip.setAttribute('aria-pressed',String(focused));
    chip.setAttribute('aria-label',description+(annotations?'. '+annotations:'')+'. '+status);
    chip.title=description+(annotations?'. '+annotations:'')+'. '+status+' '+(sound.rankingReason||'');
  }
  const note=row.querySelector('.sonority-selection-note');
  if(note){
    const notices=[];
    if(group?.unalignedCount)notices.push('Certaines occurrences ne peuvent pas être surlignées avec certitude dans les lettres. Leur décompte phonétique est conservé.');
    if(group?.uncertain)notices.push('Le décompte comprend une lecture variable ou proposée.');
    note.textContent=notices.join(' ');
    note.hidden=!notices.length;
  }
}

export function renderSonorityPanel(row,analysis,{selected,onSelect,categories={alliterations:true,assonances:true},hiddenPhones=new Set(),showSingletons=false,onToggleCategory}){
  row.classList.add('sonorities-row');
  const panel=document.createElement('aside');panel.className='sonorities-panel';
  panel.setAttribute('aria-label','Détail des sonorités du vers');
  for(const [kind,label,empty]of [
    ['alliterations','Allitérations',showSingletons?'Aucun son consonantique.':'Aucune répétition consonantique.'],
    ['assonances','Assonances',showSingletons?'Aucun son vocalique.':'Aucune répétition vocalique.']
  ]){
    const group=document.createElement('section');group.className='sonority-group';group.dataset.kind=kind;
    const title=document.createElement('h3'),toggle=document.createElement('button');
    toggle.type='button';toggle.className='sonority-category-toggle';toggle.textContent=label;toggle.dataset.category=kind;
    toggle.setAttribute('aria-pressed',String(categories[kind]));
    toggle.title='Afficher ou masquer cette catégorie dans ce vers uniquement.';
    toggle.addEventListener('click',()=>onToggleCategory?.(kind));title.append(toggle);group.append(title);
    const body=document.createElement('div');body.className='sonority-category-body';body.hidden=!categories[kind];group.append(body);
    const repetitions=groupsFor(analysis)[kind].filter(sound=>showSingletons||sound.count>1);
    if(!repetitions.length){const note=document.createElement('p');note.className='sonority-empty';note.textContent=empty;body.append(note);}
    else {
      const list=document.createElement('div');list.className='sonority-list';body.append(list);
      repetitions.forEach(sound=>{
        const button=document.createElement('button');button.type='button';button.className='sonority-chip';
        if(sound.count===1)button.classList.add('sonority-singleton');
        if(sound.uncertain)button.classList.add('sonority-uncertain');
        if(sound.prominent)button.classList.add('sonority-distributed');
        if(sound.internalOnly)button.classList.add('sonority-internal');
        button.dataset.phone=sound.phone;button.dataset.occurrences=sound.count;button.dataset.words=sound.wordCount;
        button.dataset.kind=sound.kind;
        button.setAttribute('aria-pressed','false');
        const description='/'+sound.phone+'/ — '+sound.count+' '+(sound.count===1?'occurrence':'occurrences')+' dans '+sound.wordCount+' '+(sound.wordCount===1?'mot':'mots');
        button.setAttribute('aria-label',description);
        const symbol=document.createElement('span');symbol.className='sonority-phone';symbol.textContent='/'+sound.phone+'/';
        const count=document.createElement('span');count.className='sonority-count';count.textContent='×'+sound.count;count.setAttribute('aria-hidden','true');
        button.append(symbol,count);
        applySonorityStyle(button,[sound.phone],{singlePhones:sound.count===1?[sound.phone]:[]});
        const annotations=[];
        if(sound.count===1)annotations.push('son isolé, sans répétition');
        if(sound.semiConsonant)annotations.push('semi-consonne');
        if(sound.internalOnly)annotations.push('répétition interne');
        if(sound.uncertain)annotations.push('lecture variable');
        if(annotations.length){button.dataset.annotations=annotations.join(' · ');button.setAttribute('aria-label',description+'. '+annotations.join(' · '));}
        button.title=description+'. '+(annotations.length?annotations.join(' · ')+'. ':'')+(sound.rankingReason||'')+' Sélectionner ce son pour isoler ses occurrences.';
        button.addEventListener('click',()=>onSelect(sound.phone));
        list.append(button);
      });
    }
    panel.append(group);
  }
  const note=document.createElement('p');note.className='sonority-selection-note';note.setAttribute('role','status');note.hidden=true;panel.append(note);
  row.append(panel);focusSonority(row,analysis,selected,{hiddenPhones,categories,showSingletons});
}

function deltaIPA(before,after){
  const count=ipa=>{const out=new Map();for(const p of phones(ipa))if(p!=='.'&&p!=='‿')out.set(p,(out.get(p)||0)+1);return out;};
  const first=count(before),second=count(after),deltas=[];
  for(const p of new Set([...first.keys(),...second.keys()])){
    const difference=(second.get(p)||0)-(first.get(p)||0);
    if(difference)deltas.push('/'+p+'/ '+(difference>0?'+':'')+difference);
  }
  return deltas.length?deltas.join(' ; '):'mêmes phonèmes';
}

export function renderPoeticOptions(row,line,baseLine,{onChoice}){
  if(!line.poetry)return;
  const ambiguities=line.poetry.ambiguities||[];
  const rules=line.poetry.rules||[];
  const notes=line.poetry.notes||[];
  if(!ambiguities.length&&!rules.length&&!notes.length)return;
  const details=document.createElement('section');details.className='poetry-notes';
  const summary=document.createElement('h4');summary.textContent='Lecture classique'+(ambiguities.length?' · '+ambiguities.length+' '+(ambiguities.length===1?'point à vérifier':'points à vérifier'):'');
  details.append(summary);
  for(const item of ambiguities){
    const token=line.tokens[item.tokenIndex];if(!token||!item.options?.length)continue;
    const label=document.createElement('label');label.className='poetry-choice-label';
    const name=document.createElement('span');name.textContent='« '+(item.word||token.text)+' »';
    const select=document.createElement('select');select.className='poetry-choice';select.dataset.tokenIndex=item.tokenIndex;
    select.setAttribute('aria-label','Lecture de '+(item.word||token.text));
    for(const option of item.options){
      const node=document.createElement('option');node.value=option.ipa;
      node.textContent=option.label+' /'+option.ipa+'/';node.title=option.reason||item.reason||'';select.append(node);
    }
    if([...select.options].some(o=>o.value===token.ipa))select.value=token.ipa;
    select.addEventListener('change',()=>onChoice(item.tokenIndex,select.value));
    label.append(name,select);details.append(label);
    const help=document.createElement('p');help.className='poetry-incidence';
    help.textContent=(item.reason||'Lecture variable.')+' Écart avec la lecture courante : '+deltaIPA(baseLine?.tokens[item.tokenIndex]?.ipa||token.ipa,token.ipa)+'.';
    details.append(help);
  }
  const descriptions=[...new Set([...rules.map(rule=>rule.word+' : '+rule.rule),...notes])];
  if(descriptions.length){
    const list=document.createElement('ul');
    for(const text of descriptions){const item=document.createElement('li');item.textContent=text;list.append(item);}details.append(list);
  }
  row.append(details);
}
