import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HTML='Transcription-phonetique-traditionnelle.html';
const PREFIX='Transcription phonétique traditionnelle v';
const CATALOG='versions.json';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";

// Development packaging only. The delivered HTML has no PowerShell dependency.
// Use the Windows ZIP implementation, with CreateNew to prevent overwrites.
function nativeZip(root,archive,create){
  const html=path.join(root,HTML);
  const script=[
    "$ErrorActionPreference='Stop'",
    '[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false)',
    'Add-Type -AssemblyName System.IO.Compression',
    'Add-Type -AssemblyName System.IO.Compression.FileSystem',
    create?[
      '$stream=[System.IO.File]::Open('+quote(archive)+',[System.IO.FileMode]::CreateNew,[System.IO.FileAccess]::ReadWrite,[System.IO.FileShare]::None)',
      '$zip=$null',
      'try {$zip=[System.IO.Compression.ZipArchive]::new($stream,[System.IO.Compression.ZipArchiveMode]::Create,$false);[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,'+quote(html)+','+quote(HTML)+',[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null} finally {if($null -ne $zip){$zip.Dispose()}else{$stream.Dispose()}}'
    ].join('\n'):'',
    '$zip=[System.IO.Compression.ZipFile]::OpenRead('+quote(archive)+')',
    'try {',
    'if($zip.Entries.Count -ne 1 -or $zip.Entries[0].FullName -ne '+quote(HTML)+'){throw "Unexpected ZIP content"}',
    '$entryStream=$zip.Entries[0].Open();$sha=[System.Security.Cryptography.SHA256]::Create()',
    'try {([BitConverter]::ToString($sha.ComputeHash($entryStream))).Replace("-","").ToLowerInvariant()} finally {$sha.Dispose();$entryStream.Dispose()}',
    '} finally {$zip.Dispose()}'
  ].join('\n');
  const command=process.platform==='win32'?'powershell.exe':'pwsh';
  const result=spawnSync(command,['-NoProfile','-NonInteractive','-Command',script],{encoding:'utf8',windowsHide:true});
  if(result.error||result.status!==0)throw new Error('Archivage ZIP impossible : '+String(result.error||result.stderr||result.stdout).trim());
  const hash=result.stdout.trim();
  if(!/^[a-f0-9]{64}$/u.test(hash))throw new Error('Empreinte du contenu ZIP invalide.');
  return hash;
}

function readHistory(root){
  const file=path.join(root,CATALOG);
  if(!fs.existsSync(file))throw new Error('Historique absent : ne pas recréer les anciennes archives. Restaurer versions.json avant de poursuivre.');
  const history=JSON.parse(fs.readFileSync(file,'utf8'));
  if(history.schemaVersion!==1||!Array.isArray(history.versions))throw new Error('Historique de versions invalide.');
  const numbers=history.versions.map(v=>v.version);
  if(numbers.some(v=>!Number.isSafeInteger(v)||v<1)||new Set(numbers).size!==numbers.length)throw new Error('Numéros de versions invalides.');
  return history;
}

export function checkVersionHistory(root){readHistory(root);}

function writeIndex(root,history){
  const date=iso=>new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Paris'}).format(new Date(iso));
  const rows=history.versions.map(v=>{
    const exists=fs.existsSync(path.join(root,v.archive.filename));
    const archive=exists?'[Télécharger](<'+v.archive.filename+'>)':'ZIP absent';
    return '| v'+v.version+' | '+date(v.createdAt)+' | '+v.description.replace(/[|\r\n]/gu,' ')+' | '+archive+' |';
  });
  const details=history.versions.flatMap(v=>[
    '', '### v'+v.version, '',
    '- HTML : '+v.html.filename+' ; '+v.html.bytes+' octets.',
    '- SHA-256 HTML : '+v.html.sha256+'.',
    '- Archive : '+v.archive.filename+' ; '+v.archive.bytes+' octets.',
    '- SHA-256 ZIP : '+v.archive.sha256+'.'
  ]);
  const text=[
    '# Historique des versions', '',
    'Les archives précédentes ne sont jamais écrasées. L’utilisateur peut les supprimer librement : leur absence ne déclenche aucune recréation et leur numéro reste réservé.', '',
    'Cet historique conserve la trace des versions ; un ZIP absent ne peut pas être téléchargé. Les dates sont affichées dans le fuseau Europe/Paris.', '',
    '| Version | Date | Modification | Archive |', '| --- | --- | --- | --- |',
    ...rows,...details,''
  ].join('\n');
  fs.writeFileSync(path.join(root,'HISTORIQUE_VERSIONS.md'),text);
}

function saveHistory(root,history){
  const target=path.join(root,CATALOG),temporary=target+'.tmp';
  fs.writeFileSync(temporary,JSON.stringify(history,null,2)+'\n',{flag:'wx'});
  fs.renameSync(temporary,target);
  writeIndex(root,history);
}

function record(root,number,archive,html,description){
  return {
    version:number,createdAt:fs.statSync(archive).birthtime.toISOString(),description,
    html:{filename:HTML,bytes:html.length,sha256:digest(html)},
    archive:{filename:path.basename(archive),bytes:fs.statSync(archive).size,sha256:digest(fs.readFileSync(archive))}
  };
}

export function registerVersionOne(root,description){
  if(fs.existsSync(path.join(root,CATALOG)))throw new Error('La v1 est déjà enregistrée ; historique conservé.');
  const archive=path.join(root,PREFIX+'1.zip'),html=fs.readFileSync(path.join(root,HTML));
  if(nativeZip(root,archive,false)!==digest(html))throw new Error('La v1 ne correspond pas au HTML actuel.');
  const history={schemaVersion:1,application:'Transcription phonétique traditionnelle',timezone:'Europe/Paris',versions:[record(root,1,archive,html,description)]};
  saveHistory(root,history);
  return {created:false,registered:true,version:1,archive:path.basename(archive)};
}

export function archiveHtmlVersion(root,{description='Modification du fichier HTML.'}={}){
  const history=readHistory(root),html=fs.readFileSync(path.join(root,HTML)),hash=digest(html);
  const last=[...history.versions].sort((a,b)=>b.version-a.version)[0];
  if(last?.html.sha256===hash){
    writeIndex(root,history);
    return {created:false,version:last.version,archive:last.archive.filename,archivePresent:fs.existsSync(path.join(root,last.archive.filename))};
  }
  const existing=fs.readdirSync(root).map(name=>name.startsWith(PREFIX)&&name.endsWith('.zip')?Number(name.slice(PREFIX.length,-4)):0).filter(Number.isSafeInteger);
  const number=Math.max(0,...history.versions.map(v=>v.version),...existing)+1;
  const archive=path.join(root,PREFIX+number+'.zip');
  if(nativeZip(root,archive,true)!==hash)throw new Error('Le contenu ZIP ne correspond pas au HTML : version non enregistrée.');
  history.versions.push(record(root,number,archive,html,description));
  saveHistory(root,history);
  return {created:true,version:number,archive:path.basename(archive),archivePresent:true};
}

const thisFile=fileURLToPath(import.meta.url);
if(process.argv[1]&&path.resolve(process.argv[1])===thisFile){
  const root=path.resolve(path.dirname(thisFile),'..');
  const i=process.argv.indexOf('--note'),description=i>=0?process.argv[i+1]:'Modification du fichier HTML.';
  if(!description||description.startsWith('--'))throw new Error('Préciser le résumé après --note.');
  const result=process.argv.includes('--register-v1')?registerVersionOne(root,description):archiveHtmlVersion(root,{description});
  console.log(JSON.stringify(result,null,2));
}
