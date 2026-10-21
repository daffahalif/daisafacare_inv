'use strict';
/*
 * h3_packages.js — uji paket NB (parsing nama, createSchedulePackage, edit kunjungan,
 * batalkan kunjungan pertama, hapus induk paket yang menyimpan DP, dan baca ulang).
 */
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

const t = mkSuite('h3_packages');
const app = mock.reset();
const tomorrow = app.__meta.tomorrow;

function pick(arr, pred) { return arr.filter(pred)[0]; }
function rows() { return app.__ss.getSheetByName('Schedules')._data; }
function rowsOfPkg(pkgId) { return rows().slice(1).filter(r => String(r[23]) === pkgId); }
function custTotals(id) {
  const c = pick(app.getCustomers(1, 'admin').data, x => x.id === id);
  return { total: c.total_purchase, paid: c.total_paid, due: c.total_due };
}
const bp = (extra) => Object.assign({
  customer_id: 3, therapist_id: 2, start_date: tomorrow, location: 'Langgar Jawa',
  km: 6.3, time1: '07:00', time2: '15:30', payment_method: 'cash'
}, extra || {});

// ── 1. Parsing nama paket dari Treatment ──
t.eq('"3 Hari" + NB 2x → 3 hari × 2', app.parsePackageTreatment('3 Hari', 'NB 2x'), { days: 3, visitsPerDay: 2 });
t.eq('"14 Hari" + NB 2x → 14 hari × 2', app.parsePackageTreatment('14 Hari', 'NB 2x'), { days: 14, visitsPerDay: 2 });
t.eq('"7 Hari" + NB 1x → 7 hari × 1', app.parsePackageTreatment('7 Hari', 'NB 1x'), { days: 7, visitsPerDay: 1 });
t.eq('"1 Hari" + NB 1x → 1 hari × 1', app.parsePackageTreatment('1 Hari', 'NB 1x'), { days: 1, visitsPerDay: 1 });
t.eq('huruf kecil "7 hari" + "nb 2x" tetap terbaca', app.parsePackageTreatment('7 hari', 'nb 2x'), { days: 7, visitsPerDay: 2 });
t.eq('"99 Hari" diizinkan tapi dijepit maksimum 60 hari (dokumentasi perilaku nyata)', app.parsePackageTreatment('99 Hari', 'NB 1x'), { days: 60, visitsPerDay: 1 });
t.eq('nama tanpa angka dianggap 1 hari (dokumentasi)', app.parsePackageTreatment('Hari Borongan', 'NB 1x'), { days: 1, visitsPerDay: 1 });
t.eq('"5 Hari" + NB tanpa x → 1 kunjungan per hari', app.parsePackageTreatment('5 Hari', 'NB'), { days: 5, visitsPerDay: 1 });
t.eq('kategori selain "2x" (mis. NB 3x) dibaca 1 kunjungan per hari (dokumentasi)', app.parsePackageTreatment('1 Hari', 'NB 3x'), { days: 1, visitsPerDay: 1 });

// ── 2. createSchedulePackage ditolak bila syarat tak terpenuhi ──
t.ok('treatment bukan paket NB ditolak', app.createSchedulePackage(bp({ treatment_id: 2, time1: '07:00', time2: '15:00' }), 1, 'admin').success === false);
t.ok('tanpa jam kunjungan ditolak', app.createSchedulePackage(bp({ treatment_id: 18, time1: '' }), 1, 'admin').success === false);
t.ok('paket 2x tanpa jam kedua ditolak', app.createSchedulePackage(bp({ treatment_id: 18, time2: '' }), 1, 'admin').success === false);
t.ok('treatment tidak dikenal ditolak', app.createSchedulePackage(bp({ treatment_id: 999, time2: '15:30' }), 1, 'admin').success === false);

