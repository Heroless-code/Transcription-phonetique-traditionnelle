/* Contextual phonology. No remote lookup and no letter-only liaison rule.
 * The supplied lexicon has no POS labels: local analyses are deliberately
 * conservative, and semantic homographs keep their alternatives visible.
 */
const set = text => new Set(text.split(/\s+/u).filter(Boolean));
const lower = text => String(text || '').normalize('NFC').toLocaleLowerCase('fr').replace(/[’ʼ]/gu, "'");
const bare = ipa => String(ipa || '').replace(/[.ˈˌ\s]/gu, '');
const last = list => list[list.length - 1];

const DETERMINERS = set('le la les un une des du au aux ce cet cette ces mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs quel quelle quels quelles quelque quelques plusieurs aucun aucune nul nulle certains certaines divers diverses différents différentes deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize vingt trente quarante cinquante soixante cent mille');
const NUMERALS = set('deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize vingt trente quarante cinquante soixante cent mille');
const FUNCTION_WORDS = set("à a au aux avec après avant chez contre dans de des du et en entre hors mais ni ou où par pour sans selon sous sur vers car donc lorsque puisque quand que qui quoi dont si ne pas plus jamais rien tout tous ainsi alors aussi encore enfin ici là ailleurs ensuite autrefois aujourd'hui hier demain maintenant il elle ils elles je tu on nous vous eux moi toi soi ce ceci cela ça est sont était étaient être ai as avons avez ont avait avaient avoir y");
const CLITICS = set("ne n' me m' te t' se s' le la l' les lui leur en y nous vous");
const SUBJECTS = set('je tu il elle on nous vous ils elles');
const INVERTED_SUBJECTS = set('il elle on ils elles');
const PLURAL_DETERMINERS = set('les des ces mes tes ses nos vos leurs quelques plusieurs certains certaines quels quelles deux trois quatre cinq six sept huit neuf dix vingt trente cent');
const NOMINAL_SINGULAR_DETERMINERS = set("le la un une du au ce cet cette mon ma ton ta son sa notre votre leur aucun aucune nul nulle chaque quel quelle l'");
const NOMINAL_PLURAL_DETERMINERS = new Set([...PLURAL_DETERMINERS,...NUMERALS,...set('aux quelles diverses différentes toutes')]);
const VERBS = set("a ai as avons avez ont avait avaient avais aviez aurai aura auront aurais auraient eut eût est es suis sommes êtes sont était étaient étais étiez sera seront serais seraient fut fût été être avoir aime aimes aiment aimait aimons aimez aimera aimeraient arrive arrives arrivent arrivait arrivons arrivez arrivèrent écoute écoutes écoutent écoutait écoutons écoutez écrit écrivent écrivaient écrit écrit écrit habite habites habitent habitaient habitons habitez invite invites invitent invitons invitez attend attends attendent attendait attendons attendez ira iront irai irais irions iriez allez allait allons vont va vais veut veux veulent voulait voulons voulez peut peux peuvent pouvait pouvons pouvez fait fais font faisait faisons faites prend prends prennent prenait prenons prenez dit dis disent disaient disons dites voit vois voient voyait voyons voyez sait sais savent savait savons savez parle parles parlent parlait parlons parlez donne donnes donnent donnait donnons donnez vient viens viennent venait venons venez part pars partent partait partons partez met mets mettent mettait mettons mettez vend vends vendent vendons vendez répond réponds répondent répondons répondez comprend comprends comprennent comprenons comprenez entend entends entendent entendons entendez apprend apprends apprennent apprenons apprenez ouvre ouvres ouvrent ouvrons ouvrez oublie oublies oublient oublions oubliez accepte acceptes acceptent acceptons acceptez existe existent existait reste restent restez restent court cours courent vit vis vivent vivent rit ris rient sied sied plaît plais plaisent pleut pleuvent");
const COPULAS = set('est es suis sommes êtes sont était étaient étais étiez sera seront serai serais seraient serions seriez fut furent fût fûmes fûtes être');
const AUXILIARIES = new Set([...COPULAS, ...set('ai as a avons avez ont avais avait avaient aviez aurez aura auront eut eurent eût avoir')]);
const ADJECTIVES = set('aimable agréable ancien anciens ancienne anciennes amusant amusante amusants amusantes attentif attentive attentifs attentives autre autres adorable adorables admirable admirables anglais anglaise anglais anglaises italien italienne espagnol espagnole intéressant intéressante intéressants intéressantes important importante importants importantes heureux heureuse heureuses honnête honnêtes habillé habillée habillés habillées élégant élégante élégants élégantes élevé élevée élevés élevées étonné étonnée étonnés étonnées étrange étranges immense immenses intelligent intelligente intelligents intelligentes inquiet inquiète inquiets inquiètes inconnu inconnue inconnus inconnues utile utiles urgent urgente urgents urgentes ouvert ouverte ouverts ouvertes ému émue émus émues excellent excellente excellents excellentes indépendant indépendante indépendants indépendantes efficace efficaces exact exacte exacts exactes étroit étroite étroits étroites idéal idéale idéaux idéales affreux affreuse affreuses optimiste optimistes inévitable inévitables enthousiaste enthousiastes odieux odieuse odieuses affamé affamée affamés affamées affaibli affaiblie absurde absurdes insupportable insupportables impossible impossibles immense immenses');
const PREPOSED_ADJECTIVES = set('petit petits grand grands gros mauvais vieux beaux bon bons ancien anciens nouvel nouveaux premier premiers dernier derniers léger légers divers différents différents nombreux heureux fameux joyeux certain certains plein moyen vilain divin long longs haut hauts tout tous');
const PREPOSED_FEMININE = set('petite petites grande grandes grosse grosses haute hautes ancienne anciennes bonne bonnes mauvaise mauvaises vieille vieilles belle belles nouvelle nouvelles première premières dernière dernières légère légères certaine certaines pleine pleines moyenne moyennes vilaine vilaines divine divines longue longues fameuse fameuses joyeuse joyeuses heureuse heureuses nombreuse nombreuses');
const AMBIGUOUS_ADJECTIVES = set('savant savants précieux précieux puissant puissants jeune jeunes');
const DENASALIZING = new Map([['bon', ['ɔ̃', 'ɔ']], ['certain', ['ɛ̃', 'ɛ']], ['plein', ['ɛ̃', 'ɛ']], ['ancien', ['ɛ̃', 'ɛ']], ['moyen', ['ɛ̃', 'ɛ']], ['vilain', ['ɛ̃', 'ɛ']], ['divin', ['ɛ̃', 'i']]]);
const PREPOSITIONS_Z = set('dans sans sous chez dès');
const OPTIONAL_WORDS = set('après avant devant depuis pendant durant quand mais soit dont pas jamais assez beaucoup trop mieux rien chacun');
const FORBIDDEN_LEFT = set('et hors vers envers selon travers quelqu\'un quelqu\'une quelqu\'uns quelqu\'unes');
const VOWEL_ONSET = /^[aeiouyɑɛəøœɔ]/u;
const GLIDE_ONSET = /^[jwɥ]/u;
const LEGACY_GLIDES = /^(?:yeux|yeuse|yèble|ouaill|ouat|oise|oisif|oisi|huil|huîtr|huitr)/u;
const DISJUNCTIVE = /^(?:onze|onzième|huit|huitième|huitain|oui|ouï-dire|ouistiti|ouagadougou|yaourt|yogourt|yacht|yack|yak|yoga|yoyo|yo-yo|yéti|yucca|yankee|watt|whisky|whiskey|water|week|web|wifi|wi-fi|wok)/u;
const ASPIRE = /^(?:hache|hachis|hachoir|hachur|haie|haillon|haine|haï|haiss|halage|halet|hall(?:s|e|es)?$|halte|hamac|hamburger|hameau|hamster|hanap|hanche|hand|hangar|hanneton|hant|happ|haquet|hara|harcel|hard|hareng|haricot|harnais|harpe|hasard|hâte|hât|haut|havre|henn|hérisson|héron|héros$|héro(?:s)?$|herse|hêtre|heurt|hibou|hideux|hideuse|hiérarch|hippie|hiss|hobby|hobereau|hoche|hockey|hollande|hollandais|homard|hongr|honnir|honte|hoquet|horde|hors|hotte|houblon|houe|houille|houle|houppel|housse|hublot|huche|hue|huguenot|huit$|huitième|hulul|huppe|hure|hurl|hussard|hutte|hyène)/u;
const MUET = /^(?:habile|habill|habit|haleine|halogène|harmon|hebdom|héberg|hébreu|hect|hégémon|hélic|héli|hém|hennin|hép|herb|héré|héroï|héroin|héroïs|hésit|heure|hex|hiatus|hier$|hilar|hindi|hindou|hippo|hirond|hispan|hist|hiver|homéo|homm|homog|homol|homon|honnêt|honneur|honor|hôpital|horizon|horloge|horreur|horrib|hort|hosp|host|hôte|hôtel|huile|huiss|huîtr|huitr|humain|humble|humeur|humide|humili|humor|humour|humu|hurluberlu|hybr|hydr|hyg|hymn|hyp)/u;

