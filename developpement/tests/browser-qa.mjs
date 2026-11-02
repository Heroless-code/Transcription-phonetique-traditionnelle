import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {session} from './browser-session.mjs';
const s=await session('browser-report'),{page,report,check,submit,rows,ipa,sonorities,copyAPI}=s;
try{
  await check('standalone HTML starts offline without the removed controls or color module',async()=>{
    assert.equal(await page.title(),'Transcription phonétique traditionnelle');
    assert.equal(await page.locator('#color-enabled,#color-options,#color-vowels,#color-consonants,#color-nasals').count(),0);
    assert.equal(await page.locator('#sonorities-enabled').isChecked(),false);
    assert.ok(!/composeColors|styleForPhone|color-model\.js|color-enabled|colors-row|phonemeStyle/u.test(s.bytes.toString()));
    const build=JSON.parse(fs.readFileSync(path.join(s.root,'dist/build.json'),'utf8'));assert.equal(build.sha256,report.sha256);
    assert.ok(!build.modules.includes('color-model.js'));assert.ok(build.modules.includes('color-math.js'));
  });
  await check('button and shortcut stay at the left above the single Sonorités control',async()=>{
    const box=await page.evaluate(()=>{const b=document.getElementById('transcribe-button').getBoundingClientRect(),h=document.querySelector('.keyboard-hint').getBoundingClientRect(),f=document.getElementById('input-text').getBoundingClientRect(),son=document.querySelector('.sonorities-control').getBoundingClientRect();return {button:b.toJSON(),hint:h.toJSON(),field:f.toJSON(),son:son.toJSON()};});
    assert.ok(Math.abs(box.button.x-box.field.x)<2);assert.ok(box.hint.x>=box.button.right);assert.ok(box.son.y>box.button.bottom);
  });
  await submit('Les enfants jouent dans le jardin.\n\nLa lune brille.');
  await check('original lines, blank stanzas and visible plain API are preserved by default',async()=>{
    assert.equal(await page.locator('.line-result').count(),3);assert.equal(await page.locator('.blank-line').count(),1);
    assert.deepEqual(await page.locator('.line-original').allTextContents(),['Les enfants jouent dans le jardin.','La lune brille.']);
    assert.ok((await ipa())[0].includes('z‿'));assert.ok((await ipa())[1].includes('ly.nə'));
    for(const e of await page.locator('.line-phonetic').all())assert.equal(await e.isVisible(),true);
    assert.equal(await page.locator('.line-original').evaluateAll(es=>es.every(e=>e.nextElementSibling.className==='line-phonetic')),true);
  });
  await check('base fonts and dark grey remain legible, and API is selectable',async()=>{
    const value=await page.evaluate(()=>{const a=document.querySelector('.line-original'),b=document.querySelector('.line-phonetic'),range=document.createRange();range.selectNodeContents(b);getSelection().removeAllRanges();getSelection().addRange(range);return {sizes:['#input-text','.line-original','.line-phonetic'].map(s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize)),ink:getComputedStyle(a).color,selected:getSelection().toString(),text:b.textContent};});
    assert.deepEqual(value.sizes,[16,16,14]);assert.equal(value.ink,'rgb(65, 73, 75)');assert.equal(value.selected,value.text);
  });
  await check('Sonorités hides the API rows and disabling it restores the identical transcription',async()=>{
    const before=await ipa(),height=(await rows().first().boundingBox()).height;
    await sonorities(true);for(const e of await page.locator('.line-phonetic').all())assert.equal(await e.isVisible(),false);
    assert.equal(await page.locator('.line-phonetic .sonority-unit').count(),0);assert.equal(await page.locator('#result-title').textContent(),'Sonorités');
    assert.deepEqual(await ipa(),before);assert.equal(await copyAPI(),before.join('\n\n'));
    await sonorities(false);assert.deepEqual(await ipa(),before);assert.equal(await page.locator('.line-phonetic').first().isVisible(),true);
    assert.equal(await page.locator('#result-title').textContent(),'Transcription');assert.ok((await rows().first().boundingBox()).height>=height-1);
  });
  await check('unknown words keep a usable conjecture and pronunciation details',async()=>{
    await submit('plourimètre plourimètre');assert.ok((await ipa())[0].length>4);assert.ok(await page.locator('.word-uncertain').count()>0);
    await page.locator('.verse-help>summary').click();assert.match(await page.locator('.verse-help-content').textContent(),/hypoth|règles|déduit/iu);
  });
  await check('text remains text, including hostile markup and exact Unicode source',async()=>{
    const text='<img src=x onerror=alert(1)> L’e\u0301le\u0300ve « & » 🙂';await submit(text);
    assert.equal(await page.locator('.line-original').textContent(),text);assert.equal(await page.locator('#results img,#results script,#results svg').count(),0);
  });
  await check('keyboard shortcut transcribes',async()=>{await submit('Bonjour.',true);assert.equal(await page.locator('.line-original').textContent(),'Bonjour.');});
  await check('code-review pronunciation corrections survive the removal of visual metadata',async()=>{
    const cases=[['Le mot à traduire.','/lə mo a tʁa.dɥiʁ./'],['Les petits os.','/le pə.ti.z‿o./'],['1\u202f000 euros','/mil ø.ʁo/'],['Je donne à cette classe 21 tulipes.','/ʒə dɔn a sɛ.tə kla.sə vɛ̃.t‿e yn ty.lip./'],['sous-évaluer','/su.ze.va.lɥe/']];
    await submit(cases.map(c=>c[0]).join('\n'));assert.deepEqual(await ipa(),cases.map(c=>c[1]));
  });
  await check('canonical Unicode spellings retain identical API without color-mode metadata',async()=>{
    const t='L’élève voit une pâte et un maître.';await submit(t+'\n'+t.normalize('NFD'));const ps=await ipa();assert.equal(ps[0],ps[1]);
    assert.deepEqual(await page.locator('.line-original').allTextContents(),[t,t.normalize('NFD')]);
  });
  await check('long multiline text stays contained and mode changes preserve the hidden API',async()=>{
    const text=Array(120).fill('Les enfants voient le bateau.').join('\n');let start=performance.now();await submit(text);report.metrics.multiline120Ms=Math.round(performance.now()-start);
    assert.equal(await rows().count(),120);const before=await ipa();
    for(let i=0;i<4;i++){await sonorities(i%2===0);assert.deepEqual(await ipa(),before);}
    assert.ok(report.metrics.multiline120Ms<10000);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  });
  for(const width of [320,390,768,1280])await check('plain and Sonorités layouts fit width '+width,async()=>{
    await page.setViewportSize({width,height:1000});await submit('Les beaux enfants voient un taxi et un lien.\nLa lune brille.');
    for(const enabled of [false,true]){await sonorities(enabled);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.locator('.line-phonetic').first().isVisible(),!enabled);}
  });
  await page.setViewportSize({width:1280,height:1000});await sonorities(false);await page.screenshot({path:path.join(s.out,'v2-transcription-desktop.png'),fullPage:true});
}finally{await s.finish();}
