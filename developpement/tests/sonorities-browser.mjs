import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {session} from './browser-session.mjs';
import {sonorityStyle} from '../src/sonority-colors.js';
const s=await session('sonorities-browser'),{page,report,check,submit,row,rows,ipa,sonorities,singletons,chip,counts,copyAPI}=s;
const racine='Pour qui sont ces serpents qui sifflent sur vos têtes ?';
const press=(i,p)=>chip(i,p).click();
const paints=async i=>row(i).locator('.sonority-overview').evaluateAll(es=>es.flatMap(e=>JSON.parse(e.dataset.sonorityPhones)));
const global=async(kind,on)=>{const b=page.locator('#sonority-'+kind);if(await b.getAttribute('aria-pressed')!==String(on))await b.click();};
const local=(i,kind)=>row(i).locator('.sonority-category-toggle[data-category="'+kind+'"]').click();
try{
  await submit(racine+'\n'+racine);const reference=await ipa();
  await check('Sonorités hides every API row while analysis and full API copy stay intact',async()=>{
    await sonorities(true);assert.equal(await page.locator('.line-phonetic:visible').count(),0);assert.equal(await copyAPI(),reference.join('\n'));
    assert.equal(await page.locator('.line-phonetic .sonority-unit').count(),0);assert.deepEqual(await ipa(),reference);
    assert.equal(await page.locator('#color-enabled,#color-options').count(),0);
  });
  await check('five Racine s sounds remain counted and c in ces is selectable',async()=>{
    for(let i=0;i<2;i++)await counts(i,'s',5,5);
    await press(0,'s');const text=await row(0).locator('.sonority-hit').allTextContents();assert.equal(text.length,5);assert.ok(text.includes('c'));
    assert.equal(await row(1).locator('.sonority-hit').count(),0);assert.equal(await page.locator('.line-phonetic:visible').count(),0);
  });
  await check('second click hides the color, third restores it, without touching counts or other verses',async()=>{
    await press(0,'s');assert.equal(await chip(0,'s').getAttribute('data-sonority-state'),'hidden');assert.equal((await paints(0)).includes('s'),false);assert.equal((await paints(1)).includes('s'),true);await counts(0,'s',5,5);
    await press(0,'s');assert.equal(await chip(0,'s').getAttribute('data-sonority-state'),'visible');assert.equal((await paints(0)).includes('s'),true);assert.deepEqual(await ipa(),reference);
  });
  await check('the x1 button remains off by default and adds the existing lighter palette only on request',async()=>{
    assert.equal(await page.locator('#sonority-singletons').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('.sonority-chip.sonority-singleton').count(),0);
    await singletons(true);assert.ok(await page.locator('.sonority-chip.sonority-singleton').count()>0);
    const values=await page.locator('.sonority-chip').evaluateAll(es=>es.map(e=>({p:e.dataset.phone,single:Number(e.dataset.occurrences)===1,bg:e.style.getPropertyValue('--sonority-background').trim()})));
    for(const v of values)assert.equal(v.bg,sonorityStyle(v.p,{single:v.single}).background);
    await singletons(false);assert.equal(await page.locator('.sonority-chip.sonority-singleton').count(),0);assert.deepEqual(await ipa(),reference);
  });
  for(const [text,expected]of [
    ['tache tâche tache tâche',[['a',2,2],['ɑː',2,2]]],
    ['mettre maître mettre maître',[['ɛ',2,2],['ɛː',2,2]]],
    ['fée fait fée fait',[['e',2,2],['ɛ',2,2]]],
    ['brin brun brin brun',[['ɛ̃',2,2],['œ̃',2,2]]],
    ['cote côte cote côte',[['ɔ',2,2],['oː',2,2]]],
    ['jeune jeûne jeune jeûne',[['œ',2,2],['øː',2,2]]]
  ])await check('traditional phone distinctions: '+text,async()=>{await submit(text);for(const [p,n,w]of expected)await counts(0,p,n,w);});
  for(const [text,p]of [['yeux yeux','j'],['oui oui','w'],['huit huit','ɥ']])await check('semi-consonant classification: '+p,async()=>{
    await submit(text);await counts(0,p,2,2);assert.match(await chip(0,p).getAttribute('aria-label'),/semi-consonne/u);
  });
  await check('nasalization and length marks are never standalone entries',async()=>{
    await submit('an an an maître maître');await counts(0,'ɑ̃',3,3);await counts(0,'ɛː',2,2);
    const ps=await page.locator('.sonority-chip').evaluateAll(es=>es.map(e=>e.dataset.phone));for(const p of ['̃','ː','.','‿'])assert.equal(ps.includes(p),false);
  });
  await check('silent and doubled letters never add fake occurrences',async()=>{
    await submit('sacs sacs belle belle');await counts(0,'s',2,2);await counts(0,'l',2,2);
    assert.equal(await chip(0,'z').count(),0);assert.equal(await page.locator('[data-silent=true].sonority-overview,[data-uncertain=true].sonority-overview').count(),0);
  });
  await check('liaisons and denasalizations still come from the final pronunciation',async()=>{
    await submit('Les enfants, les enfants.');await counts(0,'z',2,2);
    await submit('Un bon ami, un bon ami.');await counts(0,'ɔ',2,2);assert.equal(await chip(0,'ɔ̃').count(),0);
  });
  for(const [text,p,n,w]of [['abracadabra','a',5,1],['sac sac','s',2,2],['l’élément l’élément','l',4,2],['tête-à-tête','t',4,1],['21 21','v',2,2],['1 000 1 000','m',2,2]])await check('graphic word counts: '+text,async()=>{await submit(text);await counts(0,p,n,w);});
  await check('separate verses and blank stanzas never create cross-verse repetitions',async()=>{
    await submit('sac\n\nsac');assert.equal(await page.locator('.line-result').count(),3);assert.equal(await page.locator('.blank-line').count(),1);assert.equal(await page.locator('.sonority-chip').count(),0);
    await singletons(true);assert.equal(await page.locator('.sonority-chip').count(),6);assert.equal(await page.locator('.sonority-chip:not(.sonority-singleton)').count(),0);await singletons(false);
  });
  await check('unknown pronunciations and uncertain orthographic anchors remain qualified despite the hidden API',async()=>{
    await submit('plourimètre plourimètre');await counts(0,'p',2,2);assert.match(await row(0).textContent(),/hypoth|déduit|incertain/iu);
    await submit('21 21');await press(0,'v');assert.equal(await row(0).locator('.sonority-hit').count(),0);assert.match(await row(0).textContent(),/certitude|décompte/iu);assert.ok((await copyAPI()).includes('v'));
  });
  await check('hiding one phone of x keeps its other phone and removing both clears all stale paint',async()=>{
    await submit('taxi taxi');await press(0,'k');await press(0,'k');const graphs=row(0).locator('.sonority-unit').filter({hasText:'x'});
    for(const ps of await graphs.evaluateAll(es=>es.map(e=>JSON.parse(e.dataset.sonorityPhones))))assert.deepEqual(ps,['s']);
    await press(0,'s');await press(0,'s');assert.equal(await graphs.evaluateAll(es=>es.some(e=>e.classList.contains('sonority-overview'))),false);
    await press(0,'k');for(const ps of await graphs.evaluateAll(es=>es.map(e=>JSON.parse(e.dataset.sonorityPhones))))assert.deepEqual(ps,['k']);
  });
  await check('all four global filter combinations work without revealing the API',async()=>{
    await submit(racine+'\n'+racine);const before=await ipa();
    for(const mask of [0,1,2,3]){
      await global('alliterations',Boolean(mask&1));await global('assonances',Boolean(mask&2));
      for(let i=0;i<2;i++){assert.equal(await row(i).locator('.sonority-alliteration').count()>0,Boolean(mask&1));assert.equal(await row(i).locator('.sonority-assonance').count()>0,Boolean(mask&2));}
      assert.equal(await page.locator('.line-phonetic:visible').count(),0);assert.deepEqual(await ipa(),before);
    }
  });
  await check('verse category titles affect only their own verse and master buttons show mixed states',async()=>{
    await local(0,'alliterations');assert.equal(await row(0).locator('.sonority-alliteration').count(),0);assert.ok(await row(1).locator('.sonority-alliteration').count()>0);assert.equal(await page.locator('#sonority-alliterations').getAttribute('aria-pressed'),'mixed');await global('alliterations',true);
    await local(1,'assonances');assert.equal(await row(1).locator('.sonority-assonance').count(),0);assert.ok(await row(0).locator('.sonority-assonance').count()>0);await global('assonances',true);
  });
  await check('a shared oi graph keeps only the active category tint',async()=>{
    await submit('moi moi loin loin');const shared=row(0).locator('.sonority-alliteration.sonority-assonance').first();assert.match(await shared.evaluate(e=>getComputedStyle(e).backgroundImage),/linear-gradient/u);
    await global('alliterations',false);assert.equal(await row(0).locator('.sonority-assonance').first().evaluate(e=>getComputedStyle(e).backgroundImage),'none');await global('alliterations',true);
  });
  await check('the reported four lines show exactly three /e/ highlights in the first verse',async()=>{
    await submit('Pour faire défiler les ptits culs\nAu milieu des comètes\nParfois au milieu de la nuit j’envoie je fuis\nEnvoyer crucifié');
    await counts(0,'e',3,2);await counts(3,'e',2,2);
    await press(0,'e');
    assert.deepEqual(await row(0).locator('.sonority-hit').allTextContents(),['é','er','e']);
    assert.match((await ipa())[0],/\ble pti ky\//u);
    assert.equal(await copyAPI(),(await ipa()).join('\n'));
  });
  await check('oi and ui can be isolated as assonances while each glide keeps its category',async()=>{
    await submit('Parfois au milieu de la nuit j’envoie je fuis');
    await counts(0,'wa',2,2);await counts(0,'ɥi',2,2);await counts(0,'a',2,2);
    assert.equal(await chip(0,'i').count(),0);
    await press(0,'wa');
    assert.deepEqual(await row(0).locator('.sonority-hit').allTextContents(),['oi','oi']);
    await press(0,'ɥi');
    assert.deepEqual((await row(0).locator('.sonority-hit').allTextContents()).join(''),'uiui');
    assert.equal(await chip(0,'ɥi').getAttribute('data-kind'),'assonance');
    assert.equal(await chip(0,'ɥi').evaluate(e=>e.style.getPropertyValue('--sonority-background')),sonorityStyle('ɥi').background);
    await local(0,'alliterations');
    assert.equal(await chip(0,'ɥi').getAttribute('data-sonority-state'),'focused');
    await local(0,'assonances');
    assert.equal(await row(0).locator('.sonority-hit').count(),0);
    await local(0,'assonances');
    assert.equal(await chip(0,'ɥi').getAttribute('data-sonority-state'),'visible');
    await local(0,'alliterations');
  });
  await check('x1 respects per-verse counts, category filters and focus clearing',async()=>{
    await submit('sac\nsac sac');await singletons(false);assert.equal(await row(0).locator('.sonority-chip').count(),0);assert.equal(await row(1).locator('.sonority-chip').count(),3);
    await singletons(true);await counts(0,'s',1,1);await press(0,'s');await singletons(false);assert.equal(await row(0).locator('.sonority-hit,.sonority-muted').count(),0);
    await local(0,'alliterations');await singletons(true);assert.equal(await row(0).locator('.sonority-alliteration').count(),0);await local(0,'alliterations');await singletons(false);
  });
  await check('hidden sounds, filters and visible API restoration survive Sonorités mode changes',async()=>{
    await submit('sac sac\nsac sac');const before=await ipa();await press(0,'s');await press(0,'s');await local(1,'assonances');
    await sonorities(false);assert.equal(await page.locator('.line-phonetic:visible').count(),2);assert.deepEqual(await ipa(),before);
    await sonorities(true);assert.equal(await chip(0,'s').getAttribute('data-sonority-state'),'hidden');assert.equal(await row(1).locator('.sonority-assonance').count(),0);assert.deepEqual(await ipa(),before);
    await global('assonances',true);
  });
  await check('NFC and NFD spellings keep identical counts and source highlighting',async()=>{
    const t='élève élève';await submit(t+'\n'+t.normalize('NFD'));assert.deepEqual(await page.locator('.line-original').allTextContents(),[t,t.normalize('NFD')]);await counts(0,'ɛ',2,2);await counts(1,'ɛ',2,2);await press(1,'ɛ');assert.equal(await row(1).locator('.sonority-hit').count(),2);
  });
  await check('keyboard supports the full three-state sound cycle and local category toggle',async()=>{
    await submit(racine);await chip(0,'s').focus();await page.keyboard.press('Enter');assert.equal(await chip(0,'s').getAttribute('data-sonority-state'),'focused');await page.keyboard.press('Space');assert.equal(await chip(0,'s').getAttribute('data-sonority-state'),'hidden');await page.keyboard.press('Enter');assert.equal(await chip(0,'s').getAttribute('data-sonority-state'),'visible');
    const title=row(0).locator('[data-category="alliterations"]');await title.focus();await page.keyboard.press('Space');assert.equal(await title.getAttribute('aria-pressed'),'false');await page.keyboard.press('Enter');assert.equal(await title.getAttribute('aria-pressed'),'true');
  });
  await check('poetic alternatives remain in the compact question panel and update counts without revealing full API',async()=>{
    await submit('Le lion rêve, le lion rêve.');const h=row(0).locator('.verse-help'),height=(await row(0).boundingBox()).height;await h.locator('summary').click();
    assert.equal(await page.locator('.poetry-choice').count(),2);await page.locator('.poetry-choice').nth(0).selectOption('li.ɔ̃');await page.locator('.poetry-choice').nth(1).selectOption('li.ɔ̃');
    await counts(0,'i',2,2);assert.equal(await chip(0,'j').count(),0);assert.equal(await page.locator('.line-phonetic:visible').count(),0);assert.ok(Math.abs((await row(0).boundingBox()).height-height)<5);
    const before=await ipa();assert.equal(await copyAPI(),before.join('\n'));await page.keyboard.press('Escape');
  });
  const stanza=['Comme je descendais des Fleuves impassibles,','Je ne me sentis plus guidé par les haleurs ;','Des Peaux-Rouges criards les avaient pris pour cibles,','Les ayant cloués nus aux poteaux de couleurs.','J’étais insoucieux de tous les équipages,','Porteur de blés flamands ou de cotons anglais.','Quand avec mes haleurs ont fini ces tapages,','Les Fleuves m’ont laissé descendre où je voulais.'];
  await check('eight verses are more compact with no full API row and x1 stays off by default',async()=>{
    await singletons(false);await submit(stanza.join('\n'));const heights=await rows().evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));report.metrics.compactMeanVerseHeight=Math.round(heights.reduce((a,b)=>a+b,0)/heights.length);
    assert.ok(report.metrics.compactMeanVerseHeight<71);assert.equal(await page.locator('.line-phonetic:visible').count(),0);assert.equal(await page.locator('.sonority-chip.sonority-singleton').count(),0);
    await page.locator('#result-section').screenshot({path:path.join(s.out,'v2-sonorities-desktop.png')});
  });
  for(const width of [320,390,768,1280])await check('Sonorités, x1 and details remain contained at width '+width,async()=>{
    await page.setViewportSize({width,height:1000});await singletons(true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await singletons(false);
    const panel=await row(0).locator('.sonorities-panel').boundingBox(),text=await row(0).locator('.sonority-text').boundingBox();if(width<=650)assert.ok(panel.y>=text.y+text.height);else assert.ok(panel.x+panel.width<text.x);
  });
  await page.setViewportSize({width:390,height:1000});await page.locator('#result-section').screenshot({path:path.join(s.out,'v2-sonorities-mobile.png')});await page.setViewportSize({width:1280,height:1000});
  await check('long text, repeated toggles and sticky controls remain stable offline',async()=>{
    const start=performance.now();await submit(Array(70).fill(racine).join('\n'));report.metrics.seventyVersesMs=Math.round(performance.now()-start);const before=await ipa();
    await page.evaluate(()=>scrollTo(0,document.getElementById('results').getBoundingClientRect().top+scrollY+100));assert.ok((await page.locator('.sonority-toolbar').boundingBox()).y<=2);
    for(let i=0;i<6;i++){await sonorities(i%2===1);assert.deepEqual(await ipa(),before);}assert.ok(report.metrics.seventyVersesMs<10000);assert.equal(await page.locator('.line-phonetic:visible').count(),0);
  });
}finally{await s.finish();}
