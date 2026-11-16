// node test-main.js : la vérification de yt-dlp, hors ligne, avec une vraie version signée (tools/ytdlp, copiée le 16 novembre 2026)
const assert = require('assert'), fs = require('fs'), path = require('path'), pgp = require('./pgp.js');
const r = f => fs.readFileSync(path.join(__dirname, 'tools', 'ytdlp', f)), KEY = 'AC0CBBE6848D6A873464AF4E57CF65933B5A7581';
const sums = r('SHA2-256SUMS'), sig = r('SHA2-256SUMS.sig'), key = r('public.key');
assert.ok(pgp.verify(sums, sig, key, KEY), 'la vraie signature doit passer');
const bad = Buffer.from(sums); bad[0] ^= 1; assert.ok(!pgp.verify(bad, sig, key, KEY), 'une liste modifiée doit être refusée');
assert.ok(!pgp.verify(sums, sig, key, 'ab'.repeat(20)), 'une autre clé que celle épinglée doit être refusée');
assert.ok(!pgp.verify(sums, Buffer.alloc(0), key, KEY), 'pas de signature : refusé');
assert.match(pgp.sumOf(sums, 'yt-dlp.exe'), /^[0-9a-f]{64}$/); assert.match(pgp.sumOf(sums, 'yt-dlp_linux'), /^[0-9a-f]{64}$/);
const ff = r('ffmpeg-checksums.sha256');
assert.match(pgp.sumOf(ff, 'ffmpeg-master-latest-win64-gpl.zip'), /^[0-9a-f]{64}$/); assert.match(pgp.sumOf(ff, 'ffmpeg-master-latest-linux64-gpl.tar.xz'), /^[0-9a-f]{64}$/);
assert.equal(pgp.sha256(Buffer.from('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
console.log('ok · signature de yt-dlp vérifiée, liste modifiée refusée');
