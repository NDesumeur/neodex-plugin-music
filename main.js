// NeoMusic, the NeoDex version of MuPlayer (the system side of the plugin, loaded by NeoDex once the plugin is signed and has full access): music files and covers on disk, YouTube / SoundCloud / Deezer through yt-dlp (Python),
// the global shortcuts, capsules and the import of an existing MuPlayer folder. The page keeps the library itself
// (music.json, synced between PCs): files and covers are only caches here, fetched again from their URL on a PC that does not have them.
const { app, net, nativeImage, globalShortcut, shell, dialog } = require('electron');
const { spawn, execFile, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');

const ROOT = () => path.join(app.getPath('userData'), 'neomusic');
const MUSIC = () => path.join(ROOT(), 'musics'), COVERS = () => path.join(ROOT(), 'covers'), CACHE = () => path.join(ROOT(), 'cache.json');
const md5 = s => crypto.createHash('md5').update(String(s)).digest('hex');
const inside = (dir, name) => { const p = path.join(dir, path.basename(String(name || ''))); return p.startsWith(dir) ? p : null; };  // only plain file names, never a path elsewhere
let ffmpeg = null;
try { ffmpeg = execFileSync('where', ['ffmpeg'], { encoding: 'utf8', windowsHide: true }).split(/\r?\n/)[0].trim() || null; } catch {}
const BIN = () => path.join(ROOT(), 'bin'), YT = () => path.join(BIN(), 'yt-dlp.exe'), FF = () => path.join(BIN(), 'ffmpeg.exe');
if (!ffmpeg && fs.existsSync(FF())) ffmpeg = FF();

/* ---------- yt-dlp et ffmpeg : installés tout seuls dans le dossier de NeoMusic (ni Python ni installation à la main), yt-dlp remis à jour ---------- */
async function grab(url, dest) {
  const r = await fetch(url, { headers: { 'User-Agent': 'NeoDex' }, signal: AbortSignal.timeout(600000) });
  if (!r.ok) throw new Error('téléchargement impossible (' + r.status + ') : ' + url.split('/').pop());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest + '.tmp', Buffer.from(await r.arrayBuffer())); fs.renameSync(dest + '.tmp', dest);
}
let tools = null;
function ensureTools(force) {  // une seule installation à la fois ; force = yt-dlp retéléchargé (YouTube change souvent et refuse alors les vieilles versions : erreur 403)
  if (force) tools = null;
  return tools ??= (async () => {
    const yt = YT();
    if (force || !fs.existsSync(yt) || Date.now() - fs.statSync(yt).mtimeMs > 3 * 864e5) {
      try { await grab('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', yt); }
      catch (e) { if (!fs.existsSync(yt)) throw new Error("yt-dlp n'a pas pu être installé : " + e.message); }  // une ancienne copie vaut mieux que rien
    }
    if (!ffmpeg) {
      const zip = path.join(BIN(), 'ffmpeg.zip');
      await grab('https://github.com/yt-dlp/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-gpl.zip', zip);
      await new Promise((ok, ko) => execFile('tar', ['-xf', zip, '-C', BIN(), '--strip-components=2', '*/bin/ffmpeg.exe'], { windowsHide: true, timeout: 120000 }, e => e ? ko(new Error('ffmpeg illisible')) : ok()));
      fs.rmSync(zip, { force: true });
      if (fs.existsSync(FF())) ffmpeg = FF();
    }
  })().catch(e => { tools = null; throw e; });
}
function ytRun(args, { onLine, timeout = 180000 } = {}) {
  return new Promise((ok, ko) => {
    const opt = { windowsHide: true, cwd: os.tmpdir(), env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } };
    const common = ['--no-warnings', '--ignore-config', ...(ffmpeg ? ['--ffmpeg-location', ffmpeg] : []), ...args];
    // yt-dlp.exe installé par NeoMusic ; à défaut le module Python (-P : le dossier du script n'est pas cherché, un yt_dlp.py planté ne tournerait pas)
    const p = fs.existsSync(YT()) ? spawn(YT(), common, opt) : spawn('python', ['-P', '-m', 'yt_dlp', ...common], opt);
    const out = [], err = [];
    let buf = '';
    const t = setTimeout(() => { p.kill(); ko(new Error('yt-dlp ne répond pas')); }, timeout);
    p.stdout.on('data', d => {
      out.push(d);
      if (!onLine) return;
      buf += d.toString('utf8');
      for (let i; (i = buf.search(/[\r\n]/)) >= 0; buf = buf.slice(i + 1)) if (buf.slice(0, i).trim()) onLine(buf.slice(0, i));
    });
    p.stderr.on('data', d => err.push(d));
    p.on('error', e => { clearTimeout(t); ko(new Error('yt-dlp est introuvable (' + e.message + ')')); });
    p.on('close', code => {
      clearTimeout(t);
      if (code === 0) return ok(Buffer.concat(out).toString('utf8'));
      const lines = Buffer.concat(err).toString('utf8').trim().split(/\r?\n/);
      ko(new Error((lines.filter(l => /ERROR/.test(l)).pop() || lines.pop() || 'yt-dlp a échoué').replace(/^ERROR:\s*(\[[^\]]+\]\s*)?/, '').slice(0, 300)));
    });
  });
}
async function ytdlp(args, opts) {
  try { await ensureTools(); } catch (e) { if (!fs.existsSync(YT())) { try { return await ytRun(args, opts); } catch { throw e; } } }  // installation impossible (hors ligne) : Python s'il est là
  try { return await ytRun(args, opts); }
  catch (e) {
    if (!/403|forbidden|unable to download|sign in|unable to extract|HTTP Error/i.test(e.message)) throw e;
    await ensureTools(true);  // YouTube refuse la version installée : mise à jour de yt-dlp puis une seconde tentative
    return ytRun(args, opts);
  }
}
const ytJson = async (args, opts) => JSON.parse(await ytdlp([...args, '-J'], opts));
const ytId = url => /(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/.exec(url || '')?.[1] || null;
const ytUrl = e => e.webpage_url || (e.id && /^[\w-]{11}$/.test(e.id) && !/^https?:/.test(e.url || '') ? 'https://www.youtube.com/watch?v=' + e.id : e.url);
const thumbOf = e => (e.id && /^[\w-]{11}$/.test(e.id) ? `https://i.ytimg.com/vi/${e.id}/hqdefault.jpg` : '') || e.thumbnail || (e.thumbnails || []).at(-1)?.url || '';
const NON_SONG = ['reaction', 'reacts to', 'react to', 'reacting', 'interview', 'review', 'explained', 'breakdown', 'analysis', 'compilation', 'mix', 'playlist', 'full album', 'album mix',
  '1 hour', '2 hours', 'lofi radio', 'best of', 'top 10', 'top 20', 'tier list', 'ranking', 'vlog', 'podcast'];
const isSong = e => !NON_SONG.some(w => (e.title || '').toLowerCase().includes(w));
const cleanArtist = n => (n || '').replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim() || n;
const entryOf = e => ({ url: ytUrl(e), title: e.title || '', author: cleanArtist(e.channel || e.uploader || ''), duration: +e.duration || 0, thumbnail: thumbOf(e) });

async function search(query, n = 5) {
  const r = await ytJson([`ytsearch${n}:${query}`, '--flat-playlist']);
  return (r.entries || []).filter(e => e.id).map(entryOf);
}
async function info(url) {
  const e = await ytJson(['--no-playlist', url]);
  return { title: e.title || 'Musique', author: cleanArtist(e.channel || e.uploader || ''), publish_date: e.upload_date || '', url: e.webpage_url || url, thumbnail_url: thumbOf(e), duration: +e.duration || 0 };
}
async function download(url, onProgress) {
  fs.mkdirSync(MUSIC(), { recursive: true });
  let file = '', meta = null;
  await ytdlp(['-f', 'bestaudio/best', '-x', '--audio-format', 'mp3', '--audio-quality', '192K', '--no-playlist', '--newline', '--progress',
    '--progress-template', 'download:NEOP %(progress._percent_str)s', '--print', 'before_dl:NEOJ %(.{id,title,channel,uploader,upload_date,webpage_url,duration,thumbnail})j',
    '--print', 'after_move:NEOF %(filepath)s', '-o', path.join(MUSIC(), '%(id)s.%(ext)s'), url], {
    timeout: 600000,
    onLine: l => {
      if (l.startsWith('NEOP')) onProgress?.(parseFloat(l.slice(5)) || 0);
      else if (l.startsWith('NEOJ')) try { meta = JSON.parse(l.slice(5)); } catch {}
      else if (l.startsWith('NEOF')) file = l.slice(5).trim();
    },
  });
  if (!file || !fs.existsSync(file)) throw new Error("Le MP3 téléchargé n'a pas été retrouvé");
  meta ||= {};
  return { file: path.basename(file), title: meta.title || 'Musique', author: cleanArtist(meta.channel || meta.uploader || ''), publish_date: meta.upload_date || '',
    url: meta.webpage_url || url, thumbnail_url: thumbOf(meta), duration: +meta.duration || 0 };
}
// the direct audio address of an online track, played through neomusic://stream (kept a few hours, YouTube addresses expire)
const direct = new Map();
async function directUrl(url, fresh) {
  const c = direct.get(url);
  if (c && !fresh && Date.now() - c.at < 3 * 3600e3) return c.u;
  const u = (await ytdlp(['-f', 'bestaudio/best', '-g', '--no-playlist', url], { timeout: 60000 })).trim().split(/\r?\n/)[0];
  direct.set(url, { u, at: Date.now() });
  return u;
}
// "Mix" YouTube around a real song of each artist: only real songs, by close artists (MuPlayer's _mix_similar_artist_tracks)
async function mixYt(seeds, exclude = []) {
  const skip = new Set(exclude.map(x => x.toLowerCase())), found = {};
  await Promise.all(seeds.slice(0, 5).map(async seed => {
    try {
      const s = await ytJson([`ytsearch3:${seed} official audio`, '--flat-playlist'], { timeout: 60000 });
      const e = (s.entries || []).find(e => e.id && (!e.duration || (e.duration >= 60 && e.duration <= 720)));
      if (!e) return;
      const m = await ytJson([`https://www.youtube.com/watch?v=${e.id}&list=RD${e.id}`, '--flat-playlist', '--playlist-end', '40'], { timeout: 60000 });
      for (const x of m.entries || []) {
        const artist = cleanArtist(x.channel || x.uploader || '');
        if (!x.id || !artist || !isSong(x) || /reaction|reacts/i.test(artist) || artist.toLowerCase() === seed.toLowerCase() || skip.has(artist.toLowerCase())) continue;
        found[artist] ??= { artist, seed, ...entryOf(x) };
      }
    } catch {}
  }));
  return Object.values(found).sort((a, b) => a.artist.localeCompare(b.artist));
}
// les goûts : des artistes proches (Deezer, sans clé), classés selon le nombre de tes artistes dont ils sont proches et leur poids (écoutes, favoris)
const normName = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const dzCache = new Map();
async function dzArtist(name) {  // l'artiste de ce nom exact (pour que « Air » ne devienne pas « Air Supply »)
  const k = normName(name); if (!k) return null; if (dzCache.has(k)) return dzCache.get(k);
  const r = await deezer('/search/artist?limit=5&q=' + encodeURIComponent(name)), a = (r.data || []).find(x => normName(x.name) === k) || null;
  dzCache.set(k, a); return a;
}
async function inBatches(list, size, fn) { for (let i = 0; i < list.length; i += size) await Promise.all(list.slice(i, i + size).map(fn)); }
async function realSong(artist, title) {  // la vraie chanson sur YouTube
  return (await search(artist + ' ' + title + ' official audio', 4)).find(e => isSong(e) && (!e.duration || (e.duration >= 90 && e.duration <= 600))) || null;
}
async function similar(seeds, exclude = [], max = 12) {
  const skip = new Set([...exclude, ...seeds.map(s => s.artist)].map(normName)), pool = new Map();
  await Promise.all(seeds.slice(0, 8).map(async s => {
    try {
      const a = await dzArtist(s.artist); if (!a) return;
      ((await deezer('/artist/' + a.id + '/related?limit=20')).data || []).forEach((x, i) => {
        const k = normName(x.name); if (skip.has(k)) return;
        const c = pool.get(k) || { id: x.id, artist: x.name, score: 0, from: [] };
        c.score += (s.w || 1) * (1.4 - i / 40); if (!c.from.includes(s.artist)) c.from.push(s.artist); pool.set(k, c);
      });
    } catch {}
  }));
  const top = [...pool.values()].sort((a, b) => b.score - a.score || b.from.length - a.from.length).slice(0, max), out = [];
  await inBatches(top, 4, async c => {
    try {
      const tr = (await deezer('/artist/' + c.id + '/top?limit=3')).data || [];
      for (const t of tr) { const y = await realSong(c.artist, t.title); if (y) { out.push({ ...y, artist: c.artist, seed: c.from[0], from: c.from, score: c.score }); break; } }
    } catch {}
  });
  return out.sort((a, b) => b.score - a.score);
}
async function mix(seeds, exclude = []) {  // seeds : des noms, ou { artist, w } (w = poids des écoutes)
  const ws = seeds.map(s => typeof s === 'string' ? { artist: s, w: 1 } : s).filter(s => s.artist);
  let out = []; try { out = await similar(ws, exclude); } catch {}
  return out.length ? out : mixYt(ws.map(s => s.artist), exclude);  // sans Deezer : l'ancien mix YouTube
}
async function radar(artists) {  // les sorties des 4 derniers mois des artistes écoutés ET d'artistes proches (albums et singles de Deezer), des titres de chaque sortie retrouvés sur YouTube
  const cutoff = new Date(Date.now() - 120 * 864e5).toISOString().slice(0, 10), albums = [], seen = new Set(), names = artists.slice(0, 30);
  const known = new Set(names.map(normName)), close = [];
  await inBatches(names.slice(0, 5), 5, async name => {  // les artistes proches des plus écoutés : on n'écoute pas que ses favoris
    try { const a = await dzArtist(name); if (a) for (const x of ((await deezer('/artist/' + a.id + '/related?limit=6')).data || []).slice(0, 4)) if (!known.has(normName(x.name))) { known.add(normName(x.name)); close.push(x); } } catch {}
  });
  const take = async (a, n) => {
    for (const al of ((await deezer('/artist/' + a.id + '/albums?limit=100')).data || []).filter(x => x.release_date >= cutoff).slice(0, n)) if (!seen.has(al.id)) { seen.add(al.id); albums.push({ ...al, artist: a.name }); }
  };
  await inBatches(names, 6, async name => { try { const a = await dzArtist(name); if (a) await take(a, 3); } catch {} });
  await inBatches(close, 6, async x => { try { await take(x, 1); } catch {} });
  albums.sort((x, y) => y.release_date.localeCompare(x.release_date));
  const out = [];
  await inBatches(albums.slice(0, 30), 5, async al => {
    try {
      for (const t of ((await deezer('/album/' + al.id + '/tracks?limit=3')).data || []).slice(0, 2)) {
        const y = await realSong(al.artist, t.title); if (y && !out.some(o => o.url === y.url)) out.push({ ...y, artist: al.artist, released: al.release_date });
      }
    } catch {}
  });
  return out.sort((x, y) => y.released.localeCompare(x.released));
}
async function artistTracks(name) {  // un artiste (le nom exact d'abord) et ses titres les plus écoutés, sans doublon
  let a = await dzArtist(name);
  if (!a) a = ((await deezer('/search/artist?limit=1&q=' + encodeURIComponent(name))).data || [])[0];
  if (!a) return null;
  const seen = new Set(), tracks = [];
  for (const t of (await deezer('/artist/' + a.id + '/top?limit=100')).data || []) {
    const k = normName(t.title_short || t.title); if (seen.has(k)) continue; seen.add(k);
    tracks.push({ title: t.title_short || t.title, album: t.album?.title || '', duration: t.duration || 0 });
  }
  // puis le reste de ses albums et singles, du plus récent au plus ancien (le « top » de Deezer ne donne souvent qu'une poignée de titres)
  const albums = ((await deezer('/artist/' + a.id + '/albums?limit=100')).data || []).sort((x, y) => (y.release_date || '').localeCompare(x.release_date || '')).slice(0, 30), per = [];
  await inBatches(albums, 6, async al => { try { per[albums.indexOf(al)] = ((await deezer('/album/' + al.id + '/tracks?limit=60')).data || []).map(t => ({ ...t, albumTitle: al.title })); } catch {} });
  for (const t of per.flat().filter(Boolean)) {
    const k = normName(t.title_short || t.title); if (seen.has(k) || tracks.length >= 200) continue; seen.add(k);
    tracks.push({ title: t.title_short || t.title, album: t.albumTitle, duration: t.duration || 0 });
  }
  return { artist: a.name, picture: a.picture_xl || a.picture_big || a.picture_medium || '', fans: a.nb_fan || 0, tracks };
}
async function weekly(queries, recentOnly) {  // "Radar des sorties": recent songs of the favourite artists
  const out = [], seen = new Set(), cutoff = Date.now() - 30 * 864e5;
  await Promise.all(queries.map(async q => {
    try {
      for (const e of (await ytJson([`ytsearch5:${q}`, '--flat-playlist'], { timeout: 60000 })).entries || []) {
        const d = e.upload_date ? Date.parse(e.upload_date.replace(/(\d{4})(\d\d)(\d\d)/, '$1-$2-$3')) : 0;
        if (!e.id || !isSong(e) || (recentOnly && d && d < cutoff) || (e.duration && (e.duration < 90 || e.duration > 600))) continue;
        const x = entryOf(e); if (!seen.has(x.url)) { seen.add(x.url); out.push(x); }
      }
    } catch {}
  }));
  return out;
}

/* ---------- links: YouTube / SoundCloud playlists, Deezer ---------- */
async function deezer(pathname) {
  const r = await net.fetch('https://api.deezer.com' + pathname, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || 'Deezer : contenu inaccessible (privé ou introuvable)');
  return j;
}
async function resolveDeezer(url) {
  if (/(deezer|dzr)\.page\.link/i.test(url)) try { url = (await net.fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).url; } catch {}
  const p = /deezer\.com\/(?:[a-z]{2}\/)?playlist\/(\d+)/i.exec(url), t = /deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i.exec(url);
  return p ? { kind: 'playlist', id: p[1] } : t ? { kind: 'track', id: t[1] } : { kind: null };
}
async function playlistEntries(url, kind) {
  if (kind === 'deezer') {
    const out = [];
    for (let i = 0; i < 2000; i += 100) {
      const page = await deezer(`/playlist/${url}/tracks?limit=100&index=${i}`);
      out.push(...(page.data || []).map(t => ({ query: `${t.title} ${t.artist?.name || ''}`.trim(), title: t.title, author: t.artist?.name || '', duration: t.duration || 0 })));
      if (!page.next) break;
    }
    return out;
  }
  const r = await ytJson(['--flat-playlist', url], { timeout: 300000 });
  return (r.entries || []).filter(e => e && (e.id || e.url) && !/\[(private|deleted)/i.test(e.title || '')).map(entryOf);
}

/* ---------- covers: square 320 px JPEG cut from the thumbnail (YouTube 4:3 thumbnails have black bands) ---------- */
async function saveCover(thumb) {
  if (!thumb) return '';
  const name = md5(thumb) + '.jpg', file = path.join(COVERS(), name);
  if (fs.existsSync(file)) return name;
  const id = /i\.ytimg\.com\/vi(?:_webp)?\/([\w-]{11})\//.exec(thumb)?.[1];
  const tries = id ? ['maxresdefault', 'sddefault', 'hqdefault'].map(q => `https://i.ytimg.com/vi/${id}/${q}.jpg`) : [thumb];
  for (const u of tries) {
    try {
      const r = await net.fetch(u); if (!r.ok) continue;
      let buf = Buffer.from(await r.arrayBuffer()), img = nativeImage.createFromBuffer(buf);
      if (img.isEmpty() && ffmpeg) {  // webp & co: ffmpeg turns it into a JPEG first
        const tmp = path.join(os.tmpdir(), 'neomusic-' + md5(u)); fs.writeFileSync(tmp, buf);
        try { execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', tmp, tmp + '.jpg'], { windowsHide: true }); img = nativeImage.createFromPath(tmp + '.jpg'); } finally { fs.rmSync(tmp, { force: true }); fs.rmSync(tmp + '.jpg', { force: true }); }
      }
      if (img.isEmpty()) continue;
      const { width: w, height: h } = img.getSize();
      if (id && w < 400) continue;  // YouTube answers a 120 px grey placeholder for missing sizes
      const content = id && Math.abs(w / h - 4 / 3) < .03 ? Math.round(w * 9 / 16) : h, side = Math.min(w, content);
      fs.mkdirSync(COVERS(), { recursive: true });
      fs.writeFileSync(file, img.crop({ x: Math.round((w - side) / 2), y: Math.round((h - side) / 2), width: side, height: side }).resize({ width: 320, height: 320, quality: 'best' }).toJPEG(86));
      return name;
    } catch {}
  }
  return '';
}

async function serveStream(pageUrl, req) {
  const pass = async fresh => {
    const range = req.headers.get('range');
    return net.fetch(await directUrl(pageUrl, fresh), { headers: range ? { Range: range } : {} });
  };
  let r = await pass(false);
  if (r.status === 403 || r.status === 410) r = await pass(true);  // the address expired: ask yt-dlp again
  const headers = { 'Access-Control-Allow-Origin': '*', 'Accept-Ranges': 'bytes' };
  for (const h of ['content-type', 'content-length', 'content-range']) if (r.headers.get(h)) headers[h] = r.headers.get(h);
  return new Response(r.body, { status: r.status, headers });
}

/* ---------- global shortcuts (the ones without Ctrl/Alt/Shift stay inside NeoDex) ---------- */
let hotkeys = {}, sendHotkey = () => {};  // sendHotkey : posé par register()
const accel = s => s.replace(/Ctrl/g, 'Control').replace(/\bEsc\b/, 'Escape');
function registerHotkeys() {
  if (process.env.NEO_SELFTEST) return [];
  const failed = [];
  for (const [action, combo] of Object.entries(hotkeys)) {
    if (!combo || !/(Ctrl|Alt|Shift)\+/.test(combo)) continue;
    try { if (!globalShortcut.register(accel(combo), () => sendHotkey(action))) failed.push(combo); } catch { failed.push(combo); }
  }
  return failed;
}

/* ---------- MuPlayer folder (playlists, stats, achievements, settings, covers, music files) ---------- */
const safeName = n => String(n).replace(/[\\/*?:"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 180) || 'musique';
const readJ = p => { try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, '')); } catch { return null; } };
function importMuPlayer(dir) {
  const jd = path.join(dir, 'jsons');
  if (!fs.existsSync(path.join(jd, 'playlists.json'))) throw new Error("Ce dossier ne contient pas de bibliothèque MuPlayer (jsons/playlists.json introuvable)");
  fs.mkdirSync(MUSIC(), { recursive: true }); fs.mkdirSync(COVERS(), { recursive: true });
  const cfg = readJ(path.join(jd, 'playlists.json')), names = Array.isArray(cfg) ? cfg : cfg?.names || [], modes = cfg?.modes || {};
  const copied = { files: 0, covers: 0 }, waveforms = {};
  const here = (p, sub) => !p ? '' : fs.existsSync(p) ? p : path.join(dir, sub, path.win32.basename(p));  // MuPlayer keeps absolute paths: the folder may have moved
  const copyCover = p => {
    p = here(p, 'covers');
    if (!p || !fs.existsSync(p)) return '';
    const name = md5(p) + path.extname(p).toLowerCase(); const dst = path.join(COVERS(), name);
    if (!fs.existsSync(dst)) { fs.copyFileSync(p, dst); copied.covers++; }
    return name;
  };
  const copyFile = p => {
    p = here(p, 'musics');
    if (!p || !fs.existsSync(p)) return '';
    let name = path.basename(p), dst = path.join(MUSIC(), name);
    if (fs.existsSync(dst) && fs.statSync(dst).size !== fs.statSync(p).size) { name = md5(p).slice(0, 8) + '-' + name; dst = path.join(MUSIC(), name); }
    if (!fs.existsSync(dst)) { fs.copyFileSync(p, dst); copied.files++; }
    return name;
  };
  const playlists = names.map(name => {
    const data = readJ(path.join(jd, `metadata_${safeName(name)}.json`)) || [];
    return { name, mode: modes[name] === 'online' ? 'online' : 'offline', tracks: data.filter(x => x && (x.path || x.url)).map(x => {
      const t = { display_title: x.display_title || path.basename(x.path || '') || 'Musique', author: x.author || '', publish_date: x.publish_date || '', date_added: +x.date_added || Date.now() / 1000,
        song_length: x.song_length || '', duration: +x.stream_duration || 0, url: x.url || '', thumbnail_url: x.thumbnail_url || '', cover: copyCover(x.cover), file: copyFile(x.path),
        is_online: !!x.is_online || !x.path, last_played: +x.last_played || 0 };
      if (Array.isArray(x.waveform) && x.waveform.length) waveforms[t.url || 'file:' + t.file] = x.waveform;
      return t;
    }) };
  });
  const trash = (readJ(path.join(jd, 'trash.json')) || []).filter(e => e?.item).map(e => ({ ...e, item: { ...e.item, file: copyFile(e.item.path), cover: copyCover(e.item.cover) } }));
  return { playlists, stats: readJ(path.join(jd, 'stats.json')), achievements: readJ(path.join(jd, 'achievements.json')), settings: readJ(path.join(jd, 'settings.json')), trash, waveforms, copied };
}

/* ---------- sizes, capsules ---------- */
const dirSize = d => { let n = 0, c = 0; try { for (const f of fs.readdirSync(d)) { const s = fs.statSync(path.join(d, f)); if (s.isFile()) { n += s.size; c++; } } } catch {} return { bytes: n, count: c }; };
const tar = (args, cwd) => new Promise((ok, ko) => { const p = spawn('tar', args, { cwd, windowsHide: true }); let e = ''; p.stderr.on('data', d => e += d); p.on('error', ko); p.on('close', c => c ? ko(new Error(e.trim() || 'tar a échoué')) : ok()); });

function register({ ipcMain, getWin, emit, serveFile, protocol, onShortcutReset, readDoc, writeDoc }) {
  sendHotkey = action => emit('music:hotkey', action);
  onShortcutReset(registerHotkeys);  // le cœur défait tous les raccourcis globaux quand il refait le sien
  protocol(async req => {  // neoplugin://neodex.music/file/<nom> | cover/<nom> | stream/?u=<adresse>
    const u = new URL(req.url), [, kind, ...rest] = u.pathname.split('/'), name = decodeURIComponent(rest.join('/'));
    if (kind === 'file') return serveFile(inside(MUSIC(), name), req);
    if (kind === 'cover') return serveFile(inside(COVERS(), name), req);
    if (kind === 'stream') return await serveStream(u.searchParams.get('u'), req);
    return new Response('', { status: 404 });
  });
  // la bibliothèque est le document « library » du dossier du plugin : la synchro et les sauvegardes le prennent comme tout document de plugin (règles de fusion : « sync » du manifeste)
  const LEGACY = path.join(app.getPath('userData'), 'music.json');  // l'ancien emplacement, dans le cœur : repris une fois
  ipcMain.handle('music:load', () => {
    let d = readDoc('library');
    if (d == null && (d = readJ(LEGACY))) { writeDoc('library', d); fs.renameSync(LEGACY, LEGACY + '.migre'); }
    return d;
  });
  ipcMain.handle('music:save', (_, d) => { writeDoc('library', d); return true; });
  ipcMain.handle('music:caps', async () => {
    let version = ''; try { version = (await ytdlp(['--version'], { timeout: 30000 })).trim(); } catch {}
    return { ytdlp: version, ffmpeg: !!ffmpeg, muplayer: [path.join(app.getPath('downloads'), 'MuPlayerV1.0'), path.join(app.getPath('downloads'), 'muplayer_repo', 'muplayer_repo')].find(d => fs.existsSync(path.join(d, 'jsons', 'playlists.json'))) || '' };
  });
  ipcMain.handle('music:search', (_, q, n) => search(q, n));
  ipcMain.handle('music:info', (_, url) => info(url));
  ipcMain.handle('music:download', async (_, url, id) => {
    const r = await download(url, p => emit('music:progress', { id, p }));
    r.cover = await saveCover(r.thumbnail_url);
    return r;
  });
  ipcMain.handle('music:cover', (_, thumb) => saveCover(thumb));
  ipcMain.handle('music:mix', (_, seeds, exclude) => mix(seeds, exclude));
  ipcMain.handle('music:artist', (_, name) => artistTracks(String(name || '').slice(0, 100)));
  ipcMain.handle('music:resolve', (_, artist, title) => realSong(String(artist), String(title)));
  ipcMain.handle('music:radar', (_, artists) => radar(artists));
  ipcMain.handle('music:weekly', (_, queries, recent) => weekly(queries, recent));
  ipcMain.handle('music:entries', (_, url, kind) => playlistEntries(url, kind));
  ipcMain.handle('music:deezer', async (_, url) => {
    const r = await resolveDeezer(url);
    if (r.kind === 'track') { const t = await deezer('/track/' + r.id); return { kind: 'track', query: `${t.title} ${t.artist?.name || ''}`.trim() }; }
    return r;
  });
  ipcMain.handle('music:exists', (_, names) => Object.fromEntries(names.map(n => [n, !!n && fs.existsSync(inside(MUSIC(), n))])));
  ipcMain.handle('music:coversExist', (_, names) => Object.fromEntries(names.map(n => [n, !!n && fs.existsSync(inside(COVERS(), n))])));
  ipcMain.handle('music:addFile', (_, src) => {  // an audio file of the PC, copied next to NeoMusic's songs (the rhythm game makes levels from it)
    if (!src || !fs.existsSync(src) || !/\.(mp3|m4a|aac|ogg|opus|wav|flac|webm)$/i.test(src)) throw new Error('fichier audio non pris en charge');
    fs.mkdirSync(MUSIC(), { recursive: true });
    const name = md5(src + fs.statSync(src).size).slice(0, 8) + '-' + safeName(path.basename(src)), dst = path.join(MUSIC(), name);
    if (!fs.existsSync(dst)) fs.copyFileSync(src, dst);
    return name;
  });
  ipcMain.handle('music:files', () => { try { return fs.readdirSync(MUSIC()); } catch { return []; } });
  ipcMain.handle('music:deleteFile', (_, name) => { const p = inside(MUSIC(), name); if (p) fs.rmSync(p, { force: true }); return true; });
  ipcMain.handle('music:reveal', (_, name) => { const p = inside(MUSIC(), name); if (p && fs.existsSync(p)) shell.showItemInFolder(p); else shell.openPath(MUSIC()); });
  ipcMain.handle('music:cacheLoad', () => readJ(CACHE()) || {});
  ipcMain.handle('music:cacheSave', (_, data) => { fs.mkdirSync(ROOT(), { recursive: true }); fs.writeFileSync(CACHE() + '.tmp', JSON.stringify(data)); fs.renameSync(CACHE() + '.tmp', CACHE()); return true; });
  ipcMain.handle('music:storage', () => ({ musics: dirSize(MUSIC()), covers: dirSize(COVERS()), cache: { bytes: (() => { try { return fs.statSync(CACHE()).size; } catch { return 0; } })(), count: 1 }, root: ROOT() }));
  ipcMain.handle('music:clearCache', () => { fs.rmSync(CACHE(), { force: true }); direct.clear(); return true; });
  ipcMain.handle('music:hotkeys', (_, map) => {
    for (const combo of Object.values(hotkeys)) if (combo && /(Ctrl|Alt|Shift)\+/.test(combo)) try { globalShortcut.unregister(accel(combo)); } catch {}
    hotkeys = map || {};
    return registerHotkeys();
  });
  ipcMain.handle('music:pickMuPlayer', async (_, def) => {
    const testDir = process.env.NEO_SELFTEST_MUPLAYER;
    const { canceled, filePaths } = testDir ? { filePaths: [testDir] } : await dialog.showOpenDialog(getWin(), { title: 'Dossier de MuPlayer (celui qui contient « jsons »)', defaultPath: def || app.getPath('downloads'), properties: ['openDirectory'] });
    return canceled ? null : importMuPlayer(filePaths[0]);
  });
  ipcMain.handle('music:exportCapsule', async (_, json) => {
    const { canceled, filePath } = await dialog.showSaveDialog(getWin(), { title: 'Exporter une capsule NeoMusic', defaultPath: path.join(app.getPath('documents'), `NeoMusic_capsule_${new Date().toISOString().slice(0, 10)}.zip`), filters: [{ name: 'Capsule NeoMusic', extensions: ['zip'] }] });
    if (canceled) return '';
    fs.mkdirSync(MUSIC(), { recursive: true }); fs.mkdirSync(COVERS(), { recursive: true });
    fs.writeFileSync(path.join(ROOT(), 'music.json'), JSON.stringify(json));
    try { await tar(['-a', '-c', '-f', filePath, 'musics', 'covers', 'music.json'], ROOT()); } finally { fs.rmSync(path.join(ROOT(), 'music.json'), { force: true }); }
    return filePath;
  });
  ipcMain.handle('music:importCapsule', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(getWin(), { title: 'Importer une capsule NeoMusic', properties: ['openFile'], filters: [{ name: 'Capsule NeoMusic', extensions: ['zip'] }] });
    if (canceled) return null;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'neomusic-capsule-'));
    try {
      await tar(['-x', '-f', filePaths[0]], tmp);
      const json = readJ(path.join(tmp, 'music.json'));
      if (!json) throw new Error("Ce fichier n'est pas une capsule NeoMusic");
      for (const [sub, dst] of [['musics', MUSIC()], ['covers', COVERS()]]) {
        fs.mkdirSync(dst, { recursive: true });
        try { for (const f of fs.readdirSync(path.join(tmp, sub))) if (!fs.existsSync(path.join(dst, f))) fs.copyFileSync(path.join(tmp, sub, f), path.join(dst, f)); } catch {}
      }
      return json;
    } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  });
}

module.exports = api => {
  register(api);
  return () => { for (const combo of Object.values(hotkeys)) if (combo && /(Ctrl|Alt|Shift)\+/.test(combo)) try { globalShortcut.unregister(accel(combo)); } catch {} };
};
module.exports.radar = radar;  // pour les tests
module.exports.artistTracks = artistTracks;
