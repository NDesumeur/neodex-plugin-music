// node tools/widget-sync.js : recopie dans widget.js le dessin de la platine, du disque et du spectre du petit lecteur
// (les blocs « platine:début / platine:fin » d'index.js), pour que le widget de l'accueil soit exactement le même lecteur.
// À relancer après chaque changement de ces blocs ; --check : dit seulement si widget.js est à jour (code 1 sinon).
const fs = require('fs'), path = require('path'), dir = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(dir, 'index.js'), 'utf8').replace(/\r\n/g, '\n');
const blocks = [...src.matchAll(/\/\/ platine:début[^\n]*\n([\s\S]*?)\n\s*\/\/ platine:fin/g)].map(m => m[1]);
if (blocks.length < 3) { console.error('index.js : blocs « platine » introuvables'); process.exit(2); }
const W = path.join(dir, 'widget.js'), w = fs.readFileSync(W, 'utf8');
const body = '  // platine:début (copié d\'index.js par tools/widget-sync.js : ne pas modifier ici)\n' + blocks.join('\n') + '\n  // platine:fin';
const out = w.replace(/ {2}\/\/ platine:début[\s\S]*?\/\/ platine:fin/, () => body);
if (out === w) { console.log('widget.js déjà à jour'); process.exit(0); }
if (process.argv.includes('--check')) { console.error('widget.js n\'est pas à jour : node tools/widget-sync.js'); process.exit(1); }
fs.writeFileSync(W, out); console.log('widget.js mis à jour (' + blocks.length + ' blocs)');
