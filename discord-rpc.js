// Statut Discord « Écoute NeoMusic » : le protocole local de l'appli Discord (IPC par tube nommé), sans compte, sans réseau, sans jeton.
// Discord doit être ouvert sur ce PC ; l'identifiant d'une application Discord (créée sur discord.com/developers) donne le nom affiché.
const net = require('net'), path = require('path');
const NAME = process.env.NEO_DISCORD_PIPE || 'discord-ipc-';  // l'auto-test prend un autre nom, Discord pouvant être ouvert
let sock = null, ready = false, appId = '', connecting = null, retryAt = 0;
const pipe = i => process.platform === 'win32' ? '\\\\?\\pipe\\' + NAME + i : path.join(process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || '/tmp', NAME + i);
const frame = (op, obj) => { const j = Buffer.from(JSON.stringify(obj)), h = Buffer.alloc(8); h.writeInt32LE(op, 0); h.writeInt32LE(j.length, 4); return Buffer.concat([h, j]); };
function close() { try { sock?.destroy(); } catch {} sock = null; ready = false; connecting = null; }
// les messages de Discord : 8 octets (code, longueur) puis du JSON ; un morceau peut arriver en plusieurs fois
function reader(onMsg) {
  let buf = Buffer.alloc(0);
  return d => { buf = Buffer.concat([buf, d]); while (buf.length >= 8) { const op = buf.readInt32LE(0), n = buf.readInt32LE(4); if (buf.length < 8 + n) break; let m = {}; try { m = JSON.parse(buf.subarray(8, 8 + n).toString()); } catch {} buf = buf.subarray(8 + n); onMsg(op, m); } };
}
function connect(id) {
  return connecting ??= new Promise((ok, ko) => {
    let i = 0;
    const fail = e => { close(); ko(e); };
    const next = () => {
      if (i > 9) return fail(new Error('Discord n\'est pas ouvert'));
      const s = net.connect(pipe(i++)), t = setTimeout(() => { s.destroy(); fail(new Error('Discord ne répond pas')); }, 5000);
      s.once('error', () => { clearTimeout(t); s.destroy(); next(); });
      s.once('connect', () => {
        s.removeAllListeners('error'); sock = s;
        s.on('data', reader((op, m) => {
          if (op === 1 && m.evt === 'READY') { clearTimeout(t); ready = true; ok(); }
          else if (op === 2 || m.evt === 'ERROR') { clearTimeout(t); fail(new Error(m.message || m.data?.message || 'refusé par Discord')); }
          else if (op === 3) s.write(frame(4, m));  // ping -> pong
        }));
        s.on('error', close); s.on('close', close);
        s.write(frame(0, { v: 1, client_id: id }));
      });
    };
    next();
  });
}
// act : { title, artist, image, start, end } ou null pour effacer le statut ; rend false si Discord n'est pas joignable (réessayé 30 s plus tard)
async function set(id, act) {
  id = String(id || '').replace(/\D/g, '');
  if (!id || id !== appId) { if (sock) close(); appId = id; }
  if (!id) return false;
  if (!ready) { if (!act || Date.now() < retryAt) return false; try { await connect(id); } catch { retryAt = Date.now() + 30000; return false; } }
  const pad = s => { s = String(s || '').slice(0, 128); return s.length < 2 ? (s + '  ').slice(0, 2) : s; };
  const activity = act && { type: 2, details: pad(act.title), state: pad(act.artist ? 'par ' + act.artist : 'NeoMusic'), instance: false,
    assets: { large_image: /^https:\/\//.test(act.image || '') ? act.image : 'neomusic', large_text: 'NeoMusic' },
    ...(act.start ? { timestamps: { start: Math.round(act.start), ...(act.end ? { end: Math.round(act.end) } : {}) } } : {}) };
  sock.write(frame(1, { cmd: 'SET_ACTIVITY', args: { pid: process.pid, activity: activity || undefined }, nonce: Date.now() + '-' + Math.random() }));
  return true;
}
module.exports = { set, close, frame, reader };
