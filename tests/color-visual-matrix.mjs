/** Real-browser, offline visual matrix. Writes only color-matrix-* artifacts. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const artifact=path.resolve(process.argv.find(a=>a.endsWith('.html'))||path.join(root,'Transcription-phonetique-traditionnelle.html'));
const initial=process.argv.includes('--initial'),customPhase=process.argv.find(a=>a.startsWith('--phase='))?.slice(8),phase=initial?'initial':customPhase||'final';
assert.match(phase,/^[a-z0-9-]+$/u);
const out=path.join(root,'validation'),prefix=path.join(out,'color-matrix-');
const reportPath=prefix+phase+'.json';
if(initial&&fs.existsSync(reportPath))throw new Error('Initial visual report is immutable.');
const isolated=prefix+'isolated';fs.mkdirSync(isolated,{recursive:true});
const copy=path.join(isolated,'transcription.html'),artifactBytes=fs.readFileSync(artifact);fs.writeFileSync(copy,artifactBytes);
let require=createRequire(import.meta.url),chromium;
try{({chromium}=require('playwright'));}catch{require=createRequire(path.join(path.dirname(process.execPath),'..','package.json'));({chromium}=require('playwright'));}
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--disable-background-networking','--disable-component-update','--no-first-run']});
const context=await browser.newContext({offline:true,viewport:{width:1280,height:1000}});
const report={artifact,sha256:createHash('sha256').update(artifactBytes).digest('hex'),browser:browser.version(),offline:true,phase,tests:[],metrics:{},errors:[],requests:[],modes:[]};
context.on('request',r=>{if(/^https?:/i.test(r.url()))report.requests.push(r.url());});
const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedAPI=text;}}});});
const sample=[
 'Un lien, loin d’un taxi, les oiseaux et le travail.',
 'Un brin, un brun, un banc, un bon vin.',
 'Les beaux enfants ont un grand ami ; les héros arrivent.',
 'L’e\u0301le\u0300ve voit l’eau, la pluie et une ambiguïté.',
 'Aha ! Un bahaï du Bihar et les haricots.'
].join('\n');
report.sample=sample;
const labels=['Aucune catégorie','Voyelles','Consonnes','Voyelles + consonnes','Nasalisations','Voyelles + nasalisations','Consonnes + nasalisations','Les trois catégories'];
async function check(name,fn){try{const details=await fn();report.tests.push({name,passed:true,...details?{details}:{}});console.log('PASS '+name);}catch(e){report.tests.push({name,passed:false,error:e.message});console.log('FAIL '+name+': '+e.message.split('\n')[0]);}}
async function submit(text){await page.locator('#input-text').fill(text);await page.locator('#transcribe-button').click();await page.waitForFunction(()=>!document.getElementById('transcribe-button').disabled&&!document.getElementById('result-section').hidden);}
async function mode(mask){await page.locator('#color-options').evaluate(e=>{e.open=true;});await page.locator('#color-enabled').check();for(const[id,bit]of [['color-vowels',1],['color-consonants',2],['color-nasals',4]])await page.locator('#'+id).setChecked(Boolean(mask&bit));await page.locator('#color-options').evaluate(e=>{e.open=false;});}
async function inspected(){return page.evaluate(()=>{
 const luma=color=>{const channels=color.startsWith('#')?color.slice(1).match(/../g).map(v=>parseInt(v,16)):color.match(/[\d.]+/g).slice(0,3).map(Number);const c=channels.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
 const spans=[...document.querySelectorAll('.sound')].map(s=>{const st=getComputedStyle(s),a=luma(st.color),b=luma(st.backgroundColor),nasal=s.classList.contains('sound-nasal'),accent=st.getPropertyValue('--nasal-accent').trim();let nasalContrast=null;if(nasal&&accent){const c=luma(accent);nasalContrast=(Math.max(c,b)+.05)/(Math.min(c,b)+.05);}return {text:s.textContent,phone:s.dataset.phoneme,layers:(s.dataset.layers||'').split(' '),contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),ink:st.color,background:st.backgroundColor,nasal,shared:s.classList.contains('sound-shared'),accent,nasalContrast,backgroundImage:st.backgroundImage,backgroundPosition:st.backgroundPosition,backgroundSize:st.backgroundSize,paddingBottom:parseFloat(st.paddingBottom),decoration:st.textDecorationLine};});
 const geometry=[...document.querySelectorAll('.line-result:not(.blank-line)')].map(e=>{const a=e.querySelector('.line-original'),b=e.querySelector('.line-phonetic'),paintedBottom=Math.max(a.getBoundingClientRect().bottom,...[...a.querySelectorAll('.sound')].flatMap(s=>[...s.getClientRects()].map(r=>r.bottom)));return {originalBottom:a.getBoundingClientRect().bottom,paintedOriginalBottom:paintedBottom,ipaTop:b.getBoundingClientRect().top,originalOverflow:a.scrollWidth>a.clientWidth+1,ipaOverflow:b.scrollWidth>b.clientWidth+1};});
 return {spans,geometry,overflow:document.documentElement.scrollWidth>innerWidth,original:[...document.querySelectorAll('.line-original')].map(e=>e.textContent),ipa:[...document.querySelectorAll('.line-phonetic')].map(e=>e.textContent),silentsColored:document.querySelectorAll('[data-silent="true"].sound,[data-uncertain="true"].sound').length};
 });}
try{
 const start=performance.now();await page.goto(pathToFileURL(copy).href);await page.waitForFunction(()=>!document.getElementById('transcribe-button').disabled,null,{timeout:120000});report.metrics.startupMs=Math.round(performance.now()-start);
 await submit(sample);const canonical=await inspected();
 await page.locator('#color-enabled').uncheck();
 await check('master switch off is neutral',async()=>assert.equal((await inspected()).spans.length,0));
 for(let mask=0;mask<8;mask++){
  await mode(mask);const view=await inspected();
  await check(`mode ${mask}: source, API, selected layers, silent and uncertain segments`,async()=>{
   assert.deepEqual(view.original,sample.split('\n'));assert.deepEqual(view.ipa,canonical.ipa);assert.equal(view.silentsColored,0);
   if(mask===0)assert.equal(view.spans.length,0);else assert.ok(view.spans.length>0);
   for(const span of view.spans){for(const layer of span.layers)assert.ok(mask&({vowel:1,consonant:2,nasal:4}[layer]),span.phone+' wrongly includes '+layer);if(span.nasal)assert.ok(mask&4);assert.ok(span.contrast>=4.5,JSON.stringify(span));}
   if(!(mask&4))assert.equal(view.spans.some(s=>s.nasal),false);
   assert.equal(view.spans.some(s=>s.phone==='h'),Boolean(mask&2),'Le /h/ réellement prononcé suit l’option Consonnes.');
  });
  await check(`mode ${mask}: nasal accents have an explicit background and internal space`,async()=>{
   for(const span of view.spans.filter(s=>s.nasal)){
    assert.ok(span.accent&&span.nasalContrast>=3.2,JSON.stringify(span));
    assert.ok(span.paddingBottom>=(span.shared?8:4));
    assert.equal(span.decoration.includes('underline'),false,'L’accent ne repose plus sur une décoration extérieure au fond.');
    assert.ok((span.backgroundImage.match(/linear-gradient\(/g)||[]).length>=(span.shared?4:2));
    assert.ok(span.backgroundPosition.includes('calc(100% - 2px)'));
    if(span.shared)assert.ok(span.backgroundPosition.includes('calc(100% - 4px)'));
    assert.ok(span.backgroundSize.split(',').filter(size=>size.trim()==='100% 1px').length>=2);
   }
  });
  await check(`mode ${mask}: copy emits exactly the same API`,async()=>{await page.locator('#copy-button').click();assert.equal(await page.evaluate(()=>window.__copiedAPI),canonical.ipa.join('\n'));});
  await check(`mode ${mask}: aspirated orthographic h stays neutral`,async()=>{
   const h=await page.locator('.line-original>span').evaluateAll(words=>{
    const word=words.find(w=>w.textContent.toLocaleLowerCase('fr')==='haricots');
    const letter=word&&[...word.children].find(s=>s.textContent==='h');
    return letter?{silent:letter.dataset.silent,colored:letter.classList.contains('sound')}:null;
   });
   assert.ok(h);assert.equal(h.silent,'true');assert.equal(h.colored,false);
  });
  report.modes.push({mask,label:labels[mask],coloredSpans:view.spans.length,minimumContrast:view.spans.length?Math.min(...view.spans.map(s=>s.contrast)):null,minimumNasalAccentContrast:view.spans.some(s=>s.nasal)?Math.min(...view.spans.filter(s=>s.nasal).map(s=>s.nasalContrast)):null,shared:view.spans.filter(s=>s.shared)});
  await page.locator('#results').screenshot({path:prefix+phase+'-mode-'+mask+'.png'});
  for(const width of [320,390,768,1280]){
   await page.setViewportSize({width,height:1000});
   await check(`mode ${mask}: width ${width} has no clipping or row collisions`,async()=>{const v=await inspected();assert.equal(v.overflow,false);assert.ok(v.geometry.every(g=>!g.originalOverflow&&!g.ipaOverflow&&g.ipaTop>=g.originalBottom&&g.ipaTop>=g.paintedOriginalBottom));});
   await page.locator('#color-options').evaluate(e=>{e.open=true;});
   await check(`mode ${mask}: width ${width} option menu remains in viewport`,async()=>{
    const box=await page.locator('#color-options fieldset').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1,JSON.stringify(box));
   });
   await page.locator('#color-options').evaluate(e=>{e.open=false;});
  }
 }
 await page.setViewportSize({width:390,height:1000});await mode(7);await page.screenshot({path:prefix+phase+'-mobile.png',fullPage:true});await page.setViewportSize({width:1280,height:1000});
 await check('long colored text: 200 paragraphs and 12 mask changes stay fluid',async()=>{
  const long='Les beaux enfants ont un lien avec les oiseaux ; un taxi traverse le jardin.\n'.repeat(200).trim();
  const start=performance.now();await submit(long);report.metrics.coloredParagraphMs=Math.round(performance.now()-start);report.metrics.coloredWords=(long.match(/\p{L}+/gu)||[]).length;
  const stable=(await inspected()).ipa.join('\n');const timings=[];
  for(let i=0;i<12;i++){const start=performance.now();await mode(i%8);timings.push(Math.round(performance.now()-start));assert.equal((await inspected()).ipa.join('\n'),stable);}
  report.metrics.longMaskChangesMs=timings;assert.ok(report.metrics.coloredParagraphMs<10000);assert.ok(timings.every(t=>t<5000));
 });
 await check('offline, no HTTP and no errors',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.requests,[]);});
 // Contact sheet contains images of the production rendering, without recoloring.
 const cards=labels.map((label,mask)=>`<section><h2>${mask.toString(2).padStart(3,'0')} · ${label}</h2><img src="data:image/png;base64,${fs.readFileSync(prefix+phase+'-mode-'+mask+'.png').toString('base64')}" alt="${label}"></section>`).join('');
 const matrix='<!doctype html><html lang="fr"><meta charset="utf-8"><title>Comparaison des huit sélections</title><style>body{margin:0;padding:24px;background:#eff1ed;color:#41494b;font-family:Arial,sans-serif}h1{font-size:24px;font-weight:500;margin:0 0 20px}.grid{display:grid;grid-template-columns:repeat(2,846px);gap:20px}section{background:#f6f7f5;border:1px solid #ccd5cf;border-radius:8px;overflow:hidden}h2{font-size:16px;font-weight:500;margin:0;padding:15px 18px;border-bottom:1px solid #dce2de}img{display:block;width:846px;height:auto}</style><h1>Rendu réel — huit combinaisons de couleurs</h1><div class="grid">'+cards+'</div></html>';
 fs.writeFileSync(prefix+phase+'.html',matrix);const sheet=await context.newPage();await sheet.setViewportSize({width:1760,height:1000});await sheet.goto(pathToFileURL(prefix+phase+'.html').href);await sheet.screenshot({path:prefix+phase+'.png',fullPage:true});await sheet.close();
}finally{await browser.close();report.passed=report.tests.filter(t=>t.passed).length;report.failed=report.tests.length-report.passed;fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify({passed:report.passed,failed:report.failed,metrics:report.metrics},null,2));if(report.failed)process.exitCode=1;
