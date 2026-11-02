/** A limited palette proposal, kept separate from production source. */
import fs from 'node:fs';
const old={
 A:['#000000','#e5e9e5'],E:['#ffffff','#414e52'],I:['#b51e32','#fff1f3'],U:['#126535','#eaf5e9'],O:['#174bb3','#ecf2ff'],EU:['#803b91','#f4eaf7'],
 'p/b':['#995011','#eef1ee'],'t/d':['#386a6b','#eef1ee'],'k/ɡ':['#6b5096','#eef1ee'],'f/v':['#943e60','#eef1ee'],'s/z':['#8c5b08','#eef1ee'],'ʃ/ʒ':['#9c3926','#eef1ee'],
 'm/n/ɲ/ŋ':['#08756e','#eef1ee'],l:['#4d6582','#eef1ee'],'ʁ':['#775840','#eef1ee'],'j/w/ɥ':['#a03575','#eef1ee']
};
const next={...old,'s/z':['#776715','#eef1ee'],'t/d':['#24576f','#eef1ee'],'k/ɡ':['#514b92','#eef1ee'],'f/v':['#853f56','#eef1ee'],'h/ʔ':['#53515b','#eef1ee']};
const decode=hex=>hex.slice(1).match(/../g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));
const lab=hex=>{
 const[r,g,b]=decode(hex),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
};
const distance=(a,b)=>Math.hypot(...lab(a).map((v,i)=>v-lab(b)[i]));
const lum=hex=>decode(hex).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
function audit(palette){
 const entries=Object.entries(palette),pairs=[];
 for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++)pairs.push({groups:[entries[i][0],entries[j][0]],distance:+distance(entries[i][1][0],entries[j][1][0]).toFixed(6)});
 pairs.sort((a,b)=>a.distance-b.distance);
 const contrastByGroup=Object.fromEntries(entries.map(([name,[fg,bg]])=>[name,+contrast(fg,bg).toFixed(6)]));
 return {minimumPair:pairs[0],nearestPairs:pairs.slice(0,15),minimumTextContrast:Math.min(...Object.values(contrastByGroup)),contrastByGroup,allPairs:pairs};
}
const targets=[['p/b','s/z'],['t/d','m/n/ɲ/ŋ'],['f/v','j/w/ɥ'],['EU','k/ɡ']];
const report={purpose:'Independent calculation for one limited, restrained palette proposal; colour distances are comparative diagnostics, not normative recognition thresholds.',oldPalette:old,proposedPalette:next,changes:['s/z: muted olive','t/d: dark slate petrol','k/ɡ: muted indigo','f/v: deep dusty rose','h/ʔ: neutral violet charcoal'],old:audit(old),proposed:audit(next),targetPairs:targets.map(([a,b])=>({groups:[a,b],old:+distance(old[a][0],old[b][0]).toFixed(6),proposed:+distance(next[a][0],next[b][0]).toFixed(6)}))};
fs.writeFileSync(new URL('../validation/color-review-palette-proposal.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
const cards=Object.entries(next).map(([group,[fg,bg]])=>`<div class="card"><small>${group}</small><div class="row">${old[group]?`<span style="color:${old[group][0]};background:${old[group][1]}">ancien · ${group}</span>`:'<span>nouveau</span>'}<b>→</b><span style="color:${fg};background:${bg}">proposition · ${group}</span></div><code>${fg} · ${contrast(fg,bg).toFixed(2)}:1</code></div>`).join('');
fs.writeFileSync(new URL('../validation/color-review-palette-proposal.html',import.meta.url),`<!doctype html><html lang="fr"><meta charset="utf-8"><title>Proposition limitée de palette</title><style>body{margin:36px auto;padding:0 28px;max-width:1100px;background:#f6f7f5;color:#41494b;font:18px/1.7 Georgia,serif}h1{font-size:28px;font-weight:400}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.card{padding:14px;border:1px solid #dce2de;border-radius:8px}.row{display:flex;align-items:center;gap:12px}.row span{padding:3px 7px;border-radius:4px}small,code{font:12px/1.7 Arial,sans-serif;color:#657174}b{font:13px Arial,sans-serif}</style><h1>Proposition limitée de palette</h1><p>Quatre familles consonantiques ajustées ; voyelles et EU conservées. Les fonds restent doux et neutres.</p><div class="grid">${cards}</div></html>`);
console.log(JSON.stringify({targetPairs:report.targetPairs,oldMinimum:report.old.minimumPair,proposedMinimum:report.proposed.minimumPair,minimumTextContrast:report.proposed.minimumTextContrast,changedContrast:Object.fromEntries(['s/z','t/d','k/ɡ','f/v','h/ʔ'].map(group=>[group,report.proposed.contrastByGroup[group]]))},null,2));
