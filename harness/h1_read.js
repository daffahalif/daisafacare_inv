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

// ── 10. getSchedules berhalaman: page/pageSize/q/sort/from/to di sisi server ──
mock.addExtraSchedules(app, 25, 101);
const legacyRep = app.getSchedules(1, 'admin', {});
t.eq('tanpa page: respons lama hanya punya success+data', Object.keys(legacyRep).sort().join(','), 'data,success');
const legacy = legacyRep.data;
t.eq('tanpa page: daftar tetap penuh (9 seed + baris 100 + 25 tambahan)', legacy.length, 35);

// Miror pecis logika tampilan client (scheduleSortedFiltered) untuk membandingkan server.
function mirrorPaged(all, p) {
  // `all` = hasil panggilan tanpa page (urutan pembalikan seperti kirim server),
  // jadi jangan dibalik lagi di sini.
  let rows = all.slice();
  const q = String(p.q || '').trim().toLowerCase();
  const qDigit = q.replace(/\D/g, '');
  if (q) {
    rows = rows.filter(s => {
      const teks = [s.customer_name, s.customer_phone, s.invoice_no, s.treatments, s.location, s.notes, s.keterangan, s.therapist_name]
        .map(x => String(x || '').toLowerCase()).join(' ');
      if (teks.indexOf(q) !== -1) return true;
      if (!qDigit) return false;
      return String(s.customer_phone || '').replace(/\D/g, '').indexOf(qDigit) !== -1;
    });
  }
  const mode = String(p.sort || 'date_desc');
  const tgl = s => String((s && s.schedule_date) || '');
  const jamx = s => String((s && s.schedule_time) || '').trim();
  if (p.from) rows = rows.filter(s => tgl(s) >= String(p.from));
  if (p.to) rows = rows.filter(s => tgl(s) <= String(p.to));
  if (mode === 'date_asc' || mode === 'time_asc') {
    rows = rows.slice().sort((a, b) => tgl(a).localeCompare(tgl(b)) || (jamx(a) || '99:99').localeCompare(jamx(b) || '99:99'));
  } else if (mode === 'name_asc') {
    rows = rows.slice().sort((a, b) => String(a.customer_name || '').localeCompare(String(b.customer_name || ''), 'id'));
  } else if (mode === 'total_desc') {
    rows = rows.slice().sort((a, b) => (parseFloat(b.grand_total) || 0) - (parseFloat(a.grand_total) || 0));
  } else {
    rows = rows.slice().sort((a, b) => tgl(b).localeCompare(tgl(a)));
  }
  const ps = parseInt(p.pageSize, 10) || 10;
  const pages = Math.max(1, Math.ceil(rows.length / ps));
  const page = Math.min(Math.max(1, parseInt(p.page, 10) || 1), pages);
  return { rows: rows.slice((page - 1) * ps, page * ps), total: rows.length, page, totalPages: pages };
}

function callPage(payload) { return app.getSchedules(1, 'admin', Object.assign({}, payload)); }

// Halaman 1 bawaan (sort date_desc)
const r1 = callPage({ page: 1, pageSize: 10 });
const m1 = mirrorPaged(legacy, {});
t.eq('halaman 1: success', r1.success, true);
t.eq('halaman 1: berisi 10 baris', r1.data.length, 10);
t.eq('halaman 1: total pas daftar penuh', r1.total, 35);
t.eq('halaman 1: totalPages', r1.totalPages, 4);
t.eq('halaman 1: posisi halaman', r1.page, 1);
t.eq('halaman 1: id baris sama persis dengan hasil klien', r1.data.map(s => s.id), m1.rows.map(s => s.id));
t.eq('halaman 1: isi baris identik piksel-demi-piksel dengan daftar penuh', JSON.stringify(r1.data), JSON.stringify(m1.rows));
t.ok('halaman 1: JSON-aman', mock.deepScan(r1).length === 0);

// Halaman 2: baris berbeda, urutan sesuai klien
const r2 = callPage({ page: 2, pageSize: 10 });
t.eq('halaman 2: tidak ada baris dari laman 1', r2.data.filter(x => r1.data.some(y => y.id === x.id)).length, 0);
t.eq('halaman 2: id baris sama persis dengan hasil klien', r2.data.map(s => s.id), mirrorPaged(legacy, { page: 2 }).rows.map(s => s.id));

