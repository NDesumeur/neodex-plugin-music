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
    if (!r.deck || r.title !== 'Nightcall' || r.btns !== 5 || r.vol !== 'VOL 3 %') throw new Error('widget ' + size + ' : ' + JSON.stringify(r));
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
  return `page affichée · widget dessiné par le plugin : ${out.join(', ')} · Disposer : ${p.rows} lignes`;
};
