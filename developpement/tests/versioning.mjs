import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {archiveHtmlVersion,checkVersionHistory} from '../tools/versions.mjs';

const temporaryParent=fs.realpathSync(os.tmpdir());
const fixture=fs.mkdtempSync(path.join(temporaryParent,'transcription-versioning-test-'));
const htmlFile=path.join(fixture,'Transcription-phonetique-traditionnelle.html');
const prefix='Transcription phonétique traditionnelle v';
const archive=n=>path.join(fixture,prefix+n+'.zip');
const catalog=()=>JSON.parse(fs.readFileSync(path.join(fixture,'versions.json'),'utf8'));
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const report={purpose:'ZIP integrity, non-overwrite, numbering and respect for user deletions. Tests use isolated temporary HTML fixtures, never real user archives.',passed:0,failed:0,tests:[]};
const check=(name,fn)=>{try{fn();report.passed++;report.tests.push({name,passed:true});}catch(error){report.failed++;report.tests.push({name,passed:false,error:error.message});}};

try{
  fs.writeFileSync(path.join(fixture,'versions.json'),JSON.stringify({schemaVersion:1,versions:[]}));
  fs.writeFileSync(htmlFile,'<!doctype html><title>Version 1 — été</title>');
  check('a new HTML creates the first ZIP and verifies its actual extracted hash',()=>{
    const result=archiveHtmlVersion(fixture,{description:'Première version'});
    assert.equal(result.version,1);assert.equal(result.created,true);
    assert.equal(catalog().versions[0].html.sha256,digest(htmlFile));
    assert.equal(catalog().versions[0].archive.sha256,digest(archive(1)));
  });
  const originalZip=digest(archive(1));
  check('an identical build creates no duplicate and never overwrites v1',()=>{
    assert.equal(archiveHtmlVersion(fixture).created,false);
    assert.equal(catalog().versions.length,1);assert.equal(digest(archive(1)),originalZip);
  });
  check('a deleted current ZIP is not recreated for unchanged HTML',()=>{
    fs.unlinkSync(archive(1));
    const result=archiveHtmlVersion(fixture);
    assert.equal(result.created,false);assert.equal(result.archivePresent,false);
    assert.equal(fs.existsSync(archive(1)),false);assert.equal(catalog().versions.length,1);
    assert.match(fs.readFileSync(path.join(fixture,'HISTORIQUE_VERSIONS.md'),'utf8'),/ZIP absent/u);
  });
  check('the next modification advances to v2 despite a deleted v1',()=>{
    fs.writeFileSync(htmlFile,'<!doctype html><title>Version 2</title>');
    assert.equal(archiveHtmlVersion(fixture,{description:'Deuxième version'}).version,2);
    assert.equal(fs.existsSync(archive(1)),false);assert.equal(catalog().versions.length,2);
  });
  const secondZip=digest(archive(2));
  check('old ZIP bytes remain unchanged after a further revision',()=>{
    fs.writeFileSync(htmlFile,'<!doctype html><title>Version 3</title>');
    assert.equal(archiveHtmlVersion(fixture).version,3);
    assert.equal(digest(archive(2)),secondZip);
  });
  check('deleting multiple ZIPs preserves their history and reserved numbers',()=>{
    fs.unlinkSync(archive(2));fs.unlinkSync(archive(3));
    assert.equal(archiveHtmlVersion(fixture).created,false);
    assert.equal(fs.existsSync(archive(3)),false);
    fs.writeFileSync(htmlFile,'<!doctype html><title>Version 1 — été</title>');
    assert.equal(archiveHtmlVersion(fixture,{description:'Retour au contenu de v1'}).version,4);
    assert.deepEqual(catalog().versions.map(v=>v.version),[1,2,3,4]);
    assert.equal(catalog().versions[0].html.sha256,catalog().versions[3].html.sha256);
  });
  check('an unregistered ZIP filename is never overwritten or reused',()=>{
    fs.writeFileSync(archive(9),'User-owned placeholder');
    const reserved=digest(archive(9));
    fs.writeFileSync(htmlFile,'<!doctype html><title>Version suivante</title>');
    assert.equal(archiveHtmlVersion(fixture,{description:'Nouvelle modification'}).version,10);
    assert.equal(digest(archive(9)),reserved);
  });
  check('all deleted archive records retain their original hashes and descriptions',()=>{
    const records=catalog().versions;
    assert.equal(records[0].archive.sha256,originalZip);
    assert.equal(records[1].archive.sha256,secondZip);
    assert.equal(records[0].description,'Première version');
    assert.equal(records[3].description,'Retour au contenu de v1');
    assert.equal(records.length,5);
  });
  check('missing history blocks automatic recreation or numbering from scratch',()=>{
    fs.unlinkSync(path.join(fixture,'versions.json'));
    assert.throws(()=>checkVersionHistory(fixture),/Historique absent/u);
    assert.throws(()=>archiveHtmlVersion(fixture),/Historique absent/u);
    assert.equal(fs.existsSync(archive(1)),false);
  });
}finally{
  // Only the test-owned directory created by mkdtemp may be removed recursively.
  const resolved=path.resolve(fixture);
  assert.equal(path.dirname(resolved),temporaryParent);
  assert.ok(path.basename(resolved).startsWith('transcription-versioning-test-'));
  fs.rmSync(resolved,{recursive:true});
}
fs.writeFileSync(new URL('../validation/versioning.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
