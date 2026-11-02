/* Preregistered targeted checks. Dots and predictable duration are ignored
   unless strict:true. These are not a frequency-weighted speech corpus. */
const words=(text,category)=>text.trim().split('\n').map(row=>{const[word,ipa]=row.split('|');return {text:'Ils '+word+' ce travail.',word,ipa:ipa.split(';'),category};});
export const paradigmProbes=[
  ...words(`appellent|apɛl
jettent|ʒɛt
achètent|aʃɛt
lèvent|lɛv
mènent|mɛn
pèsent|pɛz
préfèrent|pʁefɛʁ
répètent|ʁepɛt
possèdent|pɔsɛd
cèdent|sɛd
emploient|ɑ̃plwa
voient|vwa
croient|kʁwa
nettoient|nɛtwa
envoient|ɑ̃vwa
essuient|esɥi;ɛsɥi
essaient|esɛ;ɛsɛ;esɛj;ɛsɛj
convainquent|kɔ̃vɛ̃k
vainquent|vɛ̃k
peignent|pɛɲ
craignent|kʁɛɲ
joignent|ʒwaɲ
tiennent|tjɛn
viennent|vjɛn
retiennent|ʁətjɛn
fuient|fɥi
rient|ʁi
prient|pʁi
lient|li
relient|ʁəli
délient|deli
plient|pli
étudient|etydi
scient|si
concluent|kɔ̃kly
incluent|ɛ̃kly
excluent|ɛkskly
tuent|ty
muent|my
puent|py
situent|sity
polluent|pɔly
jouent|ʒu
louent|lu
avouent|avu
dénouent|denu
renouent|ʁənu
paient|pɛ;pɛj;pej
haïssent|ais
bruissent|bʁɥis;bʁyis
bénissent|benis
fleurissent|flœʁis
acquièrent|akjɛʁ
requièrent|ʁəkjɛʁ
meurent|mœʁ
courent|kuʁ
parcourent|paʁkuʁ
rompent|ʁɔ̃p
interrompent|ɛ̃tɛʁɔ̃p;ɛ̃teʁɔ̃p
battent|bat
combattent|kɔ̃bat
mettent|mɛt
remettent|ʁəmɛt
finissent|finis
naissent|nɛs
connaissent|kɔnɛs
prennent|pʁɛn
apprennent|apʁɛn
comprennent|kɔ̃pʁɛn
rendent|ʁɑ̃d
descendent|desɑ̃d
prétendent|pʁetɑ̃d
étendent|etɑ̃d
surviennent|syʁvjɛn`, 'paradigmes-verbaux'),
  {text:'Nous mangeons dehors.',word:'mangeons',ipa:['mɑ̃ʒɔ̃'],category:'graphie-flexionnelle'},
  {text:'Nous mangions dehors.',word:'mangions',ipa:['mɑ̃ʒjɔ̃'],category:'graphie-flexionnelle'},
  {text:'Nous nageons ensemble.',word:'nageons',ipa:['naʒɔ̃'],category:'graphie-flexionnelle'},
  {text:'Nous avançons doucement.',word:'avançons',ipa:['avɑ̃sɔ̃'],category:'graphie-flexionnelle'},
  {text:'Le patient attend.',word:'patient',ipa:['pasjɑ̃'],category:'finale-nominale'},
  {text:'Le quotient est exact.',word:'quotient',ipa:['kɔsjɑ̃'],category:'finale-nominale'},
  {text:'Le coefficient est stable.',word:'coefficient',ipa:['kɔefisjɑ̃','koefisjɑ̃'],category:'finale-nominale'},
  {text:'Un ingrédient manque.',word:'ingrédient',ipa:['ɛ̃ɡʁedjɑ̃'],category:'finale-nominale'},
  {text:'Les instruments sont rangés.',word:'instruments',ipa:['ɛ̃stʁymɑ̃'],category:'finale-nominale'},
  {text:'La jument est calme.',word:'jument',ipa:['ʒymɑ̃'],category:'finale-nominale'},
  {text:'Un ligament solide.',word:'ligament',ipa:['liɡamɑ̃'],category:'finale-nominale'},
  {text:'Le ciment sèche.',word:'ciment',ipa:['simɑ̃'],category:'finale-nominale'},
  {text:'Le serment est prononcé.',word:'serment',ipa:['sɛʁmɑ̃'],category:'finale-nominale'},
  {text:'Un jugement prudent.',word:'jugement',ipa:['ʒyʒəmɑ̃','ʒyʒmɑ̃'],category:'finale-nominale'}
];
export const sentenceProbes=[
  ['Ils arrivent au village.','il.z‿a.ʁiv o vi.laʒ.'],
  ['Je cherche les œufs.','ʒə ʃɛʁʃ le.z‿ø.'],
  ['Les enfants et les adultes.','le.z‿ɑ̃.fɑ̃ e le.z‿a.dylt.'],
  ['Un grand arbre.','œ̃ ɡʁɑ̃.t‿aʁbʁ.'],
  ['Un bon ami.','œ̃ bɔ.n‿a.mi.'],
  ['Un petit arbre.','œ̃ pə.ti.t‿aʁbʁ.'],
  ['Un enfant heureux.','œ̃.n‿ɑ̃.fɑ̃ ø.ʁø.'],
  ['Un homme et une femme.','œ̃.n‿ɔm e yn fam.'],
  ['Des héros et des hommes.','de e.ʁo e de.z‿ɔm.'],
  ['Le vent souffle.','lə vɑ̃ sufl.'],
  ['Ils soudent le métal.','il sud lə me.tal.'],
  ['Une âme.','yn ɑːm.'],
  ['Le maître et la reine.','lə mɛːtʁ e la ʁɛːn.'],
  ['Sous un arbre.','su.z‿œ̃.n‿aʁbʁ.'],
  ['Dans une école.','dɑ̃.z‿yn e.kɔl.'],
  ['Chez un ami.','ʃe.z‿œ̃.n‿a.mi.'],
  ['Trois oiseaux.','tʁwɑ.z‿wa.zo.'],
  ['Deux enfants.','dø.z‿ɑ̃.fɑ̃.'],
  ['Les onze enfants.','le ɔ̃z ɑ̃.fɑ̃.'],
  ['Les, enfants.','le, ɑ̃.fɑ̃.'],
  ['Il est arrivé.','il ɛ a.ʁi.ve.'],
  ["Il n'est plus ici.",'il nɛ ply i.si.'],
  ['Il en veut plus.','il ɑ̃ vø plys.'],
  ['Ils sont tous ici.','il sɔ̃ tus i.si.'],
  ['Tous les amis.','tu le.z‿a.mi.'],
  ['Elle a six ans.','ɛl a si.z‿ɑ̃.'],
  ['Il a dix ans.','il a di.z‿ɑ̃.'],
  ['Il a neuf ans.','il a nœ.v‿ɑ̃.'],
  ['Un accent étrange.','œ̃.n‿ak.sɑ̃ e.tʁɑ̃ʒ.']
].map(([text,ipa])=>({text,ipa,category:'phrase-complete'}));

export const cacheIsolation=[
  ['fils','Les fils de cuivre.','Mon fils arrive.'],
  ['couvent','Les poules couvent.','Le couvent est fermé.'],
  ['plus','Il ne veut plus venir.','Il en veut plus.'],
  ['est',"À l'est du village.",'Il est calme.'],
  ['portions','Nous portions ces sacs.','Les portions sont prêtes.']
];

export const inventedInflections=['anuflent','orfanent','ilumisent','amufient','olubent','anuglent','ébruflent','uluvient'];
