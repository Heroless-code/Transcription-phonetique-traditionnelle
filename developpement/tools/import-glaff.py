"""Read the public archive as data; extract only named notices and valid IPA rows."""
import tarfile, json, re, unicodedata, hashlib
from pathlib import Path

root = Path(__file__).resolve().parents[1]
archive = root / 'data/references/GLAFF-1.2.2.tar.bz2'
stats = {'source': 'GLÀFF 1.2.2', 'archiveSha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'rows': 0, 'retainedRows': 0}
pos_codes = {'N': 'NOM', 'V': 'VER', 'A': 'ADJ', 'R': 'ADV', 'D': 'ART', 'P': 'PRO', 'S': 'PRE', 'C': 'CON', 'I': 'ONO'}
with tarfile.open(archive) as source:
    notice = source.extractfile('GLAFF-1.2.2/LISEZMOI.txt').read()
    (root / 'data/references/GLAFF_LISEZMOI.txt').write_bytes(notice)
    with source.extractfile('GLAFF-1.2.2/glaff-1.2.2.txt') as raw, (root / 'data/references/glaff-candidates.jsonl').open('w', encoding='utf-8') as output:
        for line in raw:
            stats['rows'] += 1
            fields = line.decode('utf-8').rstrip('\r\n').split('|')
            if len(fields) < 5: continue
            word, tag, lemma, pronunciations = fields[:4]
            word = unicodedata.normalize('NFC', word).lower().replace('’', "'")
            if not re.fullmatch(r"[a-zà-öø-ÿœæ]+(?:[-'][a-zà-öø-ÿœæ]+)*", word): continue
            pos = pos_codes.get(tag[:1])
            if not pos: continue
            readings = []
            for ipa in pronunciations.split(';'):
                ipa = unicodedata.normalize('NFD', ipa.strip()).replace('g', 'ɡ').replace('r', 'ʁ')
                if not ipa or not re.fullmatch(r'[aɑeɛəioɔuyøœbpdtkɡfvszmnlʃʒʁɲŋjwɥh.ː\u0303]+', ipa): continue
                if not re.search(r'[aɑeɛəioɔuyøœ]', ipa): continue
                if re.search(r'(?:^|[^ɑɛɔœ])\u0303', ipa): continue
                if any(not re.search(r'[aɑeɛəioɔuyøœ]', syllable) for syllable in ipa.split('.')): continue
                if ipa not in readings: readings.append(ipa)
            if not readings: continue
            stats['retainedRows'] += 1
            output.write(json.dumps({'word': word, 'pos': pos, 'lemma': lemma, 'ipa': readings, 'tag': tag}, ensure_ascii=False) + '\n')
(root / 'data/glaff-import.json').write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(stats))