// Pencarian teks server (lokasi customer terapis)
const rq = callPage({ page: 1, pageSize: 10, q: 'Educity' });
t.eq('cari "Educity": total', rq.total, 10);
t.eq('cari "Educity": totalPages', rq.totalPages, 1);
t.ok('cari "Educity": semua baris memuat lokasi itu', rq.data.every(s => String(s.location).indexOf('Educity') !== -1));
const rpd = callPage({ page: 1, pageSize: 10, q: '362678' });
t.eq('cari No. HP digits: total', rpd.total, 10);
t.eq('cari No. HP digits: hanya pelanggan itu', rpd.data.every(s => String(s.customer_id) === '1'), true);
t.eq('cari No. HP digits: id sama dengan klien', rpd.data.map(s => s.id), mirrorPaged(legacy, { q: '362678' }).rows.map(s => s.id));

// Urutan server
const rt = callPage({ page: 1, pageSize: 10, sort: 'total_desc' });
t.ok('sort total_desc: 10 teratas menurun', rt.data.every((s, i) => i === 0 || (parseFloat(rt.data[i - 1].grand_total) || 0) >= (parseFloat(s.grand_total) || 0)));
t.eq('sort total_desc: id sama dengan klien', rt.data.map(s => s.id), mirrorPaged(legacy, { sort: 'total_desc' }).rows.map(s => s.id));
const rn = callPage({ page: 1, pageSize: 10, sort: 'name_asc' });
t.ok('sort name_asc: nama naik', rn.data.every((s, i) => i === 0 || String(rn.data[i - 1].customer_name).localeCompare(String(s.customer_name), 'id') <= 0));
t.eq('sort name_asc: id sama dengan klien', rn.data.map(s => s.id), mirrorPaged(legacy, { sort: 'name_asc' }).rows.map(s => s.id));
const rta = callPage({ page: 1, pageSize: 10, sort: 'time_asc' });
t.eq('sort time_asc: id sama dengan klien', rta.data.map(s => s.id), mirrorPaged(legacy, { sort: 'time_asc' }).rows.map(s => s.id));

// Rentang tanggal server lewat from/to (alias dateFrom/dateTo)
const rf = callPage({ page: 1, pageSize: 10, from: '2026-08-10', to: '2026-08-20' });
t.eq('filter from/to: total', rf.total, 11);
t.eq('filter from/to: totalPages', rf.totalPages, 2);
t.ok('filter from/to: baris dalam rentang', rf.data.every(s => s.schedule_date >= '2026-08-10' && s.schedule_date <= '2026-08-20'));
t.eq('filter from/to: id sama dengan klien', rf.data.map(s => s.id), mirrorPaged(legacy, { from: '2026-08-10', to: '2026-08-20' }).rows.map(s => s.id));

// pageSize lain & halaman di luar rentang dipotong aman
const r5 = callPage({ page: 3, pageSize: 5 });
t.eq('pageSize 5 page 3: totalPages', r5.totalPages, 7);
t.eq('pageSize 5 page 3: posisi', r5.page, 3);
t.eq('pageSize 5 page 3: data sesuai mirror', r5.data.length, mirrorPaged(legacy, { page: 3, pageSize: 5 }).rows.length);
const rx = callPage({ page: 99, pageSize: 10 });
t.eq('halaman melebihi rentang: pages', rx.totalPages, 4);
t.eq('halaman melebihi rentang: dipotong ke akhir', rx.page, 4);
t.eq('halaman melebihi rentang: sisa baris', rx.data.length, 5);

// ── 11. Dashboard: pendapatan hanya bulan kalender berjalan (batas atas) ──
// Payung masalah: dulu monthScheds tidak punya batas atas, jadi semua jadwal dari
// tanggal 1 bulan ini sampai tahun depan ikut dijumlah.
const appM = mock.reset();
const curMonth = appM.__meta.today.slice(0, 7);
const monthSchedsSeed = appM.getSchedules(1, 'admin', {}).data
  .filter(s => s.status !== 'cancelled' && String(s.schedule_date).slice(0, 7) === curMonth);
const baseMonthTotal = monthSchedsSeed.reduce((a, s) => a + s.grand_total, 0);
const baseMonthPaid = monthSchedsSeed.reduce((a, s) => a + s.paid_amount, 0);
const dashBase = appM.getDashboardStats(1, 'admin').data;
t.eq('dashboard: pendapatan bulan ini = jumlah jadwal non-cancelled bulan ini', dashBase.monthRevenue, baseMonthTotal);
t.eq('dashboard: terkumpul bulan ini = jumlah dibayar jadwal bulan ini', dashBase.monthCollected, baseMonthPaid);

