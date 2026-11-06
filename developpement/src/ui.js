import { initialize, transcribe } from './engine.js';
import {analyzeSonorities,isAssonance} from './sonorities.js';
import {applyPoeticReading} from './poetry.js';
import {renderSonorityPanel,focusSonority,renderPoeticOptions} from './sonorities-view.js';

const $ = id => document.getElementById(id);
let currentResult = null;
let baseResult = null;
let sonoritiesEnabled = false;
let showSingletons = false;
let poetryChoices = {};
const sonoritySelections = new Map();
const sonorityHiddenPhones = new Map();
const sonorityCategories={alliterations:true,assonances:true};
const sonorityVerseCategories=new Map();
const sonorityCache = new WeakMap();
const openHelpLines = new Set();
let copyTimer;


function notesFor(token) {
  const notes = [];
  for (const note of token.notes || []) {
    const text = typeof note === 'string' ? note : note?.message || note?.text;
    if (text) notes.push(text);
  }
  return notes;
}

function positionHelp(help){
  if(!help.open)return;
  const box=help.querySelector('summary').getBoundingClientRect();
  const below=innerHeight-box.bottom-12,above=box.top-12;
  const upwards=below<240&&above>below;
  help.classList.toggle('opens-upwards',upwards);
  help.querySelector('.verse-help-content').style.maxHeight=Math.max(100,Math.min(innerHeight*.65,(upwards?above:below)-29))+'px';
}

function renderOriginal(container, tokens, original) {
  if (!Array.isArray(tokens)) { container.textContent = original; return; }
  for (const [tokenIndex,token] of tokens.entries()) {
    if (token.type !== 'word') { container.append(document.createTextNode(token.text)); continue; }
    const word = document.createElement('span');
    const uncertain = token.confidence === 'hypothesis' || token.confidence === 'ambiguous' || token.confidence === 'fallback';
    if (uncertain) word.className = 'word-uncertain';
    const notes = notesFor(token);
    if (notes.length) word.title = notes.join('\n');
    const segments = token.segments || [];
    if (sonoritiesEnabled && segments.length && segments.map(s => s.text).join('') === token.text) {
      for (const [segmentIndex,segment] of segments.entries()) {
        const node = document.createElement('span');node.textContent=segment.text;
        if (segment.silent) node.dataset.silent = 'true';
        if (segment.uncertain) {
          node.dataset.uncertain = 'true';
          node.title = 'Correspondance lettres–sons incertaine : ce segment reste sans couleur.';
        }
        if(sonoritiesEnabled){
          node.classList.add('sonority-unit');node.dataset.sonoritySide='original';
          node.dataset.tokenIndex=tokenIndex;node.dataset.segmentIndex=segmentIndex;
        }
        word.append(node);
      }
    } else word.textContent = token.text;
    container.append(word);
  }
}

