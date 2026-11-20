// lancé par le test « local » de NeoDex : la page de NeoMusic s'affiche (logo, liste des artistes), puis son widget sur l'accueil :
// exactement le petit lecteur (ici avec la platine du niveau 150) dessiné par widget.js dans sa propre iframe, aux 3 tailles, puis le simple disque, et la fenêtre « Disposer » ; captures de l'accueil
module.exports = async ({ pj, js, sleep, shot = async () => {} }) => {
  await sleep(1500);
  if (!await pj(`!!document.querySelector('.muLogo')`)) throw new Error('la page de NeoMusic ne s\'affiche pas');
  // l'iframe du widget, cherchée par son nom (« <id>:widget »)
  const wj = code => { const f = require('electron').BrowserWindow.getAllWindows().flatMap(w => w.webContents.mainFrame.framesInSubtree).find(f => f.name === 'neodex.music:widget'); if (!f) throw new Error('pas d\'iframe de widget'); return f.executeJavaScript(code); };
  // le profil de test n'a pas de morceau : les données sont posées comme muWidget() les envoie
  await js(`pluginApi(pluginInfo.get('neodex.music'), 'widget', { data: { title: 'Nightcall', artist: 'Kavinsky', playing: true, fav: true, dur: 258, pos: 96, at: Date.now(), cover: '',
    T: { CARD: '#1a1030', CARD_ALT: '#2a1c48', BORDER: '#3d2a66', TEXT: '#f3eaff', SUBTEXT: '#a898cc', ACCENT: '#ff4fb8', ACCENT_2: '#7dffb0', HEART: '#ff5a8a', WARN: '#ffc861', DANGER: '#ff5a5a' },
    deck: { vinyl: true, deckBase: 'Noyer', deckArm: 'Or' }, level: 160, vol: .03, spec: Array.from({ length: 32 }, (_, i) => Math.abs(Math.sin(i * .7)) * .8) } }).then(() => (showTab(null), 0))`);
  await sleep(2500);
  const out = [];
  for (const size of ['m', 's', 'l']) {
    await js(`saveLayout({homeWidgetSizes: {'neodex.music': '${size}'}}).then(() => 0)`); await sleep(900);
    const r = await wj(`(() => { const w = document.querySelector('.muMini'); return { deck: w?.classList.contains('deck'), title: document.querySelector('#mmTitle')?.textContent, btns: document.querySelectorAll('.mmBtn').length, vol: document.querySelector('#mmVol')?.textContent, time: document.querySelector('#mmTime')?.textContent }; })()`);
    if (!r.deck || r.title !== 'Nightcall' || r.btns !== 7 || r.vol !== 'VOL 3 %') throw new Error('widget ' + size + ' : ' + JSON.stringify(r));
    const box = await js(`(() => { const c = document.querySelector('#wGrid .nbWidget[data-id="neodex.music"]'), b = c.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), out: b.right > innerWidth + 1 }; })()`);
    if (box.out) throw new Error('le widget déborde : ' + JSON.stringify(box));
    await shot('widget-' + size); out.push(size.toUpperCase() + ' ' + box.w + 'x' + box.h);
  }
  await js(`saveLayout({homeWidgetSizes: {}}).then(() => 0)`);
  // sans la platine : le disque seul, comme le petit lecteur
  await js(`pluginApi(pluginInfo.get('neodex.music'), 'widget', { data: { ...pluginWidgets['neodex.music'].data, deck: { vinyl: true }, level: 40, at: Date.now() } }).then(() => 0)`); await sleep(900);
  if (await wj(`document.querySelector('.muMini').classList.contains('deck')`)) throw new Error('widget : la platine reste sans le niveau 150'); await shot('widget-disque');
  // un bouton du widget lance la commande du plugin (ici « fav », sans morceau : rien ne casse)
  await wj(`document.querySelector('#mmFav').click(), 0`); await sleep(500);
  await js(`$('layoutBtn').click(), 0`); await sleep(500); await shot('disposer');
  const p = await js(`(() => { const p = $('layoutPop'), r = p.getBoundingClientRect(); return { rows: p.querySelectorAll('.lyRow').length, music: [...p.querySelectorAll('.lyRow span')].some(s => s.textContent === 'NeoMusic'), out: r.right > innerWidth + 1 || r.bottom > innerHeight + 1 }; })()`);
  await js(`$('layoutPop').classList.remove('on'), 0`);
  if (p.rows < 4 || !p.music || p.out) throw new Error('Disposer : ' + JSON.stringify(p));
  // le bouton + du widget monte le volume de NeoMusic (commande « volup »), qui renvoie le nouveau volume au widget
  const v0 = await js(`pluginWidgets['neodex.music'].data.vol`);
  await wj(`[...document.querySelectorAll('.mmVolBox .mmBtn')].pop().click(), 0`); await sleep(800);
  const v1 = await js(`pluginWidgets['neodex.music'].data?.vol`);
  if (!(v1 > v0) && v0 !== 1) throw new Error('le + du widget ne monte pas le volume : ' + v0 + ' → ' + v1);
  // l'accueil affiché avec le widget : NeoMusic le sait (et y garde son petit lecteur caché)
  const pf = require('electron').BrowserWindow.getAllWindows().flatMap(w => w.webContents.mainFrame.framesInSubtree).find(f => f.name === 'neodex.music');
  await js(`pluginTabChange(), 0`); await sleep(300);
  const homeW = pf ? await pf.executeJavaScript(`document.body.classList.contains('homeW')`) : 'pas de frame';
  if (homeW !== true) throw new Error('NeoMusic ne sait pas que son widget est sur l’accueil : ' + homeW);
  // Options : 4 onglets, sans les réglages retirés, plus de bouton SAUVEGARDER ni de MuPlayer ; la liste vide dit quoi faire ; chaque réglage gardé dès qu'il change, la police choisie, l'export en QR codes
  const opt = `[...document.querySelectorAll('.muSideBtn')].find(b => b.textContent === 'Options').click()`, txt = `document.querySelector('.muWin').textContent`;
  await pf.executeJavaScript(opt); await sleep(300);
  const o = await pf.executeJavaScript(`(() => { const t = ${txt}, c = document.querySelector('.muWin input[type=checkbox]'), was = c.checked; c.click();
    [...document.querySelectorAll('.muWin .muBtn')].find(b => b.textContent === 'Ronde').click(); return { save: t.includes('SAUVEGARDER'), mup: /MUPLAYER|CAPSULE/.test(t), qr: t.includes('EXPORTER EN QR CODE'), was, tabs: document.querySelectorAll('.muWin .muOptTab').length, old: /Fondu de la pochette|même quand le widget|date de sortie des musiques/.test(t), empty: !!document.querySelector('.muEmpty') }; })()`); await sleep(300);
  await pf.executeJavaScript(`document.querySelector('.muWin .muWinBar button').click()`); await pf.executeJavaScript(opt); await sleep(300);
  const o2 = await pf.executeJavaScript(`({ now: document.querySelector('.muWin input[type=checkbox]').checked, font: getComputedStyle(document.getElementById('mu')).getPropertyValue('--mfont') })`);
  await pf.executeJavaScript(`document.querySelector('.muWin input[type=checkbox]').click(), [...document.querySelectorAll('.muWin .muBtn')].find(b => b.textContent === 'Celle du thème').click(), document.querySelector('.muWin .muWinBar button').click()`);
  if (o.save || o.mup || !o.qr || o.tabs !== 4 || o.old || !o.empty || o2.now === o.was || !o2.font.includes('Pixelify')) throw new Error('Options : ' + JSON.stringify({ ...o, ...o2 }));
  // l'ambiance du thème : la toile derrière l'appli se dessine (des pixels non transparents)
  { await sleep(600); const px = await pf.executeJavaScript(`(() => { const c = document.getElementById('muAmb'); if (!c || !c.width) return -1; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; })()`);
    if (!(px > 20)) throw new Error('ambiance du thème : ' + px + ' pixels dessinés'); }
  // chaque thème a son décor : fond et cartes différents d'un thème à l'autre (captures « theme-<nom> »)
  await js(`newTab('plugin:neodex.music'), 0`); await sleep(800);
  const looks = new Set(), ms = ['nova', 'onyx', 'grenat', 'aube', 'ambre', 'abyme', 'sakura', 'crepuscule', 'menthe', 'rubis', 'glacier', 'cuivre', 'lavande', 'foret', 'ocean', 'soleil', 'cyber', 'neon'];
  if (await pf.executeJavaScript(`document.getElementById('mu').dataset.ms`) !== 'nova') throw new Error('thème : pas de décor data-ms');
  for (const m of ms) {
    looks.add(await pf.executeJavaScript(`(() => { const mu = document.getElementById('mu'); mu.dataset.ms = '${m}'; const c = getComputedStyle(document.querySelector('.muCard')); return getComputedStyle(mu).backgroundImage + '|' + c.borderRadius + c.borderLeftWidth + c.clipPath + c.boxShadow; })()`));
    if (['nova', 'ambre', 'rubis', 'cuivre', 'cyber', 'neon'].includes(m)) { await sleep(200); await shot('theme-' + m); }
  }
  if (looks.size !== ms.length) throw new Error('thèmes : seulement ' + looks.size + ' décors différents sur ' + ms.length);
  // en Deluxe aussi, le fond change avec le thème (3.3.5)
  const lux = new Set(); await pf.executeJavaScript(`document.getElementById('mu').classList.add('lux', 'px')`);
  for (const m of ms) { lux.add(await pf.executeJavaScript(`(() => { const mu = document.getElementById('mu'); mu.dataset.ms = '${m}'; return getComputedStyle(mu).backgroundImage; })()`)); if (['ambre', 'neon'].includes(m)) { await sleep(200); await shot('deluxe-' + m); } }
  await pf.executeJavaScript(`document.getElementById('mu').classList.remove('lux', 'px'), document.getElementById('mu').dataset.ms = 'nova'`);
  if (lux.size !== ms.length) throw new Error('Deluxe : seulement ' + lux.size + ' fonds différents sur ' + ms.length);
  return `options enregistrées toutes seules, police ${o2.font}, export QR · page affichée · widget dessiné par le plugin : ${out.join(', ')} · Disposer : ${p.rows} lignes · volume ${v0} → ${v1} · petit lecteur caché sur l'accueil`;
};
