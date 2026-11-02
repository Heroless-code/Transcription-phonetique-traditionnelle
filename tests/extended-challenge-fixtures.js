// Fixed expectations before observing this campaign's output. Semicolon = variants.
export const challengeWords=`
vergeure|vɛʁʒyʁ
exsangue|ɛksɑ̃ɡ
exiguë|ɛɡziɡy
ambiguë|ɑ̃biɡy
ambiguïté|ɑ̃biɡɥite
aiguë|eɡy;ɛɡy
aiguillon|eɡɥijɔ̃;ɛɡɥijɔ̃
aiguilleur|eɡɥijœʁ;ɛɡɥijœʁ
magnat|maɲa;maɡna
stagnant|staɲɑ̃;staɡnɑ̃
ignifuge|iɲifyʒ;iɡnifyʒ
synecdoque|sinɛkdɔk
œsophage|ezɔfaʒ;øzɔfaʒ
œdème|edɛm;ødɛm
cœlacanthe|selakɑ̃t
chœur|kœʁ
chorégraphie|kɔʁeɡʁafi
chthonien|ktɔnjɛ̃
échevin|eʃvɛ̃;eʃəvɛ̃;ɛʃvɛ̃
échiquier|eʃikje
schisme|ʃism;ʃizm
schizophrène|skizɔfʁɛn
psychisme|psiʃism;psiʃizm
omniscient|ɔmnisjɑ̃
science|sjɑ̃s
patience|pasjɑ̃s
acrobatie|akʁɔbasi
minutie|minysi
garantie|ɡaʁɑ̃ti
sympathie|sɛ̃pati
amitié|amitje
initié|inisje
initier|inisje
antienne|ɑ̃tjɛn
équation|ekwasjɔ̃
équateur|ekwatœʁ
aquatique|akwatik
quadrilatère|kwadʁilatɛʁ;kadʁilatɛʁ
quatuor|kwatɥɔʁ;kwatyɔʁ
quartz|kwaʁts
séquoia|sekɔja
quinoa|kinɔa
cueillette|kœjɛt
recueil|ʁəkœj
orgueilleux|ɔʁɡœjø
orgueil|ɔʁɡœj
tressaillement|tʁesajmɑ̃;tʁɛsajmɑ̃
effervescence|efɛʁvɛsɑ̃s;ɛfɛʁvɛsɑ̃s;efɛʁvesɑ̃s
velléité|veleite;vɛleite
rédhibition|ʁedibisjɔ̃
imbroglio|ɛ̃bʁɔljo;ɛ̃bʁɔɡlijo
fuchsia|fyʃja
yacht|jɔt
whisky|wiski
week-end|wikɛnd
shampooing|ʃɑ̃pwɛ̃
shampoing|ʃɑ̃pwɛ̃
camping|kɑ̃piŋ
jogging|dʒɔɡiŋ
clown|klun
puzzle|pœzl;pœzœl
ginkgo|ʒɛ̃ko;ʒiŋko;ɡiŋko
mnémotechnique|mnemɔtɛknik
pneumatique|pnømatik
ptérodactyle|pteʁodaktil;pteʁɔdaktil
septentrional|sɛptɑ̃tʁijɔnal
septième|sɛtjɛm
second|səɡɔ̃
seconde|səɡɔ̃d
secondaire|səɡɔ̃dɛʁ
sculpter|skylte
baptême|batɛm
baptismal|batismal;batizmal
comptabilité|kɔ̃tabilite
indomptable|ɛ̃dɔ̃ptabl;ɛ̃dɔ̃tabl
dompteur|dɔ̃ptœʁ;dɔ̃tœʁ
sixième|sizjɛm
dixième|dizjɛm
neuvième|nœvjɛm
quatre-vingtième|katʁəvɛ̃tjɛm;katʁvɛ̃tjɛm
faon|fɑ̃
paon|pɑ̃
taon|tɑ̃
saoul|su
saoule|sul
soûler|sule
août|ut;u
aoriste|aɔʁist
moelle|mwal
moelleux|mwalø
poêle|pwal
poêlon|pwalɔ̃
rehausser|ʁəose
réinitialiser|ʁeinisjalize
extraordinaire|ɛkstʁaɔʁdinɛʁ
inhérent|ineʁɑ̃
inhabituel|inabitɥɛl
`.trim().split('\n').map(row=>{const[word,ipa]=row.split('|');return {word,ipa:ipa.split(';')};});

