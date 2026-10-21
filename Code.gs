/**
 * DaisafaCare — Homecare Invoice & Treatment Database
 * Google Apps Script Backend
 *
 * Business: Daisafacare — Mom & Baby Treatment (Homecare Baby Spa)
 * Contact: 0822-3212-1081 | @daisafacare
 */

// ─── Sheet Names ───────────────────────────────────────────────────────────────
const SHEETS = {
  USERS: 'Users',
  CUSTOMERS: 'Customers',
  TREATMENTS: 'Treatments',
  SCHEDULES: 'Schedules',
  SCHEDULE_ITEMS: 'Schedule_Items',
  PAYMENTS: 'Payments',
  SETTINGS: 'Settings',
  LOGS: 'Activity_Logs'
};

// ─── Column Index Maps ─────────────────────────────────────────────────────────

// Users: id, full_name, email, phone, password, role, is_active, created_at, updated_at
const U = { ID:0, NAME:1, EMAIL:2, PHONE:3, PWD:4, ROLE:5, ACTIVE:6, CREATED:7, UPDATED:8 };

// Customers: id, name, phone, address, baby_name, baby_age, notes, total_purchase, total_paid, total_due, is_active, created_by, created_at, dob, maps_link
const CU = {
  ID:0, NAME:1, PHONE:2, ADDR:3, BABY_NAME:4, BABY_AGE:5, NOTES:6,
  TOTAL:7, PAID:8, DUE:9, ACTIVE:10, CREATED_BY:11, CREATED:12,
  // Tanggal lahir pelanggan (tanggal, disimpan sebagai teks yyyy-MM-dd)
  DOB:13,
  // Tautan Google Maps lokasi pelanggan (teks)
  MAPS_LINK:14
};

// Treatments: id, category, name, description, price, duration_min, is_active, created_by, created_at
const TR = { ID:0, CAT:1, NAME:2, DESC:3, PRICE:4, DURATION:5, ACTIVE:6, CREATED_BY:7, CREATED:8 };

// Schedules: id, invoice_no, customer_id, therapist_id, schedule_date, schedule_time,
//   location, km_distance, fee_treatment, transport_fee, subtotal, discount, grand_total,
//   paid_amount, due_amount, payment_method, status, keterangan, notes, created_by, created_at, updated_at, maps_link
const SC = {
  ID:0, INV_NO:1, CUST_ID:2, THERAPIST_ID:3,
  DATE:4, TIME:5, LOCATION:6, KM:7,
  FEE:8, TRANSPORT:9, SUBTOTAL:10, DISCOUNT:11, TOTAL:12,
  PAID:13, DUE:14, METHOD:15, STATUS:16,
  KETERANGAN:17, NOTES:18, CREATED_BY:19, CREATED:20, UPDATED:21,
  // Tautan Google Maps lokasi kunjungan (teks)
  MAPS_LINK:22,
  // ID paket NB yang sama untuk semua kunjungan dalam satu paket (teks, contoh PKG-000012)
  PKG_ID:23,
  // Nama paket yang dibeli, contoh: NB 2x - 7 Hari (teks)
  PKG_NAME:24,
  // Nomor kunjungan di dalam paket (1 sampai jumlah kunjungan)
  VISIT_NO:25,
  // Jumlah seluruh kunjungan dalam paket (contoh: NB 2x 7 Hari berisi 14 kunjungan)
  TOTAL_VISITS:26,
  // ID jadwal kunjungan pertama yang memegang invoice dan uang paket; kosong untuk booking normal
  MASTER_ID:27
};

// Schedule_Items: id, schedule_id, treatment_id, treatment_name, price, qty, subtotal
const SI = { ID:0, SCHED_ID:1, TR_ID:2, TR_NAME:3, PRICE:4, QTY:5, SUBTOTAL:6 };

// Payments: id, schedule_id, customer_id, amount, method, reference_no, payment_date, notes, created_by, created_at
const PAY = { ID:0, SCHED_ID:1, CUST_ID:2, AMT:3, METHOD:4, REF:5, DATE:6, NOTES:7, CREATED_BY:8, CREATED:9 };

// Settings: id, key, value, updated_by, updated_at
const ST = { ID:0, KEY:1, VAL:2, UPDATED_BY:3, UPDATED:4 };

// Logs: id, user_id, username, action, table, record_id, details, created_at
const L = { ID:0, UID:1, UNAME:2, ACTION:3, TABLE:4, RID:5, DETAILS:6, CREATED:7 };

// ─── Web App Entry ─────────────────────────────────────────────────────────────
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('DaisafaCare — Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function getSheetData(name) {
  const sh = getSheet(name);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).getValues();
}

function getNextId(name) {
  const sh = getSheet(name);
  if (!sh || sh.getLastRow() < 2) return 1;
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat()
    .map(v => typeof v === 'number' ? v : Number(String(v == null ? '' : v).trim()))
    .filter(n => typeof n === 'number' && isFinite(n));
  return ids.length ? Math.max(...ids) + 1 : 1;
}

function findRowByValue(name, col, val) {
  const data = getSheetData(name);
  for (let i = 0; i < data.length; i++) {
    if (data[i][col] == val) return { row: i + 2, data: data[i] };
  }
  return null;
}

function ts() { return new Date().toISOString(); }

function isActive(val) { return val === 1 || val === true || val === '1'; }

function fmtDate(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(val).split('T')[0];
}

function fmtTs(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function fmtTime(val) {
  if (val === null || val === undefined || val === '') return '';
  let out;
  if (val instanceof Date) {
    out = Utilities.formatDate(val, Session.getScriptTimeZone(), 'HH:mm');
  } else {
    const s = String(val).trim();
    const m = s.match(/(\d{1,2}):(\d{2})/);
    out = m ? (String(m[1]).padStart(2, '0') + ':' + m[2]) : s;
  }
  // Baris lama menyimpan jam sebagai angka 0 (tampil 00:00) padahal jadwal belum punya jam
  if (out === '00:00' || out === '0') return '';
  return out;
}

// Nomor telepon dirapikan ke bentuk internasional (hanya digit, diawali 62).
// Baris lama ada yang tersimpan sebagai angka, jadi 0 di depan bisa sudah hilang.
function normalizePhoneWa(v) {
  if (v === null || v === undefined) return '';
  let s = String(v).replace(/\D/g, '');
  if (!s) return '';
  if (s.indexOf('62') === 0) return s;
  if (s.charAt(0) === '0') return '62' + s.substring(1);
  if (s.charAt(0) === '8') return '62' + s;
  return s;
}

// Tampilan nomor telepon lokal untuk layar: 0812-3456-7890 (best effort, aman untuk nomor pendek)
function formatPhone(v) {
  const wa = normalizePhoneWa(v);
  if (!wa) return '';
  if (wa.indexOf('62') !== 0) return wa;
  const local = wa.substring(2);
  if (!local) return '';
  const digits = '0' + local;
  if (digits.length < 8) return digits;
  const parts = [digits.substring(0, 4), digits.substring(4, 8), digits.substring(8)].filter(p => p !== '');
  return parts.join('-');
}

// Metode pembayaran disimpan seragam: hanya 'Cash' atau 'TF/QRIS'
function normalizePaymentMethod(v) {
  return String(v === null || v === undefined ? '' : v).toLowerCase().indexOf('cash') !== -1 ? 'Cash' : 'TF/QRIS';
}

// Untuk tampilan: metode kosong tetap kosong (tidak dianggap TF/QRIS)
function paymentMethodLabel(v) {
  const s = String(v === null || v === undefined ? '' : v).trim();
  if (!s) return '';
  return normalizePaymentMethod(s);
}

// Data sheet untuk dikirim ke halaman web. Objek Date tidak boleh dikirim lewat google.script.run,
// jadi setiap sel bertanggal diubah menjadi teks waktu lokal spreadsheet.
function getSheetDataClient(name) {
  const tz = Session.getScriptTimeZone();
  return getSheetData(name).map(row => row.map(v => {
    if (v instanceof Date) return Utilities.formatDate(v, tz, "yyyy-MM-dd'T'HH:mm:ss");
    if (v === null || v === undefined) return '';
    return v;
  }));
}

// Peta teks jam per id jadwal. Kolom jam disimpan sheet sebagai angka epoch 1899,
// jadi dibaca sebagai teks tampilan supaya jamnya persis seperti di sheet.
function getScheduleTimeById() {
  const out = {};
  const sh = getSheet(SHEETS.SCHEDULES);
  const n = sh ? sh.getLastRow() - 1 : 0;
  if (n < 1) return out;
  const ids = sh.getRange(2, SC.ID + 1, n, 1).getValues();
  const times = sh.getRange(2, SC.TIME + 1, n, 1).getDisplayValues();
  for (let i = 0; i < n; i++) out[ids[i][0]] = String(times[i][0] || '').trim();
  return out;
}

function getUsernameById(uid) {
  const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(uid));
  return r ? r.data[U.NAME] : 'Unknown';
}

// ─── Role Policy & Settings ────────────────────────────────────────────────────
const WRITER_ROLES = ['admin', 'receptionist'];
function canWrite(role) { return WRITER_ROLES.indexOf(String(role || '').toLowerCase()) !== -1; }

function getSetting(key, fallback) {
  const r = findRowByValue(SHEETS.SETTINGS, ST.KEY, key);
  return (r && r.data[ST.VAL] !== '' && r.data[ST.VAL] != null) ? r.data[ST.VAL] : fallback;
}

// Simpan satu nilai pengaturan (dipakai untuk penanda nomor invoice terakhir)
function setSetting(key, value, userId) {
  const sh = getSheet(SHEETS.SETTINGS);
  const r = findRowByValue(SHEETS.SETTINGS, ST.KEY, key);
  if (r) {
    const row = r.data.slice();
    row[ST.KEY] = key;
    row[ST.VAL] = value;
    row[ST.UPDATED_BY] = userId || '';
    row[ST.UPDATED] = ts();
    sh.getRange(r.row, 1, 1, row.length).setValues([row]);
  } else {
    sh.appendRow([getNextId(SHEETS.SETTINGS), key, value, userId || '', ts()]);
  }
}

// Aturan biaya transport: gratis sampai 5 km (termasuk 5 km),
// lebih dari itu dikalikan tarif per km dengan jarak dibulatkan ke bawah.
function calcTransportFee(km, rate) {
  const dist = parseFloat(km);
  const rateVal = parseFloat(rate);
  if (!isFinite(dist) || !isFinite(rateVal)) return 0;
  // Jarak dibulatkan ke bawah dulu, baru dibandingkan dengan 5 km:
  // 5,8 km -> 5 km (gratis), 6,3 km -> 6 km (Rp12.000)
  const whole = Math.floor(dist);
  if (whole <= 5) return 0;
  return Math.max(0, whole * rateVal);
}

// Baca paket NB dari nama treatment: '7 Hari' berisi 7 hari,
// kategori 'NB 2x' berarti 2 kunjungan per hari, 'NB 1x' berarti 1 kunjungan per hari.
function parsePackageTreatment(name, category) {
  const cat = String(category === null || category === undefined ? '' : category).toLowerCase().replace(/\s+/g, '');
  const visitsPerDay = cat.indexOf('2x') !== -1 ? 2 : 1;
  const m = String(name === null || name === undefined ? '' : name).match(/\d+/);
  let days = m ? parseInt(m[0], 10) : 1;
  if (!isFinite(days) || days < 1) days = 1;
  if (days > 60) days = 60;
  return { days: days, visitsPerDay: visitsPerDay };
}

// Tambah sejumlah hari pada teks tanggal yyyy-MM-dd memakai tanggal lokal,
// supaya tidak bergeser karena zona waktu atau perubahan bulan/tahun.
function addDaysStr(dateStr, days) {
  const m = String(dateStr === null || dateStr === undefined ? '' : dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10) + (parseInt(days, 10) || 0));
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
function login(email, password) {
  try {
    if (!email || !password) return { success: false, message: 'Email dan password wajib diisi' };
    const r = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (!r) return { success: false, message: 'Email atau password salah' };
    const u = r.data;
    if (!isActive(u[U.ACTIVE])) return { success: false, message: 'Akun tidak aktif. Hubungi admin.' };
    if (password !== u[U.PWD]) return { success: false, message: 'Email atau password salah' };
    getSheet(SHEETS.USERS).getRange(r.row, U.UPDATED + 1).setValue(ts());
    logActivity(u[U.ID], u[U.NAME], 'LOGIN', 'Users', u[U.ID], '');
    return {
      success: true, message: 'Login berhasil',
      data: { id: u[U.ID], full_name: u[U.NAME], email: u[U.EMAIL], phone: formatPhone(u[U.PHONE]), phone_wa: normalizePhoneWa(u[U.PHONE]), role: u[U.ROLE] }
    };
  } catch(e) { console.error('login:', e); return { success: false, message: 'Login gagal' }; }
}

