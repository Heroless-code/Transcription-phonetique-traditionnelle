# Transcription phonétique traditionnelle

**Du texte aux sons du français moderne traditionnel.**  
**From French text to traditional modern French sounds.**

[**Ouvrir l’application en ligne / Open the app**](https://heroless-code.github.io/Transcription-phonetique-traditionnelle/)

[Français](#français) · [English](#english) · [Télécharger / Download](https://github.com/Heroless-code/Transcription-phonetique-traditionnelle/releases) · [Contribuer / Contributing](CONTRIBUTING.md)

## Français

Une application simple pour convertir des mots, des phrases ou des poèmes français en alphabet phonétique international (API). Chaque ligne du texte apparaît au-dessus de sa transcription. Le mode **Sonorités** met en évidence les répétitions de consonnes et de voyelles pour explorer les allitérations et les assonances.

L’application fonctionne **entièrement hors ligne**, sans compte ni installation, après téléchargement. L’interface est en français.

### Utilisation

1. Dans [Releases](https://github.com/Heroless-code/Transcription-phonetique-traditionnelle/releases), télécharger le fichier HTML joint. Il est également disponible dans ce dépôt sous le nom **Application.html**.
2. Ouvrir ce fichier dans un navigateur récent et attendre son initialisation.
3. Saisir un texte, puis cliquer sur **Transcrire** ou utiliser **Ctrl + Entrée**.
4. Cocher **Sonorités** pour afficher les répétitions de sons. **« ? »** donne les précisions et les variantes de lecture ; **Copier l’API** récupère la transcription.

### Aperçu

![Transcription ligne par ligne](docs/screenshots/transcription.png)

![Allitérations et assonances](docs/screenshots/sonorites.png)

<details>
<summary>Vue mobile</summary>

![Vue mobile](docs/screenshots/mobile.png)

</details>

### Conventions et contributions

La référence est le [français moderne traditionnel](https://fr.wiktionary.org/wiki/Annexe:Prononciation/fran%C3%A7ais#Fran%C3%A7ais_moderne_traditionnel), avec une lecture classique des e caducs et des variantes de diérèse/synérèse. Aucun mètre n’est imposé. Les mots inconnus, les noms propres et certaines ambiguïtés peuvent nécessiter une vérification ; les répétitions sonores ne prouvent pas une intention littéraire.

Les [signalements](https://github.com/Heroless-code/Transcription-phonetique-traditionnelle/issues) et les [pull requests](https://github.com/Heroless-code/Transcription-phonetique-traditionnelle/pulls) sont bienvenus. Les sources et la documentation technique se trouvent dans [developpement](developpement/README.md). Les notices [Lexique](developpement/data/references/LEXIQUE_ATTRIBUTION.md) et [GLÀFF](developpement/data/references/GLAFF_ATTRIBUTION.md) sont conservées ; la provenance et la licence du JSONL initial restent incomplètement documentées.

**Version provisoire : l’application est en cours d’amélioration. Des corrections et de nouvelles fonctionnalités pourront être proposées au fil des mises à jour.**

---

## English

A simple app that converts French words, sentences and poems into the International Phonetic Alphabet (IPA). Each original line appears above its transcription. **Sonorités** highlights repeated consonants and vowels to help explore alliteration and assonance.

After downloading, the app runs **entirely offline**, without an account or installation. Its interface is currently in French. The screenshots above show the transcription, sound-pattern and mobile views.

### Usage

1. Download the HTML attachment from [Releases](https://github.com/Heroless-code/Transcription-phonetique-traditionnelle/releases), or get **Application.html** from this repository.
2. Open the file in a recent browser and wait for initialization.
3. Enter French text, then click **Transcrire** or press **Ctrl + Enter**.
4. Enable **Sonorités** to explore sound repetitions. **“?”** provides details and reading variants; **Copier l’API** copies the transcription.

### Conventions and contributions

The target is traditional modern French, with a classical reading policy for schwas and available diaeresis/synaeresis variants. No poetic metre is forced. Unknown words, proper names and some ambiguities may need checking; repeated sounds alone do not establish literary intent.

[Issues](https://github.com/Heroless-code/Transcription-phonetique-traditionnelle/issues) and [pull requests](https://github.com/Heroless-code/Transcription-phonetique-traditionnelle/pulls) are welcome. Source code and technical documentation are in [developpement](developpement/README.md). Third-party data notices are preserved; the initial JSONL’s provenance and licence remain incompletely documented.

**Provisional release: the app is being improved. Fixes and new features may be introduced in future updates.**
