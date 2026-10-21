'use strict';
/*
 * h1_read.js — uji endpoint BACA memakai Code.gs asli + seed mock.js.
 * Jalankan: node harness/h1_read.js (TZ=Asia/Jakarta sudah diset lewat run_all / manual)
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

const t = mkSuite('h1_read');
const app = mock.reset();
const SC = app.__consts.SC;
const CU = app.__consts.CU;
const today = app.__meta.today;
const tomorrow = app.__meta.tomorrow;

function pick(arr, pred) { return arr.filter(pred)[0]; }

// ── 1. Semua endpoint baca harus JSON-aman (tanpa Date / fungsi) ──
const readReplies = {
  getSchedules: app.getSchedules(1, 'admin', {}),
  getScheduleDetail: app.getScheduleDetail(3, 1, 'admin'),
  getCustomers: app.getCustomers(1, 'admin'),
  getPayments: app.getPayments(1, 'admin', {}),
  getTreatments: app.getTreatments(1, 'admin'),
  getDashboardStats: app.getDashboardStats(1, 'admin')
};
for (const [name, rep] of Object.entries(readReplies)) {
  const bad = mock.deepScan(rep);
  t.ok('JSON-aman ' + name, rep && rep.success === true && bad.length === 0 && (name === 'getDashboardStats' || (readReplies[name].data && (name === 'getScheduleDetail' ? true : readReplies[name].data.length > 0))));
}

// ── 2. Telepon legacy numerik dirapikan & phone_wa hanya digit ──
const custs = readReplies.getCustomers.data;
const c1 = pick(custs, c => c.id === 1);
const c2 = pick(custs, c => c.id === 2);
const c3 = pick(custs, c => c.id === 3);
const c4 = pick(custs, c => c.id === 4);
t.eq('telepon legacy 82136267808 → 0821-3626-7808', c1.phone, '0821-3626-7808');
t.eq('phone_wa legacy 82136267808 → digits 62', c1.phone_wa, '6282136267808');
t.eq('telepon legacy 85633221199 → 0856-3322-1199', c2.phone, '0856-3322-1199');
t.eq('telepon berformat 0813-5555-1212 tetap sama', c3.phone, '0813-5555-1212');
t.eq('walk-in: semua field kosong', [c4.phone, c4.phone_wa, c4.name, c4.address].join('|'), '|||');
t.eq('getCustomers dikembalikan terbalik (terbaru dulu)', custs[0].id, 4);

// ── 3. CASH mendeteksi huruf besar/kecil di pembayaran ──
const pays = readReplies.getPayments.data;
t.eq('payment "cash" huruf kecil → Cash', pick(pays, p => p.id === 1).method, 'Cash');
t.eq('payment "CASH" huruf besar → Cash', pick(pays, p => p.id === 3).method, 'Cash');
t.eq('payment "TF/QRIS" tetap TF/QRIS', pick(pays, p => p.id === 2).method, 'TF/QRIS');
t.eq('payment app.paymentMethodLabel("") kosong', app.paymentMethodLabel(''), '');
t.eq('payment app.paymentMethodLabel("cash")', app.paymentMethodLabel('cash'), 'Cash');

// ── 4. Aturan "00:00" kembali kosong; jam dibaca waktu tampilan ──
const sched = readReplies.getSchedules.data;
const s3 = pick(sched, s => s.id === 3);
const s4 = pick(sched, s => s.id === 4);
const s8 = pick(sched, s => s.id === 8);
t.eq('jam tersimpan teks "00:00" → kembali kosong', s3.schedule_time, '');
t.eq('jam tersimpan angka 0 (tampil 00:00) → kembali kosong', s8.schedule_time, '');
t.eq('jam normal 07:00 tetap 07:00', s4.schedule_time, '07:00');
t.eq('getScheduleTimeById membaca teks tampilan 00:00', app.getScheduleTimeById()[3], '00:00');
t.eq('getScheduleTimeById membaca teks tampilan angka 0', app.getScheduleTimeById()[8], '0');
t.eq('fmtTime("00:00") → kosong', app.fmtTime('00:00'), '');
t.eq('fmtTime("0") → kosong', app.fmtTime('0'), '');
t.eq('fmtTime("") → kosong', app.fmtTime(''), '');
t.eq('fmtTime("7:05") → 07:05', app.fmtTime('7:05'), '07:05');
t.eq('tanggal Date (id 8) serial jadi yyyy-MM-dd', s8.schedule_date, today);

// ── 5. Peta kolom Schedules 28 kolom, Customers 15 kolom ──
const scHeader = app.__ss.getSheetByName('Schedules').getRange(1, 1, 1, 40).getValues()[0];
const cuHeader = app.__ss.getSheetByName('Customers').getRange(1, 1, 1, 40).getValues()[0];
t.eq('Schedules header sampai Master Schedule ID berada di kolom AA (27)', SC.MASTER_ID, 27);
t.eq('Schedules header berjumlah 28 kolom', scHeader.slice(0, 28).filter(h => h !== '').length, 28);
t.eq('Kolom W Schedules = Maps Link', scHeader[SC.MAPS_LINK], 'Maps Link');
t.eq('Kolom X Schedules = Package ID', scHeader[SC.PKG_ID], 'Package ID');
t.eq('Kolom Y Schedules = Package Name', scHeader[SC.PKG_NAME], 'Package Name');
t.eq('Kolom Z Schedules = Visit No', scHeader[SC.VISIT_NO], 'Visit No');
t.eq('Kolom AA Schedules = Total Visits', scHeader[SC.TOTAL_VISITS], 'Total Visits');
t.eq('Kolom AB Schedules = Master Schedule ID', scHeader[SC.MASTER_ID], 'Master Schedule ID');
t.eq('Customers kolom N = Tanggal Lahir', cuHeader[CU.DOB], 'Tanggal Lahir');
t.eq('Customers kolom O = Maps Link', cuHeader[CU.MAPS_LINK], 'Maps Link');
t.eq('Customers header berjumlah 15 kolom', cuHeader.slice(0, 15).filter(h => h !== '').length, 15);

// ── 6. getSchedules membawa treatments (nama gabungan) dan maps_link ──
t.eq('treatments teks gabungan "Baby - Sleep Booster ×1"', pick(sched, s => s.id === 7).treatments, 'Baby - Sleep Booster ×1');
t.eq('treatments "Baby - Bapil ×1" milik jadwal id 3', s3.treatments, 'Baby - Bapil ×1');
t.eq('maps_link dikirim bila ada', pick(sched, s => s.id === 5).maps_link, 'goo.gl/maps-visit5');
t.ok('maps_link selalu jadi field (string kosong bila tidak ada)', 'maps_link' in s4 && s4.maps_link === '');

// filter juga dipakai:
t.eq('filter status done hanya jadwal id 1', app.getSchedules(1, 'admin', { status: 'done' }).data.map(s => s.id), [1]);
t.eq('filter tanggal besok (daftar terbaru dulu)', app.getSchedules(1, 'admin', { dateFrom: tomorrow, dateTo: tomorrow }).data.map(s => s.id), [7, 6]);

// ── 7. getDashboardStats ──
const dash = readReplies.getDashboardStats.data;
t.eq('todayCount menghitung kunjungan (bukan booking) hari ini', dash.todayCount, 4);
t.eq('upcomingToday urut jam: [5,4] lalu kosongnya di belakang [3,8]', dash.upcomingToday.map(b => b.id), [5, 4, 3, 8]);
t.eq('upcomingTomorrow urut jam: [6] lalu kosongnya [7]', dash.upcomingTomorrow.map(b => b.id), [6, 7]);
t.ok('setiap brief punya maps_link', dash.upcomingToday.every(b => typeof b.maps_link === 'string') && dash.upcomingTomorrow.every(b => typeof b.maps_link === 'string'));
t.ok('brief tanpa maps_link kembali ""', dash.upcomingToday.filter(b => b.id === 4)[0].maps_link === '');
t.ok('brief jam kosong ditaruh paling bawah', dash.upcomingToday[2].time === '' && dash.upcomingToday[3].time === '');
t.ok('tiebreak nama pelanggan: Kirana dulu, baru Sari', dash.upcomingToday[0].customer === 'Bunda Kirana' && dash.upcomingToday[1].customer === 'Bunda Sari');
t.eq('totalSchedules tidak menghitung yang dibatalkan', dash.totalSchedules, 8);
t.eq('statusDist memuat yang dibatalkan', dash.statusDist.cancelled, 1);

// ── 8. Aturan transport (gratis ≤5 km, floor km × tarif) ──
t.eq('transport 5.8 km → 0', app.calcTransportFee(5.8, 2000), 0);
t.eq('transport 6.3 km → 12000', app.calcTransportFee(6.3, 2000), 12000);
t.eq('transport 27.6 km → 54000', app.calcTransportFee(27.6, 2000), 54000);
t.eq('transport angka 5 → 0', app.calcTransportFee(5, 2000), 0);
t.eq('transport 12.1 km → 24000', app.calcTransportFee(12.1, 2000), 24000);

// ── 9. Baris paket (kolom X–AB) dibaca dengan benar oleh endpoint baca ──
// Simulasikan baris produksi lama karya versi app sebelumnya (master i� hilang).
app.__ss.getSheetByName('Schedules').appendRow([
  100, '', 2, 2, '2026-09-10', '07:00', 'Jl Uji Paket', 6.3, 0, 0, 0, 0, 0, 0, 0,
  '', 'scheduled', '', '', 1, app.__meta.TS, app.__meta.TS, 'goo.gl/maps-visit100',
  'PKG-000100', 'NB 2x - 3 Hari', 3, 6, 98
]);
const pRow = pick(app.getSchedules(1, 'admin', {}).data, s => s.id === 100);
t.eq('getSchedules: package_id dari kolom X', pRow.package_id, 'PKG-000100');
t.eq('getSchedules: package_name dari kolom Y', pRow.package_name, 'NB 2x - 3 Hari');
t.eq('getSchedules: visit_no / total_visits dari kolom Z & AA', [pRow.visit_no, pRow.total_visits], [3, 6]);
t.eq('getSchedules: master_id dari kolom AB', pRow.master_id, 98);
t.eq('detail kunjungan paket: teks treatment memakai nama paket', app.getScheduleDetail(100, 1, 'admin').data.treatments, 'NB 2x - 3 Hari');
t.eq('detail kunjungan paket: maps_link kolom W', app.getScheduleDetail(100, 1, 'admin').data.maps_link, 'goo.gl/maps-visit100');

t.finish();