// ─── Users ─────────────────────────────────────────────────────────────────────
// Halaman login dihapus, jadi aplikasi memakai pengguna admin aktif pertama.
// Kalau data Users belum siap, dipakai admin bawaan supaya aplikasi tetap terbuka.
function getAppUser() {
  try {
    const data = getSheetDataClient(SHEETS.USERS);
    const active = data.filter(r => isActive(r[U.ACTIVE]));
    const admin = active.filter(r => String(r[U.ROLE] || '').toLowerCase().trim() === 'admin')[0];
    const u = admin || active[0];
    if (!u) {
      return { success: true, data: { id: 1, full_name: 'Admin Daisafa', email: '', role: 'admin', phone: '', phone_wa: '' } };
    }
    return {
      success: true,
      data: {
        id: u[U.ID], full_name: u[U.NAME], email: u[U.EMAIL], role: u[U.ROLE],
        phone: formatPhone(u[U.PHONE]), phone_wa: normalizePhoneWa(u[U.PHONE])
      }
    };
  } catch(e) { console.error('getAppUser:', e); return { success: false, message: 'Gagal memuat pengguna' }; }
}

function getUsers(userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Akses ditolak' };
    const data = getSheetDataClient(SHEETS.USERS);
    return {
      success: true,
      data: data.map(r => ({
        id: r[U.ID], full_name: r[U.NAME], email: r[U.EMAIL], phone: formatPhone(r[U.PHONE]), phone_wa: normalizePhoneWa(r[U.PHONE]),
        role: r[U.ROLE], is_active: isActive(r[U.ACTIVE]) ? 1 : 0,
        created_at: fmtTs(r[U.CREATED])
      })).reverse()
    };
  } catch(e) { return { success: false, message: 'Gagal memuat pengguna' }; }
}

function addUser(data, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Akses ditolak' };
    const { full_name, email, phone, password, userRole } = data;
    if (!full_name || !email || !password) return { success: false, message: 'Nama, email, dan password wajib diisi' };
    if (password.length < 6) return { success: false, message: 'Password minimal 6 karakter' };
    const newRole = String(userRole || 'receptionist').toLowerCase().trim();
    if (['admin','therapist','receptionist'].indexOf(newRole) === -1) return { success: false, message: 'Role tidak valid' };
    const existing = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (existing) return { success: false, message: 'Email sudah terdaftar' };
    const sh = getSheet(SHEETS.USERS);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.USERS);
      const now = ts();
      sh.appendRow([newId, full_name.trim(), email.trim().toLowerCase(), formatPhone(phone), password, newRole, 1, now, now]);
      logActivity(userId, '', 'CREATE', 'Users', newId, 'Added: '+full_name.trim());
      return { success: true, message: 'Pengguna berhasil ditambahkan', data: { id: newId } };
    } finally { lock.releaseLock(); }
  } catch(e) { return { success: false, message: 'Gagal menambahkan pengguna' }; }
}

function updateUser(data, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Akses ditolak' };
    const { id, full_name, email, phone, password, userRole, is_active } = data;
    if (!id || !full_name || !email) return { success: false, message: 'Nama dan email wajib diisi' };
    if (password && String(password).length < 6) return { success: false, message: 'Password minimal 6 karakter' };
    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(id));
    if (!r) return { success: false, message: 'Pengguna tidak ditemukan' };
    const ec = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (ec && ec.data[U.ID] != parseInt(id)) return { success: false, message: 'Email sudah digunakan' };
    const row = r.data.slice();
    row[U.NAME] = full_name.trim();
    row[U.EMAIL] = email.trim().toLowerCase();
    row[U.PHONE] = formatPhone(phone);
    row[U.ROLE] = userRole||'receptionist';
    if (is_active !== undefined && is_active !== null) row[U.ACTIVE] = (is_active==1||is_active===true) ? 1 : 0;
    if (password) row[U.PWD] = password;
    row[U.UPDATED] = ts();
    getSheet(SHEETS.USERS).getRange(r.row, 1, 1, row.length).setValues([row]);
    logActivity(userId, '', 'UPDATE', 'Users', parseInt(id), 'Updated: '+full_name.trim());
    return { success: true, message: 'Pengguna berhasil diperbarui' };
  } catch(e) { return { success: false, message: 'Gagal memperbarui pengguna' }; }
}

function deleteUser(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Hanya admin yang bisa menghapus' };
    if (parseInt(id) === parseInt(userId)) return { success: false, message: 'Tidak bisa menghapus akun sendiri' };
    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(id));
    if (!r) return { success: false, message: 'Pengguna tidak ditemukan' };
    const name = r.data[U.NAME];
    getSheet(SHEETS.USERS).deleteRow(r.row);
    logActivity(userId, '', 'DELETE', 'Users', parseInt(id), 'Deleted: '+name);
    return { success: true, message: 'Pengguna berhasil dihapus' };
  } catch(e) { return { success: false, message: 'Gagal menghapus pengguna' }; }
}

function getProfile(userId) {
  try {
    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(userId));
    if (!r) return { success: false, message: 'Pengguna tidak ditemukan' };
    const u = r.data;
    return { success: true, data: { id: u[U.ID], full_name: u[U.NAME], email: u[U.EMAIL], phone: formatPhone(u[U.PHONE]), phone_wa: normalizePhoneWa(u[U.PHONE]), role: u[U.ROLE] } };
  } catch(e) { return { success: false, message: 'Gagal memuat profil' }; }
}

function updateProfile(profileData, userId) {
  try {
    const { full_name, phone } = profileData;
    if (!full_name) return { success: false, message: 'Nama wajib diisi' };
    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(userId));
    if (!r) return { success: false, message: 'Pengguna tidak ditemukan' };
    const row = r.data.slice();
    row[U.NAME] = full_name.trim();
    row[U.PHONE] = formatPhone(phone);
    row[U.UPDATED] = ts();
    getSheet(SHEETS.USERS).getRange(r.row, 1, 1, row.length).setValues([row]);
    return { success: true, message: 'Profil berhasil diperbarui' };
  } catch(e) { return { success: false, message: 'Gagal memperbarui profil' }; }
}

function changePassword(userId, currentPassword, newPassword) {
  try {
    if (!newPassword || newPassword.length < 6) return { success: false, message: 'Password baru minimal 6 karakter' };
    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(userId));
    if (!r) return { success: false, message: 'Pengguna tidak ditemukan' };
    if (currentPassword !== r.data[U.PWD]) return { success: false, message: 'Password lama salah' };
    getSheet(SHEETS.USERS).getRange(r.row, U.PWD + 1).setValue(newPassword);
    return { success: true, message: 'Password berhasil diubah' };
  } catch(e) { return { success: false, message: 'Gagal mengubah password' }; }
}

function getTherapistsForDropdown() {
  try {
    const data = getSheetDataClient(SHEETS.USERS);
    return { success: true, data: data.filter(r => isActive(r[U.ACTIVE]) && (r[U.ROLE]==='therapist'||r[U.ROLE]==='admin')).map(r => ({ id: r[U.ID], name: r[U.NAME] })) };
  } catch(e) { return { success: true, data: [] }; }
}

// ─── Customers ─────────────────────────────────────────────────────────────────
function getCustomers(userId, role) {
  try {
    const data = getSheetDataClient(SHEETS.CUSTOMERS);
    const uData = getSheetDataClient(SHEETS.USERS);
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });
    return {
      success: true,
      data: data.map(r => ({
        id: r[CU.ID], name: r[CU.NAME], phone: formatPhone(r[CU.PHONE]), phone_wa: normalizePhoneWa(r[CU.PHONE]), address: r[CU.ADDR]||'',
        baby_name: r[CU.BABY_NAME]||'', baby_age: r[CU.BABY_AGE]||'', notes: r[CU.NOTES]||'',
        dob: fmtDate(r[CU.DOB]), maps_link: r[CU.MAPS_LINK]||'',
        total_purchase: parseFloat(r[CU.TOTAL])||0, total_paid: parseFloat(r[CU.PAID])||0,
        total_due: parseFloat(r[CU.DUE])||0, is_active: isActive(r[CU.ACTIVE]) ? 1 : 0,
        created_by_name: uMap[r[CU.CREATED_BY]]||'', created_at: fmtTs(r[CU.CREATED])
      })).reverse()
    };
  } catch(e) { console.error('getCustomers:', e); return { success: false, message: 'Gagal memuat pelanggan' }; }
}

function addCustomer(cuData, userId, role) {
  try {
    if (!canWrite(role)) return { success: false, message: 'Akses ditolak' };
    const { name, phone, address, baby_name, baby_age, notes, dob, maps_link } = cuData;
    if (!name) return { success: false, message: 'Nama pelanggan wajib diisi' };
    const sh = getSheet(SHEETS.CUSTOMERS);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.CUSTOMERS);
      sh.appendRow([newId, name.trim(), formatPhone(phone), address||'', baby_name||'', baby_age||'', notes||'', 0, 0, 0, 1, userId, ts(),
        fmtDate(dob), maps_link||'']);
      logActivity(userId, '', 'CREATE', 'Customers', newId, 'Added: '+name.trim());
      return { success: true, message: 'Pelanggan berhasil ditambahkan', data: { id: newId, name: name.trim() } };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('addCustomer:', e); return { success: false, message: 'Gagal menambahkan pelanggan' }; }
}

function updateCustomer(cuData, userId, role) {
  try {
    if (!canWrite(role)) return { success: false, message: 'Akses ditolak' };
    const { id, name, phone, address, baby_name, baby_age, notes, is_active, dob, maps_link } = cuData;
    if (!id || !name) return { success: false, message: 'Nama wajib diisi' };
    const r = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Pelanggan tidak ditemukan' };
    const row = r.data.slice();
    row[CU.NAME] = name.trim();
    row[CU.PHONE] = formatPhone(phone);
    row[CU.ADDR] = address||'';
    row[CU.BABY_NAME] = baby_name||'';
    row[CU.BABY_AGE] = baby_age||'';
    row[CU.NOTES] = notes||'';
    row[CU.DOB] = fmtDate(dob);
    row[CU.MAPS_LINK] = maps_link||'';
    if (is_active !== undefined && is_active !== null) row[CU.ACTIVE] = (is_active==1||is_active===true) ? 1 : 0;
    getSheet(SHEETS.CUSTOMERS).getRange(r.row, 1, 1, row.length).setValues([row]);
    logActivity(userId, '', 'UPDATE', 'Customers', parseInt(id), 'Updated: '+name.trim());
    return { success: true, message: 'Pelanggan berhasil diperbarui' };
  } catch(e) { return { success: false, message: 'Gagal memperbarui pelanggan' }; }
}

function deleteCustomer(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Hanya admin yang bisa menghapus' };
    const r = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Pelanggan tidak ditemukan' };
    const scData = getSheetData(SHEETS.SCHEDULES);
    if (scData.some(s => s[SC.CUST_ID] == parseInt(id))) return { success: false, message: 'Tidak bisa dihapus - ada jadwal terkait' };
    const name = r.data[CU.NAME];
    getSheet(SHEETS.CUSTOMERS).deleteRow(r.row);
    logActivity(userId, '', 'DELETE', 'Customers', parseInt(id), 'Deleted: '+name);
    return { success: true, message: 'Pelanggan berhasil dihapus' };
  } catch(e) { return { success: false, message: 'Gagal menghapus pelanggan' }; }
}

function getCustomersForDropdown() {
  try {
    const data = getSheetDataClient(SHEETS.CUSTOMERS);
    return { success: true, data: data.filter(r => isActive(r[CU.ACTIVE])).map(r => ({ id: r[CU.ID], name: r[CU.NAME], phone: formatPhone(r[CU.PHONE]), phone_wa: normalizePhoneWa(r[CU.PHONE]) })) };
  } catch(e) { return { success: true, data: [] }; }
}

