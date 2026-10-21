// Membuat salinan Code.gs yang di-sabotase untuk membuktikan jaring bekerja.
'use strict';
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'Code.gs'), 'utf8');
const out = path.join(__dirname, 'tmp');
fs.mkdirSync(out, { recursive: true });

// A: aturan "00:00" pada fmtTime dihapus
const targetA = "\n  if (out === '00:00' || out === '0') return '';\n";
if (src.indexOf(targetA) === -1) throw new Error('target fmtTime tidak ketemu');
fs.writeFileSync(path.join(out, 'Code_sabotageA.gs'), src.replace(targetA, '\n'));

// B: maps_link dihilangkan dari schedBrief (dashboard)
const targetB = "\n      maps_link: s[SC.MAPS_LINK] || ''";
if (src.indexOf(targetB) === -1) throw new Error('target maps_link tidak ketemu');
fs.writeFileSync(path.join(out, 'Code_sabotageB.gs'), src.replace(targetB, '\n'));

console.log('salinan sabotase siap di', out);