function render(result) {
  currentResult = result;
  let soundAnalysis=null;
  if(sonoritiesEnabled){
    if(!sonorityCache.has(result))sonorityCache.set(result,analyzeSonorities(result));
    soundAnalysis=sonorityCache.get(result);
  }
  $('sonorities-description').hidden=!sonoritiesEnabled;
  $('result-title').textContent=sonoritiesEnabled?'Sonorités':'Transcription';
  $('sonority-singletons').setAttribute('aria-pressed',String(showSingletons));
  for(const kind of ['alliterations','assonances'])$('sonority-'+kind).setAttribute('aria-pressed',categoryState(kind));
  const fragment = document.createDocumentFragment();
  for (const [lineIndex,line] of (result.lines || []).entries()) {
    const row = document.createElement('article');
    row.className = 'line-result';
    row.dataset.lineIndex=lineIndex;
    if (!line.original?.trim()) {
      row.classList.add('blank-line');
      row.setAttribute('aria-label', 'Ligne vide');
      fragment.append(row); continue;
    }
    const original = document.createElement('div');
    original.className = 'line-original';
    renderOriginal(original, line.tokens, line.original);
    const phonetic = document.createElement('div');
    phonetic.className = 'line-phonetic';
    phonetic.setAttribute('lang', 'fr-fonipa');
    phonetic.textContent='/'+(line.ipa||'')+'/';phonetic.hidden=sonoritiesEnabled;
    const content=soundAnalysis?document.createElement('div'):row;
    if(soundAnalysis){content.className='sonority-text';row.append(content);}
    content.append(original, phonetic);
    if(soundAnalysis){
      const analysis=soundAnalysis.lines[lineIndex];
      const selected=sonoritySelections.get(lineIndex);
      const hiddenPhones=sonorityHiddenPhones.get(lineIndex)||new Set();sonorityHiddenPhones.set(lineIndex,hiddenPhones);
      const categories=sonorityVerseCategories.get(lineIndex)||{...sonorityCategories};sonorityVerseCategories.set(lineIndex,categories);
      renderSonorityPanel(row,analysis,{selected,hiddenPhones,categories,showSingletons,onToggleCategory:kind=>toggleSonorityCategory(kind,lineIndex),onSelect:phone=>{
        if(hiddenPhones.has(phone)){hiddenPhones.delete(phone);sonoritySelections.delete(lineIndex);}
        else if(sonoritySelections.get(lineIndex)===phone){hiddenPhones.add(phone);sonoritySelections.delete(lineIndex);}
        else sonoritySelections.set(lineIndex,phone);
        focusSonority(row,analysis,sonoritySelections.get(lineIndex),{hiddenPhones,categories,showSingletons});
      }});
    }
    const help=document.createElement('details');help.className='verse-help';help.dataset.lineIndex=lineIndex;
    help.open=openHelpLines.has(lineIndex);
    const helpButton=document.createElement('summary');helpButton.className='verse-help-toggle';helpButton.textContent='?';
    if(line.poetry?.ambiguities?.length||line.tokens?.some(t=>['hypothesis','ambiguous','fallback'].includes(t.confidence)))helpButton.classList.add('has-variants');
    helpButton.setAttribute('aria-label','Précisions et variantes du vers '+(lineIndex+1));helpButton.title='Lecture classique, variantes et précisions de prononciation';
    const helpContent=document.createElement('div');helpContent.className='verse-help-content';
    const helpTitle=document.createElement('h3');helpTitle.textContent='Précisions du vers';helpContent.append(helpTitle);
    renderPoeticOptions(helpContent,line,baseResult?.lines[lineIndex],{onChoice:(tokenIndex,ipa)=>{
      poetryChoices[lineIndex]||={};poetryChoices[lineIndex][tokenIndex]=ipa;
      openHelpLines.add(lineIndex);
      refreshReading();
    }});
    if(soundAnalysis){
      const fullList=document.createElement('section');fullList.className='sonority-full-details';
      const heading=document.createElement('h4');heading.textContent=showSingletons?'Tous les sons du vers':'Répétitions du vers';fullList.append(heading);
      for(const [kind,label] of [['alliterations','Allitérations'],['assonances','Assonances']]){
        const groupTitle=document.createElement('h5');groupTitle.textContent=label;fullList.append(groupTitle);
        const list=document.createElement('ul');
        for(const sound of soundAnalysis.lines[lineIndex].soundGroups[kind]){
          if(!showSingletons&&sound.count===1)continue;
          const item=document.createElement('li');
          item.textContent='/'+sound.phone+'/ — '+sound.count+' '+(sound.count===1?'occurrence':'occurrences')+' dans '+sound.wordCount+' '+(sound.wordCount===1?'mot':'mots')+(sound.count===1?' · son isolé':'')+(sound.internalOnly?' · répétition interne':'')+(sound.semiConsonant?' · semi-consonne':'')+(sound.uncertain?' · lecture variable':'');
          list.append(item);
        }
        if(list.children.length)fullList.append(list);else {const empty=document.createElement('p');empty.textContent=showSingletons?'Aucun son de cette catégorie.':'Aucune répétition de cette catégorie.';fullList.append(empty);}
      }
      helpContent.append(fullList);
      const selectionNote=row.querySelector('.sonority-selection-note');if(selectionNote)helpContent.append(selectionNote);
    }
    const allNotes = [...(line.notes || []), ...(line.tokens || []).flatMap(t => notesFor(t).map(n => `${t.text} : ${n}`))];
    const notes = [...new Set(allNotes.filter(n => typeof n === 'string' && n.trim()))];
    if (notes.length) {
      const disclosure = document.createElement('section');
      disclosure.className = 'uncertainty-toggle';
      const summary = document.createElement('h4');
      summary.textContent = notes.length === 1 ? '1 précision de prononciation' : `${notes.length} précisions de prononciation`;
      const list = document.createElement('ul');
      for (const note of notes) { const item = document.createElement('li'); item.textContent = note; list.append(item); }
      disclosure.append(summary, list); helpContent.append(disclosure);
    }
    help.append(helpButton,helpContent);row.append(help);
    help.addEventListener('toggle',()=>{if(help.isConnected){if(help.open){openHelpLines.add(lineIndex);positionHelp(help);}else openHelpLines.delete(lineIndex);}});
    fragment.append(row);
  }
  $('results').replaceChildren(fragment);
  $('result-section').hidden = false;
  const { unknown = 0, ambiguous = 0, unaligned = 0 } = result.stats || {};
  const warnings = [];
  if (unknown) warnings.push(`${unknown} ${unknown === 1 ? 'mot proposé' : 'mots proposés'} par les règles phonétiques`);
  if (ambiguous) warnings.push(`${ambiguous} ${ambiguous === 1 ? 'ambiguïté signalée' : 'ambiguïtés signalées'}`);
  if (sonoritiesEnabled && unaligned) warnings.push(`${unaligned} ${unaligned === 1 ? 'correspondance lettres–sons partielle' : 'correspondances lettres–sons partielles'}`);
  $('result-note').textContent = warnings.length ? warnings.join(' · ') + '. Précisions dans « ? ».' : '';
}

function refreshReading(){
  if(!baseResult)return;
  const result=applyPoeticReading(baseResult,{choices:poetryChoices});
  render(result);
}

function setSonorities(enabled){sonoritiesEnabled=enabled;if(currentResult)render(currentResult);}