// A lexical morphological disambiguation table, not an -ent truncation rule.
// Each entry has a verbal third-person-plural form and a nominal/adjectival form.
const HOMOGRAPHS_ENT = {
  couvent: ['kuv', 'kuvɑ̃'], ferment: ['fɛʁm', 'fɛʁmɑ̃'], parent: ['paʁ', 'paʁɑ̃'],
  président: ['pʁezid', 'pʁezidɑ̃'], résident: ['ʁezid', 'ʁezidɑ̃'], excellent: ['ɛksɛl', 'ɛksɛlɑ̃'],
  violent: ['vjɔl', 'vjɔlɑ̃'], négligent: ['neɡliʒ', 'neɡliʒɑ̃'], divergent: ['divɛʁʒ', 'divɛʁʒɑ̃'],
  affluent: ['afly', 'aflyɑ̃'], content: ['kɔ̃t', 'kɔ̃tɑ̃'], expédient: ['ɛkspedi', 'ɛkspedjɑ̃'],
  équivalent: ['ekival', 'ekivalɑ̃'], influent: ['ɛ̃fly', 'ɛ̃flyɑ̃'],
  convergent: ['kɔ̃vɛʁʒ', 'kɔ̃vɛʁʒɑ̃'], émergent: ['emɛʁʒ', 'emɛʁʒɑ̃'], somnolent: ['sɔmnɔl', 'sɔmnɔlɑ̃'],
};

// Finite semantic classes, intentionally visible and reviewable. They only
// apply to a syntactically adjacent description of the noun fils. Merely
// mentioning copper later in a sentence about somebody's son is insufficient.
const THREAD_MATERIALS = set('acier aciers aluminium argent bronze caoutchouc carbone chanvre coton cuivre étain fer fibre fibres jute laine laiton lin métal métaux nylon nylons or polyester polyesters polyamide polyamides polypropylène polystyrène platine plastique plastiques satin silicium silicone sisal soie tungstène verre zinc');
const THREAD_DESCRIPTIONS = set('électriques téléphoniques télégraphiques barbelés conducteurs torsadés tressés métalliques textiles');
const THREAD_FUNCTIONS = set('coudre broder tricoter tisser');
const SINGULAR_CHILD_DETERMINERS = set('un le ce cet chaque mon ton son notre votre leur aucun du au');
function threadReading(after, previous, before) {
  // The spelling fils is singular only for the child. Material fil has no s
  // at the singular: son fils de vingt ans cannot be the plural of fil.
  let determiner = previous;
  if (previous && PREPOSED_ADJECTIVES.has(previous.lower) && before.length > 1) determiner = before[before.length - 2];
  if (determiner && SINGULAR_CHILD_DETERMINERS.has(determiner.lower)) return null;
  if (after[0] && THREAD_DESCRIPTIONS.has(after[0].lower)) return 'Description physique immédiatement postposée au pluriel.';
  if (after[0]?.lower === 'à' && after[1] && THREAD_FUNCTIONS.has(after[1].lower)) return 'Complément fonctionnel immédiatement rattaché au fil matériel.';
  if (!after[0] || !['de', "d'", 'en'].includes(after[0].lower)) return null;
  let i = 1;
  if (after[i] && ['le', 'la', "l'", 'du', 'des'].includes(after[i].lower)) i++;
  if (after[i] && THREAD_MATERIALS.has(after[i].lower)) return 'Complément de matière immédiatement rattaché au fil matériel.';
  return null;
}