const mb = mock.addMonthBoundarySchedules(appM);
const dashM = appM.getDashboardStats(1, 'admin').data;
// Tepat +200000 (jadwal 201), bukan +500000: jadwal 202 (bulan depan, 300000) dan
// 204 (dibatalkan, 500000) harus di luar; 203/205 bulan lalu juga di luar.
t.eq('dashboard: bulan depan & yang dibatalkan tidak ikut dihitung', dashM.monthRevenue, baseMonthTotal + mb.curTotal);
t.eq('dashboard: uang terkumpul bulan depan/bulan lalu/batal tidak ikut', dashM.monthCollected, baseMonthPaid + mb.curPaid);
t.ok('dashboard: jadwal bulan depan tidak bocor ke pendapatan', dashM.monthRevenue < baseMonthTotal + mb.curTotal + mb.nextTotal);
t.eq('dashboard: pendapatan hari ini tidak terpengaruh batas bulan', dashM.todayRevenue, dashBase.todayRevenue);
t.eq('dashboard: hari terakhir dailyData tetap sama dengan pendapatan hari ini', dashM.dailyData[dashM.dailyData.length - 1].amount, dashM.todayRevenue);
t.eq('dashboard: dailyData tetap 30 hari', dashM.dailyData.length, 30);
t.eq('dashboard: trBreakdown hanya item jadwal bulan ini (Baby - Bapil)', dashM.trBreakdown['Baby - Bapil'], { count: 2, revenue: 210000 });
t.ok('dashboard: trBreakdown tidak memuat item jadwal bulan depan', dashM.trBreakdown[mb.nextItemName] === undefined);
t.ok('dashboard: trBreakdown tidak memuat item jadwal bulan lalu', dashM.trBreakdown[mb.prevItemName] === undefined);

// ── 12. Paket NB: diakui sekali di bulan berjalan, kunjungan lain bernilai 0 ──
const pkgRes = appM.createSchedulePackage({ customer_id: 1, start_date: mb.cur, location: 'Jl Uji Bulan', km: 0, time1: '08:00', treatment_id: 15, dp_percent: 0, payment_method: 'TF/QRIS' }, 1, 'admin');
t.ok('paket uji bulan berjalan berhasil', pkgRes.success === true);
t.eq('paket uji NB 1x 7 Hari = 485000', pkgRes.data.grand_total, 485000);
const pkgRows = appM.getSchedules(1, 'admin', {}).data.filter(s => s.package_id === pkgRes.data.package_id);
t.eq('paket uji berisi 7 kunjungan', pkgRows.length, 7);
t.eq('kunjungan selain induk bernilai 0 semua', pkgRows.filter(s => s.visit_no > 1).every(s => s.grand_total === 0 && s.paid_amount === 0), true);
t.eq('semua kunjungan paket jatuh di bulan berjalan', pkgRows.every(s => String(s.schedule_date).slice(0, 7) === curMonth), true);
const dashP = appM.getDashboardStats(1, 'admin').data;
t.eq('dashboard: paket dihitung sekali (bukan 7 kali) di bulan berjalan', dashP.monthRevenue, baseMonthTotal + mb.curTotal + 485000);

// ── 13. Laporan: dasar tanggal jadwal & parsing tanggal lokal ──
const appR = mock.reset();
const repAll = appR.getReportsData('monthly', {}, 1, 'admin');
t.eq('laporan tanpa rentang: 8 booking (yang dibatalkan tidak dihitung)', repAll.data.totalCount, 8);
t.eq('laporan tanpa rentang: total pendapatan = jumlah grand total jadwal', repAll.data.totalRevenue, 816000);
t.eq('laporan tanpa rentang: total dibayar tetap dasar pembayaran (disengaja)', repAll.data.totalCollected, 215000);

const mbR = mock.addMonthBoundarySchedules(appR);
const repFull = appR.getReportsData('monthly', {}, 1, 'admin');
t.eq('laporan tanpa rentang setelah seed baru: semua jadwal ikut', repFull.data.totalCount, 8 + mbR.count - 1);
t.eq('laporan tanpa rentang setelah seed baru: pendapatan semua jadwal', repFull.data.totalRevenue, 816000 + mbR.curTotal + mbR.nextTotal + mbR.prevTotal + mbR.prevFirstTotal);
t.eq('laporan tanpa rentang setelah seed baru: dibayar semua jadwal', repFull.data.totalCollected, 215000 + mbR.curPaid + mbR.nextPaid + mbR.prevPaid + mbR.prevFirstPaid);

