'use strict';
/*
 * h2_write.js — uji endpoint TULIS (addSchedule, updateSchedule, pembayaran,
 * paket-DP, pengaturan, nomor invoice, pelanggan) memakai Code.gs asli.
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

const t = mkSuite('h2_write');
const app = mock.reset();
const today = app.__meta.today;
const PAD = 5; // lapis keamanan

function pick(arr, pred) { return arr.filter(pred)[0]; }
function schedById(id) { return pick(app.getSchedules(1, 'admin', {}).data, s => s.id === id); }
function custTotals(id) {
  const c = pick(app.getCustomers(1, 'admin').data, x => x.id === id);
  return { total: c.total_purchase, paid: c.total_paid, due: c.total_due };
}
function detail(id) { return app.getScheduleDetail(id, 1, 'admin').data; }

// ── A. addSchedule: harga selalu dari Treatments (klien yang bilang bohong diabaikan) ──
const beforeA = custTotals(2);
const add = app.addSchedule({
  customer_id: 2, therapist_id: 2, schedule_date: today + 'T00:00:00',
  schedule_time: '09:30', location: 'Jl Uji A', km: 6.3,
  items: [{ treatment_id: 1, price: 999, qty: 2 }], discount: 0
}, 1, 'admin');
t.ok('addSchedule berhasil', add.success === true);
const addId = add && add.data && add.data.id;
const dAdd = detail(addId);
t.eq('fee dihitung server (2× Baby Sleep Booster 85000), harga bohong klien diabaikan', dAdd.fee_treatment, 170000);
t.eq('transport server dari km 6.3 → 12000', dAdd.transport_fee, 12000);
t.eq('total = fee + transport − diskon = 182000', dAdd.grand_total, 182000);
t.eq('Schedule_Items memakai harga Treatments', dAdd.items[0].price, 85000);
t.eq('keterangan "BELUM BAYAR" bila tanpa bayar', dAdd.keterangan, 'BELUM BAYAR');
t.eq('total pelanggan bergerak +182000', custTotals(2).total - beforeA.total, 182000);
t.eq('due pelanggan bergerak +182000', custTotals(2).due - beforeA.due, 182000);
t.eq('tanpa pembayaran: baris Payments tidak dibuat', app.getPayments(1, 'admin', {}).data.length, 3);

t.ok('addSchedule ditolak bila tanggal kosong', app.addSchedule({ items: [{ treatment_id: 1, qty: 1 }] }, 1, 'admin').success === false);
t.ok('addSchedule ditolak tanpa item treatment', app.addSchedule({ schedule_date: today }, 1, 'admin').success === false);
t.ok('terapis tidak boleh addSchedule', app.addSchedule({ schedule_date: today, items: [{ treatment_id: 1, qty: 1 }] }, 2, 'therapist').success === false);
t.ok('diskon negatif ditolak', app.addSchedule({ schedule_date: today, items: [{ treatment_id: 1, qty: 1 }], discount: -5 }, 1, 'admin').success === false);

// ── B. total dengan diskon + DP ──
const add2 = app.addSchedule({
  customer_id: 2, therapist_id: 2, schedule_date: today, schedule_time: '11:00',
  location: 'Jl Uji B', km: 5.8, items: [{ treatment_id: 4, qty: 1 }],
  discount: 10000, paid_amount: 30000, payment_method: 'CASH'
}, 1, 'admin');
t.ok('booking diskon berhasil', add2.success === true);
const d2 = detail(add2.data.id);
t.eq('total = 100000 + 0 − 10000 = 90000', d2.grand_total, 90000);
t.eq('dp 30000 → keterangan "DP"', d2.keterangan, 'DP');
t.eq('sisa tagihan 60000', d2.due_amount, 60000);
t.eq('metode CASH diseragamkan "Cash"', d2.payment_method, 'Cash');
const pay2 = pick(app.getPayments(1, 'admin', {}).data, p => p.schedule_id === add2.data.id);
t.eq('pembayaran DP otomatis tercatat 30000', pay2.amount, 30000);
t.eq('pembayaran DP memakai metode yang sama', pay2.method, 'Cash');

// ── C. updateSchedule: nomor invoice dipertahankan, harga dihitung ulang, ──
//      item diganti, pembayaran dicap total baru, total pelanggan ikut delta.
const beforeC = custTotals(2);
const addC = app.addSchedule({
  customer_id: 2, therapist_id: 2, schedule_date: today, schedule_time: '08:00',
  location: 'Jl Uji C', km: '', items: [{ treatment_id: 1, qty: 1 }],
  paid_amount: 85000, payment_method: 'TF/QRIS'
}, 1, 'admin');
const cid = addC.data.id;
const invC = addC.data.invoice_no;
const afterAddC = custTotals(2).total;
t.eq('booking dibayar penuh → "LUNAS TF/QRIS"', detail(cid).keterangan, 'LUNAS TF/QRIS');
const up1 = app.updateSchedule(1, 'admin', cid, {
  customer_id: 2, schedule_date: today, schedule_time: '08:00', location: 'Jl Uji C', km: '',
  items: [{ treatment_id: 5, qty: 1 }]
});
t.ok('updateSchedule berhasil', up1.success === true);
const dC1 = detail(cid);
t.eq('nomor invoice dipertahankan', dC1.invoice_no, invC);
t.eq('harga dihitung ulang dari Treatments (Kids Sleep Booster 100000)', dC1.fee_treatment, 100000);
t.eq('yang dibayar tetap, pada batas total baru', dC1.paid_amount, 85000);
t.eq('sisa tagihan 15000 → keterangan "DP"', dC1.keterangan, 'DP');
t.eq('Schedule_Items diganti seluruhnya', dC1.items.length, 1);
t.eq('item baru "Kids - Sleep Booster"', dC1.items[0].treatment_name, 'Kids - Sleep Booster');
const delta1 = custTotals(2).total - afterAddC;
t.eq('total pelanggan bergerak sesuai delta baru (85000 → 100000)', delta1, 15000);
const afterUp1 = custTotals(2).total;
const up2 = app.updateSchedule(1, 'admin', cid, {
  customer_id: 2, schedule_date: today, schedule_time: '08:00', location: 'Jl Uji C', km: '',
  items: [{ treatment_id: 26, qty: 1 }]
});
const dC2 = detail(cid);
t.eq('total baru lebih murah: dibayar dicap 30000', dC2.paid_amount, 30000);
t.eq('total baru lebih murah: lunas kembali', dC2.keterangan, 'LUNAS TF/QRIS');
t.eq('total pelanggan turun sesuai total baru (−70000)', custTotals(2).total - afterUp1, -70000);
t.ok('updateSchedule ditolak tanpa item', app.updateSchedule(1, 'admin', cid, { schedule_date: today, items: [] }).success === false);
t.ok('updateSchedule jadwal tak dikenal ditolak', app.updateSchedule(1, 'admin', 99999, { schedule_date: today, items: [{ treatment_id: 1, qty: 1 }] }).success === false);

// ── D. Catatan pembayaran: LUNAS / DP / BELUM BAYAR; status tak diubah pembayaran ──
const addD = app.addSchedule({
  customer_id: 1, therapist_id: 2, schedule_date: today, schedule_time: '13:00',
  location: 'Jl Uji D', km: '', items: [{ treatment_id: 2, qty: 1 }]
}, 1, 'admin');
const did = addD.data.id;
t.eq('booking tanpa bayar → "BELUM BAYAR"', detail(did).keterangan, 'BELUM BAYAR');
t.ok('pembayaran sebagian berhasil', app.addSchedulePayment({ schedule_id: did, amount: 40000, method: 'cash' }, 1, 'admin').success === true);
let dl = detail(did);
t.eq('sebagian → keterangan "DP"', dl.keterangan, 'DP');
t.eq('status TETAP scheduled (bukan done)', dl.status, 'scheduled');
t.ok('pelunasan berhasil', app.addSchedulePayment({ schedule_id: did, amount: 60000, method: 'CASH' }, 1, 'admin').success === true);
dl = detail(did);
t.eq('CASH mendeteksi: "LUNAS CASH"', dl.keterangan, 'LUNAS CASH');
t.eq('status tetap scheduled setelah lunas', dl.status, 'scheduled');
t.ok('kelebihan bayar ditolak', app.addSchedulePayment({ schedule_id: did, amount: 1 }, 1, 'admin').success === false);
t.ok('terapis tidak boleh mencatat pembayaran', app.addSchedulePayment({ schedule_id: did, amount: 1 }, 2, 'therapist').success === false);
app.updateScheduleStatus(did, 'cancelled', '', 1, 'admin');
t.ok('invoice dibatalkan tidak bisa dibayar', app.addSchedulePayment({ schedule_id: did, amount: 1 }, 1, 'admin').success === false);
const beforeUn = custTotals(2);
const addU = app.addSchedule({ customer_id: 2, schedule_date: today, items: [{ treatment_id: 2, qty: 1 }] }, 3, 'receptionist');
t.ok('resepsionis boleh addSchedule', addU.success === true);
t.eq('total pelanggan bergerak +100000 walau dari resepsionis', custTotals(2).total - beforeUn.total, 100000);

// ── E. DP paket: nominal tegas, dp_percent 0 tidak menuntut DP, bawaan 20% ──
const bp = (extra) => Object.assign({
  treatment_id: 13, customer_id: 1, therapist_id: 2, start_date: today,
  location: 'Jl Uji P', km: '', time1: '07:00', payment_method: 'TF/QRIS'
}, extra || {});
const pkgA = app.createSchedulePackage(bp({ dp_amount: 12345 }), 1, 'admin');
t.ok('paket dp_amount tegas berhasil', pkgA.success === true && pkgA.data.dp === 12345);
t.eq('dp_amount 12345 → due 70000 − 12345', pkgA.data.due, 57655);
t.ok('DP paket tercatat di Payments', pick(app.getPayments(1, 'admin', {}).data, p => p.amount === 12345).notes === 'DP paket');
const pkgB = app.createSchedulePackage(bp({ treatment_id: 14, time1: '08:00', dp_percent: 0 }), 1, 'admin');
t.ok('dp_percent 0 → tidak menuntut DP', pkgB.success === true && pkgB.data.dp === 0);
t.eq('dp_percent 0 → keterangan "BELUM BAYAR"', detail(pkgB.data.master_id).keterangan, 'BELUM BAYAR');
t.ok('tanpa DP: Payments tidak menambah baris 205000', pick(app.getPayments(1, 'admin', {}).data, p => p.amount === 205000) === undefined);
const pkgC = app.createSchedulePackage(bp({ treatment_id: 17, time1: '09:00', time2: '15.30'.replace('.', ':') }), 1, 'admin');
t.eq('dp bawaan 20% dari 130000', pkgC.data.dp, 26000);

// ── F. saveAllSettings: hanya admin; kunci tak dikenal diabaikan; last_invoice_no tersembunyi ──
t.ok('terapis ditolak', app.saveAllSettings({ business_name: 'X' }, 2, 'therapist').success === false);
t.ok('resepsionis ditolak', app.saveAllSettings({ business_name: 'X' }, 3, 'receptionist').success === false);
const saved = app.saveAllSettings({
  business_phone: '0811-1111-1111',
  logo_url: 'https:contoh-cdn.test/logo.png',
  qris_url: 'https:contoh-cdn.test/qris.png',
  signature_url: 'https:contoh-cdn.test/ttd.png',
  kunci_asing: 'dua'
}, 1, 'admin');
t.ok('admin berhasil menyimpan pengaturan', saved.success === true);
const st1 = app.getSettings().data;
t.eq('business_phone tersimpan', st1.business_phone, '0811-1111-1111');
t.eq('logo_url diterima', st1.logo_url, 'https:contoh-cdn.test/logo.png');
t.eq('qris_url diterima', st1.qris_url, 'https:contoh-cdn.test/qris.png');
t.eq('signature_url diterima', st1.signature_url, 'https:contoh-cdn.test/ttd.png');
t.ok('kunci asing diabaikan', st1.kunci_asing === undefined);
t.ok('last_invoice_no tidak dilayani getSettings', st1.last_invoice_no === undefined);
t.eq('getSettings menyediakan 14 kunci (15 − last_invoice_no)', Object.keys(st1).length, 14);

// ── G. genInvoiceNo: nomor berikutnya, terhapus tidak dipakai ulang, prefix dari Settings ──
const g1 = app.genInvoiceNo();
const g2 = app.genInvoiceNo();
const seqOf = (inv) => parseInt(String(inv).split('-')[2], 10);
// Perilaku nyata: genInvoiceNo murni berspekulasi (tidak menulis apa pun), jadi
// dua panggilan beruntun mengembalikan nomor YANG SAMA; nomornya "dihabiskan"
// lewat addSchedule yang menyimpan last_invoice_no. Didokumentasikan di sini.
t.eq('dua panggilan beruntun (tanpa membuat) mengembalikan nomor yang sama', seqOf(g2), seqOf(g1));
const addG = app.addSchedule({ customer_id: 1, schedule_date: today, items: [{ treatment_id: 1, qty: 1 }] }, 1, 'admin');
const invG = addG.data.invoice_no;
t.eq('addSchedule menghabiskan nomor yang barusan dipeek', seqOf(invG), seqOf(g1));
app.deleteSchedule(addG.data.id, 1, 'admin');
const g3 = app.genInvoiceNo();
t.ok('menghapus invoice terbaru TIDAK membebaskan nomornya (high-water mark)', seqOf(g3) === seqOf(invG) + 1);
app.saveAllSettings({ invoice_prefix: 'XYZ' }, 1, 'admin');
const g4 = app.genInvoiceNo();
t.eq('prefix ikut invoice_prefix dari Settings', g4.split('-')[0], 'XYZ');
t.ok('nomor tertinggi tetap diteruskan walau prefix baru', seqOf(g4) === seqOf(g3));

// ── H. Pelanggan: telepon legacy salah tipe tidak bikin crash, aturan nol depan konsisten ──
const addCu = app.addCustomer({ name: 'Bunda Uji', phone: 628112233445, address: 'Ambawerk', baby_name: 'Bayi U' }, 1, 'admin');
t.ok('addCustomer nominal telepon berhasil', addCu.success === true);
const cuU = pick(app.getCustomers(1, 'admin').data, c => c.id === addCu.data.id);
t.eq('telepon legacy numerik tampil rapi nol depan (grup best effort 4-4-sisa)', cuU.phone, '0811-2233-445');
t.eq('phone_wa digits-only 62 tanpa nol depan', cuU.phone_wa, '628112233445');
t.ok('resepsionis boleh addCustomer', app.addCustomer({ name: 'Bunda Resep' }, 3, 'receptionist').success === true);
t.ok('terapis ditolak', app.addCustomer({ name: 'Bunda Ter' }, 2, 'therapist').success === false);
app.updateCustomer({ id: addCu.data.id, name: 'Bunda Uji', phone: '0812-9988-7766', maps_link: 'goo.gl/uji' }, 1, 'admin');
const cuU2 = pick(app.getCustomers(1, 'admin').data, c => c.id === addCu.data.id);
t.eq('updateCustomer telepon berformat tetap rapi', cuU2.phone, '0812-9988-7766');
t.eq('updateCustomer maps_link tersimpan', cuU2.maps_link, 'goo.gl/uji');
app.updateCustomer({ id: addCu.data.id, name: 'Bunda Uji', phone: null }, 1, 'admin');
t.eq('telepon null → kosong tanpa merusak nol depan aturan', pick(app.getCustomers(1, 'admin').data, c => c.id === addCu.data.id).phone, '');
t.ok('updateCustomer pelanggan tak dikenal ditolak', app.updateCustomer({ id: 9999, name: 'X' }, 1, 'admin').success === false);

// sanity: sampai sini seluruh data tetap JSON-aman
t.ok('getSchedules tetap JSON-aman setelah banyak tulisan', mock.deepScan(app.getSchedules(1, 'admin', {})).length === 0);

t.finish();
