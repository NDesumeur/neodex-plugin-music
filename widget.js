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
  // platine:fin

  const box = el('div', 'muMini'), cv = el('canvas'), body = el('div', 'mmBody'), stateEl = el('span'), titleEl = el('b'), artistEl = el('span');
  const spec = el('canvas'), seek = el('div'), time = el('span'), vol = el('span'), volBox = el('div', 'mmVolBox');
  cv.id = 'mmDisc'; cv.width = cv.height = 184; stateEl.id = 'mmState'; titleEl.id = 'mmTitle'; artistEl.id = 'mmArtist'; spec.id = 'mmSpec'; seek.id = 'mmSeek'; time.id = 'mmTime'; vol.id = 'mmVol';
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
    if (!box.contains(body)) box.replaceChildren(cv, body, specBox);
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
