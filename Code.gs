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

// Customers: id, name, phone, address, baby_name, baby_age, notes, total_purchase, total_paid, total_due, is_active, created_by, created_at
const CU = { ID:0, NAME:1, PHONE:2, ADDR:3, BABY_NAME:4, BABY_AGE:5, NOTES:6, TOTAL:7, PAID:8, DUE:9, ACTIVE:10, CREATED_BY:11, CREATED:12 };

// Treatments: id, category, name, description, price, duration_min, is_active, created_by, created_at
const TR = { ID:0, CAT:1, NAME:2, DESC:3, PRICE:4, DURATION:5, ACTIVE:6, CREATED_BY:7, CREATED:8 };

// Schedules: id, invoice_no, customer_id, therapist_id, schedule_date, schedule_time,
//   location, km_distance, fee_treatment, transport_fee, subtotal, discount, grand_total,
//   paid_amount, due_amount, payment_method, status, keterangan, notes, created_by, created_at, updated_at
const SC = {
  ID:0, INV_NO:1, CUST_ID:2, THERAPIST_ID:3,
  DATE:4, TIME:5, LOCATION:6, KM:7,
  FEE:8, TRANSPORT:9, SUBTOTAL:10, DISCOUNT:11, TOTAL:12,
  PAID:13, DUE:14, METHOD:15, STATUS:16,
  KETERANGAN:17, NOTES:18, CREATED_BY:19, CREATED:20, UPDATED:21
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
  if (sh.getLastRow() < 2) return 1;
  const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat().filter(id => id !== '');
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
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return String(val).split('T')[0];
}

function fmtTs(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function getUsernameById(uid) {
  const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(uid));
  return r ? r.data[U.NAME] : 'Unknown';
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
      data: { id: u[U.ID], full_name: u[U.NAME], email: u[U.EMAIL], phone: u[U.PHONE]||'', role: u[U.ROLE] }
    };
  } catch(e) { console.error('login:', e); return { success: false, message: 'Login gagal' }; }
}

// ─── Users ─────────────────────────────────────────────────────────────────────
function getUsers(userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Akses ditolak' };
    const data = getSheetData(SHEETS.USERS);
    return {
      success: true,
      data: data.map(r => ({
        id: r[U.ID], full_name: r[U.NAME], email: r[U.EMAIL], phone: r[U.PHONE]||'',
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
    const existing = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (existing) return { success: false, message: 'Email sudah terdaftar' };
    const sh = getSheet(SHEETS.USERS);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.USERS);
      const now = ts();
      sh.appendRow([newId, full_name.trim(), email.trim().toLowerCase(), phone||'', password, userRole||'receptionist', 1, now, now]);
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
    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(id));
    if (!r) return { success: false, message: 'Pengguna tidak ditemukan' };
    const ec = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (ec && ec.data[U.ID] != parseInt(id)) return { success: false, message: 'Email sudah digunakan' };
    const row = r.data.slice();
    row[U.NAME] = full_name.trim();
    row[U.EMAIL] = email.trim().toLowerCase();
    row[U.PHONE] = phone||'';
    row[U.ROLE] = userRole||'receptionist';
    row[U.ACTIVE] = (is_active==1||is_active===true) ? 1 : 0;
    if (password && password.length >= 6) row[U.PWD] = password;
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
    return { success: true, data: { id: u[U.ID], full_name: u[U.NAME], email: u[U.EMAIL], phone: u[U.PHONE]||'', role: u[U.ROLE] } };
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
    row[U.PHONE] = phone||'';
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
    const data = getSheetData(SHEETS.USERS);
    return { success: true, data: data.filter(r => isActive(r[U.ACTIVE]) && (r[U.ROLE]==='therapist'||r[U.ROLE]==='admin')).map(r => ({ id: r[U.ID], name: r[U.NAME] })) };
  } catch(e) { return { success: true, data: [] }; }
}

// ─── Customers ─────────────────────────────────────────────────────────────────
function getCustomers(userId, role) {
  try {
    const data = getSheetData(SHEETS.CUSTOMERS);
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });
    return {
      success: true,
      data: data.map(r => ({
        id: r[CU.ID], name: r[CU.NAME], phone: r[CU.PHONE]||'', address: r[CU.ADDR]||'',
        baby_name: r[CU.BABY_NAME]||'', baby_age: r[CU.BABY_AGE]||'', notes: r[CU.NOTES]||'',
        total_purchase: parseFloat(r[CU.TOTAL])||0, total_paid: parseFloat(r[CU.PAID])||0,
        total_due: parseFloat(r[CU.DUE])||0, is_active: isActive(r[CU.ACTIVE]) ? 1 : 0,
        created_by_name: uMap[r[CU.CREATED_BY]]||'', created_at: fmtTs(r[CU.CREATED])
      })).reverse()
    };
  } catch(e) { console.error('getCustomers:', e); return { success: false, message: 'Gagal memuat pelanggan' }; }
}

