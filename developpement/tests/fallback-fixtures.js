/**
 * Transparent French forms checked with the lexical path forcibly disabled.
 * Fixed before correcting the fallback. These are mechanism regressions,
 * not an estimate of open-vocabulary accuracy. Length and dots are checked
 * elsewhere: this set compares the segmental sequence.
 */
const rows = (category, text, options = {}) => text.trim().split('\n').map(row => {
  const [word, ipa] = row.trim().split('|');
  return { word, ipa: ipa.split(';'), category, options };
});

export const fallbackFixtures = [
  ...rows('graphèmes-réguliers', `
chat|ʃa
chou|ʃu
chute|ʃyt
poche|pɔʃ
riche|ʁiʃ
cage|kaʒ
cigale|siɡal
cigare|siɡaʁ
cube|kyb
cuisine|kɥizin
vague|vaɡ
baguette|baɡɛt
guider|ɡide
gare|ɡaʁ
girafe|ʒiʁaf
garçon|ɡaʁsɔ̃
façade|fasad
phare|faʁ
thèse|tɛz
chiffre|ʃifʁ
différence|difeʁɑ̃s
technique|tɛknik
technicien|tɛknisjɛ̃
ethnique|ɛtnik
bouche|buʃ
rouge|ʁuʒ
couleur|kulœʁ
fleur|flœʁ
peu|pø
peur|pœʁ
heure|œʁ
`),
  ...rows('nasalisation-régulière', `
chanson|ʃɑ̃sɔ̃
chant|ʃɑ̃
dans|dɑ̃
sans|sɑ̃
vent|vɑ̃
bon|bɔ̃
nom|nɔ̃
vin|vɛ̃
pain|pɛ̃
plein|plɛ̃
brun|bʁœ̃
parfum|paʁfœ̃
lundi|lœ̃di
un|œ̃
main|mɛ̃
fin|fɛ̃
train|tʁɛ̃
chemin|ʃəmɛ̃
jardin|ʒaʁdɛ̃
bonne|bɔn
fine|fin
`),
  ...rows('terminaisons-et-schwa', `
marcher|maʁʃe
chanter|ʃɑ̃te
danser|dɑ̃se
parler|paʁle
finir|finiʁ
sortir|sɔʁtiʁ
partir|paʁtiʁ
venir|vəniʁ
demander|dəmɑ̃de
reprendre|ʁəpʁɑ̃dʁ
recherche|ʁəʃɛʁʃ
secret|səkʁɛ
regret|ʁəɡʁɛ
petite|pətit
leçon|ləsɔ̃
menu|məny
tenu|təny
venu|vəny
chantaient|ʃɑ̃tɛ
marchaient|maʁʃɛ
rêvaient|ʁɛvɛ
parlons|paʁlɔ̃
chantez|ʃɑ̃te
`),
  ...rows('e-final-et-glides', `
ami|ami
amie|ami
vie|vi
rue|ʁy
boue|bu
tortue|tɔʁty
ravie|ʁavi
lui|lɥi
fuir|fɥiʁ
nuit|nɥi
pluie|plɥi
bruit|bʁɥi
fruit|fʁɥi
métier|metje
papier|papje
atelier|atəlje
`),
  ...rows('groupes-palatalisés', `
travail|tʁavaj
soleil|sɔlɛj
fauteuil|fotœj
paille|paj
feuille|fœj
abeille|abɛj
conseiller|kɔ̃sɛje
nouille|nuj
rouille|ʁuj
grenouille|ɡʁənuj
fenouil|fənuj
nettoyer|nɛtwaje
rayon|ʁɛjɔ̃
voyage|vwajaʒ
voyelle|vwajɛl
tuyau|tɥijo
appuyer|apɥije
`),
  ...rows('emprunt-intégré-en-ing', `
camping|kɑ̃piŋ
parking|paʁkiŋ
shopping|ʃɔpiŋ
`),
  ...rows('pluriels-réguliers-et-trémas', `
chats|ʃa
grands|ɡʁɑ̃
petits|pəti
froids|fʁwa
nids|ni
longs|lɔ̃
billets|bijɛ
métiers|metje
papiers|papje
écoliers|ekɔlje
ambiguë|ɑ̃biɡy
contiguë|kɔ̃tiɡy
ambiguïté|ɑ̃biɡɥite
contiguïté|kɔ̃tiɡɥite
geôle|ʒol
geôlier|ʒolje
nageoire|naʒwaʁ
gageure|ɡaʒyʁ
exagérer|ɛɡzaʒeʁe
exemple|ɛɡzɑ̃pl
exilé|ɛɡzile
`),
  ...rows('désinence-verbale-explicite', `
soudent|sud
chantent|ʃɑ̃t
parlent|paʁl
marchent|maʁʃ
collent|kɔl
prient|pʁi
crient|kʁi
`, { verb: true })
];