function getCustomerLedger(custId, userId, role) {
  try {
    const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(custId));
    if (!cr) return { success: false, message: 'Pelanggan tidak ditemukan' };
    const customer = {
      id: cr.data[CU.ID], name: cr.data[CU.NAME], phone: formatPhone(cr.data[CU.PHONE]), phone_wa: normalizePhoneWa(cr.data[CU.PHONE]),
      address: cr.data[CU.ADDR]||'', baby_name: cr.data[CU.BABY_NAME]||'',
      baby_age: cr.data[CU.BABY_AGE]||'', notes: cr.data[CU.NOTES]||'',
      dob: fmtDate(cr.data[CU.DOB]), maps_link: cr.data[CU.MAPS_LINK]||'',
      total_purchase: parseFloat(cr.data[CU.TOTAL])||0,
      total_paid: parseFloat(cr.data[CU.PAID])||0,
      total_due: parseFloat(cr.data[CU.DUE])||0
    };
    const timeById = getScheduleTimeById();
    const scData = getSheetDataClient(SHEETS.SCHEDULES);
    const uData = getSheetDataClient(SHEETS.USERS);
    const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
    const schedules = scData.filter(s => s[SC.CUST_ID] == parseInt(custId)).map(s => ({
      id: s[SC.ID], invoice_no: s[SC.INV_NO],
      date: fmtDate(s[SC.DATE]), time: fmtTime(timeById[s[SC.ID]] || s[SC.TIME]), location: s[SC.LOCATION]||'',
      grand_total: parseFloat(s[SC.TOTAL])||0, paid: parseFloat(s[SC.PAID])||0,
      due: parseFloat(s[SC.DUE])||0, status: s[SC.STATUS]||'', keterangan: s[SC.KETERANGAN]||'',
      therapist_name: uMap[s[SC.THERAPIST_ID]]||''
    })).reverse();
    const pyData = getSheetDataClient(SHEETS.PAYMENTS);
    const payments = pyData.filter(p => p[PAY.CUST_ID] == parseInt(custId)).map(p => ({
      id: p[PAY.ID], schedule_id: p[PAY.SCHED_ID],
      amount: parseFloat(p[PAY.AMT])||0, method: paymentMethodLabel(p[PAY.METHOD]),
      date: fmtDate(p[PAY.DATE]), notes: p[PAY.NOTES]||''
    })).reverse();
    return { success: true, data: { customer, schedules, payments } };
  } catch(e) { console.error('getCustomerLedger:', e); return { success: false, message: 'Gagal memuat ledger' }; }
}

// ─── Treatments ────────────────────────────────────────────────────────────────
function getTreatments(userId, role) {
  try {
    const data = getSheetDataClient(SHEETS.TREATMENTS);
    return {
      success: true,
      data: data.map(r => ({
        id: r[TR.ID], category: r[TR.CAT], name: r[TR.NAME],
        description: r[TR.DESC]||'', price: parseFloat(r[TR.PRICE])||0,
        duration_min: parseInt(r[TR.DURATION])||0,
        is_active: isActive(r[TR.ACTIVE]) ? 1 : 0, created_at: fmtTs(r[TR.CREATED])
      })).reverse()
    };
  } catch(e) { return { success: false, message: 'Gagal memuat treatment' }; }
}

function addTreatment(trData, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Akses ditolak' };
    const { category, name, description, price, duration_min } = trData;
    if (!category || !name || !price) return { success: false, message: 'Kategori, nama, dan harga wajib diisi' };
    const sh = getSheet(SHEETS.TREATMENTS);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.TREATMENTS);
      sh.appendRow([newId, category.trim(), name.trim(), description||'', parseFloat(price), parseInt(duration_min)||60, 1, userId, ts()]);
      logActivity(userId, '', 'CREATE', 'Treatments', newId, 'Added: '+name.trim());
      return { success: true, message: 'Treatment berhasil ditambahkan', data: { id: newId } };
    } finally { lock.releaseLock(); }
  } catch(e) { return { success: false, message: 'Gagal menambahkan treatment' }; }
}

function updateTreatment(trData, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Akses ditolak' };
    const { id, category, name, description, price, duration_min, is_active } = trData;
    if (!id || !category || !name || !price) return { success: false, message: 'Data tidak lengkap' };
    const r = findRowByValue(SHEETS.TREATMENTS, TR.ID, parseInt(id));
    if (!r) return { success: false, message: 'Treatment tidak ditemukan' };
    const row = r.data.slice();
    row[TR.CAT] = category.trim();
    row[TR.NAME] = name.trim();
    row[TR.DESC] = description||'';
    row[TR.PRICE] = parseFloat(price);
    row[TR.DURATION] = parseInt(duration_min)||60;
    if (is_active !== undefined && is_active !== null) row[TR.ACTIVE] = (is_active==1||is_active===true) ? 1 : 0;
    getSheet(SHEETS.TREATMENTS).getRange(r.row, 1, 1, row.length).setValues([row]);
    logActivity(userId, '', 'UPDATE', 'Treatments', parseInt(id), 'Updated: '+name.trim());
    return { success: true, message: 'Treatment berhasil diperbarui' };
  } catch(e) { return { success: false, message: 'Gagal memperbarui treatment' }; }
}

function deleteTreatment(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Hanya admin yang bisa menghapus' };
    const r = findRowByValue(SHEETS.TREATMENTS, TR.ID, parseInt(id));
    if (!r) return { success: false, message: 'Treatment tidak ditemukan' };
    const name = r.data[TR.NAME];
    getSheet(SHEETS.TREATMENTS).deleteRow(r.row);
    logActivity(userId, '', 'DELETE', 'Treatments', parseInt(id), 'Deleted: '+name);
    return { success: true, message: 'Treatment berhasil dihapus' };
  } catch(e) { return { success: false, message: 'Gagal menghapus treatment' }; }
}

function getTreatmentsForDropdown() {
  try {
    const data = getSheetDataClient(SHEETS.TREATMENTS);
    return {
      success: true,
      data: data.filter(r => isActive(r[TR.ACTIVE])).map(r => ({
        id: r[TR.ID], category: r[TR.CAT], name: r[TR.NAME],
        price: parseFloat(r[TR.PRICE])||0, duration_min: parseInt(r[TR.DURATION])||0
      }))
    };
  } catch(e) { return { success: true, data: [] }; }
}

// ─── Invoice Number Generator ──────────────────────────────────────────────────
function genInvoiceNo() {
  const d = new Date();
  const dt = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  const prefix = String(getSetting('invoice_prefix', 'DSF') || 'DSF').trim() || 'DSF';
  let maxSeq = 0;

  // Batas nomor tertinggi yang pernah dipakai disimpan di Settings,
  // supaya nomor invoice tidak bisa terpakai ulang walau baris jadwalnya dihapus.
  const saved = String(getSetting('last_invoice_no', '') || '').trim();
  const savedMatch = saved.match(/^([A-Za-z]+)-(\d{8})-(\d+)$/);
  if (savedMatch && savedMatch[2] === dt) maxSeq = Math.max(maxSeq, parseInt(savedMatch[3], 10) || 0);

  // Cadangan: baris jadwal yang masih ada
  const data = getSheetData(SHEETS.SCHEDULES);
  data.forEach(r => {
    const m = String(r[SC.INV_NO] || '').match(/^([A-Za-z]+)-(\d{8})-(\d+)$/);
    if (!m) return;
    if (m[2] !== dt) return;
    maxSeq = Math.max(maxSeq, parseInt(m[3], 10) || 0);
  });
  return prefix + '-' + dt + '-' + String(maxSeq + 1).padStart(3, '0');
}

// ─── Schedules ─────────────────────────────────────────────────────────────────

// Kelompokkan baris Schedule_Items per id jadwal. Dipakai daftar jadwal, detail jadwal,
// dan dashboard supaya teks treatment-nya selalu sama dan sheet cukup dibaca sekali.
function groupScheduleItems(siRows) {
  const out = {};
  (siRows || []).forEach(si => {
    const raw = si[SI.SCHED_ID];
    if (raw === null || raw === undefined || raw === '') return;
    const key = String(raw).trim();
    if (!key) return;
    if (!out[key]) out[key] = [];
    out[key].push({ name: si[SI.TR_NAME], qty: si[SI.QTY] });
  });
  return out;
}

function getScheduleItemMap() {
  return groupScheduleItems(getSheetDataClient(SHEETS.SCHEDULE_ITEMS));
}

// Teks ringkas treatment: "Nama ×qty" dipisah koma, nama tetap seperti di sheet.
// Kunjungan paket NB tidak memegang item sendiri (hanya kunjungan pertama),
// jadi untuk kunjungan itu dipakai nama paketnya. Tanpa apa pun hasilnya ''.
function joinTreatmentText(list, pkgName) {
  const parts = [];
  (list || []).forEach(it => {
    const rawName = it && it.name !== undefined && it.name !== null ? it.name : '';
    const name = String(rawName).trim();
    if (!name) return;
    const qty = parseInt(it.qty, 10);
    parts.push(name + ' ×' + (isFinite(qty) && qty > 0 ? qty : 1));
  });
  if (parts.length) return parts.join(', ');
  return String(pkgName === null || pkgName === undefined ? '' : pkgName).trim();
}

function getSchedules(userId, role, filters) {
  try {
    const data = getSheetDataClient(SHEETS.SCHEDULES);
    const timeById = getScheduleTimeById();
    const itemMap = getScheduleItemMap();
    const cuData = getSheetDataClient(SHEETS.CUSTOMERS);
    const uData = getSheetDataClient(SHEETS.USERS);
    const cuMap = {}; cuData.forEach(r => { cuMap[r[CU.ID]] = { name: r[CU.NAME], phone: formatPhone(r[CU.PHONE]), phoneWa: normalizePhoneWa(r[CU.PHONE]) }; });
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });
    const f = filters || {};

    let schedules = data.map(r => ({
      id: r[SC.ID], invoice_no: r[SC.INV_NO],
      customer_id: r[SC.CUST_ID], customer_name: cuMap[r[SC.CUST_ID]] ? cuMap[r[SC.CUST_ID]].name : 'Walk-in',
      customer_phone: cuMap[r[SC.CUST_ID]] ? cuMap[r[SC.CUST_ID]].phone : '',
      customer_phone_wa: cuMap[r[SC.CUST_ID]] ? cuMap[r[SC.CUST_ID]].phoneWa : '',
      therapist_id: r[SC.THERAPIST_ID], therapist_name: uMap[r[SC.THERAPIST_ID]]||'',
      schedule_date: fmtDate(r[SC.DATE]), schedule_time: fmtTime(timeById[r[SC.ID]] || r[SC.TIME]),
      treatments: joinTreatmentText(itemMap[String(r[SC.ID])], r[SC.PKG_NAME]),
      location: r[SC.LOCATION]||'', maps_link: r[SC.MAPS_LINK]||'', km: parseFloat(r[SC.KM])||0,
      fee_treatment: parseFloat(r[SC.FEE])||0, transport_fee: parseFloat(r[SC.TRANSPORT])||0,
      subtotal: parseFloat(r[SC.SUBTOTAL])||0, discount: parseFloat(r[SC.DISCOUNT])||0,
      grand_total: parseFloat(r[SC.TOTAL])||0, paid_amount: parseFloat(r[SC.PAID])||0,
      due_amount: parseFloat(r[SC.DUE])||0, payment_method: paymentMethodLabel(r[SC.METHOD]),
      status: r[SC.STATUS]||'scheduled', keterangan: r[SC.KETERANGAN]||'', notes: r[SC.NOTES]||'',
      created_by: r[SC.CREATED_BY], cashier_name: uMap[r[SC.CREATED_BY]]||'',
      created_at: fmtTs(r[SC.CREATED]),
      // Data paket NB (kosong / 0 untuk booking biasa atau baris lama)
      package_id: r[SC.PKG_ID]||'', package_name: r[SC.PKG_NAME]||'',
      visit_no: parseInt(r[SC.VISIT_NO], 10)||0, total_visits: parseInt(r[SC.TOTAL_VISITS], 10)||0,
      master_id: r[SC.MASTER_ID]||''
    }));

    if (f.dateFrom) schedules = schedules.filter(s => s.schedule_date >= f.dateFrom);
    if (f.dateTo) schedules = schedules.filter(s => s.schedule_date <= f.dateTo);
    if (f.status) schedules = schedules.filter(s => s.status === f.status);
    if (f.therapist_id) schedules = schedules.filter(s => s.therapist_id == f.therapist_id);
    if (f.customer_id) schedules = schedules.filter(s => s.customer_id == f.customer_id);

    return { success: true, data: schedules.reverse() };
  } catch(e) { console.error('getSchedules:', e); return { success: false, message: 'Gagal memuat jadwal' }; }
}

