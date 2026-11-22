// Le statut Discord sans Discord : node test-discord.js
// un faux Discord écoute sur un tube à part (un vrai Discord peut être ouvert) : poignée de main, READY, puis le statut reçu doit être « Écoute » avec titre, artiste et temps
process.env.NEO_DISCORD_PIPE = 'neodex-test-ipc-';
const NAME = process.env.NEO_DISCORD_PIPE, net = require('net'), path = require('path'), D = require('./discord-rpc');
const pipe = i => process.platform === 'win32' ? '\\\\?\\pipe\\' + NAME + i : path.join(process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || '/tmp', NAME + i);
const fail = m => { console.log('ÉCHEC ' + m); process.exit(1); };
// 1. trames coupées en morceaux
const got = []; const rd = D.reader((op, m) => got.push([op, m.a])); const f = Buffer.concat([D.frame(1, { a: 1 }), D.frame(3, { a: 2 })]);
rd(f.subarray(0, 5)); rd(f.subarray(5, 20)); rd(f.subarray(20));
if (JSON.stringify(got) !== '[[1,1],[3,2]]') fail('lecture des trames : ' + JSON.stringify(got));
// 2. un vrai échange avec le faux Discord
(async () => {
  let hello = null; const acts = [];
  const srv = net.createServer(s => s.on('data', D.reader((op, m) => {
    if (op === 0) { hello = m; s.write(D.frame(1, { cmd: 'DISPATCH', evt: 'READY', data: { v: 1 } })); }
    if (op === 1) acts.push(m.args.activity || null);
  }))).listen(pipe(0));
  const t0 = Date.now();
  if (!await D.set('1234567890', { title: 'Un morceau', artist: 'Quelqu\'un', image: 'https://exemple.fr/p.jpg', url: 'https://www.youtube.com/watch?v=abc', start: t0, end: t0 + 180000 })) fail('pas connecté');
  await D.set('1234567890', { title: 'Un morceau', artist: 'Quelqu\'un', image: 'https://exemple.fr/p.jpg', url: 'https://www.youtube.com/watch?v=abc', start: t0, paused: true, list: 'Chill', pos: 3, total: 12, level: 7 });
  await D.set('1234567890', null);
  await new Promise(r => setTimeout(r, 300));
  const a = acts[0], p = acts[1];
  if (!p || p.timestamps || !/^⏸ En pause/.test(p.state) || p.assets.large_text !== 'Playlist « Chill » · 3 sur 12' || p.details_url !== 'https://www.youtube.com/watch?v=abc' || !/search_query=Quelqu/.test(p.state_url) || p.buttons.length !== 2) fail('pause : ' + JSON.stringify(p));
  acts.splice(1, 1);
  if (hello?.client_id !== '1234567890' || hello.v !== 1) fail('poignée de main : ' + JSON.stringify(hello));
  if (!a || a.type !== 2 || a.details !== 'Un morceau' || a.state !== 'par Quelqu\'un' || a.timestamps.end - a.timestamps.start !== 180000 || a.assets.large_image !== 'https://exemple.fr/p.jpg' || a.assets.small_image !== 'neomusic' || a.buttons?.[0]?.url !== 'https://www.youtube.com/watch?v=abc' || a.status_display_type !== 2) fail('statut : ' + JSON.stringify(a));
  if (acts[1] !== null) fail('effacement : ' + JSON.stringify(acts[1]));
  D.close(); srv.close();
  console.log('ok trames, poignée de main, statut « Écoute » et effacement');
})().catch(e => fail(e.message));
