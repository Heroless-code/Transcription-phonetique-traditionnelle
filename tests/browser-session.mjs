import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

export async function session(name){
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),out=path.join(root,'validation');
  const artifact=path.join(root,'Transcription-phonetique-traditionnelle.html'),bytes=fs.readFileSync(artifact);
  const isolated=path.join(out,name+'-isolated');fs.mkdirSync(isolated,{recursive:true});
  const copy=path.join(isolated,'transcription.html');fs.writeFileSync(copy,bytes);
  let require=createRequire(import.meta.url),chromium;
  try{({chromium}=require('playwright'));}catch{require=createRequire(path.join(path.dirname(process.execPath),'..','package.json'));({chromium}=require('playwright'));}
  const executablePath=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
  const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{}),args:['--disable-background-networking','--disable-component-update','--no-first-run']});
  const context=await browser.newContext({offline:true,viewport:{width:1280,height:1000}});
  const report={purpose:'Offline v2 integration: removed color mode, compact Sonorités and phonetic invariants. Not a universal accuracy score.',artifact,sha256:createHash('sha256').update(bytes).digest('hex'),browser:browser.version(),offline:true,requests:[],errors:[],tests:[],metrics:{}};
  context.on('request',r=>{if(/^https?:/iu.test(r.url()))report.requests.push(r.url());});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  page.on('dialog',d=>{report.errors.push('Unexpected dialog: '+d.message());d.dismiss();});
  await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedAPI=text;}}});});
  const start=performance.now();await page.goto(pathToFileURL(copy).href);await page.waitForFunction(()=>!document.getElementById('transcribe-button').disabled,null,{timeout:120000});report.metrics.startupMs=Math.round(performance.now()-start);
  const check=async(name,fn)=>{try{await fn();report.tests.push({name,passed:true});console.log('PASS '+name);}catch(error){report.tests.push({name,passed:false,error:error.message});console.log('FAIL '+name+': '+error.message.split('\n')[0]);}};
  const submit=async(text,keyboard=false)=>{await page.locator('#input-text').fill(text);if(keyboard)await page.locator('#input-text').press('Control+Enter');else await page.locator('#transcribe-button').click();await page.waitForFunction(()=>!document.getElementById('transcribe-button').disabled&&!document.getElementById('result-section').hidden);};
  const rows=()=>page.locator('.line-result:not(.blank-line)'),row=i=>rows().nth(i);
  const ipa=()=>page.locator('.line-phonetic').allTextContents();
  const sonorities=enabled=>page.locator('#sonorities-enabled').setChecked(enabled);
  const singletons=async enabled=>{const b=page.locator('#sonority-singletons');if(await b.getAttribute('aria-pressed')!==String(enabled))await b.click();};
  const chip=(i,p)=>row(i).locator('.sonority-chip[data-phone="'+p.normalize('NFD')+'"]');
  const counts=async(i,p,n,w)=>{const e=chip(i,p);assert.equal(await e.count(),1,p);assert.equal(Number(await e.getAttribute('data-occurrences')),n,p+' occurrences');assert.equal(Number(await e.getAttribute('data-words')),w,p+' words');};
  const copyAPI=async()=>{await page.locator('#copy-button').click();return page.evaluate(()=>window.__copiedAPI);};
  const finish=async()=>{await check('no HTTP requests and no browser errors',()=>{assert.deepEqual(report.requests,[]);assert.deepEqual(report.errors,[]);});await browser.close();report.passed=report.tests.filter(t=>t.passed).length;report.failed=report.tests.length-report.passed;fs.writeFileSync(path.join(out,name+'.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failed:report.failed,metrics:report.metrics},null,2));if(report.failed)process.exitCode=1;};
  return {root,out,artifact,bytes,browser,page,report,check,submit,rows,row,ipa,sonorities,singletons,chip,counts,copyAPI,finish};
}