function note(token, message) {
  token.notes ||= [];
  if (!token.notes.includes(message)) token.notes.push(message);
}
function choose(token, ipa, reason, alternatives = []) {
  token.ipa = ipa;
  token.alternatives = [...new Set(alternatives.filter(x => x && bare(x) !== bare(ipa)))];
  token.contextResolved = true;
  token.contextReason = reason;
  token.confidence = alternatives.length ? 'ambiguous' : ['rules', 'morphology', 'acronym'].includes(token.source) ? 'hypothesis' : 'lexical';
  if (!alternatives.length) token.notes = (token.notes || []).filter(message => !message.startsWith('Prononciations lexicales possibles :'));
}
function ambiguous(token, message, alternatives = []) {
  note(token, message);
  token.confidence = 'ambiguous';
  token.alternatives = [...new Set([...(token.alternatives || []), ...alternatives].filter(x => x && bare(x) !== bare(token.ipa)))];
}
function isWord(token) { return token?.type === 'word'; }
function gap(tokens, left, right) { return tokens.slice(left + 1, right).map(t => t.text || '').join(''); }
function wordIndices(tokens) { return tokens.flatMap((t, i) => isWord(t) ? [i] : []); }
function contiguous(tokens, indices, first, second) {
  if (first < 0 || second >= indices.length) return false;
  return /^[\t \u00a0\u202f]*$/u.test(gap(tokens, indices[first], indices[second]));
}
function wordsAround(tokens, indices, wi, count = 5) {
  let start = wi;
  while (start > 0 && wi - start < count && contiguous(tokens, indices, start - 1, start)) start--;
  let end = wi;
  while (end + 1 < indices.length && end - wi < count && contiguous(tokens, indices, end, end + 1)) end++;
  return { start, end, before: indices.slice(start, wi).map(i => tokens[i]), after: indices.slice(wi + 1, end + 1).map(i => tokens[i]) };
}
function nominalSubjectNumber(before) {
  for(let start=0;start<before.length-1;start++){
    if(!DETERMINERS.has(before[start].lower))continue;
    let k=start+1;
    while(k<before.length-1&&posHas(before[k],'ADJ')&&!posHas(before[k],'NOM'))k++;
    if(!posHas(before[k],'NOM'))continue;
    k++;let valid=true;
    while(k<before.length){
      if(posHas(before[k],'ADJ')&&!posHas(before[k],'VER')){k++;continue;}
      if(!['de','du','des',"d'"].includes(before[k].lower)){valid=false;break;}
      k++;
      if(k<before.length&&(DETERMINERS.has(before[k].lower)||before[k].lower==="l'"))k++;
      while(k<before.length-1&&posHas(before[k],'ADJ')&&!posHas(before[k],'NOM'))k++;
      if(!posHas(before[k],'NOM')){valid=false;break;}k++;
    }
    if(valid&&k===before.length)return PLURAL_DETERMINERS.has(before[start].lower)?'plural':'singular';
  }
  return null;
}
function subjectNumber(before) {
  let j=before.length-1;
  while(j>=0&&(CLITICS.has(before[j].lower)||['ne','pas','jamais'].includes(before[j].lower))){
    if(['ils','elles'].includes(before[j].lower))return 'plural';j--;
  }
  if(j>=0&&['ils','elles'].includes(before[j].lower))return 'plural';
  if(j>=0&&['il','elle','on','ce'].includes(before[j].lower))return 'singular';
  return nominalSubjectNumber(before.slice(0,j+1));
}
/** Read the determiner of the current nominal head, not a preceding clause.
 * Only attested/preposed adjectives and their local intensifiers may intervene.
 * Invariant adjectives such as gros/vieux do not themselves establish number.
 */