function addSchedule(scData, userId, role) {
  try {
    if (!canWrite(role)) return { success: false, message: 'Akses ditolak' };
    const { customer_id, therapist_id, schedule_date, schedule_time, location, maps_link, km, items, discount, paid_amount, payment_method, notes } = scData;
    if (!schedule_date) return { success: false, message: 'Tanggal jadwal wajib diisi' };
    if (!items || !items.length) return { success: false, message: 'Tambahkan minimal satu treatment' };

    // ── Validasi tanggal ──
    let dateStr = '';
    if (schedule_date instanceof Date) {
      if (isNaN(schedule_date.getTime())) return { success: false, message: 'Tanggal jadwal tidak valid' };
      dateStr = fmtDate(schedule_date);
    } else {
      const raw = String(schedule_date).trim();
      const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (!m) return { success: false, message: 'Tanggal jadwal tidak valid' };
      const y = parseInt(m[1], 10), mo = parseInt(m[2], 10), dy = parseInt(m[3], 10);
      const probe = new Date(y, mo - 1, dy);
      if (isNaN(probe.getTime()) || probe.getFullYear() !== y || probe.getMonth() !== mo - 1 || probe.getDate() !== dy) {
        return { success: false, message: 'Tanggal jadwal tidak valid' };
      }
      dateStr = m[1] + '-' + m[2] + '-' + m[3];
    }

    // ── Validasi angka non-negatif ──
    const kmDist = parseFloat(km) || 0;
    const disc = parseFloat(discount) || 0;
    const paidIn = parseFloat(paid_amount) || 0;
    if (kmDist < 0 || disc < 0 || paidIn < 0) return { success: false, message: 'Nilai tidak boleh negatif' };

    // ── Harga ditentukan server (Treatments), bukan dari klien ──
    const trData = getSheetData(SHEETS.TREATMENTS);
    const trMap = {};
    trData.forEach(t => { if (isActive(t[TR.ACTIVE])) trMap[String(t[TR.ID])] = t; });

    const cleanItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i] || {};
      const qty = parseInt(item.qty, 10);
      if (!qty || qty < 1) return { success: false, message: 'Jumlah (qty) treatment minimal 1' };
      const trId = item.treatment_id ? parseInt(item.treatment_id, 10) : '';
      const master = trId !== '' && !isNaN(trId) ? trMap[String(trId)] : null;
      let price, name;
      if (master) {
        price = parseFloat(master[TR.PRICE]) || 0;
        name = String(master[TR.CAT] || '').trim() + ' - ' + String(master[TR.NAME] || '').trim();
      } else {
        price = parseFloat(item.price) || 0;
        name = String(item.treatment_name || '').trim();
      }
      if (price < 0) return { success: false, message: 'Harga tidak boleh negatif' };
      cleanItems.push({
        treatment_id: trId,
        treatment_name: name,
        price: price,
        qty: qty,
        subtotal: Math.round(price * qty * 100) / 100
      });
    }

    const feeTreatment = Math.round(cleanItems.reduce((s, i) => s + i.subtotal, 0) * 100) / 100;
    const ratePerKm = parseFloat(getSetting('transport_rate_per_km', 2000)) || 0;
    // Transport dihitung server hanya kalau klien tidak mengirim nilai (0 tetap dianggap nilai sah)
    const transportFee = scData.transport_fee !== undefined && scData.transport_fee !== null && scData.transport_fee !== ''
      ? (parseFloat(scData.transport_fee) || 0)
      : calcTransportFee(kmDist, ratePerKm);
    if (transportFee < 0) return { success: false, message: 'Nilai tidak boleh negatif' };
    const subtotal = Math.round((feeTreatment + transportFee) * 100) / 100;
    const grandTotal = Math.max(0, Math.round((subtotal - disc) * 100) / 100);
    const paid = Math.min(Math.max(0, paidIn), grandTotal);
    const due = Math.round((grandTotal - paid) * 100) / 100;

    // ── Keterangan ditentukan server (abaikan dari klien) ──
    const method = normalizePaymentMethod(payment_method);
    let ket;
    if (due <= 0) ket = 'LUNAS ' + (String(method).toLowerCase() === 'cash' ? 'CASH' : 'TF/QRIS');
    else if (paid > 0) ket = 'DP';
    else ket = 'BELUM BAYAR';

    const sh = getSheet(SHEETS.SCHEDULES);
    const siSh = getSheet(SHEETS.SCHEDULE_ITEMS);
    const lock = LockService.getScriptLock(); lock.waitLock(15000);
    try {
      const sId = getNextId(SHEETS.SCHEDULES);
      const invNo = genInvoiceNo();
      const now = ts();
      sh.appendRow([sId, invNo, customer_id ? parseInt(customer_id) : '', therapist_id ? parseInt(therapist_id) : '',
        dateStr, schedule_time||'', location||'', kmDist,
        feeTreatment, transportFee, subtotal, disc, grandTotal, paid, due,
        method, 'scheduled',
        ket, notes||'', userId, now, now, maps_link||'']);

      // Simpan nomor invoice terakhir di Settings (di dalam lock) supaya tidak pernah dipakai ulang
      setSetting('last_invoice_no', invNo, userId);

      let siId = getNextId(SHEETS.SCHEDULE_ITEMS);
      const siRows = cleanItems.map(item => [siId++, sId, item.treatment_id, item.treatment_name, item.price, item.qty, item.subtotal]);
      if (siRows.length) siSh.getRange(siSh.getLastRow()+1, 1, siRows.length, 7).setValues(siRows);

      if (customer_id) {
        const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(customer_id));
        if (cr) {
          const crow = cr.data.slice();
          crow[CU.TOTAL] = (parseFloat(crow[CU.TOTAL])||0) + grandTotal;
          crow[CU.PAID] = (parseFloat(crow[CU.PAID])||0) + paid;
          crow[CU.DUE] = Math.round((crow[CU.TOTAL] - crow[CU.PAID]) * 100) / 100;
          getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
        }
      }

      if (paid > 0) {
        const pyId = getNextId(SHEETS.PAYMENTS);
        getSheet(SHEETS.PAYMENTS).appendRow([pyId, sId, customer_id ? parseInt(customer_id) : '', paid, method, '', dateStr, '', userId, now]);
      }

      logActivity(userId, '', 'CREATE', 'Schedules', sId, invNo + ' Rp'+grandTotal);
      return { success: true, message: 'Jadwal berhasil disimpan', data: { id: sId, invoice_no: invNo } };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('addSchedule:', e); return { success: false, message: 'Gagal menyimpan jadwal' }; }
}

// ─── Paket NB (satu invoice untuk banyak kunjungan) ────────────────────────────
// Membuat semua baris kunjungan sekaligus. Uang dan nomor invoice hanya ada di
// baris pertama (master), kunjungan lain bernilai 0 supaya laporan tidak dobel.
function createSchedulePackage(payload, userId, role) {
  try {
    if (!canWrite(role)) return { success: false, message: 'Akses ditolak' };
    const p = payload || {};

    // ── Validasi tanggal mulai ──
    const startStr = parseDateInput(p.start_date);
    if (!startStr) return { success: false, message: 'Tanggal mulai tidak valid' };

    // ── Treatment wajib ada dan kategorinya paket NB; harga selalu dari sheet Treatments ──
    const trId = p.treatment_id ? parseInt(p.treatment_id, 10) : NaN;
    if (!trId || isNaN(trId)) return { success: false, message: 'Treatment wajib dipilih' };
    const trRow = findRowByValue(SHEETS.TREATMENTS, TR.ID, trId);
    if (!trRow) return { success: false, message: 'Treatment tidak ditemukan' };
    const catText = String(trRow.data[TR.CAT] || '').trim();
    if (catText.toLowerCase().indexOf('nb') !== 0) {
      return { success: false, message: 'Treatment yang dipilih bukan paket NB' };
    }
    const price = Math.max(0, parseFloat(trRow.data[TR.PRICE]) || 0);
    const trName = String(trRow.data[TR.NAME] || '').trim();
    const pkgName = catText + ' - ' + trName;
    const pkg = parsePackageTreatment(trName, catText);
    const totalVisits = pkg.days * pkg.visitsPerDay;

    // ── Jam kunjungan: paket 2x butuh dua jam, paket 1x cukup satu ──
    const t1 = fmtTime(p.time1);
    if (!t1) return { success: false, message: 'Jam kunjungan wajib diisi' };
    let t2 = '';
    if (pkg.visitsPerDay === 2) {
      t2 = fmtTime(p.time2);
      if (!t2) return { success: false, message: 'Jam kunjungan kedua wajib diisi untuk paket 2x' };
    }

    // ── Angka tidak boleh negatif ──
    const kmDist = parseFloat(p.km) || 0;
    const disc = parseFloat(p.discount) || 0;
    if (kmDist < 0 || disc < 0) return { success: false, message: 'Nilai tidak boleh negatif' };

    // ── Transport dihitung per kunjungan, lalu dikalikan jumlah kunjungan ──
    const ratePerKm = parseFloat(getSetting('transport_rate_per_km', 2000)) || 0;
    const perVisit = (p.transport_fee !== undefined && p.transport_fee !== null && p.transport_fee !== '')
      ? (parseFloat(p.transport_fee) || 0)
      : calcTransportFee(kmDist, ratePerKm);
    if (perVisit < 0) return { success: false, message: 'Nilai tidak boleh negatif' };
    const transportTotal = Math.round(perVisit * totalVisits * 100) / 100;
    const subtotal = Math.round((price + transportTotal) * 100) / 100;
    if (disc > subtotal) return { success: false, message: 'Diskon tidak boleh melebihi subtotal' };
    const grandTotal = Math.max(0, Math.round((subtotal - disc) * 100) / 100);

    // ── DP: boleh nominal tegas dari klien, kalau tidak ada pakai persen (bawaan 20%) ──
    const dpSent = parseFloat(p.dp_amount);
    let dpPct = parseFloat(p.dp_percent);
    if (!isFinite(dpPct)) dpPct = 20;
    dpPct = Math.min(100, Math.max(0, dpPct));
    let dp = (isFinite(dpSent) && dpSent > 0) ? dpSent : Math.round(grandTotal * dpPct / 100);
    dp = Math.round(Math.min(Math.max(0, dp), grandTotal) * 100) / 100;
    const due = Math.round((grandTotal - dp) * 100) / 100;

    // ── Keterangan mengikuti aturan addSchedule ──
    const method = normalizePaymentMethod(p.payment_method);
    let ket;
    if (due <= 0) ket = 'LUNAS ' + (String(method).toLowerCase() === 'cash' ? 'CASH' : 'TF/QRIS');
    else if (dp > 0) ket = 'DP';
    else ket = 'BELUM BAYAR';

    const custId = p.customer_id ? parseInt(p.customer_id) : '';
    if (!custId) return { success: false, message: 'Pelanggan wajib dipilih' };
    const therapistId = p.therapist_id ? parseInt(p.therapist_id) : '';
    const location = p.location || '';
    const mapsLink = p.maps_link || '';
    const notes = p.notes || '';

    const sh = getSheet(SHEETS.SCHEDULES);
    const lock = LockService.getScriptLock(); lock.waitLock(20000);
    try {
      const baseId = getNextId(SHEETS.SCHEDULES);
      const invNo = genInvoiceNo();
      const pkgId = 'PKG-' + String(baseId).padStart(6, '0');
      const now = ts();

      // Semua baris kunjungan disusun dulu, baru ditulis sekali supaya cepat
      const rows = [];
      let visitNo = 0;
      for (let d = 0; d < pkg.days; d++) {
        const dateStr = addDaysStr(startStr, d);
        const slots = pkg.visitsPerDay === 2 ? [t1, t2] : [t1];
        for (let k = 0; k < slots.length; k++) {
          visitNo++;
          const isMaster = visitNo === 1;
          rows.push([
            baseId + visitNo - 1,
            isMaster ? invNo : '',
            custId, therapistId, dateStr, slots[k], location, kmDist,
            isMaster ? price : 0, isMaster ? transportTotal : 0, isMaster ? subtotal : 0,
            isMaster ? disc : 0, isMaster ? grandTotal : 0, isMaster ? dp : 0, isMaster ? due : 0,
            isMaster ? method : '', 'scheduled', isMaster ? ket : '',
            isMaster ? notes : '', userId, now, now, mapsLink,
            pkgId, pkgName, visitNo, totalVisits, baseId
          ]);
        }
      }

      // Spreadsheet lama mungkin belum punya kolom paket, jadi lebarkan dulu
      const needCols = SC.MASTER_ID + 1;
      if (typeof sh.getMaxColumns === 'function' && sh.getMaxColumns() < needCols) {
        sh.insertColumnsAfter(sh.getMaxColumns(), needCols - sh.getMaxColumns());
      }
      sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);

      setSetting('last_invoice_no', invNo, userId);

      // Satu baris treatment hanya di kunjungan pertama
      const siSh = getSheet(SHEETS.SCHEDULE_ITEMS);
      siSh.appendRow([getNextId(SHEETS.SCHEDULE_ITEMS), baseId, trId, pkgName, price, 1, Math.round(price * 100) / 100]);

      // DP dicatat sebagai pembayaran sungguhan pada invoice paket
      if (dp > 0) {
        getSheet(SHEETS.PAYMENTS).appendRow([getNextId(SHEETS.PAYMENTS), baseId, custId, dp, method, '', startStr, 'DP paket', userId, now]);
      }

      const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, custId);
      if (cr) {
        const crow = cr.data.slice();
        crow[CU.TOTAL] = Math.round(((parseFloat(crow[CU.TOTAL]) || 0) + grandTotal) * 100) / 100;
        crow[CU.PAID] = Math.round(((parseFloat(crow[CU.PAID]) || 0) + dp) * 100) / 100;
        crow[CU.DUE] = Math.max(0, Math.round((crow[CU.TOTAL] - crow[CU.PAID]) * 100) / 100);
        getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
      }

      logActivity(userId, '', 'CREATE', 'Schedules', baseId, invNo + ' paket ' + totalVisits + ' kunjungan Rp' + grandTotal);
      return {
        success: true,
        message: 'Paket dibuat: ' + totalVisits + ' kunjungan',
        data: { master_id: baseId, package_id: pkgId, invoice_no: invNo, visits: totalVisits, grand_total: grandTotal, dp: dp, due: due }
      };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('createSchedulePackage:', e); return { success: false, message: 'Gagal membuat paket' }; }
}

