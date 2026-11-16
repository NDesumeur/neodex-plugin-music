// Checks an OpenPGP signature (RSA, v4) with Node's own crypto: used before NeoDex runs a program it downloaded (Tor, yt-dlp).
// The key file is fetched each time, but only the keys whose fingerprint is pinned here count, plus the subkeys that key signed:
// a hacked download server can change the files, the key file and the checksums, but cannot sign them.
// shortcut: revoked or expired subkeys are not checked, only the binding to the pinned primary key; enough while the pinned key itself is safe.
const crypto = require('crypto');

const dearmor = b => {
  const s = Buffer.from(b).toString('latin1'); if (!s.includes('-----BEGIN PGP')) return Buffer.from(b);
  return Buffer.from(s.split(/\r?\n\r?\n/).slice(1).join('\n').split('-----END')[0].split(/\r?\n/).filter(l => !l.startsWith('=')).join(''), 'base64');
};
function packets(buf) {
  const out = [];
  for (let i = 0; i < buf.length;) {
    const h = buf[i++]; let tag, len;
    if (!(h & 0x80)) throw new Error('fichier OpenPGP illisible');
    if (h & 0x40) { tag = h & 63; const o = buf[i++]; if (o < 192) len = o; else if (o < 224) len = ((o - 192) << 8) + buf[i++] + 192; else if (o === 255) { len = buf.readUInt32BE(i); i += 4; } else throw new Error('paquet OpenPGP partiel'); }
    else { tag = (h >> 2) & 15; const lt = h & 3; if (lt === 3) throw new Error('paquet OpenPGP de longueur inconnue'); len = lt === 0 ? buf[i] : lt === 1 ? buf.readUInt16BE(i) : buf.readUInt32BE(i); i += [1, 2, 4][lt]; }
    out.push({ tag, body: buf.subarray(i, i + len) }); i += len;
  }
  return out;
}
const mpi = (b, o) => { const n = (b.readUInt16BE(o) + 7) >> 3; return [b.subarray(o + 2, o + 2 + n), o + 2 + n]; };
const HASH = { 8: 'sha256', 9: 'sha384', 10: 'sha512' };
const keyHead = body => Buffer.from([0x99, body.length >> 8, body.length & 255]);
const fpOf = body => crypto.createHash('sha1').update(keyHead(body)).update(body).digest('hex');
const rsaOf = body => { if (body[0] !== 4 || body[5] !== 1) return null; const [n, o] = mpi(body, 6), [e] = mpi(body, o); return crypto.createPublicKey({ key: { kty: 'RSA', n: n.toString('base64url'), e: e.toString('base64url') }, format: 'jwk' }); };

// a v4 RSA signature packet: who signed it, and whether it signs `data` (for a subkey binding: the two key packets) with that key
function sigOk(sig, data, key) {
  if (sig[0] !== 4 || sig[2] !== 1 || !HASH[sig[3]]) return false;
  const hl = sig.readUInt16BE(4), part = sig.subarray(0, 6 + hl), ul = sig.readUInt16BE(6 + hl);
  const trailer = Buffer.alloc(6); trailer[0] = 4; trailer[1] = 0xff; trailer.writeUInt32BE(part.length, 2);
  const [s] = mpi(sig, 6 + hl + 2 + ul + 2), size = key.asymmetricKeyDetails.modulusLength / 8;
  const padded = Buffer.concat([Buffer.alloc(Math.max(0, size - s.length)), s]);
  return crypto.verify(HASH[sig[3]], Buffer.concat([data, part, trailer]), key, padded);
}
function issuer(sig) {  // the fingerprint in the signed part (subpacket 33): the unsigned part could be changed by anyone
  const hl = sig.readUInt16BE(4), h = sig.subarray(6, 6 + hl);
  for (let i = 0; i < h.length;) { let l = h[i++]; if (l >= 192 && l < 255) l = ((l - 192) << 8) + h[i++] + 192; else if (l === 255) { l = h.readUInt32BE(i); i += 4; } if ((h[i] & 127) === 33) return h.subarray(i + 2, i + l).toString('hex'); i += l; }
  return null;
}

// the keys of `keyFile` that may sign: the primary key whose fingerprint is pinned, and each subkey it bound to itself (signature type 0x18)
function trustedKeys(keyFile, pinned) {
  const keys = new Map(), pin = pinned.toLowerCase(); let primary = null, sub = null;
  for (const p of packets(dearmor(keyFile))) {
    if (p.tag === 6) { primary = fpOf(p.body) === pin ? p : null; sub = null; if (primary) keys.set(pin, rsaOf(p.body)); }
    else if (p.tag === 14) sub = primary ? p : null;
    else if (p.tag === 2 && sub && p.body[1] === 0x18 && issuer(p.body) === pin) {
      const k = rsaOf(sub.body);
      if (k && sigOk(p.body, Buffer.concat([keyHead(primary.body), primary.body, keyHead(sub.body), sub.body]), keys.get(pin))) keys.set(fpOf(sub.body), k);
    }
  }
  return keys;
}

// true when `sigFile` (armored or binary) is a valid signature of `data` by the pinned key or one of its subkeys
function verify(data, sigFile, keyFile, pinned) {
  const keys = trustedKeys(keyFile, pinned);
  return packets(dearmor(sigFile)).some(p => { if (p.tag !== 2 || p.body[1] !== 0) return false; const k = keys.get(issuer(p.body) ?? ''); return !!k && sigOk(p.body, Buffer.from(data), k); });
}

// the line "<sha256>  <name>" of a checksum file, for `name`
const sumOf = (sums, name) => String(sums).split(/\r?\n/).map(l => l.trim().split(/\s+\*?/)).find(([, n]) => n === name)?.[0]?.toLowerCase() || null;
const sha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

module.exports = { verify, sumOf, sha256 };
console.assert(sumOf('aa  x.exe\nbb  y.zip', 'y.zip') === 'bb' && sumOf('aa *x.exe', 'x.exe') === 'aa' && sumOf('aa  x.exe', 'z') === null, 'sumOf');
