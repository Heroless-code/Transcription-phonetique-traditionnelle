/**
 * Independent regression examples, fixed before inspecting engine output.
 * IPA spelling is checked independently of syllable dots. 'strictLength'
 * preserves lengths; other items compare segmental pronunciation and permit
 * the engine to mark predictable vowel duration.
 * Reference convention:
 * https://fr.wiktionary.org/wiki/Annexe:Prononciation/fran%C3%A7ais#Fran%C3%A7ais_moderne_traditionnel
 * Tests are not a frequency-weighted accuracy benchmark or a gold corpus.
 */

const rows = (category, text) => text.trim().split('\n').map(row => {
  const [word, ipa] = row.trim().split('|');
  return { word, ipa: ipa.split(';'), category };
});

export const wordFixtures = [
  ...rows('courants', `
bonjour|bɔ̃ʒuʁ
salut|saly
merci|mɛʁsi
maison|mɛzɔ̃
jardin|ʒaʁdɛ̃
enfant|ɑ̃fɑ̃
table|tabl
chaise|ʃɛz
livre|livʁ
école|ekɔl
livraison|livʁɛzɔ̃
soleil|sɔlɛj
lune|lyn
ville|vil
village|vilaʒ
rouge|ʁuʒ
vert|vɛʁ
bleu|blø
noir|nwaʁ
blanc|blɑ̃
petit|pəti
grande|ɡʁɑ̃d
porte|pɔʁt
fenêtre|fənɛtʁ
chambre|ʃɑ̃bʁ
musique|myzik
poésie|poezi;pɔezi
lecture|lɛktyʁ
écriture|ekʁityʁ
travail|tʁavaj
bureau|byʁo
papier|papje
crayon|kʁɛjɔ̃
stylo|stilo
ordinateur|ɔʁdinatœʁ
téléphone|telefɔn
langue|lɑ̃ɡ
français|fʁɑ̃sɛ
phonétique|fɔnetik
syllabe|silab
mot|mo
texte|tɛkst
phrase|fʁɑz
son|sɔ̃
écouter|ekute
regarder|ʁəɡaʁde
écrire|ekʁiʁ
parler|paʁle
dormir|dɔʁmiʁ
vivre|vivʁ
boire|bwaʁ
lire|liʁ
faire|fɛʁ
aller|ale
venir|vəniʁ
partir|paʁtiʁ
finir|finiʁ
choisir|ʃwaziʁ
trouver|tʁuve
aimer|eme;ɛme
`),
  ...rows('graphemes-et-exceptions', `
femme|fam
monsieur|məsjø
seconde|səɡɔ̃d
oignon|ɔɲɔ̃
automne|otɔn
août|u;ut
sept|sɛt
huit|ɥit
vingt|vɛ̃
cent|sɑ̃
mille|mil
million|miljɔ̃
fille|fij
ville|vil
tranquille|tʁɑ̃kil
aiguille|eɡɥij;ɛɡɥij
accueil|akœj
orgueil|ɔʁɡœj
cueillir|kœjiʁ
œil|œj
œuf|œf
œufs|ø
bœuf|bœf
bœufs|bø
clef|kle
clé|kle
tabac|taba
estomac|ɛstɔma
chou|ʃu
chronomètre|kʁɔnɔmɛtʁ
chorale|kɔʁal
orchestre|ɔʁkɛstʁ
technique|tɛknik
pharmacie|faʁmasi
théâtre|teɑtʁ;teatʁ
démocratie|demɔkʁasi
attention|atɑ̃sjɔ̃
question|kɛstjɔ̃
équation|ekwasjɔ̃
examen|ɛɡzamɛ̃
existence|ɛɡzistɑ̃s
taxi|taksi
sixième|sizjɛm
dixième|dizjɛm
psychologie|psikɔlɔʒi
sculpture|skyltyʁ
scène|sɛn
science|sjɑ̃s
faon|fɑ̃
paon|pɑ̃
taon|tɑ̃
`),
  ...rows('nasales-et-contrastes', `
vent|vɑ̃
vin|vɛ̃
brin|bʁɛ̃
brun|bʁœ̃
un|œ̃
lundi|lœ̃di
parfum|paʁfœ̃
commun|kɔmœ̃
on|ɔ̃
ombre|ɔ̃bʁ
ombrelle|ɔ̃bʁɛl
pain|pɛ̃
main|mɛ̃
faim|fɛ̃
daim|dɛ̃
sans|sɑ̃
sens|sɑ̃s
empire|ɑ̃piʁ
ampère|ɑ̃pɛʁ
année|ane
bonne|bɔn
bon|bɔ̃
fine|fin
fin|fɛ̃
pleine|plɛn
plein|plɛ̃
sonne|sɔn
son|sɔ̃
`),
  ...rows('terminaisons-verbales', `
soudent|sud
jouent|ʒu
parlent|paʁl
aiment|ɛm
marchent|maʁʃ
chantent|ʃɑ̃t
mangent|mɑ̃ʒ
finissent|finis
choisissent|ʃwazis
prennent|pʁɛn
viennent|vjɛn
peuvent|pœv
doivent|dwav
savent|sav
vivent|viv
lisent|liz
écrivent|ekʁiv
courent|kuʁ
voudraient|vudʁɛ
parlaient|paʁlɛ
chantaient|ʃɑ̃tɛ
parlerai|paʁləʁe
parlerais|paʁləʁɛ
parlez|paʁle
`),
  ...rows('semi-voyelles-et-hiatus', `
nuit|nɥi
lui|lɥi
huile|ɥil
oui|wi
ouest|wɛst
yeux|jø
pied|pje
pitié|pitje
billet|bijɛ
écureuil|ekyʁœj
lion|ljɔ̃;lijɔ̃
duel|dɥɛl;dyɛl
jouer|ʒwe;ʒue
pays|pei;pɛi
haïr|aiʁ
Noël|nɔɛl
poème|pɔɛm
création|kʁeasjɔ̃
réel|ʁeɛl
boa|bɔa
`),
  ...rows('h-et-emprunts', `
haricot|aʁiko
homme|ɔm
honte|ɔ̃t
héros|eʁo
héroïne|eʁɔin
hibou|ibu
haine|ɛn
heure|œʁ
histoire|istwaʁ
hôtel|otɛl
wagon|vaɡɔ̃
parking|paʁkiŋ
week-end|wikɛnd
football|futbol
tennis|tenis
Paris|paʁi
Lyon|ljɔ̃;lijɔ̃
Hugo|yɡo
`),
  ...rows('oppositions-traditionnelles', `
tache|taʃ
tâche|tɑːʃ
patte|pat
pâte|pɑːt
mettre|mɛtʁ
maître|mɛːtʁ
prêt|pʁɛ
blé|ble
jeune|ʒœn
jeûne|ʒøn
cote|kɔt
côte|kot
peu|pø
peur|pœʁ
mou|mu
lu|ly
`),
  ...rows('longueurs-reference', `
tâche|tɑːʃ
maître|mɛːtʁ
tête|tɛːt
caisse|kɛːs
reine|ʁɛːn
presse|pʁɛːs
scène|sɛːn
gène|ʒɛːn
hôte|oːt
`).map(row => ({ ...row, strictLength: true }))
];

