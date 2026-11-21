// Le widget de NeoMusic sur l'accueil de NeoDex : exactement le petit lecteur de NeoMusic (même cadre, même platine ou disque choisi,
// même spectre, même barre, mêmes boutons), agrandi pour remplir sa case. Il tourne dans sa propre iframe : NeoMusic lui envoie
// le morceau, le thème, la platine choisie et le spectre (ctx.widget.set({data}) dans index.js, muWidget) ; ses boutons lancent les commandes de plugin.json.
// Le dessin vient d'index.js (blocs « platine ») : après un changement là-bas, node tools/widget-sync.js.
const CSS = `
html,body{height:100%;margin:0;overflow:hidden}
body{display:grid;place-items:center}
.muMini{position:relative;width:430px;display:grid;grid-template-columns:92px 1fr;gap:14px;padding:12px 14px 10px;box-sizing:border-box;
  background:var(--mcard);color:var(--mtext);font:14px Consolas,'Cascadia Mono',monospace;user-select:none;cursor:pointer;
  box-shadow:0 -3px 0 0 var(--macc),0 3px 0 0 var(--mborder),-3px 0 0 0 var(--mborder),3px 0 0 0 var(--mborder),0 -6px 0 -3px var(--macc),9px 9px 0 0 rgba(0,0,0,.45)}
.muMini::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:repeating-linear-gradient(90deg,var(--macc) 0 6px,var(--macc2) 6px 9px);opacity:.55}
#mmAmb{position:absolute;inset:0;width:100%;height:100%;z-index:0;image-rendering:pixelated;pointer-events:none;display:none} .muMini.amb #mmAmb{display:block} .muMini.amb>:not(#mmAmb){position:relative;z-index:1}
#mmDisc{width:92px;height:92px;align-self:center} .muMini.deck{width:460px;grid-template-columns:130px 1fr} .muMini.deck #mmDisc{width:130px;height:96px}
.mmBody{min-width:0;display:flex;flex-direction:column;gap:3px}
.mmTop{display:flex;align-items:center;gap:6px;height:20px}
.mmKick{color:var(--macc);font-weight:bold;font-size:12px;letter-spacing:2px} #mmState{flex:1;font-size:12px;font-weight:bold;letter-spacing:1px}
#mmTitle{font-size:15px;line-height:1.3;min-height:1.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mmArtist{color:var(--msub);font-size:13px;line-height:1.3;min-height:1.3em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mmSpecBox{grid-column:1/-1;height:46px;margin-top:-4px}  .mmVolBox{margin-left:auto;display:flex;align-items:center;gap:4px} .mmVolBox .mmBtn{width:22px;height:22px;font:bold 14px Consolas,monospace} #mmSpec{display:block;image-rendering:pixelated}
.mmBar{display:flex;align-items:center;gap:8px}
#mmSeek{flex:1;height:6px;background:var(--mcard2);box-shadow:0 2px 0 rgba(0,0,0,.35)}
#mmSeek i{display:block;height:100%;width:0;background:repeating-linear-gradient(90deg,var(--macc) 0 4px,color-mix(in srgb,var(--macc) 75%,#fff) 4px 6px)}
#mmTime{color:var(--msub);font-size:12px;white-space:nowrap}
.mmCtl{display:flex;align-items:center;gap:4px;margin-top:3px}
.mmBtn{all:unset;box-sizing:border-box;cursor:pointer;width:30px;height:26px;display:grid;place-items:center;color:var(--mtext);background:var(--mcard2);
  box-shadow:inset 0 2px 0 rgba(255,255,255,.08),0 2px 0 rgba(0,0,0,.4);transition:background .1s,color .1s}
.mmBtn:hover{background:color-mix(in srgb,var(--macc) 24%,var(--mcard2));color:var(--macc)} .mmBtn:active{transform:translateY(2px);box-shadow:none}
#mmPlay{width:38px;background:var(--macc);color:#06110C} #mmPlay:hover{background:var(--macc2);color:#06110C}
#mmFav.on{color:var(--mheart)}
.mmTop .mmBtn{width:22px;height:18px;background:transparent;box-shadow:none;color:var(--msub)} .mmTop .mmBtn:hover{background:var(--mcard2);color:var(--mtext)}
#mmVol{min-width:68px;text-align:center;color:var(--msub);font-size:12px;letter-spacing:1px}
.mmBtn svg{display:block;shape-rendering:crispEdges}
.empty{grid-column:1/-1;text-align:center;color:var(--msub);padding:18px 0} .empty b{display:block;color:var(--macc);letter-spacing:2px;margin-bottom:6px}
`;
// les icônes pixel du petit lecteur (7 x 7)
const PX = { play: ['.#.....', '.##....', '.###...', '.####..', '.###...', '.##....', '.#.....'], pause: ['.##.##.', '.##.##.', '.##.##.', '.##.##.', '.##.##.', '.##.##.', '.##.##.'],
  next: ['#....##', '##...##', '###..##', '####.##', '###..##', '##...##', '#....##'], prevt: ['##....#', '##...##', '##..###', '##.####', '##..###', '##...##', '##....#'],
  heart: ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'], ext: ['...####', '.....##', '....#.#', '...#..#', '..#....', '.#.....', '#......'] };
const icon = n => '<svg viewBox="0 0 7 7" width="14" height="14" fill="currentColor"><path d="' + PX[n].flatMap((r, y) => [...r].map((c, x) => c === '#' ? `M${x} ${y}h1v1H${x}z` : '')).join('') + '"/></svg>';
const muClock = s => { s = Math.max(0, Math.floor(+s || 0)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

export default function (ctx) {
  const { el } = ctx, st = document.createElement('style'); st.textContent = CSS; document.head.append(st);
  // ce que le dessin d'index.js attend, rempli avec ce que NeoMusic envoie
  let d = null, T = null;
  const mp = {}, mu = { settings: {} }, muSpec = { levels: [] };
  const muLevel = () => ({ level: d?.level || 0 });
  const pos = () => !d ? 0 : Math.min(d.dur || 0, (d.pos || 0) + (d.playing ? (Date.now() - d.at) / 1000 : 0));
  const muAudio = { get paused() { return !d?.playing; }, get duration() { return d?.dur || 0; }, get currentTime() { return pos(); } };

  // platine:début (copié d'index.js par tools/widget-sync.js : ne pas modifier ici)
  const muHex = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const muShade = (h, f) => '#' + muHex(h).map(c => Math.round(f >= 0 ? c + (255 - c) * f : c * (1 + f)).toString(16).padStart(2, '0')).join('');
  const muBlend = (a, b, k) => { const x = muHex(a), y = muHex(b); return '#' + x.map((c, i) => Math.round(c + (y[i] - c) * k).toString(16).padStart(2, '0')).join(''); };
  const MU_RPM = 200;  // 33 tours ⅓ par minute = 200° par seconde
  /* les platines du niveau 150 et plus, en deux parties qu'on combine librement :
     le socle (sa matière : aux couleurs du thème, bois ou pierre) et le bras (son métal, qui fait aussi le bord du plateau et le liseré).
     'A' / 'B' : les couleurs d'accent du thème. */
  const MU_BASES = {
    'Thème': {lv: 150, note: 'aux couleurs du thème'},
    Noyer: {lv: 150, note: 'bois brun', mat: ['#7a4a26', '#5e3519', '#8f5a30']},
    'Ébène': {lv: 160, note: 'bois sombre', mat: ['#3a2418', '#2c1a10', '#4a2e1c']},
    'Érable': {lv: 170, note: 'bois clair', mat: ['#c8995e', '#b3844c', '#d6aa70']},
    Ardoise: {lv: 180, note: 'pierre grise', mat: ['#4b4f59', '#3f434c', '#565b66']},
    Marbre: {lv: 190, note: 'pierre blanche veinée', mat: ['#d9d7d1', '#c6c4bd', '#e7e5df']},
  };
  const MU_ARMS = {
    'Thème': {lv: 150, note: 'argent teinté du thème'},
    Argent: {lv: 150, note: 'argent', rim: ['#ffffff', '#a4a7b4'], metal: ['#ffffff', '#b8bcc8', '#5a5e6c']},
    Or: {lv: 150, note: 'or', rim: ['#ffe9a8', '#c99a3e'], metal: ['#ffe9a8', '#c99a3e', '#6e4a12'], band: '#c99a3e'},
    Noir: {lv: 160, note: 'métal noir mat', rim: ['#8a8d98', '#45474f'], metal: ['#8a8d98', '#3a3c45', '#16171c'], band: '#45474f'},
    Cuivre: {lv: 180, note: 'cuivre', rim: ['#ffc89a', '#c8743a'], metal: ['#ffc89a', '#c8743a', '#6e3412'], band: '#c8743a'},
    Platine: {lv: 190, note: 'platine, liseré à la 2e couleur du thème', rim: ['#ffffff', '#c9ccd6'], metal: ['#ffffff', '#dfe1e8', '#7b7e8a'], band: 'B'},
  };
  const MU_DECK_OLD = {Classique: ['Thème', 'Thème'], Collection: ['Noyer', 'Or'], 'Ébène': ['Ébène', 'Argent'], 'Érable': ['Érable', 'Or'], Cuivre: ['Thème', 'Cuivre'], Platine: ['Thème', 'Platine']};  // l'ancien réglage « deckStyle » (une platine toute faite)
  const muDeckParts = () => {  // [socle, bras] choisis, chacun ramené au thème si le niveau ne le permet pas
    const st = mu.settings, old = MU_DECK_OLD[st.deckStyle || (st.deckLuxe ? 'Collection' : 'Classique')] || MU_DECK_OLD.Classique, lv = muLevel().level;
    const b = st.deckBase || old[0], a = st.deckArm || old[1];
    return [MU_BASES[b]?.lv <= lv ? b : 'Thème', MU_ARMS[a]?.lv <= lv ? a : 'Thème'];
  };
  const muDeckNew = lv => {  // le message du niveau qui débloque des pièces de platine ('' si aucune)
    if (lv === 150) return 'socles et bras à combiner débloqués';
    const got = [['socle', MU_BASES], ['bras', MU_ARMS]].flatMap(([k, m]) => Object.keys(m).filter(n => m[n].lv === lv).map(n => k + ' « ' + n + ' »'));
    return got.length ? got.join(' et ') + ' débloqué' + (got.length > 1 ? 's' : '') : '';
  };
  const muDeckKit = () => { const [b, a] = muDeckParts(); return {...MU_BASES[b], ...MU_ARMS[a]}; };
  const muCol = c => { const [r, g, b] = muHex(c.length === 4 ? '#' + [...c.slice(1)].map(x => x + x).join('') : c); return (0xff000000 | b << 16 | g << 8 | r) >>> 0; };  // une couleur → un pixel d'ImageData
  function muPixLabel(img, d) {  // l'étiquette : la pochette réduite à d×d pixels, en peu de couleurs (ou une étiquette aux couleurs du thème)
    const cache = mp.pxLabels ??= new WeakMap(), k = img || muPixLabel, hit = cache.get(k);
    if (hit && hit.d === d && hit.t === T) return hit.p;
    const c = document.createElement('canvas'); c.width = c.height = d;
    const g = c.getContext('2d', {willReadFrequently: true});
    g.fillStyle = T.ACCENT; g.fillRect(0, 0, d, d); g.fillStyle = muShade(T.ACCENT_2 || T.ACCENT, -.35); g.fillRect(0, d >> 1, d, d - (d >> 1));
    if (img) { const s = Math.min(img.width, img.height); g.imageSmoothingQuality = 'high'; g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, d, d); }
    let p; try { p = new Uint32Array(g.getImageData(0, 0, d, d).data.buffer); } catch { p = new Uint32Array(d * d).fill(muCol(T.ACCENT)); }
    for (let i = 0; i < p.length; i++) p[i] = (p[i] & 0xffe0e0e0 | 0xff101010) >>> 0;  // 8 niveaux par couleur : l'aspect pixel art
    cache.set(k, {d, t: T, p}); return p;
  }
  function muPixBuf(key, W, H) {  // une petite image réutilisée d'une image à l'autre
    let b = mp[key]; if (!b || b.W !== W || b.H !== H) { const c = document.createElement('canvas'); c.width = W; c.height = H; const id = c.getContext('2d').createImageData(W, H); b = mp[key] = {W, H, c, id, P: new Uint32Array(id.data.buffer)}; }
    b.P.fill(0); return b;
  }
  function muPixKit(b) {
    const {W, H, P} = b, put = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) P[y * W + x] = c; };
    const rect = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c); };
    const disc = (cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * .8) put(cx + x, cy + y, c); };
    const line = (x0, y0, x1, y1, c, t = 1) => { const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))); for (let i = 0; i <= n; i++) rect(Math.round(x0 + (x1 - x0) * i / n) - (t >> 1), Math.round(y0 + (y1 - y0) * i / n) - (t >> 1), t, t, c); };
    return {put, rect, disc, line};
  }
  function muPixRecord(b, cx, cy, R, angle, img) {  // le disque : étiquette = pochette qui tourne, sillons en deux tons, reflet fixe tramé
    const {put} = muPixKit(b), a = angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), lr = muLabelR(R), d = lr * 2, L = muPixLabel(img, d);
    const base = muBlend('#0e0b14', muBlend(T.CARD, T.ACCENT, .3), .22), c0 = muCol(base), c1 = muCol(muShade(base, .08)), cGap = muCol(muShade(base, -.4)), cHi = muCol(muShade(base, .3)), cRim = muCol(muShade(base, .22)), cLip = muCol(muShade(base, -.3));
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const d2 = x * x + y * y; if (d2 > R * R + R * .8) continue;
      const r = Math.sqrt(d2); let c;
      if (r <= lr - .5) { const u = Math.max(0, Math.min(d - 1, Math.round(x * ca + y * sa + lr - .5))), v = Math.max(0, Math.min(d - 1, Math.round(-x * sa + y * ca + lr - .5))); c = L[v * d + u]; }
      else if (r < lr + 1) c = cLip;
      else if (r > R - 1) c = cRim;
      else {
        const k = Math.round(r); c = k % 2 ? c0 : c1;
        if (k === Math.round(lr + (R - lr) * .45) || k === Math.round(lr + (R - lr) * .75)) c = cGap;  // les silences entre les plages
        const th = Math.atan2(y, x), sec = Math.min(Math.abs(th + 2.3), Math.abs(th - .84));  // la lumière ne tourne pas avec le disque
        if (sec < .12 || (sec < .24 && (x + y & 1))) c = cHi;
      }
      put(cx + x, cy + y, c);
    }
    put(cx, cy, muCol('#e8eaf0'));  // l'axe
  }
  function muPixShow(g, b, w, h, s) {  // la petite image, agrandie d'un facteur entier, au centre
    b.c.getContext('2d').putImageData(b.id, 0, 0);
    const ox = Math.floor((w - b.W * s) / 2), oy = Math.floor((h - b.H * s) / 2);
    g.imageSmoothingEnabled = false; g.drawImage(b.c, ox, oy, b.W * s, b.H * s);
    return [ox, oy];
  }
  function muSharpLabel(g, x, y, r, angle, img, s) {  // la pochette au centre du disque : nette (pas en pixels), elle tourne avec lui
    if (!img) return;
    const k = Math.min(img.width, img.height);
    g.save(); g.translate(x, y); g.rotate(angle * Math.PI / 180); g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip();
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, -r, -r, r * 2, r * 2);
    g.restore();
    g.fillStyle = '#0b0a10'; g.fillRect(Math.round(x - s * 1.5), Math.round(y - s * 1.5), s * 3, s * 3); g.fillStyle = '#e8eaf0'; g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);  // l'axe
  }
  const muLabelR = R => Math.max(3, Math.round(R * .42));
  function muDeck(g, w, h, now, playing) {
    const s = Math.max(2, Math.round(h / 80)), W = Math.floor(w / s), H = Math.floor(h / s), b = muPixBuf('pxDeck', W, H), {put, rect, disc, line} = muPixKit(b);
    const DK = muDeckKit(), tc = c => c === 'A' ? T.ACCENT : c === 'B' ? T.ACCENT_2 || T.ACCENT : c;
    mp.coverOld = null;
    // le socle : bloc plat, liseré clair en haut, bande de couleur en bas, coins coupés ; la matière dépend de la platine
    const base = (DK.mat ? DK.mat[0] : muShade(muBlend(T.CARD, T.ACCENT, .2), -.3)), cB = muCol(base), cBd = muCol(muShade(base, -.5));
    const OL = muCol(muShade(T.CARD, -.88));
    rect(1, 0, W - 2, H, OL); rect(0, 1, W, H - 2, OL);  // le contour
    rect(1, 1, W - 2, H - 2, cB);
    if (DK.mat) { const C = DK.mat.map(muCol); for (let y = 1; y < H - 4; y++) for (let x = 1; x < W - 1; x++) put(x, y, C[Math.abs(Math.floor(y / 2 + Math.sin(x * .07 + y * .9) * 1.3)) % 3]); }  // les veines du bois ou de la pierre
    rect(2, 1, W - 4, 1, muCol(muShade(base, .3)));
    rect(1, H - 4, W - 2, 1, muCol(tc(DK.band || T.ACCENT)));
    rect(1, H - 3, W - 2, 2, cBd);
    // le plateau : ombre, bord métallique, points stroboscopiques qui tournent
    const pad = Math.round(H * .08), Rp = Math.floor(H / 2 - pad), cx = pad + Rp + 2, cy = Math.floor((H - 3) / 2), R = Rp - 2;
    const rim = DK.rim ? DK.rim.map(tc) : [muBlend('#d4d7e0', T.ACCENT, .25), muBlend('#7d808e', T.ACCENT, .25)];
    disc(cx + 1, cy + 2, Rp + 1, cBd); disc(cx, cy, Rp + 1, OL); disc(cx, cy, Rp, muCol(rim[1])); disc(cx, cy, Rp - 1, muCol(muShade(T.CARD, -.78)));
    for (let i = 0; i < 24; i++) { const t = (mp.deckAng + i * 15) * Math.PI / 180; put(cx + Math.cos(t) * Rp, cy + Math.sin(t) * Rp, muCol(i % 2 ? rim[0] : muShade(rim[1], -.4))); }
    muPixRecord(b, cx, cy, R, mp.deckAng, mp.coverImg);
    // le bras : pivot à droite, il se pose sur le bord et avance vers l'étiquette avec le morceau
    const pvx = Math.round(Math.min(W - pad - 5, cx + Rp + (W - cx - Rp) * .55)), pvy = Math.round(pad + H * .14), dx = cx - pvx, dy = cy - pvy, D = Math.hypot(dx, dy), Lr = D * .93;
    const at = rho => { const c = Math.max(-1, Math.min(1, (D * D + Lr * Lr - rho * rho) / (2 * D * Lr))); return Math.atan2(dy, dx) - Math.acos(c); };
    const dur = muAudio?.duration || mp.length || 0, pos = muAudio?.currentTime || mp.resume || 0, prog = dur ? Math.max(0, Math.min(1, pos / dur)) : 0;
    const target = mp.cur ? at(R * .94 - (R * .94 - R * .45) * prog) : at(R * 1.25);
    const dt = Math.min(64, now - (mp.armAt || now)); mp.armAt = now;
    mp.arm = mp.arm == null ? at(R * 1.25) : mp.arm + (target - mp.arm) * Math.min(1, dt * .006);
    mp.lift = (mp.lift ?? 1) + ((playing ? 0 : 1) - (mp.lift ?? 1)) * Math.min(1, dt * .008);
    const metal = DK.metal ? DK.metal.map(tc) : ['#f2f3f7', '#a4a7b4', '#4a4d5c'];
    const arm = sh => {
      const o = sh ? 1 + Math.round(mp.lift * 2) : 0, A = mp.arm, ax = pvx + o, ay = pvy + o, sx = pvx + Math.cos(A) * Lr + o, sy = pvy + Math.sin(A) * Lr + o;
      const hx = sx - Math.cos(A) * 4, hy = sy - Math.sin(A) * 4;
      line(ax - Math.cos(A) * 2, ay - Math.sin(A) * 2, ax - Math.cos(A) * 5, ay - Math.sin(A) * 5, muCol(sh ? '#000' : metal[2]), 4);  // contrepoids
      line(ax, ay, hx, hy, muCol(sh ? '#000' : metal[1]), 2); if (!sh) line(ax, ay - 1, hx, hy - 1, muCol(metal[0]), 1);  // le tube, éclairé dessus
      line(hx, hy, sx, sy, muCol(sh ? '#000' : '#1d1d24'), 3); if (!sh) put(hx + (sx - hx) * .5, hy + (sy - hy) * .5, muCol(T.ACCENT));  // la tête de lecture
    };
    { const A = mp.arm, sx = pvx + Math.cos(A) * Lr, sy = pvy + Math.sin(A) * Lr, hx = sx - Math.cos(A) * 4, hy = sy - Math.sin(A) * 4;  // le contour du bras
      if (mp.lift > .05) arm(true);
      line(pvx - Math.cos(A) * 2, pvy - Math.sin(A) * 2, pvx - Math.cos(A) * 5, pvy - Math.sin(A) * 5, OL, 6); line(pvx, pvy, hx, hy, OL, 4); line(hx, hy, sx, sy, OL, 5); }
    arm(false);
    disc(pvx + 1, pvy + 1, 4, cBd); disc(pvx, pvy, 4, OL); disc(pvx, pvy, 3, muCol(metal[1])); put(pvx - 1, pvy - 1, muCol(metal[0])); put(pvx - 2, pvy, muCol(metal[0])); rect(pvx, pvy, 1, 1, muCol('#23232b'));  // le pivot
    // le voyant et la vitesse en points
    const lx = W - pad - 3, ly = H - pad - 4;
    rect(lx - 1, ly - 1, 4, 4, OL); rect(lx, ly, 2, 2, muCol(playing ? T.ACCENT_2 || T.ACCENT : '#3a3a44'));
    for (let i = 0; i < 3; i++) put(lx - 4 - i * 2, ly + 1, muCol(i ? '#4a4d5c' : '#c9ccd6'));
    const [ox, oy] = muPixShow(g, b, w, h, s), lr = muLabelR(R);
    muSharpLabel(g, ox + (cx + .5) * s, oy + (cy + .5) * s, (lr - .5) * s, mp.deckAng, mp.coverImg, s);
  }
  function muSpin(now) {  // the record speeds up fast and slows down like a real turntable (shared by the big cover and the portable player)
    const playing = muAudio && !muAudio.paused;
    mp.spin = playing ? Math.min(1.4, (mp.spin || 0) + .35) : (mp.spin || 0) * .9 < .01 ? 0 : (mp.spin || 0) * .9;
    const dt = now - (mp.coverAt || now);
    mp.angle = ((mp.angle || 0) + (mp.spin || 0) * dt / 70) % 360; mp.coverAt = now;
    mp.deckAng = ((mp.deckAng || 0) + (mp.spin || 0) / 1.4 * MU_RPM * dt / 1000) % 360;
  }
  const muInner = e => { if (!e) return 0; const cs = getComputedStyle(e); return e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); };  // largeur sans le rembourrage (l'écran du Deluxe en a)
  function muPixSpectrum(cv, cssH, now) {
    const avail = muInner(cv.parentElement); if (!avail) return;
    const P = Math.max(2, Math.round(3 * devicePixelRatio)) / devicePixelRatio, cols = Math.floor(avail / P), rows = Math.floor(cssH / P);
    if (cv.width !== cols || cv.height !== rows) { cv.width = cols; cv.height = rows; cv.style.width = cols * P + 'px'; cv.style.height = rows * P + 'px'; }
    const s = cv._s ||= {}, g = cv.getContext('2d'), playing = muAudio && !muAudio.paused;
    const N = Math.max(12, Math.min(48, Math.floor(cols / 6))), bw = Math.floor(cols / N), inner = Math.max(2, bw - (bw > 4 ? 2 : 1)), off = Math.floor((cols - N * bw) / 2) + Math.floor((bw - inner) / 2);
    const base = rows - 2, Hb = base;  // the 2 last rows hold the shadow
    if (s.n !== N) { s.n = N; s.display = Array(N).fill(0); s.peaks = Array(N).fill(0); s.peakAt = Array(N).fill(0); s.key = ''; }
    if (s.key !== T.ACCENT + T.DANGER + T.ACCENT_2) {
      s.key = T.ACCENT + T.DANGER + T.ACCENT_2;
      s.cols = Array.from({length: N}, (_, i) => {
        const f = i / Math.max(1, N - 1), hue = f < .5 ? muBlend(T.ACCENT, T.DANGER, f * 2) : muBlend(T.DANGER, T.ACCENT_2, f * 2 - 1);
        const tiers = [muShade(hue, -.38), muShade(hue, -.15), hue, muBlend(hue, '#ffffff', .3)];
        return {tiers: tiers.map(c => [c, muBlend(c, '#ffffff', .25), muShade(c, -.38)]), cap: muBlend(hue, '#ffffff', .7), peak: muBlend(hue, '#ffffff', .5)};
      });
    }
    const dt = Math.min(.25, (now - (s.at || now)) / 1000); s.at = now;
    const per = r => 1 - (1 - r) ** (dt / .25), up = per(.92), down = per(.25), fall = .55 ** (dt / .25), t = now / 1000, L = muSpec.levels;
    g.clearRect(0, 0, cols, rows);
    g.fillStyle = T.CARD_ALT;
    for (const q of [.25, .5, .75]) { const y = base - 1 - Math.round(q * (Hb - 1)); for (let x = (y & 1) * 2; x < cols; x += 4) g.fillRect(x, y, 1, 1); }  // dotted grid
    for (let i = 0; i < N; i++) {
      const pos = i / Math.max(1, N - 1) * (L.length - 1), lo = Math.floor(pos), hi = Math.min(L.length - 1, lo + 1);
      const raw = playing ? Math.max(0, Math.min(1, L[lo] * (1 - (pos - lo)) + L[hi] * (pos - lo))) : 0;
      const target = playing ? raw : .05 + .04 * (1 + Math.sin(t * 2.2 + i * .5)) / 2;  // at rest: a slow breathing wave instead of a flat line
      s.display[i] = target > s.display[i] ? target : s.display[i] + (target - s.display[i]) * down; if (!(s.display[i] >= 0)) s.display[i] = 0;
      if (raw >= s.peaks[i]) { s.peaks[i] = raw; s.peakAt[i] = t; } else if (t - s.peakAt[i] > .12) s.peaks[i] *= fall;
      const c = s.cols[i], x = off + i * bw, h = Math.max(1, Math.min(Hb, Math.round(s.display[i] * Hb)));
      const top = base - h, py = s.peaks[i] > .06 ? base - 1 - Math.min(Hb - 1, Math.round(s.peaks[i] * Hb)) : -1, peak = py >= 0 && py < top;
      g.fillStyle = 'rgba(0, 0, 0, .2)'; g.fillRect(x + 2, top + 2, inner, h); if (peak) g.fillRect(x + 2, py + 2, inner, 1);  // drop shadow
      g.fillStyle = 'rgba(0, 0, 0, .42)'; g.fillRect(x + 1, top + 1, inner, h); if (peak) g.fillRect(x + 1, py + 1, inner, 1);
      for (let r = 0; r < h; r++) {
        const y = base - 1 - r, tier = Math.min(3, Math.floor(r / Hb * 4)), edge = tier > 0 && Math.floor((r - 1) / Hb * 4) < tier;
        const [main, light, dark] = c.tiers[tier];
        if (r === h - 1 && h > 1) { g.fillStyle = c.cap; g.fillRect(x, y, inner, 1); continue; }
        g.fillStyle = main; g.fillRect(x, y, inner, 1);
        if (edge) { g.fillStyle = c.tiers[tier - 1][0]; for (let k = (y & 1); k < inner; k += 2) g.fillRect(x + k, y, 1, 1); }  // dither between tiers
        if (inner > 2) { g.fillStyle = light; g.fillRect(x, y, 1, 1); g.fillStyle = dark; g.fillRect(x + inner - 1, y, 1, 1); }
      }
      if (peak) { g.fillStyle = c.peak; g.fillRect(x, py, inner, 1); }
    }
  }
  /* ---------- l'ambiance du thème : une petite scène en pixels derrière l'appli (ciel, décor, particules en profondeur), qui réagit aux basses ---------- */
  // une toile au tiers de la taille de la page, 30 images par seconde au plus ; le décor fixe (ciel, silhouettes) est peint une fois, puis recopié à chaque image
  const MU_AMB = {nova: 'space', onyx: 'night', grenat: 'bokeh', aube: 'dawn', ambre: 'shafts', abyme: 'abyss', sakura: 'sakura', crepuscule: 'dusk', menthe: 'fizz',
    rubis: 'gems', glacier: 'aurora', cuivre: 'forge', lavande: 'meadow', foret: 'forest', ocean: 'sea', soleil: 'sun', cyber: 'code', neon: 'synth'};
  const muAmb = {at: 0, ms: '', parts: [], fx: [], e: 0, t: 0, kick: 0, avg: 0, kAt: 0, gust: 0, spr: new Map()};
  const muMix = (a, b, f) => { const A = muHex(a), B = muHex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * f).toString(16).padStart(2, '0')).join(''); };
  const muClamp01 = v => Math.max(0, Math.min(1, v));
  const muSeed = a => () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };  // le même tirage à chaque fois (le décor ne change pas d'une ouverture à l'autre)
  const muRgba = (c, a) => 'rgba(' + muHex(c).join(',') + ',' + a + ')';
  function muSpr(rows, c, c2) {  // un petit dessin en pixels : '#' la couleur, '+' la couleur à moitié, 'o' la seconde couleur
    const k = rows + c + c2; let s = muAmb.spr.get(k); if (s) return s;
    const R = rows.split('|'); s = document.createElement('canvas'); s.width = R[0].length; s.height = R.length; const g = s.getContext('2d');
    R.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '.') return; g.globalAlpha = ch === '+' ? .45 : 1; g.fillStyle = ch === 'o' ? c2 || '#fff' : c; g.fillRect(x, y, 1, 1); }));
    muAmb.spr.set(k, s); return s;
  }
  function muGlow(c, r) {  // un halo en anneaux (des paliers nets, pas un flou), r en pixels de la toile
    const k = 'g' + c + r; let s = muAmb.spr.get(k); if (s) return s;
    s = document.createElement('canvas'); s.width = s.height = r * 2 + 1; const g = s.getContext('2d'); g.fillStyle = c;
    for (let i = r; i >= 1; i--) { g.globalAlpha = .16 * (1 - i / (r + 1)) + .05; g.beginPath(); g.arc(r + .5, r + .5, i, 0, 7); g.fill(); }
    muAmb.spr.set(k, s); return s;
  }
  function muVGrad(c) {  // une bande verticale qui s'allume au milieu (les aurores, les rayons)
    const k = 'v' + c; let s = muAmb.spr.get(k); if (s) return s;
    s = document.createElement('canvas'); s.width = 1; s.height = 32; const g = s.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 32);
    gr.addColorStop(0, muRgba(c, 0)); gr.addColorStop(.6, muRgba(c, 1)); gr.addColorStop(1, muRgba(c, 0)); g.fillStyle = gr; g.fillRect(0, 0, 1, 32);
    muAmb.spr.set(k, s); return s;
  }
  // le décor fixe : un ciel en bandes (dégradé à paliers, façon pixel art), des reliefs et des silhouettes
  const muSky = (g, W, y0, y1, c0, c1, step = 3) => { for (let y = y0; y < y1; y += step) { g.fillStyle = muMix(c0, c1, (y - y0) / Math.max(1, y1 - y0)); g.fillRect(0, y, W, step); } };
  const muRidgeY = (x, base, amp, seed, rough = 1) => Math.round(base - amp * (.55 * Math.sin(x * .011 * rough + seed * 1.7) + .3 * Math.sin(x * .029 * rough + seed * 3.1) + .15 * Math.sin(x * .071 * rough + seed * 5.3)));
  function muRidge(g, W, H, base, amp, col, seed, rough = 1, cap) {  // une ligne de montagnes (somme de sinus), cap : la couleur de la neige sur les sommets
    for (let x = 0; x < W; x++) {
      const y = muRidgeY(x, base, amp, seed, rough);
      g.fillStyle = col; g.fillRect(x, y, 1, H - y); if (cap && y < base - amp * .45) { g.fillStyle = cap; g.fillRect(x, y, 1, 2); }
    }
  }
  function muPines(g, W, H, base, hMin, hMax, col, seed, gap = 7) {  // des sapins en triangles à étages
    const R = muSeed(seed);
    for (let x = -4; x < W + 4; x += gap * (.6 + R() * .8)) {
      const h = hMin + R() * (hMax - hMin), cx = Math.round(x), top = base - h; g.fillStyle = col;
      for (let y = 0; y < h; y++) { const w = Math.round((y % 6) * .45 + y * .22) + 1; g.fillRect(cx - w, Math.round(top + y), w * 2 + 1, 1); }
      g.fillRect(cx - 1, base - 1, 3, H - base + 1);
    }
    g.fillRect(0, base, W, H - base);
  }
  function muGrass(g, W, H, hMax, col, seed, base = H) {
    const R = muSeed(seed); g.fillStyle = col; g.fillRect(0, Math.round(base - 3), W, H);
    for (let x = 0; x < W; x++) { const h = 2 + R() * hMax * (.5 + .5 * Math.abs(Math.sin(x * .05 + seed))); g.fillRect(x, Math.round(base - 3 - h), 1, Math.round(h)); }
  }
  const muP = (W, H, o) => { const R = Math.random; return {x: R() * W, y: R() * H, z: .25 + R() * .75, ph: R() * 6.28, v: R(), ...o}; };
  const MU_SPR = {
    cross: '.+.|+#+|.+.', star5: '..+..|..#..|+#o#+|..#..|..+..', star7: '...+...|...#...|..+#+..|+##o##+|..+#+..|...#...|...+...',
    flake: '+.#.+|.+#+.|##o##|.+#+.|+.#.+', bub1: '.#.|#.#|.#.', bub2: '.##.|#o.#|#..#|.##.', bub3: '.###.|#o..#|#...#|#...#|.###.',
    petal: ['.#+|###|+#.', '+#.|##+|.#.', '.##|##.', '#.|##|.#', '#|#'], leaf: ['..o|.##|##.', '.#.|#o#|.#.', 'o..|##.|.##', '#|o|#'],
    shard: ['.#.|#o#|.#.', '#|o|#'], bird: ['#...#|.#.#.|..#..', '.....|##.##|..#..'], fly: ['##.##|#o#o#|.#.#.', '.#.#.|.#o#.|..#..'],
  };
  // chaque scène : init (les particules), back (le décor fixe, peint une fois), draw (chaque image : x le contexte, f le pas en images à 30/s, e les basses, k le coup de basse)
  const MU_SCN = {
    space: {  // Nova : un voyage dans les étoiles, comme Cyber un seul motif net : les étoiles viennent du fond et filent vers les bords, plus vite sur les basses
      init: (W, H) => Array.from({length: Math.round(W * H / 170)}, () => ({x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random(), c: Math.random() < .15})),
      back(g, W, H, C) { g.fillStyle = muMix(C.bg, '#000000', .35); g.fillRect(0, 0, W, H); },
      draw(x, W, H, C, f, t, e) {
        const cx = W / 2, cy = H * .42, S = Math.max(W, H) * .3, sp = (.0035 + .016 * e) * f;
        for (const p of muAmb.parts) {
          const z0 = p.z; p.z -= sp;
          const X = cx + p.x / p.z * S, Y = cy + p.y / p.z * S;
          if (p.z <= .03 || X < 0 || X >= W || Y < 0 || Y >= H) { p.x = Math.random() * 2 - 1; p.y = Math.random() * 2 - 1; p.z = 1; continue; }
          const X0 = cx + p.x / z0 * S, Y0 = cy + p.y / z0 * S, b = 1 - p.z, n = Math.min(8, Math.round(Math.hypot(X - X0, Y - Y0)));
          x.globalAlpha = Math.min(1, .4 + b); x.fillStyle = p.c ? C.a : b > .5 ? C.t : C.s;
          for (let i = 0; i <= n; i++) x.fillRect(Math.round(X - (X - X0) * i / Math.max(1, n)), Math.round(Y - (Y - Y0) * i / Math.max(1, n)), 1, 1);
        }
      },
    },
    night: {  // Onyx : pluie oblique sur une ville, fenêtres allumées, éclaboussures, éclair sur les gros coups de basse
      init: (W, H) => Array.from({length: Math.round(W * H / 2200)}, () => muP(W, H)),
      back(g, W, H, C) {
        muSky(g, W, 0, H, C.bg, muMix(C.bg, C.card, .8));
        const R = muSeed(7);
        for (const [lay, col, hMax] of [[0, muMix(C.bg, C.card, .55), .42], [1, muMix(C.bg, '#000000', .35), .3]])
          for (let x = 0; x < W;) { const w = 8 + R() * 18 | 0, h = H * (.08 + R() * hMax) | 0, G = muAmb.G + lay * H * .04; g.fillStyle = col; g.fillRect(x, G - h, w - 1, H - G + h);
            if (lay) for (let wy = G - h + 3; wy < G - 3; wy += 4) for (let wx = x + 2; wx < x + w - 3; wx += 3) if (R() < .18) { g.fillStyle = R() < .5 ? muRgba(C.a, .7) : muRgba(C.b, .6); g.fillRect(wx, wy, 1, 2); g.fillStyle = col; }
            x += w + (R() * 3 | 0); }
      },
      draw(x, W, H, C, f, t, e, k) {
        if (k > .95 && e > .55) muAmb.flash = 1; muAmb.flash = (muAmb.flash || 0) * .8;
        if (muAmb.flash > .05) { x.globalAlpha = muAmb.flash * .12; x.fillStyle = C.t; x.fillRect(0, 0, W, H); }
        const gy = Math.round(muAmb.G + H * .04); x.globalAlpha = .18 + .2 * e; x.drawImage(muVGrad(C.a), 0, gy - 6, W * .5, 14); x.drawImage(muVGrad(C.b), W * .5, gy - 6, W * .5, 14);
        x.fillStyle = muMix(C.s, C.t, .3);
        for (const p of muAmb.parts) {
          const sp = (3 + 5 * p.z) * f * (1 + .5 * e), L = 4 + Math.round(7 * p.z); p.y += sp; p.x -= sp * .35;
          if (p.y > muAmb.G + H * .04 - (1 - p.z) * H * .2) { muAmb.fx.push({x: p.x, y: p.y, life: 1}); p.y = -Math.random() * 20; p.x = Math.random() * (W + 40); }
          for (let i = 0; i < L; i++) { x.globalAlpha = (.2 + .5 * p.z) * (1 - i / L); x.fillRect(Math.round(p.x + i * .35), Math.round(p.y - i), 1, 1); }
        }
        for (const s of muAmb.fx) { s.life -= .12 * f; x.globalAlpha = Math.max(0, s.life) * .6; const d = Math.round((1 - s.life) * 3); x.fillRect(Math.round(s.x) - d, Math.round(s.y) - 1, 1, 1); x.fillRect(Math.round(s.x) + d, Math.round(s.y) - 1, 1, 1); }
      },
    },
    bokeh: {  // Grenat : un quadrillage de petits losanges ; une vague de lumière les traverse en diagonale, plus vive sur les basses
      init: () => [],
      back(g, W, H, C) { g.fillStyle = muMix(C.bg, '#000000', .25); g.fillRect(0, 0, W, H); },
      draw(x, W, H, C, f, t, e) {
        const sp = muSpr('...#...|..#.#..|.#...#.|#.....#|.#...#.|..#.#..|...#...', C.a), sp2 = muSpr('...#...|..###..|.#####.|#######|.#####.|..###..|...#...', C.a);
        for (let j = 0, y = -3; y < H + 4; j++, y += 6) for (let X = (j % 2) * 6 - 3; X < W + 4; X += 12) {
          const v = Math.max(0, Math.cos((X + y * 1.4) / 70 - t * .7)) ** 8;
          x.globalAlpha = .12 + v * (.3 + .45 * e); x.drawImage(v > .85 && e > .35 ? sp2 : sp, X - 3, y - 3);
        }
      },
    },
    dawn: {  // Aube : un ciel en bandes nettes, un soleil plein, des nuages en pixels qui passent, deux lignes de collines (ni halo ni particules)
      init: (W, H) => Array.from({length: 7}, () => ({x: Math.random() * W, y: muAmb.G * (.08 + Math.random() * .45), w: 16 + Math.random() * 30 | 0, v: .05 + Math.random() * .1})),
      back(g, W, H, C) {
        const G = Math.round(muAmb.G); muSky(g, W, 0, G, muMix(C.bg, '#000000', .25), muMix(C.bg, C.w, .4), 4); g.fillStyle = muMix(C.bg, '#000000', .3); g.fillRect(0, G, W, H - G);
        const hl = muAmb.hl = document.createElement('canvas'); hl.width = W; hl.height = H; const q = hl.getContext('2d');
        muRidge(q, W, H, G - H * .03, H * .07, muMix(C.bg, C.a, .25), 3, .8); muRidge(q, W, H, G + 2, H * .05, muMix(C.bg, '#000000', .2), 9, 1.3);
      },
      draw(x, W, H, C, f, t, e) {
        const G = muAmb.G, sx = Math.round(W * .68), sy = Math.round(G - H * .1), r = Math.round(H * .09);
        x.globalAlpha = 1; x.fillStyle = muMix(C.w, '#ffffff', .25);
        for (let yy = -r; yy <= r; yy++) { const w = Math.round(Math.sqrt(r * r - yy * yy)); if (yy > r * .3 && (yy & 3) === 0) continue; x.fillRect(sx - w, sy + yy, 2 * w + 1, 1); }  // le bas du soleil rayé
        for (const c of muAmb.parts) {
          c.x += c.v * (1 + e) * f; if (c.x - c.w > W) c.x = -c.w * 1.2;
          x.globalAlpha = .85; x.fillStyle = muMix(C.bg, C.t, .3); const X = Math.round(c.x), Y = Math.round(c.y);
          [[.35, .2], [.7, .05], [1, 0], [.85, .1]].forEach(([k, o], i) => x.fillRect(X + Math.round(c.w * o), Y + i * 2, Math.round(c.w * k), 2));
        }
        x.globalAlpha = 1; x.drawImage(muAmb.hl, 0, 0);
      },
    },
    shafts: {  // Ambre : des alvéoles de miel ; quelques cellules se remplissent doucement puis se vident, plus nombreuses sur les basses
      init: (W, H) => { const L = []; for (let j = 0, y = 0; y < H + 10; j++, y += 8) for (let X = (j % 2) * 5; X < W + 10; X += 10) L.push({x: X, y, ph: Math.random() * 6.28, v: .2 + Math.random() * .5}); return L; },
      back(g, W, H, C) { g.fillStyle = muMix(C.bg, '#000000', .25); g.fillRect(0, 0, W, H); const s = muSpr('..###..|.#...#.|#.....#|#.....#|#.....#|.#...#.|..###..', muMix(C.bg, C.a, .16)); for (const p of muAmb.parts || []) g.drawImage(s, p.x - 3, p.y - 3); },
      draw(x, W, H, C, f, t, e) {
        const s = muSpr('..###..|.#####.|#######|#######|#######|.#####.|..###..', C.a);
        for (const p of muAmb.parts) { const v = Math.sin(t * p.v + p.ph); if (v < .75 - .25 * e) continue; x.globalAlpha = Math.min(.55, (v - .7 + .25 * e) * 1.6); x.drawImage(s, p.x - 3, p.y - 3); }
      },
    },
    abyss: {  // Abyme : des bulles nettes qui montent du fond en oscillant, sur un fond qui s'assombrit en bandes, des rochers en bas
      init: (W, H) => Array.from({length: Math.round(W * H / 1400)}, () => ({x: Math.random() * W, y: Math.random() * H, s: Math.random() * 3 | 0, v: .3 + Math.random() * .6, ph: Math.random() * 6.28})),
      back(g, W, H, C) { muSky(g, W, 0, H, muMix(C.bg, C.b, .12), muMix(C.bg, '#000000', .5), 6); muRidge(g, W, H, H - H * .05, H * .05, muMix(C.bg, '#000000', .6), 5, 1.4); },
      draw(x, W, H, C, f, t, e) {
        const B = ['bub1', 'bub2', 'bub3'];
        for (const p of muAmb.parts) {
          p.y -= p.v * (1 + 1.5 * e) * (1 + p.s * .3) * f; if (p.y < -6) { p.y = H + 4; p.x = Math.random() * W; }
          x.globalAlpha = .35 + p.s * .2; x.drawImage(muSpr(MU_SPR[B[p.s]], p.s ? C.b : C.s, C.t), Math.round(p.x + Math.sin(t * 1.5 + p.ph) * 2), Math.round(p.y));
        }
      },
    },
    sakura: {  // Sakura : une branche fleurie, des pétales qui tournent et dérivent, des rafales sur les coups de basse
      init: (W, H) => Array.from({length: Math.round(W * H / 1500) + 12}, () => muP(W, H)),
      back(g, W, H, C) {
        const R = muSeed(11), wood = muMix(C.bg, C.card, .9), tips = [];
        const br = (x0, y0, a, len, w) => { if (len < 4 || w < .6) { tips.push([x0, y0]); return; } const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; g.strokeStyle = wood; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); br(x1, y1, a - .35 - R() * .3, len * (.62 + R() * .15), w * .7); br(x1, y1, a + .25 + R() * .3, len * (.55 + R() * .15), w * .65); };
        g.imageSmoothingEnabled = false; br(W + 2, -2, Math.PI * .8, H * .13, 3);
        for (const [tx, ty] of tips) for (let i = 0; i < 7; i++) { const ox = Math.round(tx + R() * 8 - 4), oy = Math.round(ty + R() * 8 - 4); g.globalAlpha = .85; g.fillStyle = C.a; g.fillRect(ox - 1, oy, 3, 1); g.fillRect(ox, oy - 1, 1, 3); g.fillStyle = muMix(C.a, C.t, .6); g.fillRect(ox, oy, 1, 1); }
        g.globalAlpha = 1;
      },
      draw(x, W, H, C, f, t, e, k) {
        muAmb.gust = Math.max(muAmb.gust * .96, k > .9 ? 2.2 : 0);
        for (const p of muAmb.parts) {
          p.y += (.25 + .45 * p.z) * f; p.x += ((.3 + .4 * p.z) * (1 + muAmb.gust) + Math.sin(t * 1.2 + p.ph) * .4) * f;
          if (p.y > H + 4 || p.x > W + 6) { if (Math.random() < .5) { p.x = -4; p.y = Math.random() * H; } else { p.y = -4; p.x = Math.random() * W; } }
          const fr = MU_SPR.petal[Math.floor(t * (1.5 + 2 * p.v) + p.ph * 3) % MU_SPR.petal.length];
          x.globalAlpha = .45 + .45 * p.z; x.drawImage(muSpr(fr, p.v < .6 ? C.a : muMix(C.a, C.t, .5)), Math.round(p.x), Math.round(p.y));
        }
      },
    },
    dusk: {  // Crépuscule : ciel orangé, lune, silhouettes d'arbres et d'herbes, lucioles qui clignotent
      init: (W, H) => Array.from({length: 30}, () => muP(W, H, {x: W * (.25 + Math.random() * .75), y: muAmb.G * (.45 + Math.random() * .6)})),
      back(g, W, H, C) {
        muSky(g, W, 0, H, C.bg, muMix(C.bg, C.a, .5)); const R = muSeed(3);
        for (let i = 0; i < W * H / 500; i++) { g.globalAlpha = .2 + R() * .5; g.fillStyle = C.t; g.fillRect(R() * W | 0, R() * H * .45 | 0, 1, 1); } g.globalAlpha = 1;
        const mx = Math.round(W * .84), my = Math.round(muAmb.G * .32), mr = Math.round(H * .07);
        for (let y = -mr; y <= mr; y++) for (let x = -mr; x <= mr; x++) if (x * x + y * y <= mr * mr && (x - mr * .45) ** 2 + (y + mr * .2) ** 2 > mr * mr * .8) { g.fillStyle = muMix(C.t, C.b, .25); g.fillRect(mx + x, my + y, 1, 1); }
        muPines(g, W, H, muAmb.G + H * .02, H * .1, H * .22, muMix(C.bg, '#000000', .25), 4, 11); muGrass(g, W, H, H * .06, muMix(C.bg, '#000000', .45), 8, muAmb.G + H * .06);
      },
      draw(x, W, H, C, f, t, e) {
        for (const p of muAmb.parts) {
          p.x += Math.sin(t * .5 + p.ph) * .25 * f; p.y += Math.cos(t * .4 + p.ph * 2) * .15 * f; if (p.x < -4) p.x = W + 2; if (p.x > W + 4) p.x = -2;
          const a = Math.max(0, Math.sin(t * (1 + p.v) + p.ph)) ** 2 * (.7 + .5 * e); if (a < .03) continue;
          x.globalAlpha = a * .8; x.drawImage(muGlow(C.b, 4), Math.round(p.x) - 4, Math.round(p.y) - 4); x.globalAlpha = Math.min(1, a * 1.3); x.fillStyle = muMix(C.b, C.t, .5); x.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
        }
      },
    },
    fizz: {  // Menthe : des gouttes tombent sur l'eau, vue d'en haut : des ronds nets qui s'élargissent et s'effacent, plus nombreux sur les basses
      init: () => [],
      back(g, W, H, C) { g.fillStyle = muMix(C.bg, '#000000', .25); g.fillRect(0, 0, W, H); },
      draw(x, W, H, C, f, t, e, k) {
        const P = muAmb.parts; if (Math.random() < (.2 + .4 * e) * f || k > .8) P.push({x: Math.random() * W | 0, y: Math.random() * H | 0, r: 0, m: 8 + Math.random() * 14});
        for (const p of P) {
          p.r += .35 * f; const R = Math.round(p.r); if (R < 1) continue;
          const key = 'ring' + R + C.a; let s = muAmb.spr.get(key);
          if (!s) { s = document.createElement('canvas'); s.width = s.height = R * 2 + 1; const q = s.getContext('2d'); q.fillStyle = C.a; for (let a = 0; a < 6.283; a += .5 / R) q.fillRect(Math.round(R + Math.cos(a) * R), Math.round(R + Math.sin(a) * R), 1, 1); muAmb.spr.set(key, s); }
          x.globalAlpha = .95 * (1 - p.r / p.m); x.drawImage(s, p.x - R, p.y - R);
          if (p.r > 4) { x.globalAlpha *= .5; const r2 = R - 3, s2 = muAmb.spr.get('ring' + r2 + C.a); if (s2) x.drawImage(s2, p.x - r2, p.y - r2); }
        }
        muAmb.parts = P.filter(p => p.r < p.m);
      },
    },
    gems: {  // Rubis : une surface taillée en facettes (des triangles à peine plus clairs ou plus sombres) ; un reflet passe en biais, plus vif sur les basses
      init: () => [],
      back(g, W, H, C) {
        const im = g.createImageData(W, H), w = 22, h = 18, A = muHex(muMix(C.bg, '#000000', .2)), B = muHex(C.a);
        for (let y = 0; y < H; y++) for (let x0 = 0; x0 < W; x0++) {
          const j = Math.floor(y / h), fy = (y % h) / h, xx = x0 + (j % 2) * w / 2, i = Math.floor(xx / w), fx = (xx % w) / w, tri = (i + j) % 2 ? fx + fy < 1 : fx > fy;
          const r = muSeed(i * 7919 + j * 104729 + (tri ? 1 : 0))(), k = .03 + r * .11, o = (y * W + x0) * 4;
          for (let c = 0; c < 3; c++) im.data[o + c] = Math.round(A[c] + (B[c] - A[c]) * k); im.data[o + 3] = 255;
        }
        g.putImageData(im, 0, 0);
      },
      draw(x, W, H, C, f, t, e) {
        const per = W + H + 80, p = (t * 22) % (per + 200) - 40; x.fillStyle = C.t;
        for (let y = 0; y < H; y++) { const X = Math.round(p - y * .6); x.globalAlpha = .05 + .1 * e; x.fillRect(X, y, 6, 1); x.globalAlpha = .1 + .15 * e; x.fillRect(X + 2, y, 2, 1); }
      },
    },
    aurora: {  // Glacier : la neige qui tombe en trois profondeurs, qui part de côté sur les basses ; des montagnes enneigées au loin (plus d'aurores)
      init: (W, H) => Array.from({length: Math.round(W * H / 320)}, () => ({x: Math.random() * W, y: Math.random() * H, z: Math.random() * 3 | 0, ph: Math.random() * 6.28})),
      back(g, W, H, C) {
        const G = Math.round(muAmb.G); muSky(g, W, 0, G, muMix(C.bg, '#000000', .3), muMix(C.bg, C.b, .15), 4); g.fillStyle = muMix(C.bg, '#000000', .2); g.fillRect(0, G, W, H - G);
        muRidge(g, W, H, G, H * .12, muMix(C.bg, C.s, .18), 4, .9, muMix(C.t, C.bg, .25)); muRidge(g, W, H, G + 3, H * .05, muMix(C.bg, '#000000', .15), 11, 1.6);
      },
      draw(x, W, H, C, f, t, e) {
        const fl = muSpr(MU_SPR.flake, C.t, C.b), wind = .2 + 1.2 * e;
        for (const p of muAmb.parts) {
          const z = p.z + 1; p.y += .25 * z * f; p.x += (wind * z * .4 + Math.sin(t + p.ph) * .15) * f;
          if (p.y > H + 3) { p.y = -4; p.x = Math.random() * W; } if (p.x > W + 3) p.x = -3;
          const X = Math.round(p.x), Y = Math.round(p.y); x.globalAlpha = .35 + p.z * .3;
          if (p.z === 2 && (p.ph * 10 | 0) % 4 === 0) x.drawImage(fl, X - 2, Y - 2); else { x.fillStyle = p.z ? C.t : C.s; x.fillRect(X, Y, p.z === 2 ? 2 : 1, p.z === 2 ? 2 : 1); }
        }
      },
    },
    forge: {  // Cuivre : des engrenages qui tournent lentement, emboîtés sur les bords ; ils accélèrent sur les basses
      init(W, H) {
        const L = [], R = muSeed(17), add = (x, y, r, d) => L.push({x, y, r, n: Math.max(8, Math.round(r / 2.2)), d, a: R() * 6});
        add(W * .06, H * .15, H * .2, 1); add(W * .06 + H * .37, H * .15 + H * .07, H * .13, -1); add(W * .94, H * .7, H * .26, -1); add(W * .94 - H * .45, H * .7 + H * .12, H * .15, 1); add(W * .55, H * 1.02, H * .18, 1); add(W * .55 + H * .33, H * .96, H * .11, -1);
        return L;
      },
      back(g, W, H, C) { g.fillStyle = muMix(C.bg, '#000000', .25); g.fillRect(0, 0, W, H); },
      draw(x, W, H, C, f, t, e) {
        muAmb.spin = (muAmb.spin || 0) + (.006 + .03 * e) * f;
        for (const q of muAmb.parts) {
          const a0 = q.a + muAmb.spin * q.d * 30 / q.r, n = q.n, R1 = q.r, R0 = q.r - 3; x.beginPath();
          for (let i = 0; i < n * 4; i++) { const a = a0 + i / (n * 4) * 6.2832, rr = i % 4 < 2 ? R1 : R0; x.lineTo(q.x + Math.cos(a) * rr, q.y + Math.sin(a) * rr); }
          x.closePath(); x.globalAlpha = 1; x.fillStyle = muMix(C.bg, C.a, .22); x.fill();
          x.fillStyle = muMix(C.bg, '#000000', .25); x.beginPath(); x.arc(q.x, q.y, q.r * .62, 0, 6.2832); x.fill();
          x.fillStyle = muMix(C.bg, C.a, .22); for (let s = 0; s < 4; s++) { const a = a0 + s * 1.5708; x.beginPath(); x.moveTo(q.x + Math.cos(a - .12) * 2, q.y + Math.sin(a - .12) * 2); x.lineTo(q.x + Math.cos(a - .05) * q.r * .64, q.y + Math.sin(a - .05) * q.r * .64); x.lineTo(q.x + Math.cos(a + .05) * q.r * .64, q.y + Math.sin(a + .05) * q.r * .64); x.lineTo(q.x + Math.cos(a + .12) * 2, q.y + Math.sin(a + .12) * 2); x.fill(); }
          x.beginPath(); x.arc(q.x, q.y, Math.max(2, q.r * .16), 0, 6.2832); x.fill();
        }
      },
    },
    meadow: {  // Lavande : un champ de lavande qui ondule, des papillons qui volettent, du pollen
      init(W, H) { muAmb.stalks = Array.from({length: Math.round(W * 1.2)}, () => { const x = Math.random() * W, d = Math.random() ** 1.6; return {x, d, y: muRidgeY(x, muAmb.G - H * .03, H * .05, 3, .7) + 2 + d * H * .12, ph: Math.random() * 6}; }).sort((p, q) => p.y - q.y); return [...Array.from({length: 5}, () => muP(W, H, {bf: 1, tx: Math.random() * W, ty: Math.random() * H * .7})), ...Array.from({length: 40}, () => muP(W, H))]; },
      back(g, W, H, C) { muSky(g, W, 0, H, C.bg, muMix(C.bg, C.b, .2)); muRidge(g, W, H, muAmb.G - H * .03, H * .05, muMix(C.bg, C.a, .22), 3, .7); g.fillStyle = muMix(C.bg, C.a, .15); g.fillRect(0, Math.round(muAmb.G + H * .04), W, H); },
      draw(x, W, H, C, f, t, e) {
        for (const s of muAmb.stalks) {
          const X = Math.round(s.x + Math.sin(t * .9 + s.x * .03 + s.ph * .3) * (.6 + s.d * 1.2) * (1 + e)), Y = Math.round(s.y), big = s.d > .55;
          x.globalAlpha = .45 + .5 * s.d; x.fillStyle = muMix(C.bg, C.b, .35); x.fillRect(Math.round(s.x), Y, 1, big ? 3 : 1);
          x.fillStyle = s.ph < 2 ? muMix(C.a, C.h, .45) : C.a; x.fillRect(X, Y - (big ? 3 : 1), 1, big ? 3 : 1); if (big) { x.fillStyle = muMix(C.a, C.t, .4); x.fillRect(X, Y - 4, 1, 1); }
        }
        for (const p of muAmb.parts) {
          if (p.bf) { if (Math.hypot(p.tx - p.x, p.ty - p.y) < 6) { p.tx = Math.random() * W; p.ty = Math.random() * H * .75; }
            const a = Math.atan2(p.ty - p.y, p.tx - p.x) + Math.sin(t * 3 + p.ph) * .8; p.x += Math.cos(a) * .6 * f; p.y += Math.sin(a) * .6 * f + Math.sin(t * 7 + p.ph) * .3;
            x.globalAlpha = .85; x.drawImage(muSpr(MU_SPR.fly[Math.floor(t * 8 + p.ph) & 1], p.v < .5 ? C.h : C.a, C.t), Math.round(p.x) - 2, Math.round(p.y) - 1); continue; }
          p.x += (.08 + Math.sin(t * .4 + p.ph) * .1) * f; p.y -= .04 * f; if (p.x > W + 2) p.x = -2; if (p.y < -2) p.y = H + 2;
          x.globalAlpha = .25 + .35 * Math.abs(Math.sin(t + p.ph)) + .3 * e; x.fillStyle = C.w; x.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
        }
      },
    },
    forest: {  // Forêt : trois rangées de sapins dans la brume, rayons de soleil, feuilles qui tombent en tournant, quelques lucioles
      init: (W, H) => [...Array.from({length: 30}, () => muP(W, H)), ...Array.from({length: 10}, () => muP(W, H, {ff: 1, x: W * (.25 + Math.random() * .75), y: muAmb.G * (.55 + Math.random() * .45)}))],
      back(g, W, H, C) {
        muSky(g, W, 0, H, muMix(C.bg, C.b, .1), C.bg);
        const G = muAmb.G; muPines(g, W, H, G - H * .06, H * .12, H * .24, muMix(C.bg, C.a, .18), 1, 9); muPines(g, W, H, G, H * .12, H * .26, muMix(C.bg, C.a, .1), 2, 12); muPines(g, W, H, G + H * .08, H * .14, H * .3, muMix(C.bg, '#000000', .35), 3, 16);
      },
      draw(x, W, H, C, f, t, e) {
        for (let i = 0; i < 3; i++) { const u = W * (.2 + i * .28); x.globalAlpha = .05 + .03 * Math.sin(t * .3 + i * 2) + .04 * e; x.fillStyle = C.b; x.beginPath(); x.moveTo(u, 0); x.lineTo(u + W * .05, 0); x.lineTo(u - H * .3 + W * .1, H); x.lineTo(u - H * .3, H); x.fill(); }
        for (const p of muAmb.parts) {
          if (p.ff) { p.x += Math.sin(t * .6 + p.ph) * .2 * f; p.y += Math.cos(t * .5 + p.ph) * .1 * f; const a = Math.max(0, Math.sin(t * 1.5 + p.ph)) ** 2; if (a < .05) continue; x.globalAlpha = a * .7; x.drawImage(muGlow(C.b, 3), Math.round(p.x) - 3, Math.round(p.y) - 3); continue; }
          p.y += (.25 + .4 * p.z) * f; p.x += (Math.sin(t * 1.1 + p.ph) * .5 + .1) * f; if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; }
          const fr = MU_SPR.leaf[Math.floor(t * (1 + 2 * p.v) + p.ph * 3) % 4]; x.globalAlpha = .45 + .45 * p.z;
          x.drawImage(muSpr(fr, p.v < .45 ? C.a : p.v < .8 ? C.b : muMix(C.b, C.d, .5), muMix(C.bg, '#000000', .2)), Math.round(p.x), Math.round(p.y));
        }
      },
    },
    sea: {  // Océan : des lignes de vagues sur toute la hauteur, qui roulent de gauche à droite et se creusent sur les basses
      init: () => [],
      back(g, W, H, C) { g.fillStyle = muMix(C.bg, '#000000', .3); g.fillRect(0, 0, W, H); },
      draw(x, W, H, C, f, t, e) {
        const A = 1.5 + 3 * e;
        for (let j = 0, y0 = 4; y0 < H + 6; j++, y0 += 7) {
          x.fillStyle = j % 3 ? C.b : C.a; x.globalAlpha = j % 3 ? .22 : .38;
          for (let X = 0; X < W; X += 2) { const v = Math.sin(X * .045 + t * (1 + j % 2 * .4) + j * .9); x.fillRect(X, Math.round(y0 + v * A), 2, 1); }
        }
      },
    },
    sun: {  // Soleil : de grands rayons qui partent du coin en haut à droite et tournent lentement, à peine plus clairs que le fond, plus vifs sur les basses
      init: () => [],
      back(g, W, H, C) { g.fillStyle = muMix(C.bg, '#000000', .2); g.fillRect(0, 0, W, H); },
      draw(x, W, H, C, f, t, e) {
        const cx = W * 1.02, cy = -H * .08, R = Math.hypot(W, H) * 1.2, n = 18, rot = t * .025;
        x.fillStyle = C.a; x.globalAlpha = .06 + .06 * e;
        for (let i = 0; i < n; i++) { const a = rot + i / n * 6.2832; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.lineTo(cx + Math.cos(a + .14) * R, cy + Math.sin(a + .14) * R); x.fill(); }
      },
    },
    code: {  // Cyber : de vrais caractères (3 × 5 pixels) qui tombent en colonnes, tête blanche, traînée qui s'éteint, et une bande pâle sur les basses
      init(W, H) {
        const R = muSeed(13); muAmb.gl = Array.from({length: 24}, () => Array.from({length: 5}, (_, y) => Array.from({length: 3}, (_, x) => (x === 1 && y % 2 === 0) || R() < .45 ? '#' : '.').join('')).join('|'));
        return Array.from({length: Math.round(W / 6)}, (_, i) => ({x: i * 6, y: (Math.random() * 1.6 - .4) * H, v: .5 + Math.random(), L: 6 + Math.random() * 12 | 0, g: Array.from({length: 22}, () => Math.random() * 24 | 0), c: Math.random() < .25}));
      },
      back(g, W, H, C) { g.fillStyle = muRgba(C.b, .04); for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1); },
      draw(x, W, H, C, f, t, e, k) {
        const R = muAmb.now; if (k > .9) muAmb.fx.push({y: Math.random() * H, h: 2 + Math.random() * 4 | 0, life: 1});
        for (const p of muAmb.parts) {
          p.y += p.v * (1.2 + 2 * e) * f; if (p.y - p.L * 6 > H) { p.y = -Math.random() * H * .3; p.L = 6 + Math.random() * 12 | 0; }
          if (Math.random() < .05 * f) p.g[Math.random() * p.g.length | 0] = Math.random() * 24 | 0;
          const head = Math.floor(p.y / 6);
          for (let i = 0; i < p.L; i++) { const Y = (head - i) * 6; if (Y < -6 || Y > H) continue;
            x.globalAlpha = (i ? .55 * (1 - i / p.L) + .08 : .8) * (R && p.x >= R[0] && p.x < R[2] && Y >= R[1] && Y < R[3] ? .3 : 1); x.drawImage(muSpr(muAmb.gl[p.g[(head - i + 220) % p.g.length]], i ? (p.c ? C.b : C.a) : C.t), p.x, Y); }
        }
        for (const s of muAmb.fx) { s.life -= .2 * f; if (s.life <= 0) continue; x.globalAlpha = .12 * s.life; x.fillStyle = C.b; x.fillRect(0, Math.round(s.y), W, s.h); }
      },
    },
    synth: {  // Néon : des traits de lumière qui filent sur un quadrillage, tournent à angle droit et laissent une traînée qui s'éteint ; plus rapides sur les basses
      init: (W, H) => Array.from({length: Math.max(6, Math.round(W * H / 8000))}, (_, i) => ({x: Math.round(Math.random() * W / 8) * 8, y: Math.round(Math.random() * H / 8) * 8, d: i % 4, c: i % 2, tr: [], m: 0})),
      back(g, W, H, C) { g.fillStyle = muMix(C.bg, '#000000', .35); g.fillRect(0, 0, W, H); g.fillStyle = muRgba(C.a, .06); for (let X = 0; X < W; X += 8) g.fillRect(X, 0, 1, H); for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 1); },
      draw(x, W, H, C, f, t, e) {
        const D = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        for (const p of muAmb.parts) {
          p.m += (1 + 2 * e) * f;
          while (p.m >= 1) {
            p.m--; p.x += D[p.d][0]; p.y += D[p.d][1]; p.tr.push([p.x, p.y]); if (p.tr.length > 70) p.tr.shift();
            if (p.x % 8 === 0 && p.y % 8 === 0 && Math.random() < .18) p.d = (p.d + (Math.random() < .5 ? 1 : 3)) % 4;
            if (p.x < -2 || p.x > W + 2 || p.y < -2 || p.y > H + 2) { p.x = (p.x + W) % W; p.y = (p.y + H) % H; p.x -= p.x % 8; p.y -= p.y % 8; p.tr = []; }
          }
          x.fillStyle = p.c ? C.b : C.a; p.tr.forEach(([X, Y], i) => { x.globalAlpha = (i + 1) / p.tr.length * .95; x.fillRect(X, Y, 1, 1); });
          x.globalAlpha = 1; x.fillStyle = C.t; x.fillRect(p.x, p.y, 1, 1);
        }
      },
    },
  };
  // une couche de plus sur toute la hauteur (comme les colonnes de Cyber) : les particules du thème en trois profondeurs, qui accélèrent avec les basses
  // k : dot (1 ou 2 pixels), streak (un trait dans le sens de la chute), glow (un halo), spr (des dessins de MU_SPR ; fr : une suite d'images animée)
  const MU_DEEP = {
    night: [{k: 'streak', c: ['s', 't'], n: 1.6, vx: -.8, vy: 5, a: .5}, {k: 'glow', r: [1, 3], c: ['a', 'w'], n: .12, vx: .05, tw: .4, a: .6}],
    sakura: [{k: 'spr', fr: 'petal', c: ['h', 'a', 't'], n: .6, vx: .6, vy: .7, sw: 1.2}, {k: 'dot', c: ['h', 't'], n: .6, vx: .3, vy: .2, sw: .5, tw: 1}],
    dusk: [{k: 'glow', r: [2, 3], c: ['w', 'a'], n: .35, vx: .05, vy: -.06, sw: .8, tw: 1.2}, {k: 'dot', c: ['t'], n: .8, tw: 1}],
    meadow: [{k: 'spr', fr: 'fly', c: ['b', 'a', 'w'], n: .12, vx: .35, vy: -.1, sw: 1.6}, {k: 'dot', c: ['w', 't', 'a'], n: 1, vx: .15, vy: -.12, sw: .5, tw: 1}],
    forest: [{k: 'spr', fr: 'leaf', c: ['a', 'w', 'd'], n: .35, vx: .4, vy: .55, sw: 1}, {k: 'glow', r: [1, 2], c: ['w'], n: .25, sw: .8, tw: 1.2}],
  };
  function muDeepInit(W, H, L) {
    const n = W * H / 120000;
    return (L || []).map(sp => ({sp, P: Array.from({length: Math.round(sp.n * 60 * n)}, () => ({x: Math.random() * W, y: Math.random() * H, z: .35 + Math.random() * .65, ph: Math.random() * 6.28, i: Math.random() * 999 | 0, r: Math.random()}))}));
  }
  function muDeepDraw(x, W, H, C, f, t, e, k) {
    for (const {sp, P} of muAmb.deep || []) for (const p of P) {
      const v = (1 + 2 * e) * p.z * f; p.x += (sp.vx || 0) * v + Math.cos(t * 1.3 + p.ph) * (sp.sw || 0) * .3 * f; p.y += (sp.vy || 0) * v;
      if (p.x < -14) p.x += W + 28; else if (p.x > W + 14) p.x -= W + 28;
      if (p.y < -14 || p.y > H + 14) { p.y = p.y < 0 ? H + 12 : -12; p.x = Math.random() * W; }
      const col = C[sp.c[p.i % sp.c.length]], tw = sp.tw ? .55 + .45 * Math.sin(t * (1.5 + p.r * 2) * sp.tw + p.ph) : 1;
      x.globalAlpha = Math.min(1, (.45 + .75 * p.z) * tw * (sp.a || 1) * (1 + .6 * k)); const X = Math.round(p.x), Y = Math.round(p.y);
      if (sp.k === 'dot') { x.fillStyle = col; const s = p.z > .6 ? 2 : 1; x.fillRect(X, Y, s, s); }
      else if (sp.k === 'streak') { x.fillStyle = col; const L = Math.round(3 + 6 * p.z), dx = (sp.vx || 0) / (sp.vy || 1); for (let j = 0; j < L; j++) x.fillRect(X - Math.round(j * dx), Y - j, 1, 1); }
      else if (sp.k === 'glow') { const r = Math.round(sp.r[0] + (sp.r[1] - sp.r[0]) * p.r); x.drawImage(muGlow(col, r), X - r, Y - r); x.fillStyle = col; x.fillRect(X, Y, 1, 1); }
      else { const fr = sp.fr ? MU_SPR[sp.fr] : null, rows = fr ? fr[Math.floor(t * 6 + p.ph * 3) % fr.length] : MU_SPR[sp.s[p.i % sp.s.length]]; x.drawImage(muSpr(rows, col, C.t), X, Y); }
    }
    if (k > .3) { x.globalAlpha = .1 * k; x.drawImage(muVGrad(C.a), 0, -H * .6, W, H * 1.2); }  // un coup de basse : une vague de lumière douce
  }
  const muAmbC = T => ({bg: T.BG || T.CARD, card: T.CARD, a: T.ACCENT, b: T.ACCENT_2, t: T.TEXT, s: T.SUBTEXT, w: T.WARN, d: T.DANGER, h: T.HEART || T.DANGER, n: muMix(T.BG || T.CARD, '#000000', .55)});
  // une image de l'ambiance dans la toile cv (W x H), pour l'état muAmb en cours ; bass : le niveau des basses (0 à 1)
  function muAmbDraw(cv, W, H, ms, C, bass, now) {
    const dt = Math.min(.1, (now - (muAmb.at || now)) / 1000); muAmb.at = now; muAmb.t += dt;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; muAmb.ms = ''; }
    const sc = MU_SCN[MU_AMB[ms]] || MU_SCN.space, key = ms + W + 'x' + H + Object.values(C).join('');
    if (muAmb.ms !== key) {  // un nouveau thème (ou une autre taille) : le décor est repeint, les particules recréées
      muAmb.ms = key; muAmb.spr.clear(); muAmb.fx = []; muAmb.gust = 0; muAmb.parts = sc.init(W, H, C); muAmb.deep = muDeepInit(W, H, MU_DEEP[MU_AMB[ms]]);
      const bd = muAmb.bd = document.createElement('canvas'); bd.width = W; bd.height = H; sc.back?.(bd.getContext('2d'), W, H, C);
    }
    muAmb.e = Math.max(bass, muAmb.e * .9);  // monte d'un coup sur un coup de basse, retombe doucement
    muAmb.avg = muAmb.avg * .94 + bass * .06;
    if (bass > muAmb.avg * 1.3 + .06 && now - muAmb.kAt > 220) { muAmb.kick = 1; muAmb.kAt = now; } else muAmb.kick *= .6;  // un coup de basse net : les scènes y réagissent (rafale, éclair, étincelles…)
    const x = cv.getContext('2d'); x.globalAlpha = 1; x.clearRect(0, 0, W, H); x.drawImage(muAmb.bd, 0, 0);
    sc.draw(x, W, H, C, dt * 30, muAmb.t, muAmb.e, muAmb.kick); muDeepDraw(x, W, H, C, dt * 30, muAmb.t, muAmb.e, muAmb.kick);
    muAmb.fx = muAmb.fx.filter(s => s.life > 0 && s.y < H + 20 && s.y > -40);
    x.globalAlpha = 1;
  }
  // l'ambiance dans un petit lecteur (box : son cadre, cv : sa toile au tiers), avec son propre état (st) : les scènes lisent muAmb, on l'échange le temps d'une image
  function muAmbSmall(st, box, cv, ms, T, bass, now) {
    if (now - (st.at || 0) < 33) return;
    const W = Math.ceil(box.offsetWidth / 3), H = Math.ceil(box.offsetHeight / 3); if (!W || !H) return;
    const keep = {...muAmb}; for (const k in muAmb) delete muAmb[k];
    Object.assign(muAmb, {at: 0, ms: '', parts: [], fx: [], e: 0, t: 0, kick: 0, avg: 0, kAt: 0, gust: 0, spr: new Map(), ...st, G: Math.round(H * .7), now: null});
    try { muAmbDraw(cv, W, H, ms, muAmbC(T), bass, now); }
    finally { for (const k in st) delete st[k]; Object.assign(st, muAmb); for (const k in muAmb) delete muAmb[k]; Object.assign(muAmb, keep); }
  }
  // platine:fin

  const box = el('div', 'muMini'), cv = el('canvas'), amb = el('canvas'), ambSt = {}, body = el('div', 'mmBody'), stateEl = el('span'), titleEl = el('b'), artistEl = el('span');
  const spec = el('canvas'), seek = el('div'), time = el('span'), vol = el('span'), volBox = el('div', 'mmVolBox');
  amb.id = 'mmAmb'; cv.id = 'mmDisc'; cv.width = cv.height = 184; stateEl.id = 'mmState'; titleEl.id = 'mmTitle'; artistEl.id = 'mmArtist'; spec.id = 'mmSpec'; seek.id = 'mmSeek'; time.id = 'mmTime'; vol.id = 'mmVol';
  const btn = (id, ic, tip, fn) => { const b = el('button', 'mmBtn'); b.id = id; b.innerHTML = icon(ic); b.title = tip; b.onclick = e => { e.stopPropagation(); fn(); }; return b; };
  const top = el('div', 'mmTop'), specBox = el('div', 'mmSpecBox'), bar = el('div', 'mmBar'), ctl = el('div', 'mmCtl');
  top.append(el('span', 'mmKick', 'NEOMUSIC'), stateEl, btn('mmBack', 'ext', 'Ouvrir NeoMusic', () => ctx.widget.open()));
  seek.append(el('i')); specBox.append(spec); bar.append(seek, time);
  const play = btn('mmPlay', 'play', 'Lecture / pause', () => ctx.widget.command('toggle')), fav = btn('mmFav', 'heart', 'Favori', () => ctx.widget.command('fav'));
  const vbtn = (txt, tip, cmd) => { const b = el('button', 'mmBtn', txt); b.title = tip; b.onclick = e => { e.stopPropagation(); ctx.widget.command(cmd); }; return b; };
  volBox.append(vbtn('−', 'Baisser le volume', 'voldown'), vol, vbtn('+', 'Monter le volume', 'volup'));
  ctl.append(btn('mmPrev', 'prevt', 'Morceau précédent', () => ctx.widget.command('prev')), play, btn('mmNext', 'next', 'Morceau suivant', () => ctx.widget.command('next')), fav, volBox);
  body.append(top, titleEl, artistEl, bar, ctl);  // le spectre : sous tout le lecteur, en grand (le petit lecteur l'a sous le titre)
  box.title = 'Clic : pause / lecture · Double-clic : ouvrir NeoMusic · Molette : volume';
  box.onclick = () => d?.title ? ctx.widget.command('toggle') : ctx.widget.open();
  box.ondblclick = () => ctx.widget.open();
  box.onwheel = e => { if (!d?.title) return; e.preventDefault(); ctx.widget.command(e.deltaY < 0 ? 'volup' : 'voldown'); };  // la molette règle le volume, comme sur le petit lecteur
  document.body.append(box);

  // le petit lecteur garde ses proportions et grandit (ou rétrécit) pour remplir la case du widget
  const fit = () => { box.style.zoom = 1; const k = Math.min((innerWidth - 16) / box.offsetWidth, (innerHeight - 16) / box.offsetHeight); box.style.zoom = Math.max(.5, Math.min(3, k)); };
  addEventListener('resize', fit);
  let coverKey = null;
  function paint() {
    T = d?.T || T;
    if (T) for (const [k, v] of Object.entries({ card: T.CARD, card2: T.CARD_ALT, border: T.BORDER, text: T.TEXT, sub: T.SUBTEXT, acc: T.ACCENT, acc2: T.ACCENT_2, heart: T.HEART })) if (v) box.style.setProperty('--m' + k, v);
    if (!d || !d.title || !T) { mp.cur = null; box.classList.remove('deck'); box.replaceChildren(Object.assign(el('div', 'empty'), { innerHTML: '<b>NEOMUSIC</b>Rien en cours. Clique pour choisir une musique.' })); fit(); return; }
    if (!box.contains(body)) box.replaceChildren(amb, cv, body, specBox);
    box.classList.toggle('amb', !!d.amb);
    mp.cur = d; mu.settings = d.deck || {}; muSpec.levels = d.spec || muSpec.levels;
    if (d.cover !== coverKey) {  // la pochette, comme muSetCover
      coverKey = d.cover; mp.coverImg = null;
      if (d.cover) { const img = new Image(); img.crossOrigin = 'anonymous'; img.onload = () => { if (coverKey === d.cover) mp.coverImg = img; }; img.src = 'neoplugin://neodex.music/cover/' + encodeURIComponent(d.cover); }
    }
    box.classList.toggle('deck', !!mu.settings.vinyl && muLevel().level >= 150);
    titleEl.textContent = d.title; titleEl.title = d.title; artistEl.textContent = d.artist || '';
    stateEl.textContent = d.playing ? '· LECTURE' : '· PAUSE'; stateEl.style.color = d.playing ? T.ACCENT_2 : T.WARN;
    play.innerHTML = icon(d.playing ? 'pause' : 'play');
    fav.classList.toggle('on', !!d.fav); fav.title = d.fav ? 'Retirer des favoris' : 'Ajouter aux favoris';
    vol.textContent = d.vol == null ? '' : 'VOL ' + Math.round(d.vol * 100) + ' %';
    fit();
  }
  function frame(now) {  // muMiniFrame d'index.js
    requestAnimationFrame(frame);
    if (document.hidden || !mp.cur || !T) return;
    muSpin(now);
    if (d.amb) muAmbSmall(ambSt, box, amb, d.ms || 'nova', T, d.playing ? ((muSpec.levels[0] || 0) + (muSpec.levels[1] || 0) + (muSpec.levels[2] || 0)) / 3 : 0, now);  // l'ambiance du thème (option de NeoMusic)
    if (box.classList.contains('deck')) {
      const r = cv.getBoundingClientRect(), k = devicePixelRatio || 1, w = Math.round(r.width * k), h = Math.round(r.height * k);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      const g = cv.getContext('2d'); g.clearRect(0, 0, w, h); if (w && h) muDeck(g, w, h, now, !muAudio.paused);
    } else {
      if (cv.width !== 184 || cv.height !== 184) cv.width = cv.height = 184;
      const g = cv.getContext('2d'), W = cv.width; g.clearRect(0, 0, W, W);
      if (mu.settings.vinyl) {
        const b = muPixBuf('pxMini', 46, 46), { disc } = muPixKit(b);
        disc(23, 23, 22, muCol(T.ACCENT)); muPixRecord(b, 23, 23, 20, mp.deckAng || 0, mp.coverImg); const [ox, oy] = muPixShow(g, b, W, W, 4); muSharpLabel(g, ox + 23.5 * 4, oy + 23.5 * 4, (muLabelR(20) - .5) * 4, mp.deckAng || 0, mp.coverImg, 4);
      } else if (mp.coverImg) { const im = mp.coverImg, s = Math.min(im.width, im.height); g.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, W, W); }
      else { g.fillStyle = T.CARD_ALT; g.fillRect(0, 0, W, W); g.fillStyle = T.ACCENT; g.font = 'bold 80px Consolas'; g.textAlign = 'center'; g.fillText('?', W / 2, W / 2 + 28); }
    }
    muPixSpectrum(spec, 46, now);
    const dur = d.dur || 0, p = pos();
    seek.firstChild.style.width = (dur ? Math.min(100, p / dur * 100) : 0) + '%';
    time.textContent = muClock(p) + ' / ' + muClock(dur);
  }
  requestAnimationFrame(frame);
  ctx.widget.onSize(fit);
  ctx.widget.onData(x => { d = x; paint(); });
  paint();
}