function nominalHeadNumber(before) {
  let adjectives=0;
  for(let j=before.length-1;j>=0;j--){
    const token=before[j],w=token.lower;
    if(NOMINAL_PLURAL_DETERMINERS.has(w))return 'plural';
    if(NOMINAL_SINGULAR_DETERMINERS.has(w))return 'singular';
    if(PREPOSED_ADJECTIVES.has(w)||PREPOSED_FEMININE.has(w)||token.posHint==='adjective'||posHas(token,'ADJ')&&!posHas(token,'VER')){adjectives++;continue;}
    if(adjectives&&['très','si','assez','tout','trop','bien','fort','plus','moins'].includes(w))continue;
    return null;
  }
  return null;
}
function coordinatedPredicate(before,after){
  if(!['et','ou','ni','puis'].includes(last(before)?.lower))return false;
  // Require a right-hand argument. This protects an adjectival ending such as
  // « ils trouvent cet élève excellent et content » from an invented verb.
  const argument=after[0]&&(DETERMINERS.has(after[0].lower)||['à','au','aux','en','sur','avec','pour'].includes(after[0].lower));
  if(!argument)return false;
  for(let i=before.length-2;i>=Math.max(0,before.length-13);i--){
    const t=before[i];
    if(['que','qui','dont','où','mais','car','lorsque','si'].includes(t.lower))return false;
    if(t.posHint==='verb')return /(?:ent|ont)$/u.test(t.lower);
  }
  return false;
}
function relativeSubjectNumber(before){
  // One bounded relative ending in a finite predicate. Nested or elliptical
  // relatives are left unresolved instead of silently skipping arbitrary text.
  for(let i=1;i<before.length-1;i++){
    const relative=before[i].lower;
    if(!['qui','que'].includes(relative))continue;
    const number=nominalSubjectNumber(before.slice(0,i));
    if(!number)continue;
    const body=before.slice(i+1);
    if(body.some(t=>['qui','que','dont','où'].includes(t.lower)))continue;
    const verbs=body.filter(t=>t.posHint==='verb');
    if(verbs.length!==1||last(body)!==verbs[0])continue;
    if(relative==='que'&&!SUBJECTS.has(body[0]?.lower)&&!nominalSubjectNumber(body.slice(0,-1)))continue;
    return number;
  }
  return null;
}
function verbLikely(tokens, indices, wi) {
  const token = tokens[indices[wi]];
  if (token.posHint === 'verb' || token.morphology?.pos === 'verb') return true;
  const { before, after } = wordsAround(tokens, indices, wi, 14);
  if (!before.length) return false;
  const previous = last(before);
  const pluralFinite = /(?:ent|ont)$/u.test(token.lower);
  const agrees = subject => {
    if (subject === 'nous') return /(?:ons|mes)$/u.test(token.lower);
    if (subject === 'vous') return /(?:ez|tes)$/u.test(token.lower);
    if (['ils','elles'].includes(subject)) return pluralFinite;
    if (HOMOGRAPHS_ENT[token.lower] && ['je','tu','il','elle','on'].includes(subject)) return false;
    return true;
  };
  // A POS lexicon can omit a regular homographic verb, as in désertions.
  // Positive infinitive/paradigm evidence plus an agreeing nous/vous subject
  // outranks that missing label, but never a guessed truncation of -ent.
  if(token.regularVerbCandidate&&before.some(t=>['nous','vous'].includes(t.lower))){
    let j=before.length-1;while(j>=0&&(CLITICS.has(before[j].lower)||['pas','jamais'].includes(before[j].lower))){
      if(['nous','vous'].includes(before[j].lower)&&agrees(before[j].lower))return true;j--;
    }
    if(j>=0&&['nous','vous'].includes(before[j].lower)&&agrees(before[j].lower))return true;
  }
  if (Array.isArray(token.pos) && token.pos.length && !posHas(token,'VER') && !posHas(token,'AUX')) return false;
  if (previous.lower === 'qui' && (pluralFinite || looksVerbal(token))) return true;
  if(pluralFinite&&['et','ou','ni'].includes(previous.lower)&&before.length>=2&&before[before.length-2].posHint==='verb')return true;
  if (pluralFinite && ['certains','certaines','plusieurs','tous','toutes','quelques-uns','quelques-unes'].includes(previous.lower)) return true;
  // A determiner immediately introducing this token takes precedence over a
  // more distant possible subject. Les enfants de ce président is nominal.
  if (DETERMINERS.has(previous.lower) && !CLITICS.has(previous.lower)) return false;
  if(pluralFinite&&coordinatedPredicate(before,after))return true;
  if(pluralFinite&&relativeSubjectNumber(before)==='plural')return true;
  if (pluralFinite && ['où','que','comment','pourquoi','ici','là','ainsi','alors'].includes(previous.lower) && after[0] && PLURAL_DETERMINERS.has(after[0].lower) && after[1] && (posHas(after[1],'NOM') || /[sx]$/u.test(after[1].lower))) return true;
  let j = before.length - 1;
  // Negation and preverbal object pronouns may intervene between subject and verb.
  while (j >= 0 && (CLITICS.has(before[j].lower) || ['pas', 'jamais'].includes(before[j].lower))) {
    if (SUBJECTS.has(before[j].lower) && agrees(before[j].lower)) return true;
    j--;
  }
  if (j >= 0 && SUBJECTS.has(before[j].lower) && agrees(before[j].lower)) return true;
  // The old suffix-only heuristic confused les anciennes élèves with a
  // subject plus the second-person verb élèves. A plural nominal subject
  // can establish only a compatible third-person-plural finite reading.
  if (!pluralFinite) return false;
  if(nominalSubjectNumber(before.slice(0,j+1))==='plural')return true;
  if (before.length >= 2 && /[sx]$/u.test(previous.lower) && PLURAL_DETERMINERS.has(before[before.length - 2].lower)) return true;
  // Bounded noun-phrase recognition: plural determiner + head noun, followed
  // by adjectives and explicit de/du/des/d' complements. No relative clause
  // or intervening finite verb is silently skipped.
  for (let start = before.length - 2; start >= 0; start--) {
    if (!PLURAL_DETERMINERS.has(before[start].lower)) continue;
    let k = start + 1;
    while (k < before.length - 1 && posHas(before[k],'ADJ') && !posHas(before[k],'NOM')) k++;
    if (k >= before.length || !(posHas(before[k],'NOM') || /[sx]$/u.test(before[k].lower))) continue;
    k++;
    let valid = true;
    while (k < before.length) {
      const t = before[k];
      if (posHas(t,'ADJ') && !posHas(t,'VER') && !posHas(t,'PRE')) { k++; continue; }
      if (!['de','du','des',"d'"].includes(t.lower)) { valid = false; break; }
      k++;
      if (k < before.length && (DETERMINERS.has(before[k].lower) || before[k].lower === "l'")) k++;
      while (k < before.length - 1 && posHas(before[k],'ADJ') && !posHas(before[k],'NOM')) k++;
      if (k >= before.length || !(posHas(before[k],'NOM') || before[k].source === 'rules')) { valid = false; break; }
      k++;
    }
    if (valid && k === before.length) return true;
  }
  return false;
}
function nominalLikely(token, previous) {
  return token.posHint === 'noun' || token.posHint === 'adjective' || (previous && DETERMINERS.has(previous.lower));
}
function posHas(token, category) {
  return Array.isArray(token?.pos) && token.pos.includes(category);
}
function traditionalFold(ipa) {
  return bare(ipa).normalize('NFC').replace(/ɑ/gu, 'a').replace(/ː/gu, '').replace(/g/gu, 'ɡ');
}
function nominalPhraseBefore(before) {
  const previous = last(before);
  if (!previous) return false;
  if (DETERMINERS.has(previous.lower) || ['de', "d'", 'par', 'avec', 'sans'].includes(previous.lower)) return true;
  if ((ADJECTIVES.has(previous.lower) || PREPOSED_ADJECTIVES.has(previous.lower) || posHas(previous, 'ADJ')) && before.length > 1) {
    return DETERMINERS.has(before[before.length - 2].lower);
  }
  return false;
}
function grammaticalSelection(token, knownVerb, before, after) {
  if (token.contextResolved && ['fils','as','est','plus','tous','six','dix','neuf','sens','os','vingt','t'].includes(token.lower)) return;
  const previous = last(before);
  // Reviewed French function-word readings outrank rare homographic nouns.
  // A preceding article may explicitly introduce the noun (le mon, le son).
  if (token.source === 'reviewed' && DETERMINERS.has(token.lower) && !(previous && DETERMINERS.has(previous.lower))) return;
  const readings = (token.grammaticalReadings || []).filter(reading => reading?.ipa && ['VER', 'AUX', 'NOM', 'ADJ'].includes(reading.pos));
  if (!readings.length) return;
  let category = null;
  if (knownVerb && readings.some(r => ['VER', 'AUX'].includes(r.pos))) category = 'VER';
  else if(previous&&DETERMINERS.has(previous.lower)&&!AMBIGUOUS_ADJECTIVES.has(token.lower)&&posHas(after[0],'NOM')&&!posHas(after[0],'ADJ')&&readings.some(r=>r.pos==='ADJ'))category='ADJ';
  else if (previous && COPULAS.has(previous.lower) && readings.some(r => r.pos === 'ADJ')) category = 'ADJ';
  else if (nominalPhraseBefore(before) && readings.some(r => r.pos === 'NOM')) category = 'NOM';
  else if (nominalPhraseBefore(before) && readings.some(r => r.pos === 'ADJ')) category = 'ADJ';
  if (!category) {
    ambiguous(token, 'Des lectures grammaticales attestées restent possibles ; le contexte local ne les départage pas.', readings.map(r => r.ipa));
    return;
  }
  const candidates = readings.filter(r => r.pos === category || category === 'VER' && r.pos === 'AUX');
  const current = candidates.find(r => traditionalFold(r.ipa) === traditionalFold(token.ipa));
  // POS information chooses the grammatical reading, not a modern vowel
  // merger. In particular a reviewed traditional length or /ɑ/ survives
  // when the attested reading differs only by those distinctions.
  const ipa = current ? token.ipa : candidates[0].ipa;
  const alternatives = [...new Set(candidates.map(r => r.ipa).filter(p => traditionalFold(p) !== traditionalFold(ipa)))];
  choose(token, ipa, 'Lecture grammaticale attestée dans ' + (token.reference || 'la référence lexicale') + ', choisie par le contexte local.', alternatives);
  token.contextGrammar = {pos: category, reference: token.reference || 'référence lexicale', scope: 'local'};
  token.posHint = category === 'VER' ? 'verb' : category === 'ADJ' ? 'adjective' : 'noun';
  if (alternatives.length) ambiguous(token, 'Plusieurs prononciations subsistent pour la même catégorie grammaticale.');
}
function looksAdjectival(token) {
  if (!token) return false;
  if (ADJECTIVES.has(token.lower) || token.posHint === 'adjective') return true;
  const hasPos = Array.isArray(token.pos) && token.pos.length;
  // A dictionary POS union lists possible uses; it does not assert that the
  // present token is an adjective. Here, in particular, locative/prepositional
  // avant and ici cannot become adjectives merely because a nominalized use
  // occurs somewhere in the reference.
  if (hasPos) return posHas(token, 'ADJ') && !['ADV','PRE','CON','PRO'].some(category => posHas(token, category));
  return /(?:able|ables|ible|ibles|eux|euse|euses|if|ifs|ive|ives|ique|iques|ant|ants|ante|antes|é|ée|és|ées)$/u.test(token.lower);
}
function looksVerbal(token) {
  return token && (VERBS.has(token.lower) || token.posHint === 'verb' || (posHas(token, 'VER') || posHas(token, 'AUX')) && !posHas(token, 'NOM') && !posHas(token, 'ADJ') || /(?:aient|iez|èrent|irent|eront|iront)$/u.test(token.lower));
}
function hStatus(token) {
  const w = token.lower;
  if (!w.startsWith('h')) return null;
  // Exact lexical distinctions precede stem classes (héroïque versus héros).
  if (MUET.test(w)) return 'muet';
  if (ASPIRE.test(w)) return 'aspire';
  return token.h || null;
}
function onsetAllowsLiaison(token) {
  if (!token) return false;
  if (DISJUNCTIVE.test(token.lower)) return false;
  if (token.lower.startsWith('h') && token.h !== 'muet') return false;
  const p = bare(token.ipa);
  if (VOWEL_ONSET.test(p)) return true;
  if (GLIDE_ONSET.test(p)) return LEGACY_GLIDES.test(token.lower) || (!/^[ywh]/u.test(token.lower) && !DISJUNCTIVE.test(token.lower));
  return false;
}
function candidatePhone(token) {
  const w = token.lower;
  if (DENASALIZING.has(w)) return 'n';
  if (['un', 'aucun', 'mon', 'ton', 'son', 'on', 'en', 'bien', 'rien'].includes(w)) return 'n';
  if (['premier', 'dernier', 'léger'].includes(w)) return 'ʁ';
  if (w === 'long') return 'k';
  if (w.endsWith('ent') && token.posHint === 'verb') return 't';
  if (/[td]$/u.test(w)) return 't';
  if (/[sxz]$/u.test(w)) return 'z';
  if (w.endsWith('p')) return 'p';
  return null;
}
function mark(token, kind, phone, reason, realized = kind === 'obligatoire', extras = {}) {
  token.liaison = { phone: phone || '', kind, realized: Boolean(realized && phone), reason, ...extras };
}
function afterInversion(tokens, indices, wi) {
  return wi > 0 && /^[-‐‑]$/u.test(gap(tokens, indices[wi - 1], indices[wi])) && INVERTED_SUBJECTS.has(tokens[indices[wi]].lower);
}