/** Unknown forms have hypotheses, not fabricated gold pronunciations. */
export const unknownFixtures = [
  'lumivelle', 'ploruchon', 'franoulette', 'bromiquette', 'syllaboscope',
  'néoflurisation', 'dézoubler', 'replumifier', 'antipanoramique',
  'hyperbrouillonnable', 'troumpflin', 'xylophotisme', 'miorphèse',
  'bléorisation', 'quonchule'
].map(word => ({ word, checks: ['nonempty', 'valid-inventory', 'hypothesis-signalled', 'complete-orthography'] }));

export const alignmentFixtures = [
  { word: 'eau', grapheme: 'eau', phone: 'o', silent: [] },
  { word: 'beau', grapheme: 'eau', phone: 'o', silent: [] },
  { word: 'saut', grapheme: 'au', phone: 'o', silent: ['t'] },
  { word: 'chou', grapheme: 'ch', phone: 'ʃ', silent: [] },
  { word: 'chou', grapheme: 'ou', phone: 'u', silent: [] },
  { word: 'photo', grapheme: 'ph', phone: 'f', silent: [] },
  { word: 'vin', grapheme: 'in', phone: 'ɛ̃', silent: [] },
  { word: 'brun', grapheme: 'un', phone: 'œ̃', silent: [] },
  { word: 'vent', grapheme: 'en', phone: 'ɑ̃', silent: ['t'] },
  { word: 'soudent', grapheme: 'ou', phone: 'u', silent: ['ent'] },
  { word: 'homme', grapheme: 'h', phone: null, silent: ['h'] },
  { word: 'tâche', grapheme: 'â', phone: 'ɑː', silent: ['e'] },
  { word: 'fille', grapheme: 'ill', phone: 'j', silent: ['e'] }
];

