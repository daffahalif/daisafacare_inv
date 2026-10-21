'use strict';
/*
 * run_all.js — menjalankan keempat file harness dan mencetak satu baris hasil
 * per file, contoh: h1_read: 64/64 PASS, 0 FAIL. Keluar non-nol bila ada FAIL.
 *
 * Pakai:  $env:TZ='Asia/Jakarta'; node harness\run_all.js
 * Uji sabotase: node harness\run_all.js <path\ke\SalinanCode.gs>
 *   (path opsional diteruskan ke semua file; mock.js memakainya menggantikan
 *    Code.gs asli, jadi jaring dapat mengapit regresi pada salinan percobaan.)
 */
process.env.TZ = process.env.TZ || 'Asia/Jakarta';

const { spawnSync } = require('child_process');
const path = require('path');

const files = ['h1_read.js', 'h2_write.js', 'h3_packages.js', 'h4_crosscheck.js'];
const override = process.argv[2] || '';
let failed = false;

for (const f of files) {
  const args = override ? [path.join(__dirname, f), path.resolve(override)] : [path.join(__dirname, f)];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 300000 });
  const lines = String(r.stdout || '').trim().split(/\r?\n/).filter(Boolean);
  const line = lines.length ? lines[lines.length - 1]
    : ('CRASH: ' + String(r.stderr || (r.error && r.error.message) || 'tanpa keluaran').trim().split(/\r?\n/).pop());
  console.log(line);
  const ok = r.status === 0 && /, 0 FAIL$/.test(line) && !/^CRASH/.test(line);
  if (!ok) failed = true;
}

process.exit(failed ? 1 : 0);