function disambiguate(tokens, indices) {
  for (let wi = 0; wi < indices.length; wi++) {
    const token = tokens[indices[wi]];
    token.lower = lower(token.lower || token.text);
    token.notes ||= [];
    token.alternatives ||= [];
    delete token.liaison;
    if (token.lower.startsWith('h')) token.h = hStatus(token);
  }
  for (let wi = 0; wi < indices.length; wi++) {
    const token = tokens[indices[wi]], w = token.lower;
    const previous = wi > 0 && contiguous(tokens, indices, wi - 1, wi) ? tokens[indices[wi - 1]] : null;
    const next = wi + 1 < indices.length && contiguous(tokens, indices, wi, wi + 1) ? tokens[indices[wi + 1]] : null;
    const { before, after } = wordsAround(tokens, indices, wi, 7);
    const knownVerb = verbLikely(tokens, indices, wi);
    if (VERBS.has(w)) token.posHint ||= 'verb';
    if (HOMOGRAPHS_ENT[w]) {
      const [verb, nominal] = HOMOGRAPHS_ENT[w];
      if (knownVerb) {
        choose(token, verb, 'Flexion verbale de troisième personne du pluriel reconnue par le sujet.');
        token.posHint = 'verb';
      } else if (nominalLikely(token, previous) || previous && COPULAS.has(previous.lower)) {
        choose(token, nominal, 'Emploi nominal ou adjectival identifié dans le contexte local.');
        token.posHint = previous && COPULAS.has(previous.lower) || ADJECTIVES.has(w) ? 'adjective' : 'noun';
      } else {
        choose(token, nominal, 'Lecture nominale ou adjectivale retenue par défaut.', [verb]);
        ambiguous(token, 'Homographe : la lecture verbale et la lecture nominale/adjectivale exigent une analyse syntaxique ou sémantique.');
      }
    } else if (knownVerb && (token.verbIpa || token.verbIPA)) {
      choose(token, token.verbIpa || token.verbIPA, 'Flexion verbale identifiée par son sujet.');
      token.posHint = 'verb';
    }
    if (w === 'est') {
      const east = previous && ["l'", "d'"].includes(previous.lower) || previous && ['nord', 'sud', 'ouest', 'plein'].includes(previous.lower);
      if (east) { choose(token, 'ɛst', 'Le point cardinal est reconnu.'); token.posHint = 'noun'; }
      else {
        choose(token, 'ɛ', 'Forme du verbe être.'); token.posHint = 'verb';
        if (!previous && !next) ambiguous(token, 'Est peut désigner le verbe être ou le point cardinal.', ['ɛst']);
      }
    }
    if (w === 'fils') {
      const threadContext = threadReading(after, previous, before);
      const childContext = after.some(t => ['fille','filles','frère','frères','sœur','sœurs','père','mère','enfant','enfants','né','nés','parti','partis','marié','mariés','dieu','roi','reine'].includes(t.lower));
      if (threadContext) choose(token, 'fil', threadContext);
      else {
        choose(token, 'fis', 'Lecture « enfant masculin » retenue.');
        if (!childContext && !(previous && SINGULAR_CHILD_DETERMINERS.has(previous.lower))) ambiguous(token, 'Fils : /fis/ « enfant » ou /fil/ pluriel de fil ; le sens peut rester ambigu.', ['fil']);
      }
      token.posHint = 'noun';
    }
    if (w === 'sens') {
      if (knownVerb || !previous && next && DETERMINERS.has(next.lower)) { choose(token, 'sɑ̃', 'Forme du verbe sentir.'); token.posHint = 'verb'; }
      else { choose(token, 'sɑ̃s', 'Emploi nominal du mot sens.'); token.posHint = 'noun'; if (!previous && !next) ambiguous(token, 'Sens peut aussi être une forme du verbe sentir.', ['sɑ̃']); }
    }
    if (w === 'as') {
      if (previous && ["l'",'un', 'le', 'cet', 'mon', 'ton', 'son'].includes(previous.lower)) { choose(token, 'ɑs', 'Nom as.'); token.posHint = 'noun'; }
      else { choose(token, 'a', 'Forme du verbe avoir.'); token.posHint = 'verb'; if (!previous && !next) ambiguous(token, 'As peut être le verbe avoir ou le nom as.', ['ɑs']); }
    }
    if (w === 'os') {
      const number=nominalHeadNumber(before);
      const fleshAndBone=before.slice(-4).map(t=>t.lower).join(' ')==='en chair et en';
      if(number==='plural')choose(token,'o','Pluriel de os identifié dans son groupe nominal.');
      else if(number==='singular')choose(token,'ɔs','Os au singulier identifié dans son groupe nominal.');
      else if(fleshAndBone)choose(token,'ɔs','Prononciation de la locution en chair et en os.');
      else {choose(token,'ɔs','Lecture isolée de os retenue par défaut.');ambiguous(token,'Os : le nombre du groupe nominal reste indéterminé.',['o']);}
      token.posHint = 'noun';
    }
    if (w === 'tous') {
      const determinant = next && (DETERMINERS.has(next.lower) || ['azimuts', 'égards', 'étages', 'âges', 'horizons'].includes(next.lower));
      if (determinant && !(previous && (COPULAS.has(previous.lower) || ['avons', 'avez', 'ont', 'avait', 'avaient'].includes(previous.lower)))) {
        choose(token, 'tu', 'Tous déterminant.'); token.posHint = 'determiner';
      } else {
        choose(token, 'tus', 'Tous pronom : s final prononcé.'); token.posHint = 'pronoun';
        if (!previous && !next) ambiguous(token, 'Tous se prononce /tu/ comme déterminant, /tus/ comme pronom.', ['tu']);
      }
    }
    if (w === 'plus') {
      const negative = before.some(t => ["n'", 'ne', 'non'].includes(t.lower)) && !before.some(t => t.lower === 'pas');
      const additive = previous && ['en', 'de'].includes(previous.lower) && !(next && next.lower === 'en');
      const comparative = next && looksAdjectival(next);
      if (negative) { choose(token, 'ply', 'Plus négatif.'); token.contextClass = 'plus-negative'; }
      else if (additive) { choose(token, 'plys', 'Locution additive en plus ou de plus.'); token.contextClass = 'plus-additive'; }
      else if (comparative) {
        choose(token, 'ply', 'Plus comparatif devant un adjectif ou adverbe.'); token.contextClass = 'plus-comparative';
        if (!before.some(t => ['le', 'la', 'les', 'encore', 'toujours', 'bien', 'beaucoup'].includes(t.lower))) ambiguous(token, 'Sans négation écrite, plus peut aussi exprimer la cessation ; l’hypothèse comparative est retenue.');
      } else if (next && next.lower === 'en' && after[1]?.lower === 'plus') {
        choose(token, 'ply', 'Locution de plus en plus.'); token.contextClass = 'plus-fixed';
      } else if (next && !FUNCTION_WORDS.has(next.lower) && !/^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒ]/u.test(next.text)) {
        choose(token, 'ply', 'Lecture comparative retenue devant un mot lexical.', ['plys']); token.contextClass = 'plus-uncertain';
        ambiguous(token, 'La portée grammaticale de plus reste incertaine.');
      } else {
        choose(token, 'plys', 'Plus au sens de davantage ou du signe arithmétique.', ['ply']); token.contextClass = 'plus-uncertain';
        ambiguous(token, 'Plus : /plys/ « davantage » et /ply/ négatif peuvent dépendre du sens.');
      }
    }
    if (w === 'six' || w === 'dix') {
      const stem = w === 'six' ? 'si' : 'di';
      const nominal = next && !FUNCTION_WORDS.has(next.lower) && !looksVerbal(next) && !NUMERALS.has(next.lower);
      const numeralCompound = next && ['cent', 'cents', 'mille', 'milliers', 'million', 'millions', 'milliard', 'milliards'].includes(next.lower);
      if (nominal || numeralCompound) { choose(token, stem, 'Déterminant numéral devant un nom ou un adjectif.'); token.posHint = 'determiner'; token.numeralDeterminer = true; }
      else { choose(token, stem + 's', 'Nombre employé isolément, comme nom ou comme pronom.'); token.posHint = 'numeral-pronoun'; token.numeralDeterminer = false; }
    }
    if (w === 'vingt') {
      choose(token, 'vɛ̃', 'Vingt sans t final hors liaison et compositions spécifiques.');
    }
    if (w === 'neuf' && next && ['an', 'ans', 'heure', 'heures'].includes(next.lower)) {
      choose(token, 'nœ', 'Neuf : f réalisé /v/ devant ans ou heures.');
      token.contextClass = 'neuf-v'; token.posHint = 'determiner';
    }
    if (w === 't' && wi > 0 && wi + 1 < indices.length && /^[-‐‑]$/u.test(gap(tokens, indices[wi - 1], indices[wi])) && /^[-‐‑]$/u.test(gap(tokens, indices[wi], indices[wi + 1])) && INVERTED_SUBJECTS.has(tokens[indices[wi + 1]].lower)) {
      choose(token, 't', 'Consonne euphonique de l’inversion.'); token.posHint = 'euphonic'; token.euphonic = true;
    }
    grammaticalSelection(token, knownVerb, before, after);
    if(w==='convient'){
      const number=subjectNumber(before);
      if(number)choose(token,number==='singular'?'kɔ̃vjɛ̃':'kɔ̃vi','Accord du sujet : convenir au singulier ou convier au pluriel.');
      else ambiguous(token,'Convient : convenir au singulier /kɔ̃vjɛ̃/ ou convier au pluriel /kɔ̃vi/ ; sujet non déterminé.',['kɔ̃vjɛ̃','kɔ̃vi']);
      token.posHint='verb';
    }
  }
}