// ── 3. Create paket NB 2x × 3 Hari → 3 hari × 2 kunjungan = 6 baris ──
const beforeC3 = custTotals(3);
const paysBefore = app.getPayments(1, 'admin', {}).data.length;
const res = app.createSchedulePackage(Object.assign(bp({ treatment_id: 18, dp_percent: 0 }), { km: 6.3 }), 1, 'admin');
t.ok('paket berhasil dibuat', res.success === true);
const base = res.data.master_id;
t.eq('data kunjungan: 6', res.data.visits, 6);
t.eq('Package ID = PKG- + 6 digit id induk', res.data.package_id, 'PKG-' + String(base).padStart(6, '0'));
t.eq('grand_total paket = 380000 + 72000 transport (12000 × 6)', res.data.grand_total, 452000);
t.eq('dp_percent 0 → dp 0', res.data.dp, 0);
t.eq('due 452000', res.data.due, 452000);
const pkgRows = rowsOfPkg(res.data.package_id);
t.eq('baris Schedules untuk paket berjumlah 6', pkgRows.length, 6);
t.eq('id kunjungan berurutan base..base+5', pkgRows.map(r => Number(r[0])), [base, base + 1, base + 2, base + 3, base + 4, base + 5]);
t.eq('kunjungan bernomor 1..6', pkgRows.map(r => Number(r[25])), [1, 2, 3, 4, 5, 6]);
t.eq('total kunjungan 6 di semua baris', pkgRows.map(r => Number(r[26])), [6, 6, 6, 6, 6, 6]);
const expDay = (k) => mock.addDaysLocal(tomorrow, k);
t.eq('jadwal hari 1 (02 kunjungan 07:00/15:30)', pkgRows.slice(0, 2).map(r => [r[4], r[5]]), [[expDay(0), '07:00'], [expDay(0), '15:30']]);
t.eq('jadwal hari 2', pkgRows.slice(2, 4).map(r => [r[4], r[5]]), [[expDay(1), '07:00'], [expDay(1), '15:30']]);
t.eq('jadwal hari 3', pkgRows.slice(4, 6).map(r => [r[4], r[5]]), [[expDay(2), '07:00'], [expDay(2), '15:30']]);
const m = pkgRows[0];
t.ok('kunjungan pertama = induk (Master Schedule ID = id sendiri)', String(m[27]) === String(base) && Number(m[0]) === base);
t.eq('induk membawa fee paket 380000', Number(m[8]), 380000);
t.eq('induk membawa transport total (12000 × 6 = 72000)', Number(m[9]), 72000);
t.eq('induk membawa total 452000 & dp 0 & due 452000', [Number(m[12]), Number(m[13]), Number(m[14])], [452000, 0, 452000]);
t.eq('induk keterangan BELUM BAYAR karena dp_percent 0', m[17], 'BELUM BAYAR');
t.eq('induk metode "cash" → "Cash"', m[15], 'Cash');
t.eq('kunjungan lain tidak membawa invoice', pkgRows.slice(1).map(r => String(r[1])), ['', '', '', '', '']);
t.eq('kunjungan lain bernilai Rp 0 seluruhnya', pkgRows.slice(1).every(r => Number(r[8]) === 0 && Number(r[12]) === 0 && Number(r[13]) === 0), true);
t.eq('kunjungan lain tetap milik paket (Package ID sama)', pkgRows.slice(1).every(r => String(r[23]) === res.data.package_id), true);
t.eq('kunjungan lain mengarah ke induk (Master Schedule ID = base)', pkgRows.slice(1).every(r => String(r[27]) === String(base)), true);
t.eq('Schedule_Items hanya 1 baris pada kunjungan pertama', app.__ss.getSheetByName('Schedule_Items')._data.slice(1).filter(r => Number(r[1]) === base).length, 1);
t.eq('nama item = nama paket "NB 2x - 3 Hari"', app.__ss.getSheetByName('Schedule_Items')._data[1 + 9 + (base - 10)][3], 'NB 2x - 3 Hari');
t.eq('jumlah kunjungan = price 380000', Number(app.__ss.getSheetByName('Schedule_Items')._data[1 + 9 + (base - 10)][4]), 380000);
t.eq('total pelanggan bergerak hanya sekali (+452000)', custTotals(3).total - beforeC3.total, 452000);
t.eq('due pelanggan bergerak hanya sekali (+452000)', custTotals(3).due - beforeC3.due, 452000);
t.eq('dp 0: tidak ada baris Payments baru', app.getPayments(1, 'admin', {}).data.length, paysBefore);