// Rentang dua hari di bulan lalu: hari pertama (205) dan hari terakhir (203) wajib ikut.
// Di zona waktu di belakang UTC, new Date('yyyy-MM-dd') memundurkan sehari dan
// membuang hari pertama; parseLocalDate tidak.
const repRange = appR.getReportsData('monthly', { dateFrom: mbR.prevFirst, dateTo: mbR.prev }, 1, 'admin');
t.eq('laporan rentang: hari pertama & hari terakhir ikut (2 booking)', repRange.data.totalCount, 2);
t.eq('laporan rentang: pendapatan 250000 + 400000', repRange.data.totalRevenue, mbR.prevFirstTotal + mbR.prevTotal);
t.eq('laporan rentang: dibayar 250000 + 200000', repRange.data.totalCollected, mbR.prevFirstPaid + mbR.prevPaid);
t.eq('laporan rentang: satu grup bulan', repRange.data.monthlyData.length, 1);
t.eq('laporan rentang: label grup = bulan lalu', repRange.data.monthlyData[0].label, mbR.prev.slice(0, 7));
t.eq('laporan rentang: hitungan per bulan', repRange.data.monthlyData[0].count, 2);

// Rentang satu hari: membuktikan hari terakhir tidak ikut terbuang.
const repDay = appR.getReportsData('monthly', { dateFrom: mbR.prev, dateTo: mbR.prev }, 1, 'admin');
t.eq('laporan satu hari: hanya jadwal hari itu', [repDay.data.totalCount, repDay.data.totalRevenue], [1, mbR.prevTotal]);

// Laporan per treatment memakai item jadwal pada tanggal jadwal (SC.DATE).
const repTr = appR.getReportsData('treatments', { dateFrom: mbR.prevFirst, dateTo: mbR.prev }, 1, 'admin');
t.eq('laporan treatment: hanya item jadwal dalam rentang', repTr.data.treatments.map(x => [x.name, x.revenue]), [[mbR.prevItemName, 400000]]);
const repTrAll = appR.getReportsData('treatments', {}, 1, 'admin');
t.eq('laporan treatment tanpa rentang: item jadwal yang dibatalkan tidak dihitung', repTrAll.data.treatments.filter(x => x.name === 'Baby - Sleep Booster')[0].revenue, 170000);

// Laporan pelanggan memakai SC.TOTAL (nilai treatment), bukan uang yang sudah dibayar.
const repCu = appR.getReportsData('customers', { dateFrom: mbR.prevFirst, dateTo: mbR.prev }, 1, 'admin');
t.eq('laporan pelanggan: satu pelanggan, nilai = grand total jadwal', repCu.data.customers.map(c => [c.id, c.totalRevenue, c.count]), [[1, mbR.prevFirstTotal + mbR.prevTotal, 2]]);
t.ok('laporan pelanggan: nilai bukan jumlah pembayaran', repCu.data.customers[0].totalRevenue !== (mbR.prevFirstPaid + mbR.prevPaid));

// ── 14. parseLocalDate: tanggal teks dibaca sebagai waktu lokal ──
const pd = app.parseLocalDate('2026-10-21');
t.eq('parseLocalDate: komponen tanggal lokal', [pd.getFullYear(), pd.getMonth() + 1, pd.getDate()], [2026, 10, 21]);
t.eq('parseLocalDate: tengah malam lokal (bukan UTC)', pd.getHours(), 0);
const pdt = app.parseLocalDate('2026-10-21T09:15:30');
t.eq('parseLocalDate: teks dengan jam', [pdt.getHours(), pdt.getMinutes(), pdt.getSeconds()], [9, 15, 30]);
t.eq('parseLocalDate: teks dengan spasi', app.parseLocalDate('2026-10-21 09:15:30').getHours(), 9);
const pdd = app.parseLocalDate(app.__newDate(2026, 9, 21, 9, 0));
t.eq('parseLocalDate: objek Date diteruskan apa adanya', pdd.getDate(), 21);
t.ok('parseLocalDate: teks ngawur jadi Invalid Date', isNaN(app.parseLocalDate('21 Oktober 2026')));
t.ok('parseLocalDate: kosong jadi Invalid Date', isNaN(app.parseLocalDate('')) && isNaN(app.parseLocalDate(null)));

t.finish();
