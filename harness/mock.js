'use strict';
/*
 * In-memory Google Sheets fixture bagi harness regresi DaisafaCare.
 *
 * File Code.gs YANG ASLI dimuat lewat vm.runInContext, lalu dijalankan di atas
 * stub SpreadsheetApp / LockService / Utilities / Session / Logger / HtmlService.
 * Tidak ada satupun logika aplikasi yang ditiru di sini — kalau aplikasi rusak,
 * harness ikut rusak (inilah tujuannya).
 *
 * Data meniru workbook produksi (DAISAFACARE - INVOICE WEB APP.xlsx):
 * - Settings 15 kunci persis, Treatment 26 baris aktif, 4 pelanggan
 *   (dua telepon legacy numerik tanpa nol depan), sejumlah booking.
 *
 * reset() menanam ulang seluruh seed, jadi tiap file harness mulai dari keadaan sama.
 * reset() juga menerima path opsional ke file .gs (dipakai uji sabotase).
 *
 * Dua jebakan nyata yang direplikasi:
 * 1. Baca data selalu lewat getSheetDataClient (uviversal serialisasi format klien,
 *    tidak pernah mengirim objek Date mentah). Tanggal satu baris seed sengaja
 *    disimpan sebagai objek Date beneran (dibuat di realm aplikasi via __newDate).
 * 2. Jam dibaca dari getScheduleTimeById pakai getDisplayValues (teks tampilan),
 *    jadi "00:00" / angka 0 harus berubah jadi string kosong lewat fmtTime.
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const DEFAULT_CODE_GS = path.join(__dirname, '..', 'Code.gs');
const DEFAULT_INDEX_HTML = path.join(__dirname, '..', 'index.html');

// ─── util tanggal lokal (harness dan app jalan di TZ Asia/Jakarta) ────────────
function pad2(n) { return String(n).padStart(2, '0'); }
function localDateStr(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}
function addDaysLocal(dateStr, days) {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10) + days);
  return localDateStr(d);
}
function ymd8(dateStr) { return dateStr.replace(/-/g, ''); }

// ─── stub spreadsheet (grid 2D sederhana) ─────────────────────────────────────
class MockRange {
  constructor(sh, row, col, numRows, numCols) {
    this._sh = sh;
    this._row = row;
    this._col = col;
    this._nr = numRows;
    this._nc = numCols;
  }
  getValues() {
    const out = [];
    for (let r = 0; r < this._nr; r++) {
      const line = [];
      const src = this._sh._data[this._row + r - 1];
      for (let c = 0; c < this._nc; c++) {
        const v = src ? src[this._col + c - 1] : undefined;
        line.push(v === undefined || v === null ? '' : v);
      }
      out.push(line);
    }
    return out;
  }
  getDisplayValues() {
    // Angka tampil apa adanya (0 → "0"); tanggal sebagai yyyy-MM-dd; sisanya teks.
    return this.getValues().map(row => row.map(v => {
      if (v instanceof Date) return localDateStr(v) + ' ' + pad2(v.getHours()) + ':' + pad2(v.getMinutes());
      if (typeof v === 'number') return String(v);
      return v === null || v === undefined ? '' : String(v);
    }));
  }
  setValues(matrix) {
    matrix.forEach((line, r) => {
      const rowIdx = this._row + r;
      while (this._sh._data.length < rowIdx) this._sh._data.push([]);
      const src = this._sh._data[rowIdx - 1];
      while (src.length < this._col - 1 + line.length) src.push('');
      line.forEach((v, c) => { src[this._col - 1 + c] = (v === undefined || v === null) ? '' : v; });
    });
    return this;
  }
  setValue(v) { return this.setValues([[v]]); }
  setNumberFormat() { return this; }
  setFontWeight() { return this; }
  setBackground() { return this; }
  setFontColor() { return this; }
}

class MockSheet {
  constructor(name) {
    this._name = name;
    this._data = []; // baris 0 = header (sheet row 1), data mulai sheet row 2
  }
  get name() { return this._name; }
  getLastRow() { return this._data.length; }
  getLastColumn() { return this._data.reduce((m, r) => Math.max(m, r.length), 0); }
  getMaxColumns() { return Math.max(26, this.getLastColumn()); }
  getMaxRows() { return Math.max(1000, this.getLastRow()); }
  insertColumnsAfter(afterCol, howMany) {
    const w = Math.max(afterCol, this.getMaxColumns()) + howMany;
    this._data.forEach(r => { while (r.length < w) r.push(''); });
    return this;
  }
  getRange(row, col, numRows, numCols) {
    return new MockRange(this, row, col, numRows || 1, numCols || 1);
  }
  appendRow(arr) { this._data.push(arr.slice()); return this; }
  deleteRow(rowPosition) {
    if (rowPosition >= 1 && rowPosition <= this._data.length) this._data.splice(rowPosition - 1, 1);
    return this;
  }
  setFrozenRows() { return this; }
  getDataRange() {
    return new MockRange(this, 1, 1, this.getLastRow(), this.getLastColumn());
  }
}

class MockSpreadsheet {
  constructor() { this._sheets = []; this._byName = new Map(); }
  getSheetByName(n) { return this._byName.get(n) || null; }
  getSheets() { return this._sheets.slice(); }
  insertSheet(name) {
    const sh = new MockSheet(name);
    this._sheets.push(sh);
    this._byName.set(name, sh);
    return sh;
  }
  deleteSheet(sh) {
    const i = this._sheets.indexOf(sh);
    if (i !== -1) this._sheets.splice(i, 1);
    if (sh && this._byName.get(sh._name) === sh) this._byName.delete(sh._name);
  }
}

// ─── stub layanan Apps Script lain ────────────────────────────────────────────
function makeLockFactory() {
  const state = { held: false };
  return function getScriptLock() {
    return {
      waitLock() { state.held = true; },
      releaseLock() { state.held = false; },
      hasLock() { return state.held; }
    };
  };
}

function makeUtilities() {
  // Meniru Utilities.formatDate untuk pola yang dipakai Code.gs
  // ('yyyy-MM-dd', 'HH:mm', "yyyy-MM-dd'T'HH:mm:ss"). Waktu memakai jam lokal,
  // kontras dengan TZ Asia/Jakarta yang diset sebelum menjalankan node.
  function formatDate(d, tz, pattern) {
    const p = String(pattern).replace(/'/g, '');
    return p
      .replace(/yyyy/g, String(d.getFullYear()))
      .replace(/MM/g, pad2(d.getMonth() + 1))
      .replace(/dd/g, pad2(d.getDate()))
      .replace(/HH/g, pad2(d.getHours()))
      .replace(/mm/g, pad2(d.getMinutes()))
      .replace(/ss/g, pad2(d.getSeconds()));
  }
  return { formatDate, sleep() {}, computeDigest() { return []; }, newUuid() { return 'uuid'; } };
}

// ─── muat Code.gs ke vm ───────────────────────────────────────────────────────
function createApp(codePath, ss) {
  const src = fs.readFileSync(codePath, 'utf8');
  const sandbox = {
    console: console,
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    LockService: { getScriptLock: makeLockFactory() },
    Utilities: makeUtilities(),
    Session: { getScriptTimeZone: () => 'Asia/Jakarta' },
    Logger: { log() {} },
    HtmlService: {
      createHtmlOutputFromFile: () => ({
        setTitle() { return this; },
        setXFrameOptionsMode() { return this; },
        addMetaTag() { return this; }
      }),
      XFrameOptionsMode: { ALLOWALL: 1 }
    }
  };
  const ctx = vm.createContext(sandbox);
  vm.runInContext(src, ctx, { filename: codePath });
  // Deklarasi fungsi top-level otomatis nempel di context; ekspor const pemetaan
  // kolom dan pembuat Date dari realm aplikasi (supaya `instanceof Date` di
  // dalam aplikasi tetap benar untuk sel seed bertanggal).
  vm.runInContext([
    'this.__newDate = function (y, mo, d, h, mi) { return new Date(y, mo, d, h || 0, mi || 0); };',
    'this.__consts = { SHEETS: SHEETS, SC: SC, CU: CU, TR: TR, U: U, SI: SI, PAY: PAY, ST: ST, L: L };'
  ].join('\n'), ctx);
  sandbox.__text = src;
  sandbox.__file = codePath;
  return sandbox;
}

// ─── seed data (cermin workbook produksi) ─────────────────────────────────────
const J = String.fromCharCode(47, 47); // '//' tanpa dua slash berturut di string literal
const LOGO_URL = 'https:' + J + 'res.cloudinary.com/dlrxxfy7f/image/upload/w_320,q_auto:good,f_png/v1792500542/LOGO_DAISAFACARE_NO_TEXT-removebg-preview_yyopiu.png';
const QRIS_URL = 'https:' + J + 'res.cloudinary.com/dlrxxfy7f/image/upload/w_500,q_auto:best,f_png/v1792500651/QRIS_DAISAFA_CARE_srnnbg.png';

function settingsRows(TS) {
  return [
    [1, 'business_name', 'Daisafacare', 1, TS],
    [2, 'business_tagline', 'Mom & Baby Treatment', 1, TS],
    [3, 'business_phone', '0822-3212-1081', 1, TS],
    [4, 'business_address', '', 1, TS],
    [5, 'business_instagram', '@daisafacare', 1, TS],
    [6, 'business_tiktok', '@daisafacare', 1, TS],
    [7, 'payment_info', 'BCA 3530674729 a.n Syifa Rasalhague or QRIS', 1, TS],
    [8, 'currency_symbol', 'Rp', 1, TS],
    [9, 'invoice_prefix', 'DSF', 1, TS],
    [10, 'transport_rate_per_km', '2000', 1, TS],
    [11, 'invoice_footer', 'Terima kasih telah mempercayakan si kecil kepada kami.', 1, TS],
    [12, 'last_invoice_no', '', 1, TS],
    [13, 'logo_url', LOGO_URL, 1, TS],
    [14, 'qris_url', QRIS_URL, 1, TS],
    [15, 'signature_url', '', 1, TS]
  ];
}

function treatmentRows(TS) {
  const d = ['', 'Baby', 'Kids', 'Mom', 'Jaga'];
  const t = (id, cat, name, price, dur) => [id, cat, name, d[0], price, dur, 1, 1, TS];
  return [
    t(1, 'Baby', 'Sleep Booster', 85000, 60),
    t(2, 'Baby', 'GTM', 100000, 60),
    t(3, 'Baby', 'Bapil', 105000, 60),
    t(4, 'Baby', 'Kolik', 100000, 60),
    t(5, 'Kids', 'Sleep Booster', 100000, 60),
    t(6, 'Kids', 'GTM', 100000, 60),
    t(7, 'Kids', 'Bapil', 115000, 60),
    t(8, 'Kids', 'Kolik', 115000, 60),
    t(9, 'Jaga', 'Jaga 2 Jam', 75000, 120),
    t(10, 'Jaga', 'Jaga 4 Jam', 140000, 240),
    t(11, 'Jaga', 'Jaga 6 Jam', 200000, 360),
    t(12, 'Jaga', 'Jaga 8 Jam', 250000, 480),
    t(13, 'NB 1x', '1 Hari', 70000, 60),
    t(14, 'NB 1x', '3 Hari', 205000, 60),
    t(15, 'NB 1x', '7 Hari', 485000, 60),
    t(16, 'NB 1x', '14 Hari', 980000, 60),
    t(17, 'NB 2x', '1 Hari', 130000, 60),
    t(18, 'NB 2x', '3 Hari', 380000, 60),
    t(19, 'NB 2x', '7 Hari', 800000, 60),
    t(20, 'NB 2x', '14 Hari', 1600000, 60),
    t(21, 'Mom', 'Laktasi', 125000, 60),
    t(22, 'Mom', 'Nifas', 150000, 90),
    t(23, 'Mom', 'Hamil', 135000, 60),
    t(24, 'Mom', 'Selapan Afiyah', 65000, 60),
    t(25, 'Mom', 'Selapan Rahmah', 145000, 60),
    t(26, 'Baby', 'Cukur', 30000, 30)
  ];
}

function buildSpreadsheet() {
  const now = new Date();
  const today = localDateStr(now);
  const tomorrow = addDaysLocal(today, 1);
  const TS = now.toISOString();

  const ss = new MockSpreadsheet();

  // Users: id, full_name, email, phone, password, role, is_active, created_at, updated_at
  ss.insertSheet('Users').appendRow(['ID', 'Full Name', 'Email', 'Phone', 'Password', 'Role', 'Is Active', 'Created At', 'Updated At']);
  ss.getSheetByName('Users').appendRow([1, 'Admin Daisafa', 'admin@daisafacare.com', '0822-3212-1081', 'admin123', 'admin', 1, TS, TS]);
  ss.getSheetByName('Users').appendRow([2, 'Terapis Sinta', 'terapis@daisafacare.com', '081234567892', 'terapis123', 'therapist', 1, TS, TS]);
  ss.getSheetByName('Users').appendRow([3, 'Resepsionis Rara', 'resepsionis@daisafacare.com', '081234567893', 'resep123', 'receptionist', 1, TS, TS]);

  // Customers (15 kolom): dua telepon legacy NUMERIK tanpa nol depan,
  // satu sudah rapi berformat 08xx-xxxx-xxxx, satu gaya walk-in kosong semua.
  ss.insertSheet('Customers').appendRow(['ID', 'Name', 'Phone', 'Address', 'Baby Name', 'Baby Age', 'Notes', 'Total Purchase', 'Total Paid', 'Total Due', 'Is Active', 'Created By', 'Created At', 'Tanggal Lahir', 'Maps Link']);
  [
    [1, 'Bunda Sari', 82136267808, 'Kalisari Dharma', 'Bayi Ayla', '3 bulan', '', 97000, 85000, 12000, 1, 1, TS, '2025-04-10', 'goo.gl/maps-sari'],
    [2, 'Bunda Kirana', 85633221199, 'Jalan Bogangin Baru Blok I No.14a', 'Bayi Vian', '2 bulan', '', 130000, 30000, 100000, 1, 1, TS, '', 'goo.gl/maps-kirana'],
    [3, 'Bunda Dewi', '0813-5555-1212', 'Educity Apartemen', 'Bayi Chandra', '1 bulan', 'Alergi minyak telon', 452000, 452000, 0, 1, 1, TS, '2025-11-02', ''],
    [4, '', '', '', '', '', '', 0, 0, 0, 1, 1, TS, '', '']
  ].forEach(r => ss.getSheetByName('Customers').appendRow(r));

  ss.insertSheet('Treatments').appendRow(['ID', 'Category', 'Name', 'Description', 'Price', 'Duration (min)', 'Is Active', 'Created By', 'Created At']);
  treatmentRows(TS).forEach(r => ss.getSheetByName('Treatments').appendRow(r));

  // Schedules (28 kolom, sampai Master Schedule ID).
  // id 8: tanggal disimpan sbg objek Date & jam disimpan sbg angka (jebakan nyata);
  //       tanggalnya ditanam di reset() pakai __newDate dari realm aplikasi.
  const S = (o) => [
    o.id, o.inv || '', o.cust !== undefined ? o.cust : '', o.ther !== undefined ? o.ther : '',
    o.date, o.time !== undefined ? o.time : '', o.loc || '', o.km !== undefined ? o.km : '',
    o.fee !== undefined ? o.fee : 0, o.trans !== undefined ? o.trans : 0, o.sub !== undefined ? o.sub : 0, o.disc || 0,
    o.total !== undefined ? o.total : 0, o.paid !== undefined ? o.paid : 0, o.due !== undefined ? o.due : 0,
    o.method || '', o.status || 'scheduled', o.ket || '', o.notes || '', o.by !== undefined ? o.by : 1, TS, TS,
    o.maps || '', o.pkg || '', o.pkgName || '', o.visit !== undefined ? o.visit : '', o.visits !== undefined ? o.visits : '', o.master !== undefined ? o.master : ''
  ];
  const schedRows = [
    S({ id: 1, inv: 'DSF-20260901-001', cust: 1, ther: 2, date: '2026-09-01', time: '07:00', loc: 'Kalisari Dharma', km: 5.8, fee: 85000, trans: 0, sub: 85000, total: 85000, paid: 85000, due: 0, method: 'CASH', status: 'done', ket: 'LUNAS CASH' }),
    S({ id: 2, inv: 'DSF-20260905-001', cust: 2, ther: 3, date: '2026-09-05', time: '', loc: 'Jalan Bogangin Baru', km: 5, fee: 100000, total: 100000, due: 100000, method: 'TF/QRIS', status: 'scheduled', ket: 'BELUM BAYAR' }),
    S({ id: 3, cust: 3, ther: 2, date: today, time: '00:00', loc: 'Educity Apartemen', km: 6.3, fee: 105000, trans: 12000, sub: 117000, total: 117000, due: 117000, status: 'scheduled', ket: 'BELUM BAYAR', by: 3 }),
    S({ id: 4, cust: 1, ther: 2, date: today, time: '07:00', loc: 'Kalisari Dharma', km: '', fee: 100000, total: 100000, paid: 100000, due: 0, method: 'cash', ket: 'LUNAS CASH' }),
    S({ id: 5, cust: 2, ther: 2, date: today, time: '07:00', loc: 'Jalan Bogangin Baru', km: 5, fee: 100000, total: 100000, paid: 30000, due: 70000, method: 'TF/QRIS', ket: 'DP', maps: 'goo.gl/maps-visit5' }),
    S({ id: 6, cust: 2, ther: 2, date: tomorrow, time: '15:30', loc: 'Jalan Bogangin Baru', km: 5, fee: 100000, total: 100000, due: 100000, method: 'TF/QRIS', ket: 'BELUM BAYAR' }),
    S({ id: 7, cust: 3, ther: 2, date: tomorrow, time: '', loc: 'Educity Apartemen', km: 6.3, fee: 85000, trans: 12000, sub: 97000, total: 97000, due: 97000, status: 'scheduled', ket: 'BELUM BAYAR' }),
    S({ id: 8, cust: 3, ther: 2, date: 'PLACEHOLDER_DATE_CELL', time: 0, loc: 'Semolowaru Utara', km: 6.3, fee: 105000, trans: 12000, sub: 117000, total: 117000, due: 117000, status: 'scheduled', ket: 'BELUM BAYAR' }),
    S({ id: 9, cust: 2, ther: 2, date: today, time: '06:00', loc: 'Tropodo', km: 9.2, fee: 85000, trans: 8000, sub: 93000, total: 93000, status: 'cancelled', ket: 'Dibatalkan customer' })
  ];
  ss.insertSheet('Schedules').appendRow(['ID', 'Invoice No', 'Customer ID', 'Therapist ID', 'Schedule Date', 'Schedule Time', 'Location', 'KM Distance', 'Fee Treatment', 'Transport Fee', 'Subtotal', 'Discount', 'Grand Total', 'Paid Amount', 'Due Amount', 'Payment Method', 'Status', 'Keterangan', 'Notes', 'Created By', 'Created At', 'Updated At', 'Maps Link', 'Package ID', 'Package Name', 'Visit No', 'Total Visits', 'Master Schedule ID']);
  schedRows.forEach(r => ss.getSheetByName('Schedules').appendRow(r));

  // Schedule_Items: id, schedule_id, treatment_id, treatment_name, price, qty, subtotal
  ss.insertSheet('Schedule_Items').appendRow(['ID', 'Schedule ID', 'Treatment ID', 'Treatment Name', 'Price', 'Qty', 'Subtotal']);
  [
    [1, 1, 1, 'Baby - Sleep Booster', 85000, 1, 85000],
    [2, 2, 2, 'Baby - GTM', 100000, 1, 100000],
    [3, 3, 3, 'Baby - Bapil', 105000, 1, 105000],
    [4, 4, 4, 'Baby - Kolik', 100000, 1, 100000],
    [5, 5, 5, 'Kids - Sleep Booster', 100000, 1, 100000],
    [6, 6, 2, 'Baby - GTM', 100000, 1, 100000],
    [7, 7, 1, 'Baby - Sleep Booster', 85000, 1, 85000],
    [8, 8, 3, 'Baby - Bapil', 105000, 1, 105000],
    [9, 9, 1, 'Baby - Sleep Booster', 85000, 1, 85000]
  ].forEach(r => ss.getSheetByName('Schedule_Items').appendRow(r));

  // Payments: id, schedule_id, customer_id, amount, method, reference_no, payment_date, notes, created_by, created_at
  ss.insertSheet('Payments').appendRow(['ID', 'Schedule ID', 'Customer ID', 'Amount', 'Method', 'Reference No', 'Payment Date', 'Notes', 'Created By', 'Created At']);
  [
    [1, 1, 1, 85000, 'cash', '', '2026-09-01', 'Full payment', 1, TS],     // huruf kecil
    [2, 5, 2, 30000, 'TF/QRIS', '', today, 'DP', 1, TS],
    [3, 4, 1, 100000, 'CASH', '', today, 'Full payment', 1, TS]            // huruf besar
  ].forEach(r => ss.getSheetByName('Payments').appendRow(r));

  // Activity_Logs: baris pertama bertanggal objek Date (ditanam di reset()).
  ss.insertSheet('Activity_Logs').appendRow(['ID', 'User ID', 'Username', 'Action', 'Table', 'Record ID', 'Details', 'Created At']);
  ss.getSheetByName('Activity_Logs').appendRow([1, 1, 'Admin Daisafa', 'LOGIN', 'Users', 1, 'Hanya untuk uji serialisasi Date', 'PLACEHOLDER_DATE_CELL']);

  ss.insertSheet('Settings').appendRow(['ID', 'Setting Key', 'Setting Value', 'Updated By', 'Updated At']);
  settingsRows(TS).forEach(r => ss.getSheetByName('Settings').appendRow(r));

  return { ss, meta: { today, tomorrow, TS, todayY8: ymd8(today) } };
}

const rowId8 = { row: 9, dateCol: 5 };   // Schedules baris id 8
const rowLog1 = { row: 2, createdCol: 8 }; // Activity_Logs baris pertama

function reset(codePath) {
  const file = codePath || process.argv[2] || DEFAULT_CODE_GS;
  const { ss, meta } = buildSpreadsheet();
  const app = createApp(file, ss);

  // Sel tanggal bertipe Date harus dibuat di realm aplikasi agar `instanceof Date`
  // di dalam Code.gs benar; jam nol angka meniru kolom jam lama berformat waktu.
  const tp = meta.today.split('-').map(Number);
  const dToday = app.__newDate(tp[0], tp[1] - 1, tp[2], 9, 0);
  ss.getSheetByName('Schedules').getRange(rowId8.row, rowId8.dateCol).setValue(dToday);
  const lp = tp;
  ss.getSheetByName('Activity_Logs').getRange(rowLog1.row, rowLog1.createdCol).setValue(app.__newDate(lp[0], lp[1] - 1, lp[2], 10, 30));

  app.__meta = meta;
  app.__ss = ss;
  return app;
}

// ─── util dibagi antar file harness ───────────────────────────────────────────
// Pemeriksa JSON-aman: tidak boleh ada Date / fungsi / sesuatu yang bukan
// primitif di hasil endpoint (google.script.run tidak bisa mengirimnya).
function deepScan(obj) {
  const bad = [];
  function walk(v, p) {
    if (v === null) return;
    const t = typeof v;
    if (t === 'string' || t === 'number' || t === 'boolean') return;
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) walk(v[i], p + '[' + i + ']');
      return;
    }
    if (t === 'object') {
      if (v instanceof Date) { bad.push(p + ' = Date'); return; }
      for (const k of Object.keys(v)) walk(v[k], p + '.' + k);
      return;
    }
    if (t === 'undefined') { bad.push(p + ' = undefined'); return; }
    bad.push(p + ' = ' + t);
  }
  walk(obj, '$');
  return bad;
}

module.exports = {
  reset,
  deepScan,
  addDaysLocal,
  localDateStr,
  ymd8,
  pad2,
  DEFAULT_CODE_GS,
  DEFAULT_INDEX_HTML,
  LOGO_URL,
  QRIS_URL
};