// Ubah input tanggal (Date atau teks yyyy-MM-dd) menjadi teks yyyy-MM-dd, '' kalau tidak valid
function parseDateInput(v) {
  if (!v) return '';
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return '';
    return fmtDate(v);
  }
  const m = String(v).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '';
  const y = parseInt(m[1], 10), mo = parseInt(m[2], 10), dy = parseInt(m[3], 10);
  const probe = new Date(y, mo - 1, dy);
  if (isNaN(probe.getTime()) || probe.getFullYear() !== y || probe.getMonth() !== mo - 1 || probe.getDate() !== dy) return '';
  return m[1] + '-' + m[2] + '-' + m[3];
}

// ─── Edit Jadwal (perbaiki booking yang sudah ada) ─────────────────────────────
function updateSchedule(userId, role, scheduleId, payload) {
  try {
    if (!canWrite(role)) return { success: false, message: 'Akses ditolak' };
    const p = payload || {};
    if (!scheduleId) return { success: false, message: 'Jadwal tidak ditemukan' };
    if (!p.schedule_date) return { success: false, message: 'Tanggal jadwal wajib diisi' };

    // ── Kunjungan paket: hanya jadwal dan lokasi yang boleh diubah ──
    // Uang paket disimpan di kunjungan pertama dan satu invoice dipakai untuk semua
    // kunjungan, jadi nominal, item, dan diskon tidak boleh diubah dari sini.
    const found = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(scheduleId));
    if (!found) return { success: false, message: 'Jadwal tidak ditemukan' };
    if (String(found.data[SC.PKG_ID] || '').trim() !== '') {
      const pkgDate = parseDateInput(p.schedule_date);
      if (!pkgDate) return { success: false, message: 'Tanggal jadwal tidak valid' };
      const pkgLock = LockService.getScriptLock(); pkgLock.waitLock(15000);
      try {
        const pr = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(scheduleId));
        if (!pr) return { success: false, message: 'Jadwal tidak ditemukan' };
        const prow = pr.data.slice();
        prow[SC.DATE] = pkgDate;
        prow[SC.TIME] = p.schedule_time || '';
        prow[SC.LOCATION] = p.location || '';
        prow[SC.MAPS_LINK] = p.maps_link || '';
        prow[SC.NOTES] = p.notes || '';
        prow[SC.UPDATED] = ts();
        getSheet(SHEETS.SCHEDULES).getRange(pr.row, 1, 1, prow.length).setValues([prow]);
        logActivity(userId, '', 'UPDATE', 'Schedules', parseInt(scheduleId), 'Kunjungan paket: ' + (prow[SC.INV_NO] || prow[SC.PKG_ID]));
        return {
          success: true, message: 'Jadwal kunjungan paket diperbarui',
          data: {
            id: parseInt(scheduleId), invoice_no: prow[SC.INV_NO] || '',
            grand_total: parseFloat(prow[SC.TOTAL]) || 0, due_amount: parseFloat(prow[SC.DUE]) || 0
          }
        };
      } finally { pkgLock.releaseLock(); }
    }

    const items = p.items || [];
    if (!items.length) return { success: false, message: 'Tambahkan minimal satu treatment' };

    const dateStr = parseDateInput(p.schedule_date);
    if (!dateStr) return { success: false, message: 'Tanggal jadwal tidak valid' };

    const kmDist = parseFloat(p.km) || 0;
    const disc = parseFloat(p.discount) || 0;
    if (kmDist < 0 || disc < 0) return { success: false, message: 'Nilai tidak boleh negatif' };

    // ── Harga selalu dihitung ulang dari sheet Treatments, bukan dari klien ──
    const trData = getSheetData(SHEETS.TREATMENTS);
    const trMap = {};
    trData.forEach(t => { trMap[String(t[TR.ID])] = t; });

    const cleanItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i] || {};
      const qty = parseInt(item.qty, 10);
      if (!qty || qty < 1) return { success: false, message: 'Jumlah (qty) treatment minimal 1' };
      const trId = item.treatment_id ? parseInt(item.treatment_id, 10) : '';
      const master = (trId !== '' && !isNaN(trId)) ? trMap[String(trId)] : null;
      if (!master) return { success: false, message: 'Treatment tidak ditemukan, pilih treatment lain' };
      const price = parseFloat(master[TR.PRICE]) || 0;
      cleanItems.push({
        treatment_id: trId,
        treatment_name: String(master[TR.CAT] || '').trim() + ' - ' + String(master[TR.NAME] || '').trim(),
        price: price,
        qty: qty,
        subtotal: Math.round(price * qty * 100) / 100
      });
    }

    const feeTreatment = Math.round(cleanItems.reduce((s, i) => s + i.subtotal, 0) * 100) / 100;
    const ratePerKm = parseFloat(getSetting('transport_rate_per_km', 2000)) || 0;
    const transportFee = (p.transport_fee !== undefined && p.transport_fee !== null && p.transport_fee !== '')
      ? (parseFloat(p.transport_fee) || 0)
      : calcTransportFee(kmDist, ratePerKm);
    if (transportFee < 0) return { success: false, message: 'Nilai tidak boleh negatif' };
    const subtotal = Math.round((feeTreatment + transportFee) * 100) / 100;
    if (disc > subtotal) return { success: false, message: 'Diskon tidak boleh melebihi subtotal' };
    const grandTotal = Math.round((subtotal - disc) * 100) / 100;
    if (grandTotal < 0) return { success: false, message: 'Total tidak boleh negatif' };

    const sh = getSheet(SHEETS.SCHEDULES);
    const siSh = getSheet(SHEETS.SCHEDULE_ITEMS);
    const lock = LockService.getScriptLock(); lock.waitLock(15000);
    try {
      const r = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(scheduleId));
      if (!r) return { success: false, message: 'Jadwal tidak ditemukan' };
      const old = r.data.slice();
      const oldStatus = String(old[SC.STATUS] || '').toLowerCase().trim();
      const oldCustId = old[SC.CUST_ID];
      const oldTotal = parseFloat(old[SC.TOTAL]) || 0;
      const oldPaid = parseFloat(old[SC.PAID]) || 0;
      const newCustId = p.customer_id ? parseInt(p.customer_id) : '';

      // ── Uang yang sudah dibayar dipertahankan, dibatasi total baru ──
      const paid = Math.min(Math.max(0, oldPaid), grandTotal);
      const due = Math.round((grandTotal - paid) * 100) / 100;
      const method = normalizePaymentMethod(p.payment_method || old[SC.METHOD]);
      let ket;
      if (due <= 0) ket = 'LUNAS ' + (String(method).toLowerCase() === 'cash' ? 'CASH' : 'TF/QRIS');
      else if (paid > 0) ket = 'DP';
      else ket = 'BELUM BAYAR';
      // Jadwal yang sudah dibatalkan tetap dibatalkan; status lain tidak lagi
      // berubah karena pembayaran, hanya updateScheduleStatus yang mengubahnya.
      const newStatus = (oldStatus === 'done' || oldStatus === 'cancelled') ? oldStatus : 'scheduled';

      const row = old.slice();
      row[SC.CUST_ID] = newCustId;
      row[SC.THERAPIST_ID] = p.therapist_id ? parseInt(p.therapist_id) : '';
      row[SC.DATE] = dateStr;
      row[SC.TIME] = p.schedule_time || '';
      row[SC.LOCATION] = p.location || '';
      row[SC.KM] = kmDist;
      row[SC.FEE] = feeTreatment;
      row[SC.TRANSPORT] = transportFee;
      row[SC.SUBTOTAL] = subtotal;
      row[SC.DISCOUNT] = disc;
      row[SC.TOTAL] = grandTotal;
      row[SC.PAID] = paid;
      row[SC.DUE] = due;
      row[SC.METHOD] = method;
      row[SC.STATUS] = newStatus;
      row[SC.KETERANGAN] = ket;
      row[SC.NOTES] = p.notes || '';
      row[SC.MAPS_LINK] = p.maps_link || '';
      row[SC.UPDATED] = ts();
      sh.getRange(r.row, 1, 1, row.length).setValues([row]);

      // ── Ganti baris Schedule_Items milik jadwal ini ──
      const siAll = getSheetData(SHEETS.SCHEDULE_ITEMS);
      siAll.map((si, idx) => si[SI.SCHED_ID] == parseInt(scheduleId) ? idx + 2 : null)
        .filter(Boolean).reverse().forEach(rn => siSh.deleteRow(rn));
      let siId = getNextId(SHEETS.SCHEDULE_ITEMS);
      const siRows = cleanItems.map(item => [siId++, parseInt(scheduleId), item.treatment_id, item.treatment_name, item.price, item.qty, item.subtotal]);
      if (siRows.length) siSh.getRange(siSh.getLastRow() + 1, 1, siRows.length, 7).setValues(siRows);

      // ── Sesuaikan total pelanggan: kurangi nilai lama, tambah nilai baru ──
      if (oldCustId && oldStatus !== 'cancelled') {
        const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(oldCustId));
        if (cr) {
          const crow = cr.data.slice();
          crow[CU.TOTAL] = Math.max(0, Math.round(((parseFloat(crow[CU.TOTAL]) || 0) - oldTotal) * 100) / 100);
          crow[CU.PAID] = Math.max(0, Math.round(((parseFloat(crow[CU.PAID]) || 0) - oldPaid) * 100) / 100);
          crow[CU.DUE] = Math.max(0, Math.round((crow[CU.TOTAL] - crow[CU.PAID]) * 100) / 100);
          getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
        }
      }
      if (newCustId && newStatus !== 'cancelled') {
        const cr2 = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(newCustId));
        if (cr2) {
          const crow2 = cr2.data.slice();
          crow2[CU.TOTAL] = Math.round(((parseFloat(crow2[CU.TOTAL]) || 0) + grandTotal) * 100) / 100;
          crow2[CU.PAID] = Math.round(((parseFloat(crow2[CU.PAID]) || 0) + paid) * 100) / 100;
          crow2[CU.DUE] = Math.max(0, Math.round((crow2[CU.TOTAL] - crow2[CU.PAID]) * 100) / 100);
          getSheet(SHEETS.CUSTOMERS).getRange(cr2.row, 1, 1, crow2.length).setValues([crow2]);
        }
      }

      logActivity(userId, '', 'UPDATE', 'Schedules', parseInt(scheduleId), old[SC.INV_NO] + ' Rp' + grandTotal);
      return {
        success: true, message: 'Jadwal berhasil diperbarui',
        data: { id: parseInt(scheduleId), invoice_no: old[SC.INV_NO], grand_total: grandTotal, due_amount: due }
      };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('updateSchedule:', e); return { success: false, message: 'Gagal memperbarui jadwal' }; }
}

