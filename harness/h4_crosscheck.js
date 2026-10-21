'use strict';
/*
 * h4_crosscheck.js â€” pemeriksa silang antara Code.gs dan index.html:
 * sintaks script inline, target ga('...') ada di backend, kebersihan string
 * literal (tidak ada "//" dalam string), seed Settings, markup penting, dan
 * urutan waitInvImages sebelum html2canvas.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const mock = require('./mock');

function mkSuite(label) {
  const st = { pass: 0, fail: 0 };
  return {
    ok(name, cond) {
      if (cond) { st.pass++; } else { st.fail++; console.error('  FAIL ' + name); }
    },
    eq(name, got, want) {
      const g = JSON.stringify(got), w = JSON.stringify(want);
      if (g === w) { st.pass++; } else { st.fail++; console.error('  FAIL ' + name + ' [dapat ' + g + ', hendak ' + w + ']'); }
    },
    finish() {
      console.log(label + ': ' + st.pass + '/' + (st.pass + st.fail) + ' PASS, ' + st.fail + ' FAIL');
      if (st.fail) process.exitCode = 1;
    }
  };
}

const t = mkSuite('h4_crosscheck');
const app = mock.reset(); // juga memuat Code.gs asli (atau salinan yang dioper lewat argv)
const codeText = fs.readFileSync(app.__file, 'utf8');
const htmlText = fs.readFileSync(mock.DEFAULT_INDEX_HTML, 'utf8');

// â”€â”€ Pemindai leksikal: temukan "//" di dalam string literal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Satu lexer kecil yang memahami komentar (baris & blok), string '', "", `...`,
// substitusi ${...}, dan literal REGEX /.../ (supaya tanda kutip di dalam regex
// seperti /"/ tidak diperhitungkan sebagai string). href="/" pada <head> tidak
// ikut diperiksa karena hanya JS (Code.gs dan blok <script> hasil ekstraksi
// index.html) yang dipindai.
function scanDoubleSlash(src) {
  const stack = [{ mode: 'code', brace: 1 }];
  const hits = [];
  let lastSig = '';
  let lastWord = '';
  const KEYWORDS = { return: 1, typeof: 1, instanceof: 1, new: 1, delete: 1, void: 1, in: 1, of: 1, case: 1, do: 1, else: 1, yield: 1, await: 1, throw: 1 };
  function updSig(c) {
    const isWord = /[A-Za-z0-9_$]/.test(c);
    lastWord = isWord ? lastWord + c : '';
    lastSig = c;
  }
  const ws = c => (c === ' ' || c === '\t' || c === '\n' || c === '\r');
  let i = 0;
  const top = () => stack[stack.length - 1];
  while (i < src.length) {
    const c = src[i], c2 = src[i + 1] || '';
    const m = top().mode;
    if (m === 'sq' || m === 'dq' || m === 'tpl') {
      if (c === '\\') { i += 2; continue; }
      if ((m === 'sq' && c === "'") || (m === 'dq' && c === '"')) { stack.pop(); updSig(c); i++; continue; }
      if (m === 'tpl' && c === '`') { stack.pop(); updSig(c); i++; continue; }
      if (m === 'tpl' && c === '$' && c2 === '{') { stack.push({ mode: 'sub', brace: 1 }); i += 2; continue; }
      if (c === '/' && c2 === '/') { hits.push(i); i += 2; continue; }
      i++; continue;
    }
    if (m === 'sub') {
      if (c === '{') { top().brace++; updSig(c); i++; continue; }
      if (c === '}') {
        top().brace--;
        updSig(c);
        if (top().brace === 0) { stack.pop(); }
        i++; continue;
      }
      if (c === "'") { stack.push({ mode: 'sq', brace: 0 }); updSig(c); i++; continue; }
      if (c === '"') { stack.push({ mode: 'dq', brace: 0 }); updSig(c); i++; continue; }
      if (c === '`') { stack.push({ mode: 'tpl', brace: 0 }); updSig(c); i++; continue; }
      if (c === '/' && c2 === '/') { stack.push({ mode: 'lnc', brace: 0 }); i += 2; continue; }
      if (c === '/' && c2 === '*') { stack.push({ mode: 'blk', brace: 0 }); i += 2; continue; }
      if (!ws(c)) updSig(c);
      i++; continue;
    }
    if (m === 'lnc') {
      if (c === '\n') { stack.pop(); continue; }
      i++; continue;
    }
    if (m === 'blk') {
      if (c === '*' && c2 === '/') { stack.pop(); updSig('/'); i += 2; continue; }
      i++; continue;
    }
    if (m === 'rx') {
      if (c === '\\') { i += 2; continue; }
      if (c === '\n') { stack.pop(); continue; } // pemulihan bila salah duga regex
      if (c === '[') { top().cls = true; i++; continue; }
      if (c === '/' || (c === ']' && top().cls)) { stack.pop(); updSig(c); i++; lastSig = '/'; lastWord = ''; while (i < src.length && /[a-z]/.test(src[i])) i++; continue; }
      if (c === '(') { top().brace++; i++; continue; }
      if (c === ')') { top().brace--; i++; continue; }
      i++; continue;
    }
    // mode code
    if (c === '/' && c2 === '/') { stack.push({ mode: 'lnc', brace: 0 }); i += 2; continue; }
    if (c === '/' && c2 === '*') { stack.push({ mode: 'blk', brace: 0 }); i += 2; continue; }
    if (c === '/') {
      const regexStart = (lastSig === '') || '+-=<>?&|!~/^%*{(,;:'.indexOf(lastSig) !== -1 || KEYWORDS[lastWord];
      if (regexStart) { stack.push({ mode: 'rx', brace: 0, cls: false }); updSig('/'); i++; continue; }
      updSig(c); i++; continue;
    }
    if (c === "'") { stack.push({ mode: 'sq', brace: 0 }); updSig(c); i++; continue; }
    if (c === '"') { stack.push({ mode: 'dq', brace: 0 }); updSig(c); i++; continue; }
    if (c === '`') { stack.push({ mode: 'tpl', brace: 0 }); updSig(c); i++; continue; }
    if (!ws(c)) updSig(c);
    i++;
  }
  return hits;
  return hits;
}

// â”€â”€ 1. Ekstrak blok <script> inline index.html & periksa sintaks dengan node --check â”€â”€
const blocks = [];
{
  const re = /<script>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(htmlText)) !== null) blocks.push(m[1]);
}
t.eq('index.html punya 2 blok script inline (blok kecil ~baris 18 & blok besar ~baris 2844)', blocks.length, 2);
blocks.forEach((b, i) => {
  const tmp = path.join(os.tmpdir(), 'daisafa-h4-block' + i + '-' + process.pid + '.js');
  try {
    fs.writeFileSync(tmp, b, 'utf8');
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
    t.ok('blok script #' + i + ' lolos node --check', true);
  } catch (e) {
    t.ok('blok script #' + i + ' lolos node --check â€” ' + String(e.stderr || e.message).split('\n')[0], false);
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) {}
  }
});

// â”€â”€ 2. Setiap target ga('...') harus ada fungsinya di Code.gs â”€â”€
const gaTargets = [];
{
  const re = /\bga\(\s*(['"])([A-Za-z_][\w.]*)\1/g;
  let m;
  while ((m = re.exec(htmlText)) !== null) if (gaTargets.indexOf(m[2]) === -1) gaTargets.push(m[2]);
}
t.ok('daftar target ga() wajar (dinamis, tidak di-hardcode: ' + gaTargets.length + ' target)', gaTargets.length >= 20 && gaTargets.length <= 45);
let missing = 0;
for (const name of gaTargets) {
  const ok = new RegExp('function\\s+' + name.replace(/[.]/g, '\\.') + '\\s*\\(').test(codeText);
  if (!ok) missing++;
  t.ok("ga('" + name + "') ada fungsinya di Code.gs", ok);
}

// â”€â”€ 3. Tidak ada "//" di dalam string literal kedua file â”€â”€
t.ok('Code.gs: tidak ada "//" dalam string literal', scanDoubleSlash(codeText).length === 0);
blocks.forEach((b, i) => {
  t.ok('index.html blok #' + i + ': tidak ada "//" dalam string literal', scanDoubleSlash(b).length === 0);
});

// â”€â”€ 4. Seed Settings: 16 kunci unik; daftar allowlist memadai â”€â”€
const stRows = app.__ss.getSheetByName('Settings')._data.slice(1);
const seedKeys = stRows.map(r => String(r[1]));
t.eq('seed Settings berisi 16 kunci', seedKeys.filter(Boolean).length, 16);
t.eq('semua kunci seed unik', new Set(seedKeys).size === 16, true);
t.eq('business_name = Daisafacare', seedKeys.indexOf('business_name') !== -1 && app.getSettings().data.business_name === 'Daisafacare', true);
t.eq('nilai tertentu tersedia (telepon, prefix, tarif, kaki invoice)', [app.getSetting('business_phone', ''), app.getSetting('invoice_prefix', ''), String(app.getSetting('transport_rate_per_km', ''))].join('|'), '0822-3212-1081|DSF|2000');
t.eq('logo_url & qris_url default Cloudinary', [t0(app.getSetting('logo_url', '')), t0(app.getSetting('qris_url', ''))].join('|'), 'logo|qris');
function t0(v) {
  if (String(v).indexOf('LOGO_DAISAFACARE_NO_TEXT') !== -1) return 'logo';
  if (String(v).indexOf('QRIS_DAISAFA_CARE') !== -1) return 'qris';
  return '?';
}
{
  const mall = codeText.match(/const allowed = \[([^\]]*)\]/);
  const allowKeys = mall ? (mall[1].match(/'([^']+)'/g) || []).map(s => s.slice(1, -1)) : [];
  t.eq('allowlist saveAllSettings sama kuncinya dengan seed', JSON.stringify(allowKeys.slice().sort()), JSON.stringify(seedKeys.slice().sort()));
}

// â”€â”€ 5. setupSheets tidak bisa dipanggil dari endpoint mana pun â”€â”€
{
  const occ = [...codeText.matchAll(/setupSheets\s*\(/g)];
  t.ok('setupSheets hanya ada pada definisinya (' + occ.length + ' kemunculan, tanpa pemanggil)',
    occ.length >= 1 && occ.every(m => codeText.slice(Math.max(0, m.index - 9), m.index) === 'function '));
}

// â”€â”€ 6. Serialisasi tanggal getSheetDataClient selalu string â”€â”€
const s8 = app.getSchedules(1, 'admin', {}).data.filter(s => s.id === 8)[0];
t.ok('baris seed bertanggal objek Date dilayani sebagai teks yyyy-MM-dd', /^\d{4}-\d{2}-\d{2}$/.test(s8.schedule_date));
const lg = app.getLogs(1, 'admin', 10).data[0];
t.ok('getLogs mengembalikan waktu sebagai teks ISO lokal', typeof lg.created_at === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(lg.created_at));
t.ok('getClients/getSchedules tetap JSON-aman', mock.deepScan(app.getCustomers(1, 'admin')).length === 0 && mock.deepScan(app.getDashboardStats(1, 'admin')).length === 0);

// â”€â”€ 7. Markup penting di index.html â”€â”€
t.eq('pemilih pelanggan modal booking: fCustSearch/fCustResults/fCustPicked',
  ['fCustSearch', 'fCustResults', 'fCustPicked'].every(id => (htmlText.match(new RegExp('id="' + id + '"', 'g')) || []).length === 1), true);
t.eq('pemilih pelanggan modal paket: pCustSearch/pCustResults/pCustPicked',
  ['pCustSearch', 'pCustResults', 'pCustPicked'].every(id => (htmlText.match(new RegExp('id="' + id + '"', 'g')) || []).length === 1), true);
t.eq('custPhoneShow didefinisikan sekali', (htmlText.match(/function custPhoneShow\(/g) || []).length, 1);
t.ok('custPhoneShow dipakai baris daftar & chip terpilih', (htmlText.match(/custPhoneShow\(/g) || []).length >= 3);
t.ok('templat invoice memuat blok QRIS', htmlText.indexOf('inv-qris-row') !== -1 && htmlText.indexOf('Scan untuk bayar') !== -1);
t.ok('templat invoice memuat cabang tanda tangan', htmlText.indexOf('inv-signature') !== -1 && /\$\{sigShow\s*\?/.test(htmlText));
t.ok('markup slide pricelist memuat pls-cols', htmlText.indexOf('pls-cols') !== -1);
{
  const h2s = [...htmlText.matchAll(/html2canvas\(/g)];
  t.ok('ada 2 pemakaian html2canvas (pricelist & invoice)', h2s.length === 2);
  t.ok('setiap html2canvas didahului waitInvImages di ekspresi yang sama',
    h2s.every(m => htmlText.slice(Math.max(0, m.index - 400), m.index).includes('waitInvImages(')));
}

// â”€â”€ 8. tautan silang kecil lain: endpoint yang dilayani web app tidak nol â”€â”€
t.ok('daftar ga() mencakup endpoint uang penting', ['addSchedule', 'addSchedulePayment', 'createSchedulePackage', 'getDashboardStats', 'saveAllSettings'].every(n => gaTargets.indexOf(n) !== -1));

t.finish();

