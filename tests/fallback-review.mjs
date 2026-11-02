import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialize, analyzeWord } from '../src/engine.js';
import { fallbackFixtures, inventedFallbackFixtures, fallbackLengthFixtures, lexicalExceptionFixtures } from './fallback-fixtures.js';
import { g2p } from '../src/rules.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const normalize = ipa => ipa.replace(/[.ːˑ]/gu, '');
const checks = [];
for (const f of fallbackFixtures) {
  const token = analyzeWord(f.word, { forceRules: true, ...f.options });
  const actual = normalize(token.ipa);
  checks.push({ type: 'known', word: f.word, category: f.category, passed: f.ipa.some(ipa => normalize(ipa) === actual), expected: f.ipa, actual, source: token.source });
}
for (const f of inventedFallbackFixtures) {
  const token = analyzeWord(f.word, { forceRules: true, ...f.options });
  const actual = normalize(token.ipa);
  const hasNucleus = /[aɑeɛəioɔuyøœ]/u.test(actual);
  const inventory = /^[aɑeɛəioɔuyøœ\u0303bdfɡklmnɲŋpʁsʃtvzʒjwɥ]+$/u.test(actual);
  checks.push({ type: 'invented-invariant', word: f.word, description: f.description,
    passed: Boolean(actual) && hasNucleus && inventory && token.confidence === 'hypothesis' &&
      (f.contains || []).every(p => actual.includes(p)) && (f.excludes || []).every(p => !actual.includes(p)), actual, source: token.source });
}
for (const f of fallbackLengthFixtures) {
  const token = analyzeWord(f.word, { forceRules: true });
  const actual = token.ipa.replace(/[.]/gu, '');
  const evidence = g2p(f.word).units.map(unit => unit.phones).join('');
  checks.push({ type: 'strict-length', word: f.word, description: f.description,
    passed: actual === f.ipa && evidence === f.ipa, expected: f.ipa, actual, unitEvidence: evidence });
}
await initialize();
const lexicalExceptions = lexicalExceptionFixtures.map(f => {
  const lexical = analyzeWord(f.word), forced = analyzeWord(f.word, { forceRules: true });
  return { word: f.word, expected: f.ipa, reason: f.reason,
    lexical: { actual: lexical.ipa, matchesGold: normalize(lexical.ipa) === normalize(f.ipa), source: lexical.source },
    forcedRules: { actual: forced.ipa, matchesGold: normalize(forced.ipa) === normalize(f.ipa), confidence: forced.confidence },
    note: 'La lecture de repli reste une hypothèse ; ce cas ne compte pas comme réussite du repli.' };
});
const report = { mechanism: 'dictionary-forcibly-bypassed', knownCases: fallbackFixtures.length, inventedInvariants: inventedFallbackFixtures.length, strictLengthCases: fallbackLengthFixtures.length, lexicalExceptions,
  passed: checks.filter(c => c.passed).length, failed: checks.filter(c => !c.passed).length, checks };
fs.mkdirSync(path.join(root, 'validation'), { recursive: true });
const suffix = process.argv[2] || 'final';
fs.writeFileSync(path.join(root, 'validation', `fallback-review-${suffix}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ knownCases: report.knownCases, inventedInvariants: report.inventedInvariants, passed: report.passed, failed: report.failed,
  failures: checks.filter(c => !c.passed), lexicalExceptions }, null, 2));
if (report.failed || lexicalExceptions.some(f => !f.lexical.matchesGold || f.forcedRules.confidence !== 'hypothesis')) process.exitCode = 1;
