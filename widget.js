// Le widget de NeoMusic sur l'accueil de NeoDex : le petit lecteur de NeoMusic (cadre pixel, disque qui tourne avec la pochette,
// barre hachurée, boutons pixel), aux couleurs du thème choisi dans NeoMusic. Il tourne dans sa propre iframe : NeoMusic lui envoie
// le morceau en cours (ctx.widget.set({data}) dans index.js, muWidget) et ses boutons lancent les commandes de plugin.json.
const CSS = `
html,body{height:100%}
.w{--mbg:#0b1410;--mcard:#13201a;--mcard2:#1c2e25;--mborder:#2a4436;--mtext:#e8fff2;--msub:#8fb5a2;--macc:#3ddc84;--macc2:#9cffc9;--mheart:#ff5a8a;
  position:absolute;inset:3px 3px 6px 3px;display:grid;grid-template-columns:auto 1fr;gap:14px;padding:12px 14px 10px;box-sizing:border-box;
  background:var(--mcard);color:var(--mtext);font:14px Consolas,'Cascadia Mono',monospace;user-select:none;overflow:hidden;
  box-shadow:0 -3px 0 0 var(--macc),0 3px 0 0 var(--mborder),-3px 0 0 0 var(--mborder),3px 0 0 0 var(--mborder)}
.w::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:repeating-linear-gradient(90deg,var(--macc) 0 6px,var(--macc2) 6px 9px);opacity:.55}
.disc{--d:92px;width:var(--d);height:var(--d);align-self:center;border-radius:50%;position:relative;cursor:pointer;
  background:radial-gradient(circle,transparent 0 31%,rgba(255,255,255,.06) 31.5% 32%,transparent 32.5% 44%,rgba(255,255,255,.05) 44.5% 45%,transparent 45.5% 58%,rgba(255,255,255,.05) 58.5% 59%,transparent 59.5%),
    conic-gradient(from 20deg,#101010,#2a2a2a 12%,#101010 25%,#262626 37%,#101010 50%,#2a2a2a 62%,#101010 75%,#262626 87%,#101010);
  box-shadow:0 0 0 3px var(--macc),0 4px 0 3px rgba(0,0,0,.45);animation:spin 3.2s linear infinite;animation-play-state:paused}
.w.on .disc{animation-play-state:running}
.disc i{position:absolute;inset:30%;border-radius:50%;background:var(--macc) center/cover no-repeat;box-shadow:0 0 0 2px #0a0a0a}
.disc i::after{content:"";position:absolute;inset:42%;border-radius:50%;background:#0a0a0a}
@keyframes spin{to{transform:rotate(360deg)}}
.body{min-width:0;display:flex;flex-direction:column;gap:3px;justify-content:center}
.top{display:flex;align-items:center;gap:8px;height:18px}
.kick{color:var(--macc);font-weight:bold;font-size:12px;letter-spacing:2px} .state{flex:1;font-size:12px;font-weight:bold;letter-spacing:1px;color:var(--msub)} .w.on .state{color:var(--macc2)}
.title{font-size:15px;font-weight:bold;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.artist{color:var(--msub);font-size:13px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar{display:flex;align-items:center;gap:8px;margin-top:4px}
.seek{flex:1;height:6px;background:var(--mcard2);box-shadow:0 2px 0 rgba(0,0,0,.35)}
.seek i{display:block;height:100%;width:0;background:repeating-linear-gradient(90deg,var(--macc) 0 4px,color-mix(in srgb,var(--macc) 75%,#fff) 4px 6px)}
.time{color:var(--msub);font-size:12px;white-space:nowrap}
.ctl{display:flex;align-items:center;gap:4px;margin-top:4px}
.b{all:unset;box-sizing:border-box;cursor:pointer;width:30px;height:26px;display:grid;place-items:center;color:var(--mtext);background:var(--mcard2);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.08),0 2px 0 rgba(0,0,0,.4)}
.b:hover{background:color-mix(in srgb,var(--macc) 24%,var(--mcard2));color:var(--macc)} .b:active{transform:translateY(2px);box-shadow:none}
.b.play{width:38px;background:var(--macc);color:#06110C} .b.play:hover{background:var(--macc2);color:#06110C} .b.fav.on{color:var(--mheart)}
.b svg{display:block;shape-rendering:crispEdges}
.queue{display:none;margin-top:6px;border-top:2px solid var(--mcard2);padding-top:6px;font-size:12px;color:var(--msub);min-width:0}
.queue b{color:var(--macc);letter-spacing:2px;font-size:11px} .queue div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.5}
.empty{grid-column:1/-1;align-self:center;text-align:center;color:var(--msub)} .empty b{display:block;color:var(--macc);letter-spacing:2px;margin-bottom:6px}
/* petit : le disque et l'essentiel ; grand : un plus grand disque et la suite de la file */
.w.s{gap:10px;padding:10px 10px 8px} .w.s .disc{--d:64px} .w.s .bar,.w.s .b.prev,.w.s .b.fav{display:none} .w.s .title{font-size:14px}
.w.l .disc{--d:150px} .w.l .title{font-size:18px} .w.l .artist{font-size:14px} .w.l .queue{display:block}
`;
// les icônes pixel du lecteur (7 x 7)
const PX = { play: ['.#.....', '.##....', '.###...', '.####..', '.###...', '.##....', '.#.....'], pause: ['.##.##.', '.##.##.', '.##.##.', '.##.##.', '.##.##.', '.##.##.', '.##.##.'],
  next: ['#...#.#', '##..#.#', '###.#.#', '####..#', '###.#.#', '##..#.#', '#...#.#'], prev: ['#.#...#', '#.#..##', '#.#.###', '#..####', '#.#.###', '#.#..##', '#.#...#'],
  heart: ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'] };
const icon = n => '<svg viewBox="0 0 7 7" width="14" height="14" fill="currentColor"><path d="' + PX[n].flatMap((r, y) => [...r].map((c, x) => c === '#' ? `M${x} ${y}h1v1H${x}z` : '')).join('') + '"/></svg>';
const mmss = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

export default function (ctx) {
  const { el } = ctx, st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  const w = el('div', 'w'), disc = el('div', 'disc'), cover = el('i'), body = el('div', 'body');
  const state = el('span', 'state'), title = el('div', 'title'), artist = el('div', 'artist'), seek = el('div', 'seek'), fill = el('i'), time = el('span', 'time'), queue = el('div', 'queue');
  const top = el('div', 'top'), bar = el('div', 'bar'), ctl = el('div', 'ctl');
  const btn = (cls, ic, tip, cmd) => { const b = el('button', 'b ' + cls); b.innerHTML = icon(ic); b.title = tip; b.onclick = () => ctx.widget.command(cmd); ctl.append(b); return b; };
  disc.append(cover); disc.title = 'Ouvrir NeoMusic'; disc.onclick = () => ctx.widget.open();
  seek.append(fill); bar.append(seek, time); top.append(el('span', 'kick', 'NEOMUSIC'), state);
  btn('prev', 'prev', 'Morceau précédent', 'prev'); const play = btn('play', 'play', 'Lecture / pause', 'toggle'); btn('next', 'next', 'Morceau suivant', 'next'); const fav = btn('fav', 'heart', 'Favori', 'fav');
  body.append(top, title, artist, bar, ctl, queue);
  document.body.append(w);
  let d = null;
  const setSize = s => { w.classList.remove('s', 'm', 'l'); w.classList.add(s || 'm'); };
  function paint() {
    if (!d || !d.title) { w.classList.remove('on'); w.replaceChildren(Object.assign(el('div', 'empty'), { innerHTML: '<b>NEOMUSIC</b>Rien en cours. Clique pour choisir une musique.' })); w.onclick = () => ctx.widget.open(); return; }
    if (!w.contains(body)) { w.replaceChildren(disc, body); w.onclick = null; }
    for (const [k, v] of Object.entries(d.theme || {})) w.style.setProperty('--m' + k, v);
    w.classList.toggle('on', !!d.playing);
    state.textContent = d.playing ? 'EN LECTURE' : 'EN PAUSE';
    title.textContent = d.title; title.title = d.title; artist.textContent = d.artist || '';
    cover.style.backgroundImage = d.cover ? `url("neoplugin://neodex.music/cover/${encodeURIComponent(d.cover)}")` : '';
    play.innerHTML = icon(d.playing ? 'pause' : 'play'); fav.classList.toggle('on', !!d.fav);
    queue.replaceChildren(el('b', '', 'À SUIVRE'), ...(d.next || []).map(t => el('div', '', t)));
    tick();
  }
  function tick() {  // la progression avance toute seule entre deux envois de NeoMusic
    if (!d || !d.title) return;
    const pos = Math.min(d.dur || 0, (d.pos || 0) + (d.playing ? (Date.now() - d.at) / 1000 : 0));
    fill.style.width = d.dur ? pos / d.dur * 100 + '%' : '0'; time.textContent = mmss(pos) + ' / ' + mmss(d.dur);
  }
  setInterval(tick, 500);
  setSize(ctx.widget.size()); ctx.widget.onSize(setSize);
  ctx.widget.onData(x => { d = x; paint(); });
  paint();
}