function getScheduleDetail(id, userId, role) {
  try {
    const r = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(id));
    if (!r) return { success: false, message: 'Jadwal tidak ditemukan' };
    const s = r.data;
    const timeById = getScheduleTimeById();
    const uData = getSheetDataClient(SHEETS.USERS);
    const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
    const cuData = getSheetDataClient(SHEETS.CUSTOMERS);
    const cuMap = {}; cuData.forEach(c => { cuMap[c[CU.ID]] = { name: c[CU.NAME], phone: formatPhone(c[CU.PHONE]), phoneWa: normalizePhoneWa(c[CU.PHONE]), address: c[CU.ADDR]||'', baby_name: c[CU.BABY_NAME]||'', baby_age: c[CU.BABY_AGE]||'' }; });
    const siData = getSheetDataClient(SHEETS.SCHEDULE_ITEMS);
    const items = siData.filter(si => si[SI.SCHED_ID] == parseInt(id)).map(si => ({
      id: si[SI.ID], treatment_id: si[SI.TR_ID], treatment_name: si[SI.TR_NAME],
      price: parseFloat(si[SI.PRICE])||0, qty: parseInt(si[SI.QTY])||1, subtotal: parseFloat(si[SI.SUBTOTAL])||0
    }));
    const pyData = getSheetDataClient(SHEETS.PAYMENTS);
    const payments = pyData.filter(p => p[PAY.SCHED_ID] == parseInt(id)).map(p => ({
      id: p[PAY.ID], amount: parseFloat(p[PAY.AMT])||0, method: p[PAY.METHOD]||'',
      date: fmtDate(p[PAY.DATE]), notes: p[PAY.NOTES]||''
    }));
    const custInfo = cuMap[s[SC.CUST_ID]] || {};
    // Kunjungan paket tidak memegang nomor invoice, jadi nomornya dibaca dari baris pertama
    const pkgId = String(s[SC.PKG_ID] || '').trim();
    const masterId = s[SC.MASTER_ID] === null || s[SC.MASTER_ID] === undefined ? '' : String(s[SC.MASTER_ID]).trim();
    let masterInvoiceNo = String(s[SC.INV_NO] || '');
    if (pkgId && masterId && masterId !== String(s[SC.ID])) {
      const mr = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(masterId, 10));
      if (mr) masterInvoiceNo = String(mr.data[SC.INV_NO] || '');
    }
    return {
      success: true,
      data: {
        id: s[SC.ID], invoice_no: s[SC.INV_NO],
        customer_id: s[SC.CUST_ID], customer_name: custInfo.name||'Walk-in',
        customer_phone: custInfo.phone||'', customer_phone_wa: custInfo.phoneWa||'', customer_address: custInfo.address||'',
        baby_name: custInfo.baby_name||'', baby_age: custInfo.baby_age||'',
        therapist_id: s[SC.THERAPIST_ID], therapist_name: uMap[s[SC.THERAPIST_ID]]||'',
        schedule_date: fmtDate(s[SC.DATE]), schedule_time: fmtTime(timeById[s[SC.ID]] || s[SC.TIME]),
        location: s[SC.LOCATION]||'', maps_link: s[SC.MAPS_LINK]||'', km: parseFloat(s[SC.KM])||0,
        fee_treatment: parseFloat(s[SC.FEE])||0, transport_fee: parseFloat(s[SC.TRANSPORT])||0,
        subtotal: parseFloat(s[SC.SUBTOTAL])||0, discount: parseFloat(s[SC.DISCOUNT])||0,
        grand_total: parseFloat(s[SC.TOTAL])||0, paid_amount: parseFloat(s[SC.PAID])||0,
        due_amount: parseFloat(s[SC.DUE])||0, payment_method: paymentMethodLabel(s[SC.METHOD]),
        status: s[SC.STATUS]||'scheduled', keterangan: s[SC.KETERANGAN]||'',
        notes: s[SC.NOTES]||'', cashier_name: uMap[s[SC.CREATED_BY]]||'',
        // Data paket NB (kosong / 0 untuk booking biasa)
        package_id: pkgId, package_name: s[SC.PKG_NAME]||'',
        visit_no: parseInt(s[SC.VISIT_NO], 10)||0, total_visits: parseInt(s[SC.TOTAL_VISITS], 10)||0,
        master_id: masterId, master_invoice_no: masterInvoiceNo, is_package: pkgId !== '',
        treatments: joinTreatmentText(items.map(it => ({ name: it.treatment_name, qty: it.qty })), s[SC.PKG_NAME]),
        items, payments
      }
    };
  } catch(e) { console.error('getScheduleDetail:', e); return { success: false, message: 'Gagal memuat detail' }; }
}

function updateScheduleStatus(id, status, keterangan, userId, role) {
  try {
    if (!canWrite(role)) return { success: false, message: 'Akses ditolak' };
    const newStatus = String(status || '').toLowerCase().trim();
    if (['scheduled','done','cancelled'].indexOf(newStatus) === -1) return { success: false, message: 'Status tidak valid' };
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const r = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(id));
      if (!r) return { success: false, message: 'Jadwal tidak ditemukan' };
      const row = r.data.slice();
      const oldStatus = String(row[SC.STATUS] || '').toLowerCase().trim();
      const method = normalizePaymentMethod(row[SC.METHOD]);
      row[SC.STATUS] = newStatus;
      row[SC.METHOD] = method;
      if (newStatus === 'done') {
        // "done" = treatment selesai, bukan berarti sudah lunas
        const dueNow = parseFloat(row[SC.DUE]) || 0;
        const paidNow = parseFloat(row[SC.PAID]) || 0;
        if (dueNow <= 0) row[SC.KETERANGAN] = 'LUNAS ' + (String(method).toLowerCase() === 'cash' ? 'CASH' : 'TF/QRIS');
        else if (paidNow > 0) row[SC.KETERANGAN] = 'DP';
        else row[SC.KETERANGAN] = 'BELUM BAYAR';
      } else if (keterangan) {
        row[SC.KETERANGAN] = keterangan;
      }
      row[SC.UPDATED] = ts();
      getSheet(SHEETS.SCHEDULES).getRange(r.row, 1, 1, row.length).setValues([row]);

      // ── Kembalikan / tambahkan lagi total pelanggan saat status cancelled berubah ──
      const custId = row[SC.CUST_ID];
      if (custId) {
        const total = parseFloat(row[SC.TOTAL]) || 0;
        const paid = parseFloat(row[SC.PAID]) || 0;
        const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(custId));
        if (cr && oldStatus !== newStatus) {
          const crow = cr.data.slice();
          let cuTotal = parseFloat(crow[CU.TOTAL]) || 0;
          let cuPaid = parseFloat(crow[CU.PAID]) || 0;
          if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
            cuTotal = Math.max(0, cuTotal - total);
            cuPaid = Math.max(0, cuPaid - paid);
          } else if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
            cuTotal = cuTotal + total;
            cuPaid = cuPaid + paid;
          }
          crow[CU.TOTAL] = Math.round(cuTotal * 100) / 100;
          crow[CU.PAID] = Math.round(cuPaid * 100) / 100;
          crow[CU.DUE] = Math.max(0, Math.round((crow[CU.TOTAL] - crow[CU.PAID]) * 100) / 100);
          getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
        }
      }

      logActivity(userId, '', 'UPDATE', 'Schedules', parseInt(id), 'Status: '+oldStatus+' to '+newStatus);
      return { success: true, message: 'Status jadwal berhasil diperbarui' };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('updateScheduleStatus:', e); return { success: false, message: 'Gagal memperbarui status' }; }
}

function addSchedulePayment(payData, userId, role) {
  try {
    if (!canWrite(role)) return { success: false, message: 'Akses ditolak' };
    const { schedule_id, amount, method, reference_no, payment_date, notes } = payData;
    const amt = parseFloat(amount);
    if (!schedule_id || !amount || !isFinite(amt) || amt <= 0) return { success: false, message: 'Jumlah pembayaran wajib diisi' };
    const payMethod = normalizePaymentMethod(method);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      // Dibaca di dalam lock agar dua pembayaran bersamaan tidak saling menimpa
      const sr = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(schedule_id));
      if (!sr) return { success: false, message: 'Jadwal tidak ditemukan' };
      if (String(sr.data[SC.STATUS] || '').toLowerCase() === 'cancelled') {
        return { success: false, message: 'Tidak bisa membayar invoice yang dibatalkan' };
      }
      const custId = sr.data[SC.CUST_ID];
      const dueBefore = Math.max(0, Math.round((parseFloat(sr.data[SC.DUE]) || 0) * 100) / 100);
      if (amt > dueBefore + 0.5) {
        return { success: false, message: 'Jumlah melebihi sisa tagihan (Rp ' + Math.round(dueBefore).toLocaleString('id-ID') + ')' };
      }

      const now = ts();
      const pyId = getNextId(SHEETS.PAYMENTS);
      getSheet(SHEETS.PAYMENTS).appendRow([pyId, parseInt(schedule_id), custId ? parseInt(custId) : '', amt, payMethod, reference_no||'', payment_date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'), notes||'', userId, now]);

      const srow = sr.data.slice();
      srow[SC.PAID] = Math.round(((parseFloat(srow[SC.PAID])||0) + amt) * 100) / 100;
      let sDue = Math.round(((parseFloat(srow[SC.TOTAL])||0) - srow[SC.PAID]) * 100) / 100;
      if (sDue < 0) sDue = 0;
      srow[SC.DUE] = sDue;
      // Lunas atau belum, status tidak diubah di sini: hanya updateScheduleStatus
      // yang boleh menandai selesai, supaya booking tidak otomatis jadi 'done'.
      if (sDue <= 0) {
        srow[SC.KETERANGAN] = 'LUNAS ' + (String(payMethod).toLowerCase() === 'cash' ? 'CASH' : 'TF/QRIS');
      } else {
        srow[SC.KETERANGAN] = 'DP';
      }
      srow[SC.UPDATED] = now;
      getSheet(SHEETS.SCHEDULES).getRange(sr.row, 1, 1, srow.length).setValues([srow]);

      if (custId) {
        const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(custId));
        if (cr) {
          const crow = cr.data.slice();
          crow[CU.PAID] = Math.round(((parseFloat(crow[CU.PAID])||0) + amt) * 100) / 100;
          crow[CU.DUE] = Math.round(((parseFloat(crow[CU.TOTAL])||0) - crow[CU.PAID]) * 100) / 100;
          if (crow[CU.DUE] < 0) crow[CU.DUE] = 0;
          getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
        }
      }
      logActivity(userId, '', 'CREATE', 'Payments', pyId, 'Rp'+amt+' for '+sr.data[SC.INV_NO]);
      return { success: true, message: 'Pembayaran berhasil dicatat' };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('addSchedulePayment:', e); return { success: false, message: 'Gagal mencatat pembayaran' }; }
}

