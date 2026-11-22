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
const SITE = 'https://ndesumeur.github.io/neodex-site/';
// act : { title, artist, image, url, start, end, paused, list, pos, total, level } ou null pour effacer le statut ;
// rend false si Discord n'est pas joignable (réessayé 30 s plus tard)
async function set(id, act) {
  id = String(id || '').replace(/\D/g, '');
  if (!id || id !== appId) { if (sock) close(); appId = id; }
  if (!id) return false;
  if (!ready) { if (!act || Date.now() < retryAt) return false; try { await connect(id); } catch { retryAt = Date.now() + 30000; return false; } }
  const pad = s => { s = String(s || '').slice(0, 128); return s.length < 2 ? (s + '  ').slice(0, 2) : s; };
  // la pochette en grand avec le petit logo NeoMusic dans son coin ; le titre du morceau à côté du pseudo (status_display_type 2) ;
  // un bouton « Écouter » vers le morceau quand il est en ligne (les boutons ne se voient que chez les autres, pas sur son propre profil)
  const cover = /^https:\/\//.test(act?.image || ''), link = /^https:\/\/(www\.|music\.)?(youtube\.com|youtu\.be)\//.test(act?.url || '') ? act.url.slice(0, 512) : '';
  // 3.3.9 : en pause « ⏸ En pause » sans barre de temps ; la pochette dit d'où vient le morceau (« Playlist Chill · 3 sur 12 »), le petit logo
  // le niveau d'écoute ; le titre mène au morceau et l'artiste à sa recherche (details_url / state_url) ; un 2e bouton vers NeoDex
  const where = act && [act.list && 'Playlist « ' + act.list + ' »', act.total > 1 && act.pos > 0 && act.pos + ' sur ' + act.total].filter(Boolean).join(' · ');
  const small = act && { small_image: 'neomusic', small_text: act.paused ? 'En pause · NeoMusic' : 'NeoMusic' + (act.level ? ' · niveau ' + act.level : '') };
  const activity = act && { type: 2, status_display_type: 2, details: pad(act.title), instance: false,
    state: pad((act.paused ? '⏸ En pause · ' : '') + (act.artist ? 'par ' + act.artist : 'NeoMusic')),
    ...(link ? { details_url: link } : {}), ...(link && act.artist ? { state_url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(act.artist).slice(0, 400) } : {}),
    assets: cover ? { large_image: act.image, large_text: pad(where || act.title), ...small } : { large_image: 'neomusic', large_text: pad(where || 'NeoMusic'), ...(act.paused ? { small_image: 'neomusic', small_text: 'En pause' } : {}) },
    buttons: [...(link ? [{ label: 'Écouter', url: link }] : []), { label: 'NeoMusic sur NeoDex', url: SITE }],
    ...(act.start && !act.paused ? { timestamps: { start: Math.round(act.start), ...(act.end ? { end: Math.round(act.end) } : {}) } } : {}) };
  sock.write(frame(1, { cmd: 'SET_ACTIVITY', args: { pid: process.pid, activity: activity || undefined }, nonce: Date.now() + '-' + Math.random() }));
  return true;
}
module.exports = { set, close, frame, reader };