function addCustomer(cuData, userId, role) {
  try {
    const { name, phone, address, baby_name, baby_age, notes } = cuData;
    if (!name) return { success: false, message: 'Nama pelanggan wajib diisi' };
    const sh = getSheet(SHEETS.CUSTOMERS);
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.CUSTOMERS);
      sh.appendRow([newId, name.trim(), phone||'', address||'', baby_name||'', baby_age||'', notes||'', 0, 0, 0, 1, userId, ts()]);
      logActivity(userId, '', 'CREATE', 'Customers', newId, 'Added: '+name.trim());
      return { success: true, message: 'Pelanggan berhasil ditambahkan', data: { id: newId, name: name.trim() } };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('addCustomer:', e); return { success: false, message: 'Gagal menambahkan pelanggan' }; }
}

function updateCustomer(cuData, userId, role) {
  try {
    const { id, name, phone, address, baby_name, baby_age, notes, is_active } = cuData;
    if (!id || !name) return { success: false, message: 'Nama wajib diisi' };
    const r = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Pelanggan tidak ditemukan' };
    const row = r.data.slice();
    row[CU.NAME] = name.trim();
    row[CU.PHONE] = phone||'';
    row[CU.ADDR] = address||'';
    row[CU.BABY_NAME] = baby_name||'';
    row[CU.BABY_AGE] = baby_age||'';
    row[CU.NOTES] = notes||'';
    row[CU.ACTIVE] = (is_active==1||is_active===true) ? 1 : 0;
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
    const data = getSheetData(SHEETS.CUSTOMERS);
    return { success: true, data: data.filter(r => isActive(r[CU.ACTIVE])).map(r => ({ id: r[CU.ID], name: r[CU.NAME], phone: r[CU.PHONE]||'' })) };
  } catch(e) { return { success: true, data: [] }; }
}

function getCustomerLedger(custId, userId, role) {
  try {
    const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(custId));
    if (!cr) return { success: false, message: 'Pelanggan tidak ditemukan' };
    const customer = {
      id: cr.data[CU.ID], name: cr.data[CU.NAME], phone: cr.data[CU.PHONE]||'',
      address: cr.data[CU.ADDR]||'', baby_name: cr.data[CU.BABY_NAME]||'',
      baby_age: cr.data[CU.BABY_AGE]||'', notes: cr.data[CU.NOTES]||'',
      total_purchase: parseFloat(cr.data[CU.TOTAL])||0,
      total_paid: parseFloat(cr.data[CU.PAID])||0,
      total_due: parseFloat(cr.data[CU.DUE])||0
    };
    const scData = getSheetData(SHEETS.SCHEDULES);
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
    const schedules = scData.filter(s => s[SC.CUST_ID] == parseInt(custId)).map(s => ({
      id: s[SC.ID], invoice_no: s[SC.INV_NO],
      date: fmtDate(s[SC.DATE]), time: s[SC.TIME]||'', location: s[SC.LOCATION]||'',
      grand_total: parseFloat(s[SC.TOTAL])||0, paid: parseFloat(s[SC.PAID])||0,
      due: parseFloat(s[SC.DUE])||0, status: s[SC.STATUS]||'', keterangan: s[SC.KETERANGAN]||'',
      therapist_name: uMap[s[SC.THERAPIST_ID]]||''
    })).reverse();
    const pyData = getSheetData(SHEETS.PAYMENTS);
    const payments = pyData.filter(p => p[PAY.CUST_ID] == parseInt(custId)).map(p => ({
      id: p[PAY.ID], schedule_id: p[PAY.SCHED_ID],
      amount: parseFloat(p[PAY.AMT])||0, method: p[PAY.METHOD]||'',
      date: fmtDate(p[PAY.DATE]), notes: p[PAY.NOTES]||''
    })).reverse();
    return { success: true, data: { customer, schedules, payments } };
  } catch(e) { console.error('getCustomerLedger:', e); return { success: false, message: 'Gagal memuat ledger' }; }
}