// ── 4. Paket dp bawaan 20%: DP tercatat di Payments, belumDp tidak menamparnya ──
const dash1 = app.getDashboardStats(1, 'admin').data;
const belumBefore = dash1.belumDpCount;
const ok1 = dash1.belumDp.some(b => b.id === base);
t.ok('induk dp 0 terdaftar di daftar belum disetor DP', ok1 === true);
const beforeC1 = custTotals(1);
const resB = app.createSchedulePackage({ customer_id: 1, start_date: tomorrow, location: 'Langgar Jawa', km: 6.3, time1: '08:00', treatment_id: 15, payment_method: 'TF/QRIS' }, 1, 'admin');
t.ok('paket B (NB 1x 7 Hari) berhasil', resB.success === true);
t.eq('paket B grand = 485000 + transport 12000 × 7 = 569000', resB.data.grand_total, 569000);
t.eq('dp bawaan 20% dari 569000', resB.data.dp, 113800);
t.eq('due 455200', resB.data.due, 455200);
const baseB = resB.data.master_id;
t.eq('paket B berisi 7 kunjungan (7 hari × 1)', rowsOfPkg(resB.data.package_id).length, 7);
t.eq('paket 1x memakai satu jam per hari (08:00)', rowsOfPkg(resB.data.package_id).every(r => r[5] === '08:00'), true);
const dpPay = pick(app.getPayments(1, 'admin', {}).data, p => p.amount === 113800);
t.ok('DP paket tercatat di Payments', dpPay !== undefined && dpPay.notes === 'DP paket');
t.eq('total pelanggan 1 bergerak +569000', custTotals(1).total - beforeC1.total, 569000);
t.eq('paid pelanggan 1 bergerak +113800 & due +455200', [custTotals(1).paid - beforeC1.paid, custTotals(1).due - beforeC1.due], [113800, 455200]);
const dash2 = app.getDashboardStats(1, 'admin').data;
t.ok('induk dp 0 masuk daftar belum DP; paket dengan DP tidak', ok1 && dash2.belumDp.every(b => b.id !== baseB));
t.eq('belumDpCount tetap (paket dengan DP tidak masuk daftar)', dash2.belumDpCount, belumBefore);

// ── 5. Edit kunjungan paket: hanya tanggal/jam/lokasi/maps/notes ──
const visit3 = base + 2;
const before = app.getSchedules(1, 'admin', {}).data.filter(s => s.id === visit3)[0];
const day10 = mock.addDaysLocal(tomorrow, 10);
const ev = app.updateSchedule(1, 'admin', visit3, {
  schedule_date: day10, schedule_time: '10:00', location: 'Lokasi Baru',
  maps_link: 'goo.gl/baru', notes: 'Catatan baru',
  items: [{ treatment_id: 5, qty: 2 }], discount: 5000
});
t.ok('edit kunjungan paket berhasil', ev.success === true);
const v3 = app.getSchedules(1, 'admin', {}).data.filter(s => s.id === visit3)[0];
t.eq('tanggal kunjungan berubah', v3.schedule_date, day10);
t.eq('jam kunjungan berubah', v3.schedule_time, '10:00');
t.eq('lokasi & maps & notes berubah', [v3.location, v3.maps_link, v3.notes], ['Lokasi Baru', 'goo.gl/baru', 'Catatan baru']);
t.eq('item/discount dikirim pun diabaikan: fee tetap 0', v3.fee_treatment, 0);
t.eq('uang kunjungan tetap 0 (milik induk)', v3.grand_total, 0);
t.eq('kolom paket kunjungan tetap', [v3.package_id, v3.visit_no, v3.total_visits], [res.data.package_id, 3, 6]);
const ed = app.updateSchedule(1, 'admin', base, {
  schedule_date: day10, schedule_time: '07:00', notes: 'Ganti induk',
  items: [{ treatment_id: 14, qty: 1 }], discount: 99999
});
t.ok('edit induk berhasil', ed.success === true);
const m2 = app.getSchedules(1, 'admin', {}).data.filter(s => s.id === base)[0];
// Dokumentasi perilaku nyata: baris pertama paket juga lewat cabang kunjungan paket,
// jadi nominal, item, dan diskon TIDAK bisa diubah lewat updateSchedule.
t.eq('induk: fee tetap 380000 walau item lain dikirim', m2.fee_treatment, 380000);
t.eq('induk: total tetap 452000 walau diskon dikirim', m2.grand_total, 452000);
t.eq('induk: jam boleh berubah', m2.schedule_time, '07:00');