// Complete two-word expressions/constructions; longer fragments never belong
// here. Longer entries carry the exact index of their liaison boundary.
const FIXED_LIAISON_PAIRS = { 'tout en': 't', 'tout est': 't', 'grand ouvert': 't', 'grand ouverte': 't', 'grands ouverts': 'z', 'quant à': 't', 'quant au': 't', 'quant aux': 't', 'états unis': 'z', 'champs élysées': 'z', 'nations unies': 'z', 'accent aigu': 't', 'fait accompli': 't', 'cas échéant': 'z', 'sous entendu': 'z', 'sous entendus': 'z', 'sous entendue': 'z', 'trop aimable': 'p' };
const FIXED_LIAISON_EXPRESSIONS=[
    ['tout à fait',0,'t'],['tout à coup',0,'t'],["tout à l' heure",0,'t'],['tout à la fois',0,'t'],
    ['tout au plus',0,'t'],['tout au moins',0,'t'],['tout au long',0,'t'],
    ['petit à petit',0,'t'],['deux à deux',0,'z'],['mot à mot',0,'t'],['nuit et jour',0,'t'],
    ['pied à terre',0,'t'],['pied à pied',0,'t'],['de pied en cap',1,'t'],
    ['de fond en comble',1,'t'],['de haut en bas',1,'t'],['de temps en temps',1,'z'],['de temps à autre',1,'z'],
    ['nez à nez',0,'z'],['vis à vis',0,'z'],['plus en plus',0,'z'],['vingt et un',0,'t'],
    ['comment allez vous',0,'t'],['quand est ce',0,'t'],['il était une fois',1,'t'],['toujours est il',0,'z'],
    ...['faire','dire','ajouter','redire'].map(verb=>['rien à '+verb,0,'n'])
].map(([expression,offset,phone])=>({words:expression.split(' '),offset,phone}));
function fixedLiaison(tokens,indices,wi) {
  const left=tokens[indices[wi]],right=tokens[indices[wi+1]];
  const pair = `${left.lower} ${right.lower}`;
  if (FIXED_LIAISON_PAIRS[pair]) return FIXED_LIAISON_PAIRS[pair];
  // Match every internal boundary: punctuation even after the liaison pair
  // prevents an incomplete fragment from licensing the lexical exception.
  for(const {words,offset,phone}of FIXED_LIAISON_EXPRESSIONS){
    const start=wi-offset;
    if(start<0||start+words.length>indices.length)continue;
    if(!words.every((word,i)=>tokens[indices[start+i]].lower===word))continue;
    const joined=words.every((_,i)=>!i||/^(?:[\t \u00a0\u202f]+|[-‐‑])$/u.test(gap(tokens,indices[start+i-1],indices[start+i]))||tokens[indices[start+i-1]].lower.endsWith("'")&&gap(tokens,indices[start+i-1],indices[start+i])==='');
    if(joined)return phone;
  }
  if (pair === 'premier étage' || pair === 'dernier étage') return 'ʁ';
  return null;
}

