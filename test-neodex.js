// lancé par le test « local » de NeoDex : la page de NeoMusic s'affiche (logo, liste des artistes), puis son widget sur l'accueil :
// le petit lecteur dessiné par widget.js dans sa propre iframe, aux 3 tailles, et la fenêtre « Disposer » ; captures de l'accueil
module.exports = async ({ pj, js, sleep, shot = async () => {} }) => {
  await sleep(1500);
  if (!await pj(`!!document.querySelector('.muLogo')`)) throw new Error('la page de NeoMusic ne s\'affiche pas');
  // l'iframe du widget, cherchée par son nom (« <id>:widget »)
  const wj = code => { const f = require('electron').BrowserWindow.getAllWindows().flatMap(w => w.webContents.mainFrame.framesInSubtree).find(f => f.name === 'neodex.music:widget'); if (!f) throw new Error('pas d\'iframe de widget'); return f.executeJavaScript(code); };
  // le profil de test n'a pas de morceau : les données sont posées comme muWidget() les envoie
  await js(`pluginApi(pluginInfo.get('neodex.music'), 'widget', { data: { title: 'Nightcall', artist: 'Kavinsky', playing: true, fav: true, dur: 258, pos: 96, at: Date.now(), cover: '',
    next: ['Odd Look · Kavinsky', 'Roadgame · Kavinsky', 'Protovision · Kavinsky'], theme: { card: '#1a1030', card2: '#2a1c48', border: '#3d2a66', text: '#f3eaff', sub: '#a898cc', acc: '#ff4fb8', acc2: '#ffb0e0', heart: '#ff5a8a' } } }).then(() => (showTab(null), 0))`);
  await sleep(2500);
  const out = [];
  for (const size of ['m', 's', 'l']) {
    await js(`saveLayout({homeWidgetSizes: {'neodex.music': '${size}'}}).then(() => 0)`); await sleep(900);
    const r = await wj(`(() => { const w = document.querySelector('.w'); return { size: ['s','m','l'].find(k => w?.classList.contains(k)), title: document.querySelector('.title')?.textContent, on: w?.classList.contains('on'), btns: document.querySelectorAll('.b').length, time: document.querySelector('.time')?.textContent }; })()`);
    if (r.size !== size || r.title !== 'Nightcall' || !r.on || r.btns !== 4) throw new Error('widget ' + size + ' : ' + JSON.stringify(r));
    const box = await js(`(() => { const c = document.querySelector('#wGrid .nbWidget[data-id="neodex.music"]'), b = c.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height), out: b.right > innerWidth + 1 }; })()`);
    if (box.out) throw new Error('le widget déborde : ' + JSON.stringify(box));
    await shot('widget-' + size); out.push(size.toUpperCase() + ' ' + box.w + 'x' + box.h);
  }
  await js(`saveLayout({homeWidgetSizes: {}}).then(() => 0)`);
  // un bouton du widget lance la commande du plugin (ici « fav », sans morceau : rien ne casse)
  await wj(`document.querySelector('.b.fav').click(), 0`); await sleep(500);
  await js(`$('layoutBtn').click(), 0`); await sleep(500); await shot('disposer');
  const p = await js(`(() => { const p = $('layoutPop'), r = p.getBoundingClientRect(); return { rows: p.querySelectorAll('.lyRow').length, music: [...p.querySelectorAll('.lyRow span')].some(s => s.textContent === 'NeoMusic'), out: r.right > innerWidth + 1 || r.bottom > innerHeight + 1 }; })()`);
  await js(`$('layoutPop').classList.remove('on'), 0`);
  if (p.rows < 4 || !p.music || p.out) throw new Error('Disposer : ' + JSON.stringify(p));
  return `page affichée · widget dessiné par le plugin : ${out.join(', ')} · Disposer : ${p.rows} lignes`;
};