function deleteSchedule(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Hanya admin yang bisa menghapus jadwal' };
    const r = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(id));
    if (!r) return { success: false, message: 'Jadwal tidak ditemukan' };
    const row = r.data;
    const invNo = row[SC.INV_NO];
    const pkgId = String(row[SC.PKG_ID] || '').trim();
    const visitNo = parseInt(row[SC.VISIT_NO], 10) || 0;
    const masterIdTxt = (row[SC.MASTER_ID] === null || row[SC.MASTER_ID] === undefined) ? '' : String(row[SC.MASTER_ID]).trim();
    const isPkgMaster = pkgId !== '' && ((masterIdTxt !== '' && masterIdTxt === String(row[SC.ID])) || visitNo === 1);
    const isPkgVisit = pkgId !== '' && !isPkgMaster;

    // Hapus Schedule_Items milik beberapa jadwal sekaligus (dari bawah ke atas)
    const deleteItemsOfIds = (ids) => {
      const siSh = getSheet(SHEETS.SCHEDULE_ITEMS);
      const siAll = getSheetData(SHEETS.SCHEDULE_ITEMS);
      siAll.map((si, idx) => ids.indexOf(parseInt(si[SI.SCHED_ID], 10)) !== -1 ? idx + 2 : null)
        .filter(Boolean).reverse().forEach(rn => siSh.deleteRow(rn));
    };

    const lock = LockService.getScriptLock(); lock.waitLock(15000);
    try {
      // ── Kunjungan paket selain baris pertama: hapus baris itu saja, uang tidak berubah ──
      if (isPkgVisit) {
        deleteItemsOfIds([parseInt(id)]);
        getSheet(SHEETS.SCHEDULES).deleteRow(r.row);
        logActivity(userId, '', 'DELETE', 'Schedules', parseInt(id), 'Hapus kunjungan ' + visitNo + ' paket ' + pkgId);
        return { success: true, message: 'Kunjungan paket berhasil dihapus' };
      }

      // ── Baris pertama paket: hapus semua kunjungan, total pelanggan dikembalikan sekali ──
      if (isPkgMaster) {
        const scAll = getSheetData(SHEETS.SCHEDULES);
        const targets = [];
        scAll.forEach((s, idx) => {
          if (String(s[SC.PKG_ID] || '').trim() === pkgId) targets.push({ row: idx + 2, data: s });
        });
        if (!targets.length) targets.push({ row: r.row, data: row });

        if (row[SC.CUST_ID] && String(row[SC.STATUS] || '') !== 'cancelled') {
          const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(row[SC.CUST_ID]));
          if (cr) {
            const crow = cr.data.slice();
            crow[CU.TOTAL] = Math.max(0, Math.round(((parseFloat(crow[CU.TOTAL]) || 0) - (parseFloat(row[SC.TOTAL]) || 0)) * 100) / 100);
            crow[CU.PAID] = Math.max(0, Math.round(((parseFloat(crow[CU.PAID]) || 0) - (parseFloat(row[SC.PAID]) || 0)) * 100) / 100);
            crow[CU.DUE] = Math.max(0, Math.round((crow[CU.TOTAL] - crow[CU.PAID]) * 100) / 100);
            getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
          }
        }

        deleteItemsOfIds(targets.map(t => parseInt(t.data[SC.ID], 10)));

        // Hapus dari baris paling bawah supaya nomor baris lain tidak bergeser
        const scSh = getSheet(SHEETS.SCHEDULES);
        targets.slice().sort((a, b) => b.row - a.row).forEach(t => scSh.deleteRow(t.row));

        // Riwayat pembayaran (termasuk DP) sengaja TIDAK dihapus, sebagai jejak uang yang sudah masuk
        logActivity(userId, '', 'DELETE', 'Schedules', parseInt(id), 'Deleted: ' + (invNo || pkgId) + ' paket ' + targets.length + ' kunjungan');
        return { success: true, message: 'Paket berhasil dihapus (' + targets.length + ' kunjungan)' };
      }

      // ── Booking biasa: perilaku lama tetap sama ──
      if (row[SC.CUST_ID] && row[SC.STATUS] !== 'cancelled') {
        const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(row[SC.CUST_ID]));
        if (cr) {
          const crow = cr.data.slice();
          crow[CU.TOTAL] = Math.max(0, (parseFloat(crow[CU.TOTAL])||0) - (parseFloat(row[SC.TOTAL])||0));
          crow[CU.PAID] = Math.max(0, (parseFloat(crow[CU.PAID])||0) - (parseFloat(row[SC.PAID])||0));
          crow[CU.DUE] = Math.round((crow[CU.TOTAL] - crow[CU.PAID]) * 100) / 100;
          getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
        }
      }
      deleteItemsOfIds([parseInt(id)]);
      const pySh = getSheet(SHEETS.PAYMENTS);
      const pyAll = getSheetData(SHEETS.PAYMENTS);
      pyAll.map((p, idx) => p[PAY.SCHED_ID] == parseInt(id) ? idx+2 : null).filter(Boolean).reverse().forEach(rn => pySh.deleteRow(rn));
      getSheet(SHEETS.SCHEDULES).deleteRow(r.row);
      logActivity(userId, '', 'DELETE', 'Schedules', parseInt(id), 'Deleted: '+invNo);
      return { success: true, message: 'Jadwal berhasil dihapus' };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('deleteSchedule:', e); return { success: false, message: 'Gagal menghapus jadwal' }; }
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function getDashboardStats(userId, role) {
  try {
    const now = new Date();
    const tz = Session.getScriptTimeZone();
    const todayStr = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
    // Tanggal besok disusun dari teks tanggal lokal hari ini, bukan dari objek Date
    // hasil parsing, supaya tidak bergeser sehari karena zona waktu.
    const tomorrowStr = addDaysStr(todayStr, 1);
    // mStart adalah tengah malam lokal awal bulan, jadi tanggal jadwal harus dibandingkan sebagai waktu lokal juga
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const scData = getSheetDataClient(SHEETS.SCHEDULES);
    const timeById = getScheduleTimeById();
    const activeScheds = scData.filter(s => s[SC.STATUS] !== 'cancelled');
    const todayScheds = activeScheds.filter(s => fmtDate(s[SC.DATE]) === todayStr);
    const tomorrowScheds = activeScheds.filter(s => fmtDate(s[SC.DATE]) === tomorrowStr);
    const cuData = getSheetDataClient(SHEETS.CUSTOMERS);
    const totalCustDue = cuData.reduce((s, c) => s + (parseFloat(c[CU.DUE])||0), 0);
    const monthScheds = activeScheds.filter(s => {
      const d = new Date(fmtDate(s[SC.DATE]) + 'T00:00:00');
      return !isNaN(d) && d >= mStart;
    });
    const monthRevenue = monthScheds.reduce((s, sc) => s + (parseFloat(sc[SC.TOTAL])||0), 0);
    const monthCollected = monthScheds.reduce((s, sc) => s + (parseFloat(sc[SC.PAID])||0), 0);
    const todayRevenue = todayScheds.reduce((s, sc) => s + (parseFloat(sc[SC.TOTAL])||0), 0);

    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const ds = Utilities.formatDate(d, tz, 'yyyy-MM-dd');
      const dayAmt = activeScheds.filter(s => fmtDate(s[SC.DATE]) === ds).reduce((s, sc) => s + (parseFloat(sc[SC.TOTAL])||0), 0);
      dailyData.push({ date: ds.substring(5), amount: dayAmt });
    }

    const siData = getSheetDataClient(SHEETS.SCHEDULE_ITEMS);
    const itemMap = groupScheduleItems(siData);
    const monthSchedIds = new Set(monthScheds.map(s => s[SC.ID]));
    const trBreakdown = {};
    siData.filter(si => monthSchedIds.has(si[SI.SCHED_ID])).forEach(si => {
      const name = si[SI.TR_NAME]||'Unknown';
      if (!trBreakdown[name]) trBreakdown[name] = { count: 0, revenue: 0 };
      trBreakdown[name].count += parseInt(si[SI.QTY])||1;
      trBreakdown[name].revenue += parseFloat(si[SI.SUBTOTAL])||0;
    });

    const statusDist = { scheduled: 0, done: 0, cancelled: 0 };
    scData.forEach(s => { const st = s[SC.STATUS]||'scheduled'; if (statusDist[st]!==undefined) statusDist[st]++; });

    const topCustomers = cuData.filter(c => parseFloat(c[CU.TOTAL]) > 0)
      .map(c => ({ name: c[CU.NAME], total: parseFloat(c[CU.TOTAL])||0 }))
      .sort((a, b) => b.total - a.total).slice(0, 5);

    const uData = getSheetDataClient(SHEETS.USERS);
    const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
    const cuMap = {}; cuData.forEach(c => { cuMap[c[CU.ID]] = c[CU.NAME]; });
    const cuWaMap = {}; cuData.forEach(c => { cuWaMap[c[CU.ID]] = normalizePhoneWa(c[CU.PHONE]); });

    // Paket NB yang belum disetor DP sama sekali. DP bukan syarat sahnya booking,
    // jadi paket tetap tampil di sini sampai ada pembayaran pertama.
    const belumDp = activeScheds
      .filter(s => String(s[SC.PKG_ID] || '').trim() !== '' && (parseInt(s[SC.VISIT_NO], 10) || 0) === 1 && (parseFloat(s[SC.PAID]) || 0) <= 0)
      .map(s => ({
        id: s[SC.ID], invoice_no: s[SC.INV_NO] || '',
        customer_name: cuMap[s[SC.CUST_ID]] || 'Walk-in',
        customer_phone_wa: cuWaMap[s[SC.CUST_ID]] || '',
        date: fmtDate(s[SC.DATE]), grand_total: parseFloat(s[SC.TOTAL]) || 0
      }))
      .reverse();

    const recentSchedules = activeScheds.slice(-8).reverse().map(s => ({
      invoice_no: s[SC.INV_NO], customer: cuMap[s[SC.CUST_ID]]||'Walk-in',
      date: fmtDate(s[SC.DATE]), total: parseFloat(s[SC.TOTAL])||0,
      status: s[SC.STATUS]||'', keterangan: s[SC.KETERANGAN]||''
    }));

    const overdueCustomers = cuData.filter(c => (parseFloat(c[CU.DUE])||0) > 0)
      .map(c => ({ name: c[CU.NAME], phone: formatPhone(c[CU.PHONE]), phone_wa: normalizePhoneWa(c[CU.PHONE]), due: parseFloat(c[CU.DUE])||0 }))
      .sort((a, b) => b.due - a.due).slice(0, 5);

    // Urut jam dari pagi; jadwal yang belum punya jam ditaruh paling bawah, lalu urut nama pelanggan
    const byTime = (a, b) => {
      const ta = String(a.time || '').trim(), tb = String(b.time || '').trim();
      if (ta !== tb) {
        if (!ta) return 1;
        if (!tb) return -1;
        return ta < tb ? -1 : 1;
      }
      const ca = a.customer || '', cb = b.customer || '';
      return ca < cb ? -1 : (ca > cb ? 1 : 0);
    };
    const schedBrief = s => ({
      id: s[SC.ID], invoice_no: s[SC.INV_NO], customer: cuMap[s[SC.CUST_ID]]||'Walk-in',
      time: fmtTime(timeById[s[SC.ID]] || s[SC.TIME]), location: s[SC.LOCATION]||'',
      therapist: uMap[s[SC.THERAPIST_ID]]||'', status: s[SC.STATUS]||'',
      treatments: joinTreatmentText(itemMap[String(s[SC.ID])], s[SC.PKG_NAME]),
      maps_link: s[SC.MAPS_LINK] || ''
    });

    const upcomingToday = todayScheds.map(schedBrief).sort(byTime);
    const upcomingTomorrow = tomorrowScheds.map(schedBrief).sort(byTime);

    return {
      success: true,
      data: {
        todayCount: todayScheds.length, todayRevenue,
        monthRevenue: Math.round(monthRevenue*100)/100,
        monthCollected: Math.round(monthCollected*100)/100,
        totalCustDue: Math.round(totalCustDue*100)/100,
        totalSchedules: activeScheds.length,
        dailyData, trBreakdown, statusDist, topCustomers,
        recentSchedules, overdueCustomers, upcomingToday,
        upcomingTomorrow, tomorrowCount: tomorrowScheds.length,
        belumDp, belumDpCount: belumDp.length
      }
    };
  } catch(e) { console.error('getDashboardStats:', e); return { success: false, message: 'Gagal memuat statistik' }; }
}

// ─── Reports ───────────────────────────────────────────────────────────────────
function getReportsData(reportType, filters, userId, role) {
  try {
    const f = filters || {};
    const dFrom = f.dateFrom ? new Date(f.dateFrom + 'T00:00:00') : null;
    const dTo = f.dateTo ? new Date(f.dateTo + 'T23:59:59') : null;
    const toD = v => v instanceof Date ? v : new Date(v);
    const inRange = v => {
      if (!dFrom && !dTo) return true;
      const d = toD(v); if (isNaN(d)) return false;
      if (dFrom && d < dFrom) return false;
      if (dTo && d > dTo) return false;
      return true;
    };

    if (reportType === 'monthly') {
      const scData = getSheetDataClient(SHEETS.SCHEDULES).filter(r => r[SC.STATUS] !== 'cancelled' && inRange(r[SC.DATE]));
      const gMap = {};
      scData.forEach(r => {
        const d = toD(r[SC.DATE]); if (isNaN(d)) return;
        const label = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
        if (!gMap[label]) gMap[label] = { label, revenue: 0, collected: 0, count: 0 };
        gMap[label].revenue += parseFloat(r[SC.TOTAL])||0;
        gMap[label].collected += parseFloat(r[SC.PAID])||0;
        gMap[label].count++;
      });
      const monthlyData = Object.values(gMap).sort((a,b) => a.label.localeCompare(b.label));
      const totalRevenue = scData.reduce((s,r) => s+(parseFloat(r[SC.TOTAL])||0), 0);
      const totalCollected = scData.reduce((s,r) => s+(parseFloat(r[SC.PAID])||0), 0);
      return { success: true, data: { monthlyData, totalRevenue, totalCollected, totalCount: scData.length } };
    }

    if (reportType === 'treatments') {
      const scData = getSheetDataClient(SHEETS.SCHEDULES).filter(r => r[SC.STATUS] !== 'cancelled' && inRange(r[SC.DATE]));
      const schedIds = new Set(scData.map(r => r[SC.ID]));
      const siData = getSheetDataClient(SHEETS.SCHEDULE_ITEMS).filter(si => schedIds.has(si[SI.SCHED_ID]));
      const tMap = {};
      siData.forEach(si => {
        const name = si[SI.TR_NAME]||'Unknown';
        if (!tMap[name]) tMap[name] = { name, count: 0, revenue: 0, qty: 0 };
        tMap[name].count++;
        tMap[name].qty += parseInt(si[SI.QTY])||1;
        tMap[name].revenue += parseFloat(si[SI.SUBTOTAL])||0;
      });
      const treatments = Object.values(tMap).sort((a,b) => b.revenue - a.revenue);
      return { success: true, data: { treatments } };
    }

    if (reportType === 'customers') {
      const scData = getSheetDataClient(SHEETS.SCHEDULES).filter(r => r[SC.STATUS] !== 'cancelled' && inRange(r[SC.DATE]));
      const cuData = getSheetDataClient(SHEETS.CUSTOMERS);
      const cuMap = {}; cuData.forEach(c => { cuMap[c[CU.ID]] = { name: c[CU.NAME], phone: formatPhone(c[CU.PHONE]), phoneWa: normalizePhoneWa(c[CU.PHONE]) }; });
      const agg = {};
      scData.forEach(r => {
        const cid = r[SC.CUST_ID]; if (!cid) return;
        if (!agg[cid]) agg[cid] = { id: cid, name: '', phone: '', phone_wa: '', totalRevenue: 0, count: 0 };
        agg[cid].totalRevenue += parseFloat(r[SC.TOTAL])||0;
        agg[cid].count++;
      });
      const customers = Object.values(agg).map(c => {
        const cu = cuMap[c.id];
        c.name = cu ? cu.name : 'Unknown';
        c.phone = cu ? cu.phone : '';
        c.phone_wa = cu ? cu.phoneWa : '';
        c.avgTicket = c.count ? c.totalRevenue/c.count : 0; return c;
      }).sort((a,b) => b.totalRevenue - a.totalRevenue);
      return { success: true, data: { customers } };
    }

    return { success: false, message: 'Tipe laporan tidak dikenali' };
  } catch(e) { console.error('getReportsData:', e); return { success: false, message: 'Gagal menghasilkan laporan' }; }
}