// ─── Treatments ────────────────────────────────────────────────────────────────
function getTreatments(userId, role) {
  try {
    const data = getSheetData(SHEETS.TREATMENTS);
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
    row[TR.ACTIVE] = (is_active==1||is_active===true) ? 1 : 0;
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
    const data = getSheetData(SHEETS.TREATMENTS);
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
  const data = getSheetData(SHEETS.SCHEDULES);
  const today = data.filter(r => String(r[SC.INV_NO]).includes(dt));
  const maxSeq = today.reduce((m, r) => {
    const parts = String(r[SC.INV_NO]).split('-');
    return Math.max(m, parseInt(parts[parts.length-1]) || 0);
  }, 0);
  return 'DSF-' + dt + '-' + String(maxSeq + 1).padStart(3, '0');
}

// ─── Schedules ─────────────────────────────────────────────────────────────────
function getSchedules(userId, role, filters) {
  try {
    const data = getSheetData(SHEETS.SCHEDULES);
    const cuData = getSheetData(SHEETS.CUSTOMERS);
    const uData = getSheetData(SHEETS.USERS);
    const cuMap = {}; cuData.forEach(r => { cuMap[r[CU.ID]] = { name: r[CU.NAME], phone: r[CU.PHONE]||'' }; });
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });
    const f = filters || {};

    let schedules = data.map(r => ({
      id: r[SC.ID], invoice_no: r[SC.INV_NO],
      customer_id: r[SC.CUST_ID], customer_name: cuMap[r[SC.CUST_ID]] ? cuMap[r[SC.CUST_ID]].name : 'Walk-in',
      customer_phone: cuMap[r[SC.CUST_ID]] ? cuMap[r[SC.CUST_ID]].phone : '',
      therapist_id: r[SC.THERAPIST_ID], therapist_name: uMap[r[SC.THERAPIST_ID]]||'',
      schedule_date: fmtDate(r[SC.DATE]), schedule_time: r[SC.TIME]||'',
      location: r[SC.LOCATION]||'', km: parseFloat(r[SC.KM])||0,
      fee_treatment: parseFloat(r[SC.FEE])||0, transport_fee: parseFloat(r[SC.TRANSPORT])||0,
      subtotal: parseFloat(r[SC.SUBTOTAL])||0, discount: parseFloat(r[SC.DISCOUNT])||0,
      grand_total: parseFloat(r[SC.TOTAL])||0, paid_amount: parseFloat(r[SC.PAID])||0,
      due_amount: parseFloat(r[SC.DUE])||0, payment_method: r[SC.METHOD]||'',
      status: r[SC.STATUS]||'scheduled', keterangan: r[SC.KETERANGAN]||'', notes: r[SC.NOTES]||'',
      created_by: r[SC.CREATED_BY], cashier_name: uMap[r[SC.CREATED_BY]]||'',
      created_at: fmtTs(r[SC.CREATED])
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
    const { customer_id, therapist_id, schedule_date, schedule_time, location, km, items, discount, paid_amount, payment_method, keterangan, notes } = scData;
    if (!schedule_date) return { success: false, message: 'Tanggal jadwal wajib diisi' };
    if (!items || !items.length) return { success: false, message: 'Tambahkan minimal satu treatment' };

    const feeTreatment = items.reduce((s, i) => s + (parseFloat(i.subtotal)||0), 0);
    const kmDist = parseFloat(km)||0;
    const transportFee = scData.transport_fee !== undefined ? parseFloat(scData.transport_fee)||0 : Math.round(kmDist * 2000);
    const subtotal = feeTreatment + transportFee;
    const disc = parseFloat(discount)||0;
    const grandTotal = Math.max(0, Math.round((subtotal - disc) * 100) / 100);
    const paid = Math.min(parseFloat(paid_amount)||0, grandTotal);
    const due = Math.round((grandTotal - paid) * 100) / 100;

    const sh = getSheet(SHEETS.SCHEDULES);
    const siSh = getSheet(SHEETS.SCHEDULE_ITEMS);
    const lock = LockService.getScriptLock(); lock.waitLock(15000);
    try {
      const sId = getNextId(SHEETS.SCHEDULES);
      const invNo = genInvoiceNo();
      const now = ts();
      sh.appendRow([sId, invNo, customer_id ? parseInt(customer_id) : '', therapist_id ? parseInt(therapist_id) : '',
        schedule_date, schedule_time||'', location||'', kmDist,
        feeTreatment, transportFee, subtotal, disc, grandTotal, paid, due,
        payment_method||'TF/QRIS', due <= 0 ? 'done' : 'scheduled',
        due <= 0 ? 'LUNAS TF/QRIS' : (keterangan||'BELUM BAYAR'), notes||'', userId, now, now]);

      let siId = getNextId(SHEETS.SCHEDULE_ITEMS);
      const siRows = items.map(item => [siId++, sId, parseInt(item.treatment_id)||'', item.treatment_name||'', parseFloat(item.price)||0, parseInt(item.qty)||1, parseFloat(item.subtotal)||0]);
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
        getSheet(SHEETS.PAYMENTS).appendRow([pyId, sId, customer_id ? parseInt(customer_id) : '', paid, payment_method||'TF/QRIS', '', schedule_date, '', userId, now]);
      }

      logActivity(userId, '', 'CREATE', 'Schedules', sId, invNo + ' Rp'+grandTotal);
      return { success: true, message: 'Jadwal berhasil disimpan', data: { id: sId, invoice_no: invNo } };
    } finally { lock.releaseLock(); }
  } catch(e) { console.error('addSchedule:', e); return { success: false, message: 'Gagal menyimpan jadwal' }; }
}

function getScheduleDetail(id, userId, role) {
  try {
    const r = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(id));
    if (!r) return { success: false, message: 'Jadwal tidak ditemukan' };
    const s = r.data;
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
    const cuData = getSheetData(SHEETS.CUSTOMERS);
    const cuMap = {}; cuData.forEach(c => { cuMap[c[CU.ID]] = { name: c[CU.NAME], phone: c[CU.PHONE]||'', address: c[CU.ADDR]||'', baby_name: c[CU.BABY_NAME]||'', baby_age: c[CU.BABY_AGE]||'' }; });
    const siData = getSheetData(SHEETS.SCHEDULE_ITEMS);
    const items = siData.filter(si => si[SI.SCHED_ID] == parseInt(id)).map(si => ({
      id: si[SI.ID], treatment_id: si[SI.TR_ID], treatment_name: si[SI.TR_NAME],
      price: parseFloat(si[SI.PRICE])||0, qty: parseInt(si[SI.QTY])||1, subtotal: parseFloat(si[SI.SUBTOTAL])||0
    }));
    const pyData = getSheetData(SHEETS.PAYMENTS);
    const payments = pyData.filter(p => p[PAY.SCHED_ID] == parseInt(id)).map(p => ({
      id: p[PAY.ID], amount: parseFloat(p[PAY.AMT])||0, method: p[PAY.METHOD]||'',
      date: fmtDate(p[PAY.DATE]), notes: p[PAY.NOTES]||''
    }));
    const custInfo = cuMap[s[SC.CUST_ID]] || {};
    return {
      success: true,
      data: {
        id: s[SC.ID], invoice_no: s[SC.INV_NO],
        customer_id: s[SC.CUST_ID], customer_name: custInfo.name||'Walk-in',
        customer_phone: custInfo.phone||'', customer_address: custInfo.address||'',
        baby_name: custInfo.baby_name||'', baby_age: custInfo.baby_age||'',
        therapist_id: s[SC.THERAPIST_ID], therapist_name: uMap[s[SC.THERAPIST_ID]]||'',
        schedule_date: fmtDate(s[SC.DATE]), schedule_time: s[SC.TIME]||'',
        location: s[SC.LOCATION]||'', km: parseFloat(s[SC.KM])||0,
        fee_treatment: parseFloat(s[SC.FEE])||0, transport_fee: parseFloat(s[SC.TRANSPORT])||0,
        subtotal: parseFloat(s[SC.SUBTOTAL])||0, discount: parseFloat(s[SC.DISCOUNT])||0,
        grand_total: parseFloat(s[SC.TOTAL])||0, paid_amount: parseFloat(s[SC.PAID])||0,
        due_amount: parseFloat(s[SC.DUE])||0, payment_method: s[SC.METHOD]||'',
        status: s[SC.STATUS]||'scheduled', keterangan: s[SC.KETERANGAN]||'',
        notes: s[SC.NOTES]||'', cashier_name: uMap[s[SC.CREATED_BY]]||'',
        items, payments
      }
    };
  } catch(e) { console.error('getScheduleDetail:', e); return { success: false, message: 'Gagal memuat detail' }; }
}