export const structureFixtures = [
  { text: 'Bonjour.\n\nLes enfants jouent.', lines: ['Bonjour.', '', 'Les enfants jouent.'] },
  { text: '  Un texte long : oui, vraiment !  ', lines: ['  Un texte long : oui, vraiment !  '] },
  { text: 'Un\r\ndeux\r\ntrois', lines: ['Un', 'deux', 'trois'] },
  { text: 'L’homme et l’enfant.', lines: ['L’homme et l’enfant.'] },
  { text: '<script>alert("x")</script>', checks: ['safe-text-rendering', 'no-HTML-injection'] },
  { text: 'Il soude. Ils soudent. Le vent souffle.', checks: ['nonempty', 'verb-ending-not-nasal'] }
];

export const colorFixtures = [
  { phone: 'a', family: 'A', color: '#000000' },
  { phone: 'ɑː', family: 'A', color: '#000000' },
  { phone: 'e', family: 'E', color: '#ffffff' },
  { phone: 'ɛː', family: 'E', color: '#ffffff' },
  { phone: 'i', family: 'I', color: '#b51e32' },
  { phone: 'y', family: 'U', color: '#126535' },
  { phone: 'u', family: 'U', color: '#126535' },
  { phone: 'o', family: 'O', color: '#174bb3' },
  { phone: 'ɔ', family: 'O', color: '#174bb3' },
  { phone: 'ɑ̃', category: 'nasal' },
  { phone: 'ɛ̃', category: 'nasal' },
  { phone: 'ɔ̃', category: 'nasal' },
  { phone: 'œ̃', category: 'nasal' },
  { phone: 'j', category: 'consonant' },
  { phone: 'w', category: 'consonant' },
  { phone: 'ɥ', category: 'consonant' }
];

/** Stable non-poetic syllabification; glides and vowel lengths add no nucleus. */
export const syllableFixtures = [
  { word: 'bonjour', ipa: 'bɔ̃.ʒuʁ', syllables: 2 },
  { word: 'ordinateur', ipa: 'ɔʁ.di.na.tœʁ', syllables: 4 },
  { word: 'dictionnaire', ipa: 'dik.sjɔ.nɛʁ', syllables: 3 },
  { word: 'théorie', ipa: 'te.ɔ.ʁi', syllables: 3 },
  { word: 'quatrième', ipa: 'ka.tʁi.jɛm', syllables: 3 },
  { word: 'travail', ipa: 'tʁa.vaj', syllables: 2 },
  { word: 'huile', ipa: 'ɥil', syllables: 1 },
  { word: 'fille', ipa: 'fij', syllables: 1 },
  { word: 'pays', ipa: 'pe.i', alternatives: ['pɛ.i'], syllables: 2 },
  { word: 'maître', ipa: 'mɛːtʁ', syllables: 1 },
  { word: 'soudent', ipa: 'sud', syllables: 1 },
  { word: 'science', ipa: 'sjɑ̃s', syllables: 1 },
  { word: 'compter', ipa: 'kɔ̃.te', syllables: 2 },
  { word: 'examen', ipa: 'ɛɡ.za.mɛ̃', syllables: 3 },
  { word: 'axiome', ipa: 'ak.sjɔm', syllables: 2 },
  { word: 'démocratie', ipa: 'de.mɔ.kʁa.si', syllables: 4 },
  { word: 'fonction', ipa: 'fɔ̃k.sjɔ̃', syllables: 2 },
  { word: 'électricité', ipa: 'e.lɛk.tʁi.si.te', syllables: 5 },
  { word: 'inconstitutionnellement', ipa: 'ɛ̃.kɔ̃s.ti.ty.sjɔ.nɛl.mɑ̃', syllables: 7 }
];
