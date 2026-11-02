/** Expectations fixed before this campaign's first engine run.
 * Phonemic comparisons ignore dots and lexical length unless a probe says otherwise.
 * These are targeted challenges, not frequency-weighted accuracy measurements. */
const words=(text,category)=>text.trim().split('\n').map(row=>{const[word,ipa]=row.split('|');return {word,ipa:ipa.split(';'),category};});
export const wordProbes=[
 ...words(`chalet|ʃalɛ
chaotique|kaɔtik
choléra|kɔleʁa
orchestre|ɔʁkɛstʁ
bronchite|bʁɔ̃ʃit
psychologue|psikɔlɔɡ;psikolɔɡ
psychothérapie|psikɔteʁapi
psychique|psiʃik
chlore|klɔʁ
abrupt|abʁypt
abruptement|abʁyptəmɑ̃;abʁyptmɑ̃
exact|ɛɡzakt
exactement|ɛɡzaktəmɑ̃;ɛɡzaktmɑ̃
abject|abʒɛkt
abjection|abʒɛksjɔ̃
équanimité|ekwanimite
inique|inik
inapte|inapt
inepte|inɛpt
inodore|inɔdɔʁ
inavouable|inavwabl
inorganique|inɔʁɡanik
inoxydable|inɔksidabl
innocent|inɔsɑ̃
innommable|inɔmabl
immaculé|imakyle
immuable|imɥabl;imyabl
immense|imɑ̃s
immersion|imɛʁsjɔ̃
immédiat|imedja
illisible|ilizibl
illégal|ileɡal
illogique|ilɔʒik
illusion|ilyzjɔ̃
irréel|iʁeɛl
irréductible|iʁedyktibl
irrationnel|iʁasjɔnɛl
irascible|iʁasibl
désuet|dezɥɛ;desɥɛ
suave|sɥav;syav
nuage|nɥaʒ;nyaʒ
nuée|nɥe;nye
ruelle|ʁɥɛl;ʁyɛl
cruel|kʁyɛl
truelle|tʁyɛl
duel|dyɛl;dɥɛl
dualité|dyalite;dɥalite
fluide|flɥid
fluor|flyɔʁ
ouïe|wi
ouïr|wiʁ
ouate|wat
ouest|wɛst
ouistiti|wistiti
`, 'lexical')
];
export const contextualProbes=[
 {text:'Nous mentions rarement à nos amis.',word:'mentions',ipa:'mɑ̃tjɔ̃'},
 {text:'Les mentions sont obligatoires.',word:'mentions',ipa:'mɑ̃sjɔ̃'},
 {text:'Nous éditions ce livre.',word:'éditions',ipa:'editjɔ̃'},
 {text:'Ces éditions sont anciennes.',word:'éditions',ipa:'edisjɔ̃'},
 {text:'Nous relations cette aventure.',word:'relations',ipa:'ʁəlatjɔ̃'},
 {text:'Ces relations sont anciennes.',word:'relations',ipa:'ʁəlasjɔ̃'},
 {text:'Nous désertions le village.',word:'désertions',ipa:'dezɛʁtjɔ̃'},
 {text:'Les désertions furent nombreuses.',word:'désertions',ipa:'dezɛʁsjɔ̃'},
 {text:'Nous adoptions cette méthode.',word:'adoptions',ipa:'adɔptjɔ̃'},
 {text:'Les adoptions sont possibles.',word:'adoptions',ipa:'adɔpsjɔ̃'},
 {text:'Nous notions les dates.',word:'notions',ipa:'nɔtjɔ̃'},
 {text:'Les notions sont simples.',word:'notions',ipa:'nɔsjɔ̃'},
 {text:'Nous inspections les lieux.',word:'inspections',ipa:'ɛ̃spɛktjɔ̃'},
 {text:'Les inspections commencent.',word:'inspections',ipa:'ɛ̃spɛksjɔ̃'},
 {text:'Nous affections ce poste à Paul.',word:'affections',ipa:'afɛktjɔ̃'},
 {text:'Les affections sont diverses.',word:'affections',ipa:'afɛksjɔ̃'},
 {text:'Nous objections à ce projet.',word:'objections',ipa:'ɔbʒɛktjɔ̃'},
 {text:'Les objections sont nombreuses.',word:'objections',ipa:'ɔbʒɛksjɔ̃'},
 {text:'Les poules mangent des graines et couvent leurs œufs.',word:'couvent',ipa:'kuv'},
 {text:'Les moines déjeunent au couvent puis président la réunion.',word:'président',ipa:'pʁezid'},
 {text:'Ils ferment la porte et content leur aventure.',word:'content',ipa:'kɔ̃t'},
 {text:'Les enfants regardent la maison et convient leurs voisins.',word:'convient',ipa:'kɔ̃vi'},
 {text:'Les secrétaires écrivent au président et résident à Lyon.',word:'résident',ipa:'ʁezid'},
 {text:'Les enfants que nous invitons content une histoire.',word:'content',ipa:'kɔ̃t'},
 {text:'Les moines qui arrivent couvent ce projet.',word:'couvent',ipa:'kuv'},
 {text:'La chambre des enfants nous convient.',word:'convient',ipa:'kɔ̃vjɛ̃'},
 {text:'Les voisins de cet enfant nous convient demain.',word:'convient',ipa:'kɔ̃vi'},
 {text:'Nous jouions dehors.',word:'jouions',ipa:'ʒujɔ̃'},
 {text:'Nous louions cette maison.',word:'louions',ipa:'lujɔ̃'},
 {text:'Nous étudiions ce texte.',word:'étudiions',ipa:'etydijɔ̃'},
 {text:'Nous criions longtemps.',word:'criions',ipa:'kʁijɔ̃'},
 {text:'Nous priions ensemble.',word:'priions',ipa:'pʁijɔ̃'},
 {text:'Nous appréciions ce repas.',word:'appréciions',ipa:'apʁesijɔ̃'},
 {text:'Nous riions beaucoup.',word:'riions',ipa:'ʁijɔ̃'},
 {text:'Vous étudiiez ce texte.',word:'étudiiez',ipa:'etydije'},
 {text:'Vous riez beaucoup.',word:'riez',ipa:['ʁije','ʁje']},
];
export const liaisonProbes=[
 ['Les houx poussent.','les','houx',false],
 ['Les huîtres sont fraîches.','les','huîtres',true],
 ['Les hurlements cessent.','les','hurlements',false],
 ['Les hurluberlus arrivent.','les','hurluberlus',true],
 ['Les handballeurs gagnent.','les','handballeurs',false],
 ['Les hamburgers sont prêts.','les','hamburgers',false],
 ['Sous huit jours.','sous','huit',false],
 ['Dans onze jours.','dans','onze',false],
 ['Les ouïes des poissons.','les','ouïes',true],
 ['Les ouistitis sautent.','les','ouistitis',false],
 ['Des oui et des non.','des','oui',false],
 ['Deux ou trois amis.','deux','ou',false],
 ['En haut de la rue.','en','haut',false],
 ['En harmonie.','en','harmonie',true],
 ['Un hôpital moderne.','un','hôpital',true],
 ['Un handicap important.','un','handicap',false],
 ['Des êtres humains.','êtres','humains',false],
 ['Des\u00a0amis arrivent.','des','amis',true],
 ['Les — enfants arrivent.','les','enfants',false],
 ['Les (enfants) arrivent.','les','enfants',false],
 ['Les amis, heureux, arrivent.','amis','heureux',false],
 ['Un long hiver.','long','hiver',true],
 ['Un long hurlement.','long','hurlement',false],
];
export const numericProbes=[
 ['120 ans','sɑ̃vɛ̃tɑ̃'],
 ['201 oiseaux','døsɑ̃œ̃nwazo'],
 ['102 euros','sɑ̃døzøʁo'],
 ['71 arbres','swasɑ̃teɔ̃zaʁbʁ'],
 ['91 habitants','katʁəvɛ̃ɔ̃zabitɑ̃'],
 ['1999','milnœfsɑ̃katʁəvɛ̃diznœf'],
 ['1 amie','ynami'],
 ['21 amies','vɛ̃teynami'],
 ['81 personnes','katʁəvɛ̃ynpɛʁsɔn'],
 ['2001 nuits','dømilynnɥi'],
 ['101 héroïnes','sɑ̃yneʁɔin'],
 ['1 ami','œ̃nami'],
 ['21 amis','vɛ̃teœ̃nami'],
 ['81 garçons','katʁəvɛ̃œ̃ɡaʁsɔ̃'],
];
