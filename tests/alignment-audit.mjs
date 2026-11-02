/**
 * Deterministic alignment audit. It checks the fidelity of source-to-IPA
 * representation, not the linguistic truth of the selected lexical reading.
 * An opaque/uncertain span is reported as such, never relabelled an error.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { initialize, transcribe, analyzeWord } from '../src/engine.js';
import { phones } from '../src/phonology.js';
import { align } from '../src/alignment.js';
import { explicitAlignmentCases, opaqueAlignmentCases } from './alignment-cases.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const samplePath = path.join(root, 'tests/alignment-sample.json');
const source = path.resolve(root, '../analyse-projet/ressources/extracted/extracted.jsonl');
const suffix = process.argv[2] || 'final';
if (!/^[a-z-]+$/u.test(suffix)) throw new Error('Invalid report suffix');
await initialize();
const graphs = ['eau','au','ai','aî','ei','eî','œu','oeu','œ','eu','ou','oû','oi','oy','ay','uy','ill','eil','ail','euil','ouill','gn','ng','qu','gu','guë','guï','gü','ge','ch','sch','sh','ph','th','rh','cc','sc','ss','tt','nn','mm','bb','dd','ff','pp','gg','rr','zz','ent','er','ez','tion','tien','ien','an','en','in','on','un','um','ym','yn','x','h','â','ê','ô','ë','ï','ü'];
let sample;
if (fs.existsSync(samplePath)) sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
else {
  let seed = 20261030;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  const reservoirs = new Map(graphs.map(graph => [graph, { seen: 0, words: [] }]));
  const general = { seen: 0, words: [] };
  const take = (bucket, word, maximum) => {
    bucket.seen++;
    if (bucket.words.length < maximum) bucket.words.push(word);
    else { const index = rand(bucket.seen); if (index < maximum) bucket.words[index] = word; }
  };
  for await (const line of readline.createInterface({ input: fs.createReadStream(source), crlfDelay: Infinity })) {
    const row = JSON.parse(line), word = row.word;
    if (!row.phonetic.length || word.length < 3 || word.length > 32 || !/^[\p{L}]+$/u.test(word)) continue;
    const lower = word.toLocaleLowerCase('fr');
    for (const [graph, bucket] of reservoirs) if (lower.includes(graph)) take(bucket, word, 24);
    take(general, word, 1800);
  }
  const selected = new Map();
  const add = word => {
    if (selected.has(word) || selected.size >= 1800) return;
    const token = analyzeWord(word);
    if (!['lexicon', 'reviewed'].includes(token.source)) return;
    selected.set(word, { word, graphs: graphs.filter(graph => word.toLocaleLowerCase('fr').includes(graph)) });
  };
  for (const bucket of reservoirs.values()) for (const word of bucket.words) add(word);
  for (const word of general.words) add(word);
  sample = { source: 'extracted.jsonl', sourceSha256: '7ccff799c9b3a9d3a6f2cb06f5d719c42ebb295e669b071fba1935008f603baf',
    selection: 'Fixed seeded reservoirs, 24 per graph plus broad reservoir, known retained lexical forms only; 1800 maximum.', seed: 20261030, words: [...selected.values()] };
  fs.writeFileSync(samplePath, JSON.stringify(sample, null, 2));
}

const clean = ipa => phones(ipa).filter(p => p !== '.' && p !== '‿').join('');
const report = { sample: path.relative(root, samplePath), words: sample.words.length, errors: [], certain: 0, uncertain: 0,
  sharedSegments: 0, silentSegments: 0, graphCoverage: {}, uncertainExamples: {}, sourceCounts: {}, liaisonCases: [],
  limits: ['Representation audit only: correct alignment does not certify pronunciation.', 'Uncertain spans remain neutral in the UI; they are counted as unresolved, not incorrect.'] };

report.explicitCases = [];
for (const f of explicitAlignmentCases) {
  const segments = align(f.word, f.ipa);
  let matches = false;
  for (let i = 0; i < segments.length; i++) {
    let text = '', mapped = [], certain = true;
    for (let j = i; j < segments.length; j++) {
      text += segments[j].text; mapped.push(...segments[j].phones); certain &&= !segments[j].uncertain;
      if (text === f.graph && mapped.join('') === f.phones.join('') && certain && (!f.silent || segments.slice(i, j+1).every(s => s.silent))) matches = true;
      if (text.length >= f.graph.length) break;
    }
  }
  const passed = matches && segments.map(s => s.text).join('') === f.word && segments.flatMap(s => s.phones).join('') === clean(f.ipa);
  report.explicitCases.push({ ...f, passed, ...(!passed ? { segments } : {}) });
  if (!passed) report.errors.push({ label: f.word + ' : ' + f.graph, problem: 'explicit graph/phone mismatch', segments });
}
report.opaqueCases = opaqueAlignmentCases.map(f => {
  const segments = align(f.word, f.ipa), passed = segments.some(s => s.uncertain);
  if (!passed) report.errors.push({ label: f.word, problem: 'opaque association falsely certified as certain', segments });
  return { ...f, passed, segments };
});

function inspect(token, label) {
  if (token.type !== 'word') return;
  const segments = token.segments || [], original = segments.map(s => s.text).join('');
  const mapped = segments.flatMap(s => s.phones || []).join('');
  if (original !== token.text) report.errors.push({ label, problem: 'source reconstruction', original: token.text, reconstructed: original });
  if (mapped !== clean(token.ipa)) report.errors.push({ label, problem: 'mapped phonemes differ from emitted IPA', ipa: token.ipa, mapped });
  for (const segment of segments) {
    if (segment.silent) {
      report.silentSegments++;
      if (segment.phones.length) report.errors.push({ label, problem: 'silent segment assigned phones', segment });
    }
    if (segment.phones.length > 1) report.sharedSegments++;
  }
}

for (const item of sample.words) {
  const result = transcribe(item.word), token = result.lines[0].tokens.find(t => t.type === 'word');
  if (!token) { report.errors.push({ word: item.word, problem: 'no word token' }); continue; }
  inspect(token, item.word);
  report.sourceCounts[token.source] = (report.sourceCounts[token.source] || 0) + 1;
  const opaque = token.segments.some(s => s.uncertain);
  report[opaque ? 'uncertain' : 'certain']++;
  for (const graph of item.graphs) {
    const bucket = report.graphCoverage[graph] ||= { words: 0, certain: 0, uncertain: 0 };
    bucket.words++; bucket[opaque ? 'uncertain' : 'certain']++;
    if (opaque) {
      const examples = report.uncertainExamples[graph] ||= [];
      if (examples.length < 5) examples.push({ word: item.word, ipa: token.ipa, segments: token.segments });
    }
  }
}

const phrases = ['les enfants','grand homme','petit enfant','deux enfants','un enfant','nous avons','vous êtes','mes amis','des arbres','tout entier','neuf ans','bon ami','et eux','les héros','les hommes','elles arrivent','un grand enfant','les anciens élèves'];
for (const text of phrases) {
  const result = transcribe(text), tokens = result.lines[0].tokens;
  for (const token of tokens) inspect(token, text + ' : ' + token.text);
  report.liaisonCases.push({ text, ipa: result.lines[0].ipa, words: tokens.filter(t => t.type === 'word').map(t => ({ text: t.text, liaison: t.liaison || null, certain: t.alignmentCertain })) });
}

report.passedIntegrity = report.errors.length === 0;
fs.mkdirSync(path.join(root, 'validation'), { recursive: true });
fs.writeFileSync(path.join(root, 'validation', `alignment-audit-${suffix}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ words: report.words, certain: report.certain, uncertain: report.uncertain, sharedSegments: report.sharedSegments,
  silentSegments: report.silentSegments, explicitCases: report.explicitCases.length, explicitFailures: report.explicitCases.filter(c => !c.passed), integrityErrors: report.errors.length, graphs: report.graphCoverage,
  uncertainExamples: Object.fromEntries(Object.entries(report.uncertainExamples).map(([g, xs]) => [g, xs.map(x => ({ word: x.word, ipa: x.ipa }))])) }, null, 2));
if (report.errors.length) process.exitCode = 1;