function updateScheduleStatus(id, status, keterangan, userId, role) {
  try {
    const r = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(id));
    if (!r) return { success: false, message: 'Jadwal tidak ditemukan' };
    const row = r.data.slice();
    const oldStatus = row[SC.STATUS];
    row[SC.STATUS] = status;
    if (keterangan) row[SC.KETERANGAN] = keterangan;
    row[SC.UPDATED] = ts();
    getSheet(SHEETS.SCHEDULES).getRange(r.row, 1, 1, row.length).setValues([row]);
    logActivity(userId, '', 'UPDATE', 'Schedules', parseInt(id), 'Status: '+oldStatus+' to '+status);
    return { success: true, message: 'Status jadwal berhasil diperbarui' };
  } catch(e) { return { success: false, message: 'Gagal memperbarui status' }; }
}

function addSchedulePayment(payData, userId, role) {
  try {
    const { schedule_id, customer_id, amount, method, reference_no, payment_date, notes } = payData;
    if (!schedule_id || !amount || parseFloat(amount) <= 0) return { success: false, message: 'Jumlah pembayaran wajib diisi' };
    const sr = findRowByValue(SHEETS.SCHEDULES, SC.ID, parseInt(schedule_id));
    if (!sr) return { success: false, message: 'Jadwal tidak ditemukan' };
    const lock = LockService.getScriptLock(); lock.waitLock(10000);
    try {
      const now = ts();
      const pyId = getNextId(SHEETS.PAYMENTS);
      getSheet(SHEETS.PAYMENTS).appendRow([pyId, parseInt(schedule_id), customer_id ? parseInt(customer_id) : '', parseFloat(amount), method||'TF/QRIS', reference_no||'', payment_date||now.split('T')[0], notes||'', userId, now]);
      const srow = sr.data.slice();
      srow[SC.PAID] = (parseFloat(srow[SC.PAID])||0) + parseFloat(amount);
      srow[SC.DUE] = Math.round(((parseFloat(srow[SC.TOTAL])||0) - srow[SC.PAID]) * 100) / 100;
      if (srow[SC.DUE] <= 0) { srow[SC.DUE] = 0; srow[SC.STATUS] = 'done'; srow[SC.KETERANGAN] = 'LUNAS TF/QRIS'; }
      srow[SC.UPDATED] = now;
      getSheet(SHEETS.SCHEDULES).getRange(sr.row, 1, 1, srow.length).setValues([srow]);
      if (customer_id) {
        const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(customer_id));
        if (cr) {
          const crow = cr.data.slice();
          crow[CU.PAID] = (parseFloat(crow[CU.PAID])||0) + parseFloat(amount);
          crow[CU.DUE] = Math.round(((parseFloat(crow[CU.TOTAL])||0) - crow[CU.PAID]) * 100) / 100;
          if (crow[CU.DUE] < 0) crow[CU.DUE] = 0;
          getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
        }
      }
      logActivity(userId, '', 'CREATE', 'Payments', pyId, 'Rp'+parseFloat(amount)+' for '+sr.data[SC.INV_NO]);
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
    const lock = LockService.getScriptLock(); lock.waitLock(15000);
    try {
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
      const siSh = getSheet(SHEETS.SCHEDULE_ITEMS);
      const siAll = getSheetData(SHEETS.SCHEDULE_ITEMS);
      siAll.map((si, idx) => si[SI.SCHED_ID] == parseInt(id) ? idx+2 : null).filter(Boolean).reverse().forEach(rn => siSh.deleteRow(rn));
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
    const todayStr = now.toISOString().split('T')[0];
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const scData = getSheetData(SHEETS.SCHEDULES);
    const activeScheds = scData.filter(s => s[SC.STATUS] !== 'cancelled');
    const todayScheds = activeScheds.filter(s => fmtDate(s[SC.DATE]) === todayStr);
    const cuData = getSheetData(SHEETS.CUSTOMERS);
    const totalCustDue = cuData.reduce((s, c) => s + (parseFloat(c[CU.DUE])||0), 0);
    const monthScheds = activeScheds.filter(s => new Date(fmtDate(s[SC.DATE])) >= mStart);
    const monthRevenue = monthScheds.reduce((s, sc) => s + (parseFloat(sc[SC.TOTAL])||0), 0);
    const monthCollected = monthScheds.reduce((s, sc) => s + (parseFloat(sc[SC.PAID])||0), 0);
    const todayRevenue = todayScheds.reduce((s, sc) => s + (parseFloat(sc[SC.TOTAL])||0), 0);

    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayAmt = activeScheds.filter(s => fmtDate(s[SC.DATE]) === ds).reduce((s, sc) => s + (parseFloat(sc[SC.TOTAL])||0), 0);
      dailyData.push({ date: ds.substring(5), amount: dayAmt });
    }

    const siData = getSheetData(SHEETS.SCHEDULE_ITEMS);
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

    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
    const cuMap = {}; cuData.forEach(c => { cuMap[c[CU.ID]] = c[CU.NAME]; });

    const recentSchedules = activeScheds.slice(-8).reverse().map(s => ({
      invoice_no: s[SC.INV_NO], customer: cuMap[s[SC.CUST_ID]]||'Walk-in',
      date: fmtDate(s[SC.DATE]), total: parseFloat(s[SC.TOTAL])||0,
      status: s[SC.STATUS]||'', keterangan: s[SC.KETERANGAN]||''
    }));

    const overdueCustomers = cuData.filter(c => (parseFloat(c[CU.DUE])||0) > 0)
      .map(c => ({ name: c[CU.NAME], phone: c[CU.PHONE]||'', due: parseFloat(c[CU.DUE])||0 }))
      .sort((a, b) => b.due - a.due).slice(0, 5);

    const upcomingToday = todayScheds.map(s => ({
      id: s[SC.ID], invoice_no: s[SC.INV_NO], customer: cuMap[s[SC.CUST_ID]]||'Walk-in',
      time: s[SC.TIME]||'', location: s[SC.LOCATION]||'',
      therapist: uMap[s[SC.THERAPIST_ID]]||'', status: s[SC.STATUS]||''
    }));

    return {
      success: true,
      data: {
        todayCount: todayScheds.length, todayRevenue,
        monthRevenue: Math.round(monthRevenue*100)/100,
        monthCollected: Math.round(monthCollected*100)/100,
        totalCustDue: Math.round(totalCustDue*100)/100,
        totalSchedules: activeScheds.length,
        dailyData, trBreakdown, statusDist, topCustomers,
        recentSchedules, overdueCustomers, upcomingToday
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
      const scData = getSheetData(SHEETS.SCHEDULES).filter(r => r[SC.STATUS] !== 'cancelled' && inRange(r[SC.DATE]));
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
      const scData = getSheetData(SHEETS.SCHEDULES).filter(r => r[SC.STATUS] !== 'cancelled' && inRange(r[SC.DATE]));
      const schedIds = new Set(scData.map(r => r[SC.ID]));
      const siData = getSheetData(SHEETS.SCHEDULE_ITEMS).filter(si => schedIds.has(si[SI.SCHED_ID]));
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
      const scData = getSheetData(SHEETS.SCHEDULES).filter(r => r[SC.STATUS] !== 'cancelled' && inRange(r[SC.DATE]));
      const cuData = getSheetData(SHEETS.CUSTOMERS);
      const cuMap = {}; cuData.forEach(c => { cuMap[c[CU.ID]] = { name: c[CU.NAME], phone: c[CU.PHONE]||'' }; });
      const agg = {};
      scData.forEach(r => {
        const cid = r[SC.CUST_ID]; if (!cid) return;
        if (!agg[cid]) agg[cid] = { id: cid, name: '', phone: '', totalRevenue: 0, count: 0 };
        agg[cid].totalRevenue += parseFloat(r[SC.TOTAL])||0;
        agg[cid].count++;
      });
      const customers = Object.values(agg).map(c => {
        const cu = cuMap[c.id]; c.name = cu ? cu.name : 'Unknown'; c.phone = cu ? cu.phone : '';
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
    const data = getSheetData(SHEETS.PAYMENTS);
    const scData = getSheetData(SHEETS.SCHEDULES);
    const cuData = getSheetData(SHEETS.CUSTOMERS);
    const scMap = {}; scData.forEach(r => { scMap[r[SC.ID]] = r[SC.INV_NO]; });
    const cuMap = {}; cuData.forEach(r => { cuMap[r[CU.ID]] = r[CU.NAME]; });
    const f = filters || {};
    let payments = data.map(r => ({
      id: r[PAY.ID], schedule_id: r[PAY.SCHED_ID],
      invoice_no: scMap[r[PAY.SCHED_ID]]||'', customer_name: cuMap[r[PAY.CUST_ID]]||'Walk-in',
      amount: parseFloat(r[PAY.AMT])||0, method: r[PAY.METHOD]||'',
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
    const data = getSheetData(SHEETS.SETTINGS);
    const settings = {};
    data.forEach(r => { settings[r[ST.KEY]] = r[ST.VAL]; });
    return { success: true, data: settings };
  } catch(e) { return { success: true, data: {} }; }
}

function saveAllSettings(settingsObj, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Hanya admin yang bisa mengubah pengaturan' };
    Object.entries(settingsObj).forEach(([key, value]) => {
      const r = findRowByValue(SHEETS.SETTINGS, ST.KEY, key);
      if (r) {
        const row = r.data.slice();
        row[ST.VAL] = value; row[ST.UPDATED_BY] = userId; row[ST.UPDATED] = ts();
        getSheet(SHEETS.SETTINGS).getRange(r.row, 1, 1, row.length).setValues([row]);
      } else {
        getSheet(SHEETS.SETTINGS).appendRow([getNextId(SHEETS.SETTINGS), key, value, userId, ts()]);
      }
    });
    logActivity(userId, '', 'UPDATE', 'Settings', '', 'Settings updated');
    return { success: true, message: 'Pengaturan berhasil disimpan' };
  } catch(e) { return { success: false, message: 'Gagal menyimpan pengaturan' }; }
}

// ─── Logs ─────────────────────────────────────────────────────────────────────
function getLogs(userId, role, limit) {
  try {
    if (role !== 'admin') return { success: false, message: 'Akses ditolak' };
    const data = getSheetData(SHEETS.LOGS);
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
    const name = uname || getUsernameById(uid);
    sh.appendRow([getNextId(SHEETS.LOGS), uid, name, action, table, rid||'', details||'', ts()]);
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
  const cush = mkSheet(SHEETS.CUSTOMERS, ['ID','Name','Phone','Address','Baby Name','Baby Age','Notes','Total Purchase','Total Paid','Total Due','Is Active','Created By','Created At']);
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
  const scsh = mkSheet(SHEETS.SCHEDULES, ['ID','Invoice No','Customer ID','Therapist ID','Schedule Date','Schedule Time','Location','KM Distance','Fee Treatment','Transport Fee','Subtotal','Discount','Grand Total','Paid Amount','Due Amount','Payment Method','Status','Keterangan','Notes','Created By','Created At','Updated At']);
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
   [11,'invoice_footer','Terima kasih atas kepercayaan Anda kepada kami.',1,now]
  ].forEach(s => stsh.appendRow(s));

  mkSheet(SHEETS.LOGS, ['ID','User ID','Username','Action','Table','Record ID','Details','Created At']);

  ss.deleteSheet(tmp);
  return 'Setup selesai! Login: admin@daisafacare.com / admin123';
}