/**
 * Annotate contextual choices and inter-word liaison, preserving token order.
 * liaison.phone is NOT appended to token.ipa: the caller owns that rendering.
 * Optional liaisons are consistently omitted, except lexicalized expressions.
 */
export function applyContext(tokens) {
  const indices = wordIndices(tokens);
  disambiguate(tokens, indices);
  for (let wi = 0; wi + 1 < indices.length; wi++) {
    const li = indices[wi], ri = indices[wi + 1];
    const left = tokens[li], right = tokens[ri], separator = gap(tokens, li, ri);
    const previous = wi > 0 && contiguous(tokens, indices, wi - 1, wi) ? tokens[indices[wi - 1]] : null;
    const after = wi + 2 < indices.length && contiguous(tokens, indices, wi + 1, wi + 2) ? tokens[indices[wi + 2]] : null;
    const w = left.lower, next = right.lower;
    const phone = candidatePhone(left);
    const hyphen = /^[-‐‑]$/u.test(separator);
    const whitespace = /^[\t \u00a0\u202f]+$/u.test(separator);
    if (hyphen && INVERTED_SUBJECTS.has(next) && left.euphonic) {
      // The t is already a pronounced token, so no extra phoneme is inserted.
      left.inversionJoin = true; right.inverted = true;
      mark(left, 'obligatoire', '', 'Consonne euphonique de l’inversion déjà présente.', false, { writtenConsonant: true, join: true });
      continue;
    }
    if (hyphen && INVERTED_SUBJECTS.has(next) && (looksVerbal(left) || /(?:ent|ait|aient|eront|iront|era|ira)$/u.test(w))) {
      const inversionPhone = /[td]$/u.test(w) || /ent$/u.test(w) ? 't' : /[sx]$/u.test(w) ? 'z' : null;
      if (inversionPhone && !bare(left.ipa).endsWith(inversionPhone)) {
        mark(left, 'obligatoire', inversionPhone, 'Inversion du verbe et du pronom sujet.', true, { join: true });
      } else mark(left, 'obligatoire', '', 'Consonne déjà prononcée devant le sujet inversé.', false, { writtenConsonant: true, join: true });
      right.inverted = true;
      continue;
    }
    if (hyphen && ['en', 'y'].includes(next) && /(?:[sz]|ons|ez)$/u.test(w) && (looksVerbal(left) || /(?:[sz]|ons|ez)$/u.test(w))) {
      mark(left, 'obligatoire', 'z', 'Impératif devant le pronom en ou y.', true, { join: true });
      right.inverted = true;
      continue;
    }
    const fixed = fixedLiaison(tokens,indices,wi);
    if (!whitespace && !(hyphen && fixed)) {
      if (phone) mark(left, 'interdite', phone, separator ? 'La ponctuation ou la frontière écrite bloque la liaison.' : 'Aucune frontière de mots permettant une liaison.');
      continue;
    }
    if (right.h === 'aspire' || DISJUNCTIVE.test(next)) {
      if (phone) mark(left, 'interdite', phone, right.h === 'aspire' ? 'Le h aspiré interdit la liaison.' : 'Initiale disjonctive : la liaison est interdite.');
      continue;
    }
    if (next.startsWith('h') && right.h !== 'muet') {
      if (phone) {
        mark(left, 'interdite', phone, 'Le statut du h n’est pas établi ; la liaison n’est pas supposée.');
        ambiguous(right, 'H initial non classé avec certitude : la liaison a été laissée en suspens.');
      }
      continue;
    }
    if (!onsetAllowsLiaison(right)) continue;
    if (fixed) { mark(left, 'obligatoire', fixed, 'Liaison d’une locution ou d’un composé lexicalisé.', true, { join: hyphen }); continue; }
    if (FORBIDDEN_LEFT.has(w)) { mark(left, 'interdite', phone, 'Ce mot n’autorise pas de liaison dans cet emploi.'); continue; }
    if (['et','ou','mais','car','donc','ni'].includes(next)) {
      if (phone) mark(left, 'interdite', phone, 'La coordination sépare les groupes ; pas de liaison hors locution figée.');
      continue;
    }
    if (left.inverted || afterInversion(tokens, indices, wi)) { if (phone) mark(left, 'interdite', phone, 'Pas de liaison après le pronom sujet inversé.'); continue; }
    if (left.contextClass === 'neuf-v') { mark(left, 'obligatoire', 'v', 'Neuf devant ans ou heures : /v/.'); continue; }
    if (w === 'tous' && left.posHint === 'pronoun') { mark(left, 'interdite', 'z', 'Tous pronom conserve /s/ ; il ne reçoit pas de liaison en /z/.'); continue; }
    if ((w === 'six' || w === 'dix') && !left.numeralDeterminer) { mark(left, 'interdite', 'z', 'Le nombre employé comme pronom ou nom conserve /s/.'); continue; }
    if (w === 'plus') {
      if (left.contextClass === 'plus-comparative') mark(left, 'obligatoire', 'z', 'Plus comparatif se lie à l’adjectif ou à l’adverbe.');
      else if (left.contextClass === 'plus-negative') mark(left, 'facultative', 'z', 'Liaison facultative après plus négatif, omise dans la diction retenue.', false);
      else mark(left, 'facultative', 'z', 'La liaison dépend de la fonction de plus ; elle n’est pas imposée.', false);
      continue;
    }
    if (w === 'tout' && (looksAdjectival(right) || looksVerbal(right) || /(?:é|ée|és|ées|i|ie|is|ies|u|ue|us|ues)$/u.test(next) && previous && AUXILIARIES.has(previous.lower))) {
      mark(left, 'facultative', 't', 'Tout adverbe ou pronom : liaison facultative, non imposée.', false);
      continue;
    }
    if (w === 'toutes' && !(previous && DETERMINERS.has(previous.lower))) {
      mark(left, 'facultative', 'z', 'Toutes pronom : la consonne /t/ est déjà prononcée ; la liaison supplémentaire est omise.', false);
      continue;
    }
    // Subject and unstressed object pronouns bind to a following verb or clitic.
    if (['nous', 'vous', 'ils', 'elles', 'on'].includes(w)) {
      if (['et', 'ou', 'mais', 'donc', 'tous', 'toutes', 'autres', 'seuls', 'seules', 'aussi'].includes(next)) {
        if (phone) mark(left, 'facultative', phone, 'Pronom détaché ou accentué : aucune liaison n’est imposée.', false);
      } else if (SUBJECTS.has(next) && !['on'].includes(next)) {
        if (phone) mark(left, 'interdite', phone, 'Deux sujets disjoints ne se lient pas.');
      } else if (looksVerbal(right) || CLITICS.has(next)) mark(left, 'obligatoire', w === 'on' ? 'n' : 'z', 'Pronom conjoint devant son verbe ou un autre clitique.');
      else {
        mark(left, 'facultative', phone, 'La fonction conjointe ou détachée du pronom n’est pas établie ; la liaison n’est pas imposée.', false, { ambiguousGrammar: true });
        ambiguous(left, 'Le groupe suivant ne permet pas d’identifier sûrement un verbe régi par le pronom.');
      }
      continue;
    }
    if (w === 'en') {
      mark(left, 'obligatoire', 'n', 'Préposition en ou pronom conjoint devant le mot régi.'); continue;
    }
    if (PREPOSITIONS_Z.has(w)) {
      if (w === 'chez' && /^[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒ]/u.test(right.text)) mark(left, 'facultative', 'z', 'Devant un nom propre après chez, la jonction varie ; elle est omise.', false);
      else mark(left, 'obligatoire', 'z', 'Préposition monosyllabique liée à son complément.');
      continue;
    }
    if (w === 'très' || w === 'moins' && looksAdjectival(right)) {
      mark(left, 'obligatoire', 'z', 'Adverbe directement lié à l’adjectif.'); continue;
    }
    if (w === 'bien') {
      if (looksAdjectival(right) || !FUNCTION_WORDS.has(next) && /(?:é|ée|és|ées)$/u.test(next) || ['assis','assise','acquis','acquise','fini','finie','réussi','réussie','parti','partie','sorti','sortie','venu','venue','vêtu','vêtue','connu','connue','conçu','conçue','reçu','reçue','lu','lue','vu','vue','compris','comprise','inclus','incluse','entendu','entendue'].includes(next)) mark(left, 'obligatoire', 'n', 'Bien modifie directement un adjectif ou un participe.');
      else mark(left, 'facultative', 'n', 'La liaison après bien dépend de sa portée ; elle est omise ici.', false);
      continue;
    }
    if (['un', 'aucun'].includes(w) && ['aussi', 'ici', 'ailleurs', 'avant', 'après', 'avec', 'en', 'à', 'au', 'aux', 'encore'].includes(next)) {
      mark(left, 'interdite', 'n', 'Un ou aucun est ici pronom, sans liaison au complément suivant.'); continue;
    }
    if (w === 'son' && previous && DETERMINERS.has(previous.lower)) {
      mark(left, 'interdite', 'n', 'Son est un nom et non un déterminant possessif.'); continue;
    }
    if (DETERMINERS.has(w) && phone && !['le', 'la', 'du', 'au', 'ce', 'notre', 'votre', 'leur', 'quel', 'quelle', 'cinq', 'sept', 'huit', 'neuf', 'quatre', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'trente', 'quarante', 'cinquante', 'soixante', 'mille'].includes(w)) {
      if (w === 'cet') left.ipa = 'sɛ';
      if (w === 'cent' && NUMERALS.has(next)) mark(left, 'interdite', 't', 'Pas de liaison entre cent et un autre numéral.');
      else mark(left, 'obligatoire', phone, 'Déterminant devant son nom ou un adjectif antéposé.');
      continue;
    }
    const earlier = wi > 1 && contiguous(tokens, indices, wi - 2, wi - 1) ? tokens[indices[wi - 2]] : null;
    const lexicalAdjective = left.posHint==='adjective' || ADJECTIVES.has(w) || !AMBIGUOUS_ADJECTIVES.has(w) && posHas(left,'ADJ') && !['NOM','ADV','PRE','CON','PRO'].some(category=>posHas(left,category)) && posHas(right,'NOM');
    const adjectiveInNounPhrase = lexicalAdjective && (previous && DETERMINERS.has(previous.lower) || previous && earlier && DETERMINERS.has(earlier.lower) && (ADJECTIVES.has(previous.lower) || posHas(previous,'ADJ') || ['très','assez','fort','si'].includes(previous.lower)));
    if ((PREPOSED_ADJECTIVES.has(w) || PREPOSED_FEMININE.has(w) || adjectiveInNounPhrase) && phone) {
      if (FUNCTION_WORDS.has(next) || looksVerbal(right) || previous && COPULAS.has(previous.lower)) {
        mark(left, 'interdite', phone, 'L’adjectif n’est pas antéposé à un nom dans cette lecture.');
      } else {
        if (DENASALIZING.has(w)) {
          const [nasal, oral] = DENASALIZING.get(w);
          left.ipa = left.ipa.replace(nasal, oral);
          mark(left, 'obligatoire', 'n', 'Adjectif antéposé : dénasalisation et liaison en /n/.');
        } else mark(left, 'obligatoire', phone, 'Adjectif antéposé lié au nom.');
      }
      continue;
    }
    if (AMBIGUOUS_ADJECTIVES.has(w) && phone) {
      mark(left, 'facultative', phone, 'La lecture adjectivale ou nominale change la possibilité de liaison ; aucune n’est imposée.', false, { ambiguousGrammar: true });
      ambiguous(left, 'Une lecture adjectivale antéposée autoriserait la liaison ; une lecture nominale peut l’interdire.');
      continue;
    }
    if (AUXILIARIES.has(w) || left.posHint === 'verb' || OPTIONAL_WORDS.has(w) || /ment$/u.test(w) || /er$/u.test(w)) {
      if (phone || /er$/u.test(w)) mark(left, 'facultative', phone || 'ʁ', 'Liaison facultative, omise dans la diction naturelle retenue.', false);
      continue;
    }
    if (phone) {
      if (/[sx]$/u.test(w) && previous && PLURAL_DETERMINERS.has(previous.lower)) mark(left, 'facultative', phone, 'Liaison après un nom pluriel : non imposée.', false);
      else mark(left, 'interdite', phone, 'Aucun lien grammatical sûr n’autorise cette liaison.');
    }
  }
  return tokens;
}

export const contextPolicy = Object.freeze({
  optionalLiaisons: 'omitted',
  fixedExpressions: 'realized',
  unknownH: 'no-assumed-liaison',
  semanticHomographs: 'local-heuristics-with-alternatives',
});

export const contextInternals = { onsetAllowsLiaison, hStatus, candidatePhone, HOMOGRAPHS_ENT };