// ─── Payments ─────────────────────────────────────────────────────────────────
function getPayments(userId, role, filters) {
  try {
    const data = getSheetDataClient(SHEETS.PAYMENTS);
    const scData = getSheetDataClient(SHEETS.SCHEDULES);
    const cuData = getSheetDataClient(SHEETS.CUSTOMERS);
    const scMap = {}; scData.forEach(r => { scMap[r[SC.ID]] = r[SC.INV_NO]; });
    const cuMap = {}; cuData.forEach(r => { cuMap[r[CU.ID]] = r[CU.NAME]; });
    const f = filters || {};
    let payments = data.map(r => ({
      id: r[PAY.ID], schedule_id: r[PAY.SCHED_ID],
      invoice_no: scMap[r[PAY.SCHED_ID]]||'', customer_name: cuMap[r[PAY.CUST_ID]]||'Walk-in',
      amount: parseFloat(r[PAY.AMT])||0, method: paymentMethodLabel(r[PAY.METHOD]),
      reference: r[PAY.REF]||'', date: fmtDate(r[PAY.DATE]), notes: r[PAY.NOTES]||''
    }));
    if (f.dateFrom) payments = payments.filter(p => p.date >= f.dateFrom);
    if (f.dateTo) payments = payments.filter(p => p.date <= f.dateTo);
    return { success: true, data: payments.reverse() };
  } catch(e) { return { success: false, message: 'Gagal memuat pembayaran' }; }
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function getSettings() {
  try {
    const data = getSheetDataClient(SHEETS.SETTINGS);
    const settings = {};
    data.forEach(r => {
      const key = String(r[ST.KEY] || '');
      // last_invoice_no hanya penanda internal, tidak perlu ditampilkan di halaman Pengaturan
      if (key === 'last_invoice_no') return;
      settings[r[ST.KEY]] = r[ST.VAL];
    });
    return { success: true, data: settings };
  } catch(e) { return { success: true, data: {} }; }
}

function saveAllSettings(settingsObj, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Hanya admin yang bisa mengubah pengaturan' };
    const allowed = ['business_name','business_tagline','business_phone','business_address','business_instagram','business_tiktok','payment_info','currency_symbol','invoice_prefix','transport_rate_per_km','invoice_footer','last_invoice_no','logo_url','qris_url','signature_url'];
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      Object.entries(settingsObj || {}).forEach(([key, value]) => {
        if (allowed.indexOf(String(key)) === -1) return;
        const r = findRowByValue(SHEETS.SETTINGS, ST.KEY, key);
        if (r) {
          const row = r.data.slice();
          row[ST.VAL] = value; row[ST.UPDATED_BY] = userId; row[ST.UPDATED] = ts();
          getSheet(SHEETS.SETTINGS).getRange(r.row, 1, 1, row.length).setValues([row]);
        } else {
          getSheet(SHEETS.SETTINGS).appendRow([getNextId(SHEETS.SETTINGS), key, value, userId, ts()]);
        }
      });
    } finally { lock.releaseLock(); }
    logActivity(userId, '', 'UPDATE', 'Settings', '', 'Settings updated');
    return { success: true, message: 'Pengaturan berhasil disimpan' };
  } catch(e) { return { success: false, message: 'Gagal menyimpan pengaturan' }; }
}

// ─── Logs ─────────────────────────────────────────────────────────────────────
function getLogs(userId, role, limit) {
  try {
    if (role !== 'admin') return { success: false, message: 'Akses ditolak' };
    const data = getSheetDataClient(SHEETS.LOGS);
    const lim = Math.min(parseInt(limit)||200, 500);
    return {
      success: true,
      data: data.map(r => ({
        id: r[L.ID], username: r[L.UNAME], action: r[L.ACTION],
        table_name: r[L.TABLE], record_id: r[L.RID], details: r[L.DETAILS]||'',
        created_at: fmtTs(r[L.CREATED])
      })).reverse().slice(0, lim)
    };
  } catch(e) { return { success: false, message: 'Gagal memuat log' }; }
}

function logActivity(uid, uname, action, table, rid, details) {
  try {
    const sh = getSheet(SHEETS.LOGS);
    if (!sh) return;
    const name = uname || getUsernameById(uid);
    const lock = LockService.getScriptLock();
    // Hindari kunci bersarang: kalau eksekusi ini sudah memegang lock, jangan ambil/lepas lagi
    const alreadyLocked = lock.hasLock();
    if (!alreadyLocked) lock.waitLock(10000);
    try {
      sh.appendRow([getNextId(SHEETS.LOGS), uid, name, action, table, rid||'', details||'', ts()]);
    } finally { if (!alreadyLocked) lock.releaseLock(); }
  } catch(e) { console.error('logActivity:', e); }
}

// ─── Setup (Run Once) ──────────────────────────────────────────────────────────
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const existing = ss.getSheets();
  let tmp = ss.insertSheet('_setup_tmp');
  existing.forEach(s => { try { ss.deleteSheet(s); } catch(e) {} });

  const now = ts();
  const hdrColor = '#85957A';

  function mkSheet(name, headers) {
    const sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground(hdrColor).setFontColor('white');
    sh.setFrozenRows(1);
    return sh;
  }

  // Users
  const ush = mkSheet(SHEETS.USERS, ['ID','Full Name','Email','Phone','Password','Role','Is Active','Created At','Updated At']);
  ush.appendRow([1,'Admin Daisafa','admin@daisafacare.com','082231210811','admin123','admin',1,now,now]);
  ush.appendRow([2,'Terapis 1','terapis1@daisafacare.com','081234567890','terapis123','therapist',1,now,now]);
  ush.appendRow([3,'Resepsionis','resep@daisafacare.com','081234567891','resep123','receptionist',1,now,now]);

  // Customers
  const cush = mkSheet(SHEETS.CUSTOMERS, ['ID','Name','Phone','Address','Baby Name','Baby Age','Notes','Total Purchase','Total Paid','Total Due','Is Active','Created By','Created At','Tanggal Lahir','Maps Link']);
  cush.appendRow([1,'Jessica Nyoman','628113108969','Kalisari Dharma','Baby J','3 bulan','',224000,224000,0,1,1,now]);
  cush.appendRow([2,'Vira Amalia','6282257502725','Jalan Bogangin Baru Blok I No.14a','Baby V','2 bulan','',85000,85000,0,1,1,now]);
  cush.appendRow([3,'Chyntia','6285173270177','Educity Apartemen','Baby C','1 bulan','',200000,0,200000,1,1,now]);

  // Treatments
  const trsh = mkSheet(SHEETS.TREATMENTS, ['ID','Category','Name','Description','Price','Duration (min)','Is Active','Created By','Created At']);
  [[1,'Baby','Sleep Booster','Pijat bayi untuk meningkatkan kualitas tidur',85000,60,1,1,now],
   [2,'Baby','GTM','Pijat bayi untuk masalah GTM',100000,60,1,1,now],
   [3,'Baby','Tummy Massage','Pijat perut bayi untuk kembung dan kolik',85000,45,1,1,now],
   [4,'Baby','Hypno Babywearing','Teknik penggunaan gendongan dengan hipno',150000,90,1,1,now],
   [5,'Kids','Sleep Booster','Pijat anak untuk meningkatkan kualitas tidur',100000,60,1,1,now],
   [6,'Kids','GTM','Pijat anak untuk masalah GTM',120000,60,1,1,now],
   [7,'Mom','Pijat Nifas','Pijat ibu pasca melahirkan',200000,90,1,1,now],
   [8,'Mom','Breast Care','Perawatan payudara untuk ibu menyusui',150000,60,1,1,now],
   [9,'Jaga','Jaga 6 Jam','Babysitter service 6 jam',200000,360,1,1,now],
   [10,'Jaga','Jaga 8 Jam','Babysitter service 8 jam',250000,480,1,1,now]
  ].forEach(t => trsh.appendRow(t));

  // Schedules
  const scsh = mkSheet(SHEETS.SCHEDULES, ['ID','Invoice No','Customer ID','Therapist ID','Schedule Date','Schedule Time','Location','KM Distance','Fee Treatment','Transport Fee','Subtotal','Discount','Grand Total','Paid Amount','Due Amount','Payment Method','Status','Keterangan','Notes','Created By','Created At','Updated At','Maps Link','Package ID','Package Name','Visit No','Total Visits','Master Schedule ID']);
  scsh.appendRow([1,'DSF-20261001-001',1,2,'2026-10-01','09:00','Kalisari Dharma',10,200000,24000,224000,0,224000,224000,0,'TF/QRIS','done','LUNAS TF/QRIS','',1,now,now]);
  scsh.appendRow([2,'DSF-20261005-001',2,2,'2026-10-05','10:00','Jalan Bogangin Baru',5,85000,0,85000,0,85000,85000,0,'TF/QRIS','done','LUNAS TF/QRIS','',1,now,now]);
  scsh.appendRow([3,'DSF-20261010-001',3,2,'2026-10-10','14:00','Educity Apartemen',8,100000,0,100000,0,100000,0,100000,'TF/QRIS','scheduled','BELUM BAYAR','',1,now,now]);

  // Schedule_Items
  const sish = mkSheet(SHEETS.SCHEDULE_ITEMS, ['ID','Schedule ID','Treatment ID','Treatment Name','Price','Qty','Subtotal']);
  sish.appendRow([1,1,9,'Jaga - 6 Jam | Rp 200K',200000,1,200000]);
  sish.appendRow([2,2,1,'Baby - Sleep Booster | Rp 85K',85000,1,85000]);
  sish.appendRow([3,3,1,'Baby - Sleep Booster | Rp 85K',85000,1,85000]);
  sish.appendRow([4,3,5,'Kids - Sleep Booster | Rp 100K',100000,1,100000]);

  // Payments
  const pysh = mkSheet(SHEETS.PAYMENTS, ['ID','Schedule ID','Customer ID','Amount','Method','Reference No','Payment Date','Notes','Created By','Created At']);
  pysh.appendRow([1,1,1,224000,'TF/QRIS','','2026-10-01','Full payment',1,now]);
  pysh.appendRow([2,2,2,85000,'TF/QRIS','','2026-10-05','Full payment',1,now]);

  // Settings
  const stsh = mkSheet(SHEETS.SETTINGS, ['ID','Setting Key','Setting Value','Updated By','Updated At']);
  [[1,'business_name','Daisafacare',1,now],
   [2,'business_tagline','Mom & Baby Treatment',1,now],
   [3,'business_phone','0822-3212-1081',1,now],
   [4,'business_address','Surabaya, Jawa Timur',1,now],
   [5,'business_instagram','@daisafacare',1,now],
   [6,'business_tiktok','daisafacare',1,now],
   [7,'payment_info','BCA 3530674729 a.n Syifa Rasalhague or QRIS',1,now],
   [8,'currency_symbol','Rp',1,now],
   [9,'invoice_prefix','DSF',1,now],
   [10,'transport_rate_per_km','2000',1,now],
   [11,'invoice_footer','Terima kasih atas kepercayaan Anda kepada kami.',1,now],
   [12,'last_invoice_no','',1,now],
   [13,'logo_url','https:' + String.fromCharCode(47, 47) + 'res.cloudinary.com/dlrxxfy7f/image/upload/w_320,q_auto:good,f_png/v1792500542/LOGO_DAISAFACARE_NO_TEXT-removebg-preview_yyopiu.png',1,now],
   [14,'qris_url','https:' + String.fromCharCode(47, 47) + 'res.cloudinary.com/dlrxxfy7f/image/upload/w_500,q_auto:best,f_png/v1792500651/QRIS_DAISAFA_CARE_srnnbg.png',1,now],
   [15,'signature_url','',1,now]
  ].forEach(s => stsh.appendRow(s));

  mkSheet(SHEETS.LOGS, ['ID','User ID','Username','Action','Table','Record ID','Details','Created At']);

  ss.deleteSheet(tmp);
  return 'Setup selesai! Login: admin@daisafacare.com / admin123';
}