// ── 6. Hapus satu kunjungan (bukan induk): baris itu saja, uang tidak berubah ──
const beforeDel = custTotals(3);
app.deleteSchedule(base + 4, 1, 'admin');
t.eq('kunjungan ke-5 terhapus, sisanya 5', rowsOfPkg(res.data.package_id).length, 5);
t.eq('uang pelanggan tidak ikut berubah', custTotals(3).total - beforeDel.total, 0);
t.eq('induk tetap memegang total 452000', Number(rowsOfPkg(res.data.package_id)[0][12]), 452000);

// ── 7. Batalkan kunjungan pertama (induk): uang dikembalikan sekali ──
const snap = custTotals(3);
const cs = app.updateScheduleStatus(base, 'cancelled', 'Dibatalkan', 1, 'admin');
t.ok('batalkan induk berhasil', cs.success === true);
t.eq('total pelanggan dikembalikan (−452000) sekali', custTotals(3).total - snap.total, -452000);
t.eq('due pelanggan turun bersama total', custTotals(3).due - snap.due, -452000);
t.eq('status induk cancelled', app.getSchedules(1, 'admin', {}).data.filter(s => s.id === base)[0].status, 'cancelled');
t.eq('kunjungan lain tetap scheduled', rowsOfPkg(res.data.package_id).slice(1).every(r => String(r[16]) === 'scheduled'), true);
const dash3 = app.getDashboardStats(1, 'admin').data;
t.ok('induk dibatalkan keluar dari daftar belum DP & tidak dihitung', dash3.belumDp.every(b => b.id !== base) && dash3.belumDpCount === belumBefore - 1);

// ── 8. Hapus induk paket ber-DP: seluruh kunjungan terhapus, baris Payments tetap ──
const rowsB = rowsOfPkg(resB.data.package_id).length;
const deletesB = app.deleteSchedule(baseB, 1, 'admin');
t.ok('hapus induk paket B berhasil', deletesB.success === true);
t.eq('seluruh 7 kunjungan paket B terhapus', rowsOfPkg(resB.data.package_id).length, 0);
t.eq('Schedule_Items paket B juga ikut terhapus', app.__ss.getSheetByName('Schedule_Items')._data.slice(1).filter(r => Number(r[1]) === baseB).length, 0);
t.eq('baris Payments DP tetap ada (jejak uang masuk)', pick(app.getPayments(1, 'admin', {}).data, p => p.amount === 113800) !== undefined, true);
t.eq('Keuangan menampilkan DP paket dengan nomor invoice kosong', pick(app.getPayments(1, 'admin', {}).data, p => p.amount === 113800).invoice_no, '');
const snapC1 = custTotals(1);
t.ok('total pelanggan 1 kembali persis ke nilai awal setelah hapus induk', snapC1.total === beforeC1.total);
t.ok('paid pelanggan 1 kembali persis ke nilai awal setelah hapus induk', snapC1.paid === beforeC1.paid);

// ── 9. getSchedules tetap melayani baris paket dengan kolom paket yang benar ──
const served = app.getSchedules(1, 'admin', {}).data.filter(s => s.package_id === res.data.package_id);
t.eq('getSchedules masih menyajikan 5 baris paket', served.length, 5);
t.eq('Package Name benar di semua baris', served.every(s => s.package_name === 'NB 2x - 3 Hari'), true);
t.eq('Visit No / Total Visits benar', served.map(s => s.visit_no).sort((a, b) => a - b), [1, 2, 3, 4, 6]);
t.eq('master_id mengarah ke induk', served.every(s => s.master_id === base), true);
t.eq('teks treatment kunjungan (tanpa item) memakai nama paket', served.filter(s => s.visit_no > 1).every(s => s.treatments === 'NB 2x - 3 Hari'), true);
t.eq('teks treatment induk (memegang item) ada tanda qty', served.filter(s => s.visit_no === 1).every(s => s.treatments === 'NB 2x - 3 Hari ×1'), true);
t.ok('data paket tetap JSON-aman', mock.deepScan(app.getSchedules(1, 'admin', {})).length === 0);

t.finish();
