/** Shared perceptual mixing and contrast checks for Sonorités only. */
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
/** Perceptual mixing keeps the isolated-phone tints close to their original hues. */
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