/** Invented words have only local invariants, no fabricated gold reading. */
export const inventedFallbackFixtures = [
  { word: 'flantruche', contains: ['ɑ̃'], options: {}, description: 'an devant consonne' },
  { word: 'plimpaque', contains: ['ɛ̃'], options: {}, description: 'im devant consonne' },
  { word: 'bloncule', contains: ['ɔ̃'], options: {}, description: 'on devant consonne' },
  { word: 'brundelle', contains: ['œ̃'], options: {}, description: 'un devant consonne' },
  { word: 'glaronne', excludes: ['ɔ̃'], options: {}, description: 'double n empêchant la nasalisation' },
  { word: 'glamelle', excludes: ['ɑ̃'], options: {}, description: 'am devant voyelle' },
  { word: 'plinette', excludes: ['ɛ̃'], options: {}, description: 'in devant voyelle' },
  { word: 'zoupent', excludes: ['ɑ̃'], contains: ['u'], options: { verb: true }, description: 'ent verbal muet' },
  { word: 'lumivent', contains: ['ɑ̃'], options: { verb: false }, description: 'ent non verbal non supprimé systématiquement' },
  { word: 'frabie', contains: ['i'], excludes: ['j'], options: {}, description: 'i conservé devant e final muet' },
  { word: 'flonue', contains: ['y'], excludes: ['ɥ'], options: {}, description: 'u conservé devant e final muet' },
  { word: 'glaboue', contains: ['u'], excludes: ['w'], options: {}, description: 'ou conservé devant e final muet' },
  { word: 'zoubing', contains: ['iŋ'], options: {}, description: 'emprunt supposé en ing' }
];

export const morphologyFixtures = [
  { word: 'néofleur', contains: ['ne', 'flœʁ'], description: 'préfixe savant + base connue' },
  { word: 'microjardin', contains: ['mikʁo', 'ʒaʁdɛ̃'], description: 'composition avec micro-' },
  { word: 'hyperpoche', contains: ['ipɛʁ', 'pɔʃ'], description: 'composition avec hyper-' },
  { word: 'antibrume', contains: ['ɑ̃ti', 'bʁym'], description: 'préfixe anti- + base connue' }
];

export const fallbackLengthFixtures = [
  { word: 'tâche', ipa: 'tɑːʃ', description: 'longueur justifiée au dernier noyau' },
  { word: 'fête', ipa: 'fɛːt', description: 'longueur justifiée au dernier noyau' },
  { word: 'hôte', ipa: 'oːt', description: 'longueur justifiée au dernier noyau' },
  { word: 'bâtiment', ipa: 'bɑtimɑ̃', description: 'qualité postérieure conservée sans durée prétonique automatique' },
  { word: 'rêver', ipa: 'ʁɛve', description: 'pas de longueur prétonique automatique' },
  { word: 'côté', ipa: 'kote', description: 'pas de longueur prétonique automatique' },
  { word: 'pâlir', ipa: 'pɑliʁ', description: 'qualité postérieure conservée sans durée prétonique automatique' },
  { word: 'croûte', ipa: 'kʁut', description: 'graphème oû prononcé /u/' }
];

/**
 * Explicitly lexical: final -en in examen cannot be inferred from the normal
 * nasal graph en→ɑ̃. The forced-rule failure remains in the initial and
 * expanded-final audit reports. It must not be counted as a forced-rule pass.
 */
export const lexicalExceptionFixtures = [
  { word: 'examen', ipa: 'ɛɡzamɛ̃', reason: 'nasale finale lexicalement exceptionnelle' }
];
