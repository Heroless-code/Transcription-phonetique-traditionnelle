/** The colors are attached to API units, never inferred from spelling. */
export function styleForPhone(raw) {
  const phone = String(raw || '').normalize('NFD');
  const base = phone.replace(/[\u0300-\u036fːˑ]/g, '');
  const nasal = phone.includes('\u0303');
  const vowels = {
    a: ['A', '#000000', '#e5e9e5'], ɑ: ['A', '#000000', '#e5e9e5'],
    e: ['E', '#ffffff', '#414e52'], ɛ: ['E', '#ffffff', '#414e52'], ə: ['E', '#ffffff', '#414e52'],
    i: ['I', '#b51e32', '#fff1f3'],
    y: ['U', '#126535', '#eaf5e9'], u: ['U', '#126535', '#eaf5e9'],
    o: ['O', '#174bb3', '#ecf2ff'], ɔ: ['O', '#174bb3', '#ecf2ff'],
    ø: ['EU', '#803b91', '#f4eaf7'], œ: ['EU', '#803b91', '#f4eaf7']
  };
  if (vowels[base]) {
    const [family, color, background] = vowels[base];
    return { category: nasal ? 'nasal' : 'vowel', family, color, background };
  }
  const consonants = {
    p: '#995011', b: '#995011', t: '#24576f', d: '#24576f', k: '#514b92', 'ɡ': '#514b92', g: '#514b92',
    f: '#853f56', v: '#853f56', s: '#776715', z: '#776715', 'ʃ': '#9c3926', 'ʒ': '#9c3926',
    m: '#08756e', n: '#08756e', 'ɲ': '#08756e', 'ŋ': '#08756e', l: '#4d6582', 'ʁ': '#775840',
    j: '#a03575', w: '#a03575', 'ɥ': '#a03575', h: '#53515b', 'ʔ': '#53515b'
  };
  return consonants[base]
    ? { category: 'consonant', family: base, color: consonants[base], background: '#eef1ee' }
    : { category: 'mark', family: null, color: null, background: null };
}

const NASAL = {color:'#885724',background:'#fbf1dd'};
const rgb = hex => hex.slice(1).match(/../g).map(c => parseInt(c,16)/255);
const linear = c => c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
const encoded = c => c<=.0031308?12.92*c:1.055*c**(1/2.4)-.055;
function lab(hex) {
  const [r,g,b]=rgb(hex).map(linear);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b);
  const m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b);
  const s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
}
function fromLab([L,a,b]) {
  const l=(L+.3963377774*a+.2158037573*b)**3;
  const m=(L-.1055613458*a-.0638541728*b)**3;
  const s=(L-.0894841775*a-1.291485548*b)**3;
  return '#'+[4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s]
    .map(v=>Math.round(Math.max(0,Math.min(1,encoded(v)))*255).toString(16).padStart(2,'0')).join('');
}
/** Perceptual mixing avoids muddy RGB averages; mandatory single-family inks stay intact. */
export function mixColors(colors,weights=colors.map(()=>1)) {
  if(!colors.length)return null;if(colors.length===1)return colors[0];
  const total=weights.reduce((s,v)=>s+v,0),result=[0,0,0];
  colors.forEach((c,i)=>lab(c).forEach((v,j)=>result[j]+=v*weights[i]/total));
  return fromLab(result);
}
export function contrastRatio(a,b) {
  const luminance=c=>rgb(c).map(linear).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  const first=luminance(a),second=luminance(b);
  return (Math.max(first,second)+.05)/(Math.min(first,second)+.05);
}
function readableInk(ink,background) {
  if(contrastRatio(ink,background)>=4.8)return ink;
  for(let amount=1;amount<=20;amount++)for(const target of ['#273238','#ffffff']) {
    const candidate=mixColors([ink,target],[20-amount,amount]);
    if(contrastRatio(candidate,background)>=4.8)return candidate;
  }
  return contrastRatio('#000000',background)>contrastRatio('#ffffff',background)?'#000000':'#ffffff';
}
/** A nasal accent is painted inside its explicit background, never on the page. */
function nasalAccent(background) {
  for(const ink of ['#8d591f','#efca86'])if(contrastRatio(ink,background)>=3.2)return ink;
  for(let amount=1;amount<=20;amount++)for(const [ink,target]of [['#8d591f','#402b14'],['#efca86','#fff0cc']]){
    const candidate=mixColors([ink,target],[20-amount,amount]);
    if(contrastRatio(candidate,background)>=3.2)return candidate;
  }
  return contrastRatio('#402b14',background)>contrastRatio('#fff0cc',background)?'#402b14':'#fff0cc';
}
function selectedPhone(phone,options) {
  const style=styleForPhone(phone),nasal=style.category==='nasal';
  if(style.category==='mark')return null;
  const vowel=style.category==='vowel'||nasal;
  const active=nasal?(options.vowel||options.nasal):options[style.category];
  const layers=[];
  if(vowel&&options.vowel)layers.push('vowel');
  if(style.category==='consonant'&&options.consonant)layers.push('consonant');
  if(nasal&&options.nasal)layers.push('nasal');
  if(!active)return {...style,active:false,nasal:false,layers:[]};
  if(nasal&&options.nasal&&!options.vowel)return {...style,...NASAL,active:true,nasal:true,layers};
  return {...style,background:nasal&&options.nasal?mixColors([style.background,NASAL.background],[.86,.14]):style.background,active:true,nasal:nasal&&options.nasal,layers};
}
/** Orthogonal options: a nasal nucleus has a vowel layer AND a nasal layer. */
export function composeColors(phones,options) {
  if(!options.enabled)return {active:false};
  const parts=phones.map(p=>selectedPhone(p,options)).filter(Boolean),selected=parts.filter(p=>p.active);
  if(!selected.length)return {active:false};
  const shared=parts.length>1&&(selected.length!==parts.length||new Set(selected.map(p=>p.color+'|'+p.background)).size>1);
  const background=shared?mixColors(selected.map(p=>p.background)):selected[0].background;
  const ink=shared?readableInk(mixColors(selected.map(p=>p.color)),background):selected[0].color;
  const band=(key,neutral)=>parts.map((p,i)=>`${p.active?p[key]:neutral} ${(i/parts.length*100).toFixed(3)}% ${((i+1)/parts.length*100).toFixed(3)}%`).join(', ');
  const nasal=selected.some(p=>p.nasal);
  return {active:true,shared,color:ink,background,nasal,nasalAccent:nasal?nasalAccent(background):null,family:shared?null:selected[0].family,
    layers:[...new Set(selected.flatMap(p=>p.layers))],bands:band('color','#8c9693'),backgroundBands:band('background','#f1f3ef')};
}