export const challengeSentences=[
 {text:'Les ouvriers du bâtiment soudent les pièces.',words:{soudent:'sud'}},
 {text:'Les moines du couvent couvent ce projet.',at:[['couvent',0,'kuvɑ̃'],['couvent',1,'kuv']]},
 {text:'Les portes ferment ; les ferments restent actifs.',words:{ferment:'fɛʁm',ferments:'fɛʁmɑ̃'}},
 {text:'Ces éléments excellent dans ce domaine.',words:{excellent:'ɛksɛl'}},
 {text:'Ces hommes violent la loi.',words:{violent:'vjɔl'}},
 {text:'Un violent orage approche.',words:{violent:'vjɔlɑ̃'},liaisons:[['violent','orage',true]]},
 {text:'Les enfants de ma sœur content une histoire.',words:{content:'kɔ̃t'}},
 {text:'Un enfant content arrive.',words:{content:'kɔ̃tɑ̃'},liaisons:[['content','arrive',false]]},
 {text:'Les élèves qui résident ici lisent.',words:{résident:'ʁezid'}},
 {text:'Un résident italien arrive.',words:{résident:'ʁezidɑ̃'},liaisons:[['résident','italien',false]]},
 {text:'Ils expédient ces documents.',words:{expédient:'ekspedi'}},
 {text:'Cet expédient est utile.',words:{expédient:'ɛkspedjɑ̃'}},
 {text:'Les élèves du cours négligent leur travail.',words:{négligent:'neɡliʒ'}},
 {text:'Un élève négligent arrive.',words:{négligent:'neɡliʒɑ̃'},liaisons:[['négligent','arrive',false]]},
 {text:'Ces religieuses de la ville influent sur le débat.',words:{influent:'ɛ̃fly'}},
 {text:'Un homme influent arrive.',words:{influent:'ɛ̃flyɑ̃'},liaisons:[['influent','arrive',false]]},
 {text:'Où les musiciens du village jouent-ils ?',words:{jouent:'ʒu'}},
 {text:'Que les élèves étudient ce chapitre.',words:{étudient:'etydi'}},
 {text:'Les enfants le lui confient.',words:{confient:'kɔ̃fi'}},
 {text:'Les enfants ne le lui confient jamais.',words:{confient:'kɔ̃fi'}},
 {text:'Les enfants, étonnés, arrivent.',liaisons:[['enfants','étonnés',false]]},
 {text:'Les héros et les héroïnes arrivent.',liaisons:[['les','héros',false],['les','héroïnes',true]]},
 {text:'Deux hauts arbres et deux petits arbustes.',liaisons:[['deux','hauts',false],['hauts','arbres',true],['petits','arbustes',true]]},
 {text:'Un grand ami et un grand héros.',liaisons:[['grand','ami',true],['grand','héros',false]]},
 {text:'Leurs amis et leurs onze enfants.',liaisons:[['leurs','amis',true],['leurs','onze',false]]},
 {text:'Ils en ont un.',liaisons:[['ils','en',true],['en','ont',true]]},
 {text:'Nous y allons ensemble.',liaisons:[['nous','y',true]]},
 {text:'Comment vont-ils à Paris ?',liaisons:[['ils','à',false]]},
 {text:'Vas-y et prends-en deux.',liaisons:[['vas','y',true],['prends','en',true]]},
 {text:'Un euro et un yacht.',liaisons:[['un','euro',true],['un','yacht',false]]},
 {text:'Les yaourts et les yeux.',liaisons:[['les','yaourts',false],['les','yeux',true]]},
 {text:'Un hibou et un hiver froid.',liaisons:[['un','hibou',false],['un','hiver',true]]},
 {text:'Mon fils range les fils de cuivre.',at:[['fils',0,'fis'],['fils',1,'fil']]},
 {text:'Les portions que nous portions étaient petites.',at:[['portions',0,'pɔʁsjɔ̃'],['portions',1,'pɔʁtjɔ̃']]},
 {text:'Ils président le conseil du président.',at:[['président',0,'pʁezid'],['président',1,'pʁezidɑ̃']]},
 {text:'Les poules du voisin pondent et couvent.',words:{pondent:'pɔ̃d',couvent:'kuv'}},
 {text:'Les candidats nous convient à dîner.',words:{convient:'kɔ̃vi'}},
 {text:'Cette solution nous convient.',words:{convient:'kɔ̃vjɛ̃'}},
 {text:'Les ingrédients que les cuisiniers évident sont prêts.',words:{évident:'evid'}},
 {text:'Un résultat évident apparaît.',words:{évident:'evidɑ̃'},liaisons:[['évident','apparaît',false]]}
];