function categoryState(kind){
  const values=(currentResult?.lines||[]).flatMap((line,i)=>line.original?.trim()?[(sonorityVerseCategories.get(i)||sonorityCategories)[kind]]:[]);
  if(!values.length)return String(sonorityCategories[kind]);
  return values.every(Boolean)?'true':values.every(v=>!v)?'false':'mixed';
}
function toggleSonorityCategory(kind,lineIndex){
  const global=lineIndex===undefined;
  const enabled=global?categoryState(kind)!=='true':!(sonorityVerseCategories.get(lineIndex)||sonorityCategories)[kind];
  if(global)sonorityCategories[kind]=enabled;
  for(const [i,line]of (currentResult?.lines||[]).entries()){
    if(!line.original?.trim()||!global&&i!==lineIndex)continue;
    const categories=sonorityVerseCategories.get(i)||{...sonorityCategories};categories[kind]=enabled;sonorityVerseCategories.set(i,categories);
    const phone=sonoritySelections.get(i);
    if(!enabled&&phone&&(isAssonance(phone)?'assonances':'alliterations')===kind)sonoritySelections.delete(i);
  }
  if(currentResult)render(currentResult);
  if(!global)document.querySelector('.line-result[data-line-index="'+lineIndex+'"] .sonority-category-toggle[data-category="'+kind+'"]')?.focus({preventScroll:true});
}

async function run(event) {
  event?.preventDefault();
  const text = $('input-text').value;
  if (!text.trim()) { $('input-text').focus(); $('status').textContent = 'Saisissez un texte à transcrire.'; return; }
  const button = $('transcribe-button');
  button.disabled = true;
  button.textContent = 'Transcription…';
  $('status').classList.remove('error');
  $('status').textContent = '';
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  try {
    baseResult=transcribe(text);poetryChoices={};sonoritySelections.clear();sonorityHiddenPhones.clear();sonorityVerseCategories.clear();openHelpLines.clear();
    const result=applyPoeticReading(baseResult,{choices:poetryChoices});
    render(result);
    const words = result.stats?.words ?? 0;
    $('status').textContent = `${words.toLocaleString('fr-FR')} ${words === 1 ? 'mot transcrit' : 'mots transcrits'}.`;
  } catch (error) {
    $('status').classList.add('error');
    $('status').textContent = 'La transcription a rencontré une difficulté. Réessayez avec un passage plus court.';
    console.error(error);
  } finally { button.disabled = false; button.textContent = 'Transcrire'; }
}

$('transcription-form').addEventListener('submit', run);
$('input-text').addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !$('transcribe-button').disabled) run(event);
});
$('sonorities-enabled').addEventListener('change',()=>setSonorities($('sonorities-enabled').checked));
for(const kind of ['alliterations','assonances'])$('sonority-'+kind).addEventListener('click',()=>toggleSonorityCategory(kind));
$('sonority-singletons').addEventListener('click',()=>{
  showSingletons=!showSingletons;
  if(!showSingletons&&currentResult){
    const analysis=sonorityCache.get(currentResult)||analyzeSonorities(currentResult);
    for(const [line,phone]of sonoritySelections){
      const sounds=analysis.lines[line]?.soundGroups;
      if(sounds&&[...sounds.alliterations,...sounds.assonances].some(g=>g.phone===phone&&g.count===1))sonoritySelections.delete(line);
    }
  }
  if(currentResult)render(currentResult);
});
document.addEventListener('pointerdown',event=>{
  for(const help of document.querySelectorAll('.verse-help[open]'))if(!help.contains(event.target)){help.open=false;openHelpLines.delete(Number(help.dataset.lineIndex));}
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape')for(const help of document.querySelectorAll('.verse-help[open]')){help.open=false;help.querySelector('summary').focus();}
});
window.addEventListener('resize',()=>{for(const help of document.querySelectorAll('.verse-help[open]'))positionHelp(help);});
$('copy-button').addEventListener('click', async () => {
  if (!currentResult) return;
  const text = currentResult.lines.map(line => line.original?.trim() ? `/${line.ipa || ''}/` : '').join('\n');
  let copied = false;
  try { await navigator.clipboard.writeText(text); copied = true; } catch {
    const field = document.createElement('textarea');
    field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
    document.body.append(field); field.select();
    try { copied = document.execCommand('copy'); } catch { /* The API remains selectable. */ }
    field.remove();
  }
  $('copy-button').textContent = copied ? 'Copié' : 'Sélectionnez la transcription';
  clearTimeout(copyTimer); copyTimer = setTimeout(() => { $('copy-button').textContent = 'Copier l’API'; }, 2200);
});

initialize().then(() => {
  $('transcribe-button').disabled = false;
  $('transcribe-button').textContent = 'Transcrire';
  $('status').textContent = 'Prêt. Le texte reste sur cet appareil.';
}).catch(error => {
  $('status').classList.add('error');
  $('status').textContent = 'Le lexique local n’a pas pu être chargé dans ce navigateur. Ouvrez ce fichier dans une version récente de Firefox, Chrome, Edge ou Safari.';
  $('transcribe-button').textContent = 'Indisponible';
  console.error(error);
});
