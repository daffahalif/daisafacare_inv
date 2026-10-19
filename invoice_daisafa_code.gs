/**
 * Developed by Rameez Scripts
 * WhatsApp: https://wa.me/923224083545 (For Custom Projects)
 * YouTube: https://www.youtube.com/@rameezimdad (Subscribe for more!)
 */

const SHEETS = { USERS: 'Users', CATEGORIES: 'Categories', SUB_CATEGORIES: 'Sub_Categories', SUPPLIERS: 'Suppliers', PURCHASES: 'Purchases', WOOD_STOCKS: 'Wood_Stocks', CUSTOMERS: 'Customers', SALES: 'Sales', SALE_ITEMS: 'Sale_Items', PAYMENTS: 'Payments', EXPENSES: 'Expenses', IMPORT_LOGS: 'Import_Logs', SETTINGS: 'Settings', LOGS: 'Activity_Logs' };

// cols: 0=id, 1=full_name, 2=email, 3=phone, 4=pwd, 5=role, 6=avatar, 7=is_active, 8=created_at, 9=updated_at, 10=otp, 11=otp_expires
const U = { ID: 0, NAME: 1, EMAIL: 2, PHONE: 3, PWD: 4, ROLE: 5, AVATAR: 6, ACTIVE: 7, CREATED: 8, UPDATED: 9, OTP: 10, OTP_EXP: 11 };

// cols: 0=id, 1=name, 2=description, 3=is_active, 4=created_by, 5=created_at
const C = { ID: 0, NAME: 1, DESC: 2, ACTIVE: 3, CREATED_BY: 4, CREATED: 5 };

// cols: 0=id, 1=category_id, 2=name, 3=arrival_date, 4=description, 5=is_active, 6=created_by, 7=created_at
const SC = { ID: 0, CAT_ID: 1, NAME: 2, ARRIVAL: 3, DESC: 4, ACTIVE: 5, CREATED_BY: 6, CREATED: 7 };

// cols: 0=id, 1=name, 2=phone, 3=address, 4=is_active, 5=created_by, 6=created_at
const SP = { ID: 0, NAME: 1, PHONE: 2, ADDR: 3, ACTIVE: 4, CREATED_BY: 5, CREATED: 6 };

// cols: 0=id, 1=serial_number, 2=sub_category_id, 3=purchase_id, 4=width_inch, 5=length_ft, 6=cubic_ft, 7=buy_rate, 8=buy_price, 9=sell_rate, 10=sell_price, 11=status, 12=notes, 13=created_by, 14=created_at, 15=updated_at, 16=qty, 17=image
const WS = { ID:0, SERIAL:1, SUBCAT_ID:2, PUR_ID:3, WIDTH:4, LENGTH:5, CFT:6, BUY_RATE:7, BUY_PRICE:8, SELL_RATE:9, SELL_PRICE:10, STATUS:11, NOTES:12, CREATED_BY:13, CREATED:14, UPDATED:15, QTY:16, IMG:17 };

// cols: 0=id, 1=purchase_no, 2=supplier_id, 3=sub_category_id, 4=total_pieces, 5=total_cubic_ft, 6=rate_per_cft, 7=total_amount, 8=paid_amount, 9=due_amount, 10=purchase_date, 11=notes, 12=status, 13=created_by, 14=created_at, 15=updated_at
const PU = { ID:0, NO:1, SUPPLIER_ID:2, SUBCAT_ID:3, PIECES:4, CFT:5, RATE:6, TOTAL:7, PAID:8, DUE:9, DATE:10, NOTES:11, STATUS:12, CREATED_BY:13, CREATED:14, UPDATED:15 };

// cols: 0=id, 1=name, 2=phone, 3=address, 4=total_purchase, 5=total_paid, 6=total_due, 7=is_active, 8=created_by, 9=created_at
const CU = { ID:0, NAME:1, PHONE:2, ADDR:3, TOTAL:4, PAID:5, DUE:6, ACTIVE:7, CREATED_BY:8, CREATED:9 };

// unified payments: 0=id, 1=sale_id, 2=purchase_id, 3=payment_type, 4=amount, 5=payment_method, 6=reference_no, 7=payment_date, 8=notes, 9=created_by, 10=created_at
const PAY = { ID:0, SALE_ID:1, PUR_ID:2, TYPE:3, AMT:4, METHOD:5, REF:6, DATE:7, NOTES:8, CREATED_BY:9, CREATED:10 };

// cols: 0=id, 1=invoice_no, 2=customer_id, 3=total_items, 4=total_cft, 5=subtotal, 6=discount, 7=grand_total, 8=paid_amount, 9=due_amount, 10=payment_method, 11=sale_date, 12=status, 13=notes, 14=created_by, 15=created_at, 16=updated_at
const SL = { ID:0, INV_NO:1, CUST_ID:2, ITEMS:3, CFT:4, SUBTOTAL:5, DISC:6, TOTAL:7, PAID:8, DUE:9, METHOD:10, DATE:11, STATUS:12, NOTES:13, CREATED_BY:14, CREATED:15, UPDATED:16 };

// sale items: 0=id, 1=sale_id, 2=wood_stock_id, 3=serial, 4=width, 5=length, 6=cft, 7=rate_per_cft, 8=line_total
const SI = { ID:0, SALE_ID:1, WS_ID:2, SERIAL:3, WIDTH:4, LENGTH:5, CFT:6, RATE:7, TOTAL:8 };

// expenses: 0=id, 1=title, 2=category, 3=amount, 4=expense_date, 5=notes, 6=created_by, 7=created_at
const EX = { ID:0, TITLE:1, CAT:2, AMT:3, DATE:4, NOTES:5, CREATED_BY:6, CREATED:7 };

// import_logs: 0=id, 1=file_name, 2=sub_category_id, 3=total_rows, 4=success_rows, 5=failed_rows, 6=status, 7=error_log, 8=created_by, 9=created_at
const IL = { ID:0, FILE:1, SUBCAT_ID:2, TOTAL:3, SUCCESS:4, FAILED:5, STATUS:6, ERRORS:7, CREATED_BY:8, CREATED:9 };

// settings: 0=id, 1=setting_key, 2=setting_value, 3=updated_by, 4=updated_at
const ST = { ID:0, KEY:1, VAL:2, UPDATED_BY:3, UPDATED:4 };

// cols: 0=id, 1=user_id, 2=username, 3=action, 4=table, 5=record_id, 6=details, 7=created_at
const L = { ID: 0, UID: 1, UNAME: 2, ACTION: 3, TABLE: 4, RID: 5, DETAILS: 6, CREATED: 7 };

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Wood Trading POS')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

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

function sanitizeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getUsernameById(uid) {
  const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(uid));
  return r ? r.data[U.NAME] : 'Unknown';
}

// count sub-cats for a category
function getSubCatCount(catId) {
  try {
    const data = getSheetData(SHEETS.SUB_CATEGORIES);
    return data.filter(r => r[SC.CAT_ID] == catId).length;
  } catch(e) { return 0; }
}

function getCatName(catId) {
  const r = findRowByValue(SHEETS.CATEGORIES, C.ID, parseInt(catId));
  return r ? r.data[C.NAME] : 'Unknown';
}

// batch wood stock stats — reads sheet once, returns map by sub_cat_id
function buildWoodStatsMap() {
  const m = {};
  try {
    const data = getSheetData(SHEETS.WOOD_STOCKS);
    data.forEach(r => {
      const scId = r[WS.SUBCAT_ID];
      const qty = parseInt(r[WS.QTY]) || 1;
      if (!m[scId]) m[scId] = { total: 0, available: 0, sold: 0, cft: 0, stockValue: 0 };
      m[scId].total += qty;
      m[scId].cft += (parseFloat(r[WS.CFT]) || 0) * qty;
      if (r[WS.STATUS] === 'available') { m[scId].available += qty; m[scId].stockValue += (parseFloat(r[WS.SELL_PRICE]) || 0); }
      else if (r[WS.STATUS] === 'sold') m[scId].sold += qty;
    });
  } catch(e) {}
  return m;
}

// count wood stocks for a sub-cat (for delete validation)
function getWoodStockCount(scId) {
  try {
    const data = getSheetData(SHEETS.WOOD_STOCKS);
    return data.filter(r => r[WS.SUBCAT_ID] == scId).length;
  } catch(e) { return 0; }
}

// drive helpers
function getDriveFolder(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}
function getAvatarFolder() { return getDriveFolder('WoodPOS_Avatars'); }

function uploadToDrive(b64, fileName, mimeType, folderName) {
  const folder = getDriveFolder(folderName || 'WoodPOS_Avatars');
  const blob = Utilities.newBlob(Utilities.base64Decode(b64), mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getId();
}

function deleteFromDrive(fileId) {
  try { if (fileId) DriveApp.getFileById(fileId).setTrashed(true); } catch(e) {}
}

// auth
function login(email, password) {
  try {
    if (!email || !password) return { success: false, message: 'Email and password required' };

    const r = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (!r) return { success: false, message: 'Invalid email or password' };

    const u = r.data;
    if (!isActive(u[U.ACTIVE])) return { success: false, message: 'Account inactive. Contact admin.' };
    if (password !== u[U.PWD]) return { success: false, message: 'Invalid email or password' };

    getSheet(SHEETS.USERS).getRange(r.row, U.UPDATED + 1).setValue(ts());
    logActivity(u[U.ID], 'LOGIN', 'Users', u[U.ID], '');

    return {
      success: true, message: 'Login successful',
      data: { id: u[U.ID], full_name: u[U.NAME], email: u[U.EMAIL], role: u[U.ROLE], avatar: u[U.AVATAR] || '' }
    };
  } catch (e) {
    console.error('login:', e);
    return { success: false, message: 'Login failed' };
  }
}

// users crud - admin only
function getUsers(userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Access denied' };

    const data = getSheetData(SHEETS.USERS);
    const users = data.map(r => ({
      id: r[U.ID], full_name: r[U.NAME], email: r[U.EMAIL], phone: r[U.PHONE] || '',
      role: r[U.ROLE], avatar: r[U.AVATAR] || '',
      is_active: isActive(r[U.ACTIVE]) ? 1 : 0,
      created_at: r[U.CREATED] instanceof Date ? r[U.CREATED].toISOString() : r[U.CREATED],
      updated_at: r[U.UPDATED] instanceof Date ? r[U.UPDATED].toISOString() : r[U.UPDATED] || ''
    }));

    return { success: true, data: users.reverse() };
  } catch (e) {
    console.error('getUsers:', e);
    return { success: false, message: 'Failed to load users' };
  }
}

function addUser(userData, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Access denied' };

    const { full_name, email, phone, password, userRole, avatarData } = userData;
    if (!full_name || !email || !password) return { success: false, message: 'Name, email and password required' };
    if (password.length < 6) return { success: false, message: 'Password min 6 characters' };

    const existing = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (existing) return { success: false, message: 'Email already exists' };

    // upload avatar if provided
    let avatarId = '';
    if (avatarData && avatarData.data) {
      avatarId = uploadToDrive(avatarData.data, avatarData.name, avatarData.type);
    }

    const sh = getSheet(SHEETS.USERS);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.USERS);
      const now = ts();
      sh.appendRow([newId, full_name.trim(), email.trim().toLowerCase(), phone || '', password, userRole || 'cashier', avatarId, 1, now, now, '', '']);
      logActivity(userId, 'CREATE', 'Users', newId, 'Added: ' + full_name.trim());
      return { success: true, message: 'User added successfully', data: { id: newId } };
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    console.error('addUser:', e);
    return { success: false, message: 'Failed to add user' };
  }
}

function updateUser(userData, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Access denied' };

    const { id, full_name, email, phone, password, userRole, is_active, avatarData, removeAvatar } = userData;
    if (!id || !full_name || !email) return { success: false, message: 'Name and email required' };

    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(id));
    if (!r) return { success: false, message: 'User not found' };

    // dup email
    const ec = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (ec && ec.data[U.ID] != parseInt(id)) return { success: false, message: 'Email already in use' };

    const sh = getSheet(SHEETS.USERS);
    const row = r.data.slice();
    row[U.NAME] = full_name.trim();
    row[U.EMAIL] = email.trim().toLowerCase();
    row[U.PHONE] = phone || '';
    row[U.ROLE] = userRole || 'cashier';
    row[U.ACTIVE] = (is_active == 1 || is_active === true) ? 1 : 0;
    if (password && password.length >= 6) row[U.PWD] = password;

    // avatar
    if (avatarData && avatarData.data) {
      if (row[U.AVATAR]) deleteFromDrive(row[U.AVATAR]);
      row[U.AVATAR] = uploadToDrive(avatarData.data, avatarData.name, avatarData.type);
    } else if (removeAvatar) {
      if (row[U.AVATAR]) deleteFromDrive(row[U.AVATAR]);
      row[U.AVATAR] = '';
    }

    row[U.UPDATED] = ts();
    sh.getRange(r.row, 1, 1, row.length).setValues([row]);

    logActivity(userId, 'UPDATE', 'Users', parseInt(id), 'Updated: ' + full_name.trim());
    return { success: true, message: 'User updated successfully' };
  } catch (e) {
    console.error('updateUser:', e);
    return { success: false, message: 'Failed to update user' };
  }
}

function deleteUser(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Access denied' };
    if (parseInt(id) === parseInt(userId)) return { success: false, message: 'Cannot delete your own account' };

    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(id));
    if (!r) return { success: false, message: 'User not found' };

    // cleanup avatar
    if (r.data[U.AVATAR]) deleteFromDrive(r.data[U.AVATAR]);

    const name = r.data[U.NAME];
    getSheet(SHEETS.USERS).deleteRow(r.row);
    logActivity(userId, 'DELETE', 'Users', parseInt(id), 'Deleted: ' + name);
    return { success: true, message: 'User deleted successfully' };
  } catch (e) {
    console.error('deleteUser:', e);
    return { success: false, message: 'Failed to delete user' };
  }
}

function toggleUserStatus(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Access denied' };
    if (parseInt(id) === parseInt(userId)) return { success: false, message: 'Cannot toggle your own status' };

    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(id));
    if (!r) return { success: false, message: 'User not found' };

    const row = r.data.slice();
    const was = isActive(row[U.ACTIVE]);
    row[U.ACTIVE] = was ? 0 : 1;
    row[U.UPDATED] = ts();
    getSheet(SHEETS.USERS).getRange(r.row, 1, 1, row.length).setValues([row]);

    const status = was ? 'Deactivated' : 'Activated';
    logActivity(userId, 'TOGGLE_STATUS', 'Users', parseInt(id), status + ': ' + r.data[U.NAME]);
    return { success: true, message: 'User ' + status.toLowerCase(), data: { is_active: was ? 0 : 1 } };
  } catch (e) {
    console.error('toggleUserStatus:', e);
    return { success: false, message: 'Failed to toggle status' };
  }
}

// profile - any user, own data
function getProfile(userId) {
  try {
    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(userId));
    if (!r) return { success: false, message: 'User not found' };
    const u = r.data;
    return {
      success: true,
      data: {
        id: u[U.ID], full_name: u[U.NAME], email: u[U.EMAIL], phone: u[U.PHONE] || '',
        role: u[U.ROLE], avatar: u[U.AVATAR] || '',
        is_active: isActive(u[U.ACTIVE]) ? 1 : 0,
        created_at: u[U.CREATED] instanceof Date ? u[U.CREATED].toISOString() : u[U.CREATED]
      }
    };
  } catch (e) {
    return { success: false, message: 'Failed to load profile' };
  }
}

function updateProfile(profileData, userId) {
  try {
    const { full_name, phone, avatarData, removeAvatar } = profileData;
    if (!full_name) return { success: false, message: 'Name is required' };

    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(userId));
    if (!r) return { success: false, message: 'User not found' };

    const row = r.data.slice();
    row[U.NAME] = full_name.trim();
    row[U.PHONE] = phone || '';

    // avatar
    if (avatarData && avatarData.data) {
      if (row[U.AVATAR]) deleteFromDrive(row[U.AVATAR]);
      row[U.AVATAR] = uploadToDrive(avatarData.data, avatarData.name, avatarData.type);
    } else if (removeAvatar) {
      if (row[U.AVATAR]) deleteFromDrive(row[U.AVATAR]);
      row[U.AVATAR] = '';
    }

    row[U.UPDATED] = ts();
    getSheet(SHEETS.USERS).getRange(r.row, 1, 1, row.length).setValues([row]);

    logActivity(userId, 'UPDATE', 'Users', parseInt(userId), 'Updated own profile');
    return { success: true, message: 'Profile updated', data: { full_name: full_name.trim(), phone: phone || '', avatar: row[U.AVATAR] } };
  } catch (e) {
    return { success: false, message: 'Failed to update profile' };
  }
}

function changePassword(userId, currentPassword, newPassword) {
  try {
    if (!newPassword || newPassword.length < 6) return { success: false, message: 'New password min 6 characters' };

    const r = findRowByValue(SHEETS.USERS, U.ID, parseInt(userId));
    if (!r) return { success: false, message: 'User not found' };
    if (currentPassword !== r.data[U.PWD]) return { success: false, message: 'Current password incorrect' };

    getSheet(SHEETS.USERS).getRange(r.row, U.PWD + 1).setValue(newPassword);
    logActivity(userId, 'CHANGE_PWD', 'Users', parseInt(userId), '');
    return { success: true, message: 'Password changed successfully' };
  } catch (e) {
    return { success: false, message: 'Failed to change password' };
  }
}

// forgot password — send 6-digit OTP via email, save in Users sheet
function sendForgotOTP(email) {
  try {
    if (!email) return { success: false, message: 'Email required' };
    const e = email.trim().toLowerCase();
    const r = findRowByValue(SHEETS.USERS, U.EMAIL, e);
    if (!r) return { success: false, message: 'No account found with this email' };
    if (!isActive(r.data[U.ACTIVE])) return { success: false, message: 'Account inactive. Contact admin.' };

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const exp = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    const sh = getSheet(SHEETS.USERS);
    sh.getRange(r.row, U.OTP + 1).setValue(otp);
    sh.getRange(r.row, U.OTP_EXP + 1).setValue(exp);

    // send branded email
    try {
      const settings = getSettings().data || {};
      const bizName = settings.business_name || 'Wood Trading POS';
      const subject = bizName + ' — Password Reset Code';
      const body = 'Hi ' + r.data[U.NAME] + ',\n\nYour password reset code is: ' + otp + '\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\n— ' + bizName;
      const html = '<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f5f7fa">' +
        '<div style="background:white;padding:32px;border-radius:10px;border-top:4px solid #001f3f;box-shadow:0 2px 12px rgba(0,0,0,0.06)">' +
        '<h2 style="color:#001f3f;margin:0 0 6px;font-size:22px">Password Reset Code</h2>' +
        '<p style="color:#666;margin:0 0 22px;font-size:13px">Hi ' + sanitizeHtml(r.data[U.NAME]) + ',</p>' +
        '<p style="color:#444;margin:0 0 12px;font-size:14px">Use the one-time code below to reset your password:</p>' +
        '<div style="background:#f0f4f8;border:1px dashed #c8d0d8;border-radius:8px;padding:20px;text-align:center;font-size:34px;font-weight:700;color:#001f3f;letter-spacing:10px;margin:16px 0;font-family:monospace">' + otp + '</div>' +
        '<p style="color:#888;font-size:13px;margin:12px 0 8px">This code expires in <strong>10 minutes</strong>.</p>' +
        '<p style="color:#888;font-size:13px;margin:0">If you did not request this, please ignore this email.</p>' +
        '<hr style="border:none;border-top:1px solid #eee;margin:22px 0">' +
        '<p style="color:#aaa;font-size:11px;margin:0">— ' + sanitizeHtml(bizName) + '</p>' +
        '</div></div>';
      MailApp.sendEmail({ to: e, subject: subject, body: body, htmlBody: html });
    } catch (mailErr) {
      console.error('mail send:', mailErr);
      return { success: false, message: 'Could not send email. Check mail permissions.' };
    }

    logActivity(r.data[U.ID], 'FORGOT_PWD', 'Users', r.data[U.ID], 'OTP sent');
    return { success: true, message: 'Reset code sent to your email' };
  } catch (err) {
    console.error('sendForgotOTP:', err);
    return { success: false, message: 'Failed to send code' };
  }
}

function verifyOTP(email, otp) {
  try {
    if (!email || !otp) return { success: false, message: 'Email and code required' };
    const r = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (!r) return { success: false, message: 'Invalid request' };

    const stored = String(r.data[U.OTP] || '').trim();
    const expRaw = r.data[U.OTP_EXP];
    if (!stored) return { success: false, message: 'No code requested. Please request a new one.' };
    if (stored !== String(otp).trim()) return { success: false, message: 'Invalid code' };

    const exp = expRaw instanceof Date ? expRaw : new Date(expRaw);
    if (isNaN(exp.getTime()) || Date.now() > exp.getTime()) return { success: false, message: 'Code expired. Request a new one.' };

    return { success: true, message: 'Code verified' };
  } catch (err) {
    console.error('verifyOTP:', err);
    return { success: false, message: 'Verification failed' };
  }
}

function resetPassword(email, otp, newPassword) {
  try {
    if (!email || !otp || !newPassword) return { success: false, message: 'All fields required' };
    if (newPassword.length < 6) return { success: false, message: 'Password min 6 characters' };

    const v = verifyOTP(email, otp);
    if (!v.success) return v;

    const r = findRowByValue(SHEETS.USERS, U.EMAIL, email.trim().toLowerCase());
    if (!r) return { success: false, message: 'User not found' };

    const sh = getSheet(SHEETS.USERS);
    sh.getRange(r.row, U.PWD + 1).setValue(newPassword);
    sh.getRange(r.row, U.OTP + 1).setValue('');
    sh.getRange(r.row, U.OTP_EXP + 1).setValue('');
    sh.getRange(r.row, U.UPDATED + 1).setValue(ts());

    logActivity(r.data[U.ID], 'RESET_PWD', 'Users', r.data[U.ID], 'Password reset via OTP');
    return { success: true, message: 'Password reset successfully. You can now sign in.' };
  } catch (err) {
    console.error('resetPassword:', err);
    return { success: false, message: 'Failed to reset password' };
  }
}

// categories crud — admin & manager write, all read
function getCategories(userId, role) {
  try {
    const data = getSheetData(SHEETS.CATEGORIES);
    // batch lookups — read once
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });
    const scData = getSheetData(SHEETS.SUB_CATEGORIES);
    const scCountMap = {}; scData.forEach(r => { const cid = r[SC.CAT_ID]; scCountMap[cid] = (scCountMap[cid] || 0) + 1; });

    const cats = data.map(r => ({
      id: r[C.ID], name: r[C.NAME], description: r[C.DESC] || '',
      is_active: isActive(r[C.ACTIVE]) ? 1 : 0,
      created_by: r[C.CREATED_BY],
      created_by_name: uMap[r[C.CREATED_BY]] || 'Unknown',
      sub_count: scCountMap[r[C.ID]] || 0,
      created_at: r[C.CREATED] instanceof Date ? r[C.CREATED].toISOString() : r[C.CREATED]
    }));
    return { success: true, data: cats.reverse() };
  } catch (e) {
    console.error('getCategories:', e);
    return { success: false, message: 'Failed to load categories' };
  }
}

function addCategory(catData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { name, description } = catData;
    if (!name) return { success: false, message: 'Category name required' };

    const existing = findRowByValue(SHEETS.CATEGORIES, C.NAME, name.trim());
    if (existing) return { success: false, message: 'Category name already exists' };

    const sh = getSheet(SHEETS.CATEGORIES);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.CATEGORIES);
      sh.appendRow([newId, name.trim(), description || '', 1, userId, ts()]);
      logActivity(userId, 'CREATE', 'Categories', newId, 'Added: ' + name.trim());
      return { success: true, message: 'Category added', data: { id: newId } };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addCategory:', e);
    return { success: false, message: 'Failed to add category' };
  }
}

function updateCategory(catData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { id, name, description, is_active } = catData;
    if (!id || !name) return { success: false, message: 'Name required' };

    const r = findRowByValue(SHEETS.CATEGORIES, C.ID, parseInt(id));
    if (!r) return { success: false, message: 'Category not found' };

    // dup name
    const nc = findRowByValue(SHEETS.CATEGORIES, C.NAME, name.trim());
    if (nc && nc.data[C.ID] != parseInt(id)) return { success: false, message: 'Category name already exists' };

    const row = r.data.slice();
    row[C.NAME] = name.trim();
    row[C.DESC] = description || '';
    row[C.ACTIVE] = (is_active == 1 || is_active === true) ? 1 : 0;
    getSheet(SHEETS.CATEGORIES).getRange(r.row, 1, 1, row.length).setValues([row]);

    logActivity(userId, 'UPDATE', 'Categories', parseInt(id), 'Updated: ' + name.trim());
    return { success: true, message: 'Category updated' };
  } catch (e) {
    console.error('updateCategory:', e);
    return { success: false, message: 'Failed to update category' };
  }
}

function deleteCategory(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete categories' };

    const r = findRowByValue(SHEETS.CATEGORIES, C.ID, parseInt(id));
    if (!r) return { success: false, message: 'Category not found' };

    if (getSubCatCount(parseInt(id)) > 0) return { success: false, message: 'Cannot delete — has linked sub-categories' };

    const name = r.data[C.NAME];
    getSheet(SHEETS.CATEGORIES).deleteRow(r.row);
    logActivity(userId, 'DELETE', 'Categories', parseInt(id), 'Deleted: ' + name);
    return { success: true, message: 'Category deleted' };
  } catch (e) {
    console.error('deleteCategory:', e);
    return { success: false, message: 'Failed to delete category' };
  }
}

function toggleCategoryStatus(id, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };

    const r = findRowByValue(SHEETS.CATEGORIES, C.ID, parseInt(id));
    if (!r) return { success: false, message: 'Category not found' };

    const row = r.data.slice();
    const was = isActive(row[C.ACTIVE]);
    row[C.ACTIVE] = was ? 0 : 1;
    getSheet(SHEETS.CATEGORIES).getRange(r.row, 1, 1, row.length).setValues([row]);

    const status = was ? 'Deactivated' : 'Activated';
    logActivity(userId, 'TOGGLE_STATUS', 'Categories', parseInt(id), status + ': ' + r.data[C.NAME]);
    return { success: true, message: 'Category ' + status.toLowerCase() };
  } catch (e) {
    return { success: false, message: 'Failed to toggle status' };
  }
}

// blur validation
function checkCategoryName(name, excludeId) {
  try {
    if (!name) return { success: true, exists: false };
    const r = findRowByValue(SHEETS.CATEGORIES, C.NAME, name.trim());
    if (r && (!excludeId || r.data[C.ID] != parseInt(excludeId))) return { success: true, exists: true };
    return { success: true, exists: false };
  } catch (e) { return { success: true, exists: false }; }
}

// sub-categories (cars) crud — admin, manager, warehouse_staff write; all read
function getSubCategories(userId, role) {
  try {
    const data = getSheetData(SHEETS.SUB_CATEGORIES);
    const catData = getSheetData(SHEETS.CATEGORIES);
    const catMap = {};
    catData.forEach(c => { catMap[c[C.ID]] = c[C.NAME]; });
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });

    const wsMap = buildWoodStatsMap();

    const subs = data.map(r => {
      const ws = wsMap[r[SC.ID]] || { total: 0, available: 0, sold: 0, cft: 0, stockValue: 0 };
      return {
        id: r[SC.ID], category_id: r[SC.CAT_ID], category_name: catMap[r[SC.CAT_ID]] || 'Unknown',
        name: r[SC.NAME],
        arrival_date: r[SC.ARRIVAL] instanceof Date ? r[SC.ARRIVAL].toISOString().split('T')[0] : (r[SC.ARRIVAL] || ''),
        description: r[SC.DESC] || '', is_active: isActive(r[SC.ACTIVE]) ? 1 : 0,
        created_by: r[SC.CREATED_BY], created_by_name: uMap[r[SC.CREATED_BY]] || 'Unknown',
        total_pieces: ws.total, available_pieces: ws.available, sold_pieces: ws.sold,
        total_cft: Math.round(ws.cft * 100) / 100, stock_value: Math.round(ws.stockValue * 100) / 100,
        created_at: r[SC.CREATED] instanceof Date ? r[SC.CREATED].toISOString() : r[SC.CREATED]
      };
    });
    return { success: true, data: subs.reverse() };
  } catch (e) {
    console.error('getSubCategories:', e);
    return { success: false, message: 'Failed to load sub-categories' };
  }
}

function addSubCategory(scData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager' && role !== 'warehouse_staff') return { success: false, message: 'Access denied' };
    const { category_id, name, arrival_date, description } = scData;
    if (!category_id || !name) return { success: false, message: 'Category and name required' };

    const sh = getSheet(SHEETS.SUB_CATEGORIES);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.SUB_CATEGORIES);
      sh.appendRow([newId, parseInt(category_id), name.trim(), arrival_date || '', description || '', 1, userId, ts()]);
      logActivity(userId, 'CREATE', 'Sub_Categories', newId, 'Added car: ' + name.trim());
      return { success: true, message: 'Sub-category added', data: { id: newId } };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addSubCategory:', e);
    return { success: false, message: 'Failed to add sub-category' };
  }
}

function updateSubCategory(scData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager' && role !== 'warehouse_staff') return { success: false, message: 'Access denied' };
    const { id, category_id, name, arrival_date, description, is_active } = scData;
    if (!id || !category_id || !name) return { success: false, message: 'Category and name required' };

    const r = findRowByValue(SHEETS.SUB_CATEGORIES, SC.ID, parseInt(id));
    if (!r) return { success: false, message: 'Sub-category not found' };

    const row = r.data.slice();
    row[SC.CAT_ID] = parseInt(category_id);
    row[SC.NAME] = name.trim();
    row[SC.ARRIVAL] = arrival_date || '';
    row[SC.DESC] = description || '';
    row[SC.ACTIVE] = (is_active == 1 || is_active === true) ? 1 : 0;
    getSheet(SHEETS.SUB_CATEGORIES).getRange(r.row, 1, 1, row.length).setValues([row]);

    logActivity(userId, 'UPDATE', 'Sub_Categories', parseInt(id), 'Updated car: ' + name.trim());
    return { success: true, message: 'Sub-category updated' };
  } catch (e) {
    console.error('updateSubCategory:', e);
    return { success: false, message: 'Failed to update sub-category' };
  }
}

function deleteSubCategory(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete' };

    const r = findRowByValue(SHEETS.SUB_CATEGORIES, SC.ID, parseInt(id));
    if (!r) return { success: false, message: 'Sub-category not found' };

    if (getWoodStockCount(parseInt(id)) > 0) return { success: false, message: 'Cannot delete — has linked wood stocks' };

    const name = r.data[SC.NAME];
    getSheet(SHEETS.SUB_CATEGORIES).deleteRow(r.row);
    logActivity(userId, 'DELETE', 'Sub_Categories', parseInt(id), 'Deleted car: ' + name);
    return { success: true, message: 'Sub-category deleted' };
  } catch (e) {
    console.error('deleteSubCategory:', e);
    return { success: false, message: 'Failed to delete' };
  }
}

function toggleSubCatStatus(id, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager' && role !== 'warehouse_staff') return { success: false, message: 'Access denied' };

    const r = findRowByValue(SHEETS.SUB_CATEGORIES, SC.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };

    const row = r.data.slice();
    const was = isActive(row[SC.ACTIVE]);
    row[SC.ACTIVE] = was ? 0 : 1;
    getSheet(SHEETS.SUB_CATEGORIES).getRange(r.row, 1, 1, row.length).setValues([row]);

    const status = was ? 'Deactivated' : 'Activated';
    logActivity(userId, 'TOGGLE_STATUS', 'Sub_Categories', parseInt(id), status + ': ' + r.data[SC.NAME]);
    return { success: true, message: 'Car ' + status.toLowerCase() };
  } catch (e) { return { success: false, message: 'Failed to toggle status' }; }
}

// wood stocks for sub-cat detail view
function getSubCatWoodStocks(subCatId) {
  try {
    const data = getSheetData(SHEETS.WOOD_STOCKS);
    const stocks = data.filter(r => r[WS.SUBCAT_ID] == parseInt(subCatId)).map(r => ({
      id: r[WS.ID], serial: r[WS.SERIAL] || '', width: parseFloat(r[WS.WIDTH]) || 0,
      length: parseFloat(r[WS.LENGTH]) || 0, cft: parseFloat(r[WS.CFT]) || 0,
      qty: parseInt(r[WS.QTY]) || 1,
      status: r[WS.STATUS] || '', buy_price: parseFloat(r[WS.BUY_PRICE]) || 0, sell_price: parseFloat(r[WS.SELL_PRICE]) || 0,
      image: r[WS.IMG] || ''
    }));
    return { success: true, data: stocks };
  } catch (e) { return { success: true, data: [] }; }
}

// active categories for dropdown
function getCategoriesForDropdown() {
  try {
    const data = getSheetData(SHEETS.CATEGORIES);
    return { success: true, data: data.filter(r => isActive(r[C.ACTIVE])).map(r => ({ id: r[C.ID], name: r[C.NAME] })) };
  } catch (e) { return { success: true, data: [] }; }
}

// purchase stats per supplier — batch read
function buildPurchaseStatsMap() {
  const m = {};
  try {
    const data = getSheetData(SHEETS.PURCHASES);
    data.forEach(r => {
      const sid = r[PU.SUPPLIER_ID];
      if (!m[sid]) m[sid] = { count: 0, totalAmt: 0, paidAmt: 0 };
      m[sid].count++;
      m[sid].totalAmt += (parseFloat(r[PU.TOTAL]) || 0);
      m[sid].paidAmt += (parseFloat(r[PU.PAID]) || 0);
    });
  } catch(e) {}
  return m;
}

function getPurchaseCountForSupplier(suppId) {
  try {
    const data = getSheetData(SHEETS.PURCHASES);
    return data.filter(r => r[PU.SUPPLIER_ID] == suppId).length;
  } catch(e) { return 0; }
}

// suppliers crud — admin & manager write, warehouse read
function getSuppliers(userId, role) {
  try {
    if (role === 'cashier') return { success: false, message: 'Access denied' };

    const data = getSheetData(SHEETS.SUPPLIERS);
    const puMap = buildPurchaseStatsMap();
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });

    const suppliers = data.map(r => {
      const pu = puMap[r[SP.ID]] || { count: 0, totalAmt: 0, paidAmt: 0 };
      return {
        id: r[SP.ID], name: r[SP.NAME], phone: r[SP.PHONE] || '', address: r[SP.ADDR] || '',
        is_active: isActive(r[SP.ACTIVE]) ? 1 : 0,
        created_by: r[SP.CREATED_BY], created_by_name: uMap[r[SP.CREATED_BY]] || 'Unknown',
        purchase_count: pu.count, total_paid: Math.round(pu.paidAmt * 100) / 100,
        total_due: Math.round((pu.totalAmt - pu.paidAmt) * 100) / 100,
        created_at: r[SP.CREATED] instanceof Date ? r[SP.CREATED].toISOString() : r[SP.CREATED]
      };
    });
    return { success: true, data: suppliers.reverse() };
  } catch (e) {
    console.error('getSuppliers:', e);
    return { success: false, message: 'Failed to load suppliers' };
  }
}

function addSupplier(spData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { name, phone, address } = spData;
    if (!name) return { success: false, message: 'Supplier name required' };

    const sh = getSheet(SHEETS.SUPPLIERS);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.SUPPLIERS);
      sh.appendRow([newId, name.trim(), phone || '', address || '', 1, userId, ts()]);
      logActivity(userId, 'CREATE', 'Suppliers', newId, 'Added: ' + name.trim());
      return { success: true, message: 'Supplier added', data: { id: newId } };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addSupplier:', e);
    return { success: false, message: 'Failed to add supplier' };
  }
}

function updateSupplier(spData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { id, name, phone, address, is_active } = spData;
    if (!id || !name) return { success: false, message: 'Name required' };

    const r = findRowByValue(SHEETS.SUPPLIERS, SP.ID, parseInt(id));
    if (!r) return { success: false, message: 'Supplier not found' };

    const row = r.data.slice();
    row[SP.NAME] = name.trim();
    row[SP.PHONE] = phone || '';
    row[SP.ADDR] = address || '';
    row[SP.ACTIVE] = (is_active == 1 || is_active === true) ? 1 : 0;
    getSheet(SHEETS.SUPPLIERS).getRange(r.row, 1, 1, row.length).setValues([row]);

    logActivity(userId, 'UPDATE', 'Suppliers', parseInt(id), 'Updated: ' + name.trim());
    return { success: true, message: 'Supplier updated' };
  } catch (e) {
    console.error('updateSupplier:', e);
    return { success: false, message: 'Failed to update supplier' };
  }
}

function deleteSupplier(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete suppliers' };

    const r = findRowByValue(SHEETS.SUPPLIERS, SP.ID, parseInt(id));
    if (!r) return { success: false, message: 'Supplier not found' };

    if (getPurchaseCountForSupplier(parseInt(id)) > 0) return { success: false, message: 'Cannot delete — has linked purchases' };

    const name = r.data[SP.NAME];
    getSheet(SHEETS.SUPPLIERS).deleteRow(r.row);
    logActivity(userId, 'DELETE', 'Suppliers', parseInt(id), 'Deleted: ' + name);
    return { success: true, message: 'Supplier deleted' };
  } catch (e) {
    console.error('deleteSupplier:', e);
    return { success: false, message: 'Failed to delete supplier' };
  }
}

function toggleSupplierStatus(id, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };

    const r = findRowByValue(SHEETS.SUPPLIERS, SP.ID, parseInt(id));
    if (!r) return { success: false, message: 'Supplier not found' };

    const row = r.data.slice();
    const was = isActive(row[SP.ACTIVE]);
    row[SP.ACTIVE] = was ? 0 : 1;
    getSheet(SHEETS.SUPPLIERS).getRange(r.row, 1, 1, row.length).setValues([row]);

    const status = was ? 'Deactivated' : 'Activated';
    logActivity(userId, 'TOGGLE_STATUS', 'Suppliers', parseInt(id), status + ': ' + r.data[SP.NAME]);
    return { success: true, message: 'Supplier ' + status.toLowerCase() };
  } catch (e) { return { success: false, message: 'Failed to toggle status' }; }
}

// supplier ledger — all purchases for a supplier
function getSupplierLedger(supplierId, userId, role) {
  try {
    if (role === 'cashier') return { success: false, message: 'Access denied' };

    const sr = findRowByValue(SHEETS.SUPPLIERS, SP.ID, parseInt(supplierId));
    if (!sr) return { success: false, message: 'Supplier not found' };

    const supplier = { id: sr.data[SP.ID], name: sr.data[SP.NAME], phone: sr.data[SP.PHONE] || '', address: sr.data[SP.ADDR] || '' };
    let ledger = [];
    try {
      const data = getSheetData(SHEETS.PURCHASES);
      let balance = 0;
      ledger = data.filter(r => r[PU.SUPPLIER_ID] == parseInt(supplierId)).map(r => {
        const total = parseFloat(r[PU.TOTAL]) || 0;
        const paid = parseFloat(r[PU.PAID]) || 0;
        balance += (total - paid);
        return {
          id: r[PU.ID], purchase_no: r[PU.NO],
          date: r[PU.DATE] instanceof Date ? r[PU.DATE].toISOString().split('T')[0] : (r[PU.DATE] || ''),
          total_amount: total, paid_amount: paid, due: Math.round((total - paid) * 100) / 100,
          balance: Math.round(balance * 100) / 100, status: r[PU.STATUS] || 'pending'
        };
      });
    } catch(e) {}

    return { success: true, data: { supplier, ledger } };
  } catch (e) {
    console.error('getSupplierLedger:', e);
    return { success: false, message: 'Failed to load ledger' };
  }
}

// purchases crud — admin, manager, warehouse_staff
// call inside lock only
function genPurchaseNo() {
  const d = new Date();
  const dt = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  const data = getSheetData(SHEETS.PURCHASES);
  const today = data.filter(r => String(r[PU.NO]).includes(dt));
  const maxSeq = today.reduce((m, r) => { const parts = String(r[PU.NO]).split('-'); return Math.max(m, parseInt(parts[parts.length-1]) || 0); }, 0);
  return 'PUR-' + dt + '-' + String(maxSeq + 1).padStart(3, '0');
}

function getPurchases(userId, role) {
  try {
    if (role === 'cashier') return { success: false, message: 'Access denied' };

    const data = getSheetData(SHEETS.PURCHASES);
    const spData = getSheetData(SHEETS.SUPPLIERS);
    const scData = getSheetData(SHEETS.SUB_CATEGORIES);
    const uData = getSheetData(SHEETS.USERS);
    const spMap = {}; spData.forEach(r => { spMap[r[SP.ID]] = r[SP.NAME]; });
    const scMap = {}; scData.forEach(r => { scMap[r[SC.ID]] = r[SC.NAME]; });
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });

    const purchases = data.map(r => ({
      id: r[PU.ID], purchase_no: r[PU.NO],
      supplier_id: r[PU.SUPPLIER_ID], supplier_name: spMap[r[PU.SUPPLIER_ID]] || 'Unknown',
      sub_category_id: r[PU.SUBCAT_ID], car_name: scMap[r[PU.SUBCAT_ID]] || 'Unknown',
      total_pieces: parseInt(r[PU.PIECES]) || 0, total_cft: parseFloat(r[PU.CFT]) || 0,
      rate_per_cft: parseFloat(r[PU.RATE]) || 0, total_amount: parseFloat(r[PU.TOTAL]) || 0,
      paid_amount: parseFloat(r[PU.PAID]) || 0, due_amount: parseFloat(r[PU.DUE]) || 0,
      purchase_date: r[PU.DATE] instanceof Date ? r[PU.DATE].toISOString().split('T')[0] : (r[PU.DATE] || ''),
      notes: r[PU.NOTES] || '', status: r[PU.STATUS] || 'pending',
      created_by_name: uMap[r[PU.CREATED_BY]] || 'Unknown',
      created_at: r[PU.CREATED] instanceof Date ? r[PU.CREATED].toISOString() : r[PU.CREATED]
    }));
    return { success: true, data: purchases.reverse() };
  } catch (e) {
    console.error('getPurchases:', e);
    return { success: false, message: 'Failed to load purchases' };
  }
}

function addPurchase(puData, userId, role) {
  try {
    if (role === 'cashier') return { success: false, message: 'Access denied' };

    const { supplier_id, sub_category_id, rate_per_cft, paid_amount, purchase_date, notes } = puData;
    if (!sub_category_id || !purchase_date) return { success: false, message: 'Car and date required' };

    // calc from wood stocks linked to this sub_cat
    let totalPieces = 0, totalCft = 0;
    try {
      const wsData = getSheetData(SHEETS.WOOD_STOCKS);
      const linked = wsData.filter(r => r[WS.SUBCAT_ID] == parseInt(sub_category_id));
      totalPieces = linked.reduce((s, r) => s + (parseInt(r[WS.QTY]) || 1), 0);
      totalCft = linked.reduce((s, r) => s + (parseFloat(r[WS.CFT]) || 0) * (parseInt(r[WS.QTY]) || 1), 0);
    } catch(e) {}

    const rate = parseFloat(rate_per_cft) || 1600;
    totalCft = Math.round(totalCft * 10000) / 10000;
    const totalAmt = Math.round(totalCft * rate * 100) / 100;
    const paid = Math.min(parseFloat(paid_amount) || 0, totalAmt);
    const due = Math.round((totalAmt - paid) * 100) / 100;

    const sh = getSheet(SHEETS.PURCHASES);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.PURCHASES);
      const purNo = genPurchaseNo();
      const now = ts();
      sh.appendRow([newId, purNo, parseInt(supplier_id) || '', parseInt(sub_category_id), totalPieces, totalCft, rate, totalAmt, paid, due, purchase_date, notes || '', 'pending', userId, now, now]);
      logActivity(userId, 'CREATE', 'Purchases', newId, 'Added: ' + purNo);
      return { success: true, message: 'Purchase created', data: { id: newId, purchase_no: purNo } };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addPurchase:', e);
    return { success: false, message: 'Failed to create purchase' };
  }
}

function updatePurchase(puData, userId, role) {
  try {
    if (role === 'cashier') return { success: false, message: 'Access denied' };

    const { id, supplier_id, sub_category_id, rate_per_cft, paid_amount, purchase_date, notes, status } = puData;
    if (!id) return { success: false, message: 'Purchase ID required' };

    const r = findRowByValue(SHEETS.PURCHASES, PU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Purchase not found' };

    const row = r.data.slice();
    row[PU.SUPPLIER_ID] = parseInt(supplier_id) || row[PU.SUPPLIER_ID];
    row[PU.SUBCAT_ID] = parseInt(sub_category_id) || row[PU.SUBCAT_ID];
    row[PU.DATE] = purchase_date || row[PU.DATE];
    row[PU.NOTES] = notes !== undefined ? notes : row[PU.NOTES];
    row[PU.STATUS] = status || row[PU.STATUS];

    const rate = parseFloat(rate_per_cft) || parseFloat(row[PU.RATE]) || 1600;
    row[PU.RATE] = rate;
    const cft = parseFloat(row[PU.CFT]) || 0;
    row[PU.TOTAL] = Math.round(cft * rate * 100) / 100;
    row[PU.PAID] = Math.min(parseFloat(paid_amount) || parseFloat(row[PU.PAID]) || 0, row[PU.TOTAL]);
    row[PU.DUE] = Math.round((row[PU.TOTAL] - row[PU.PAID]) * 100) / 100;
    row[PU.UPDATED] = ts();

    getSheet(SHEETS.PURCHASES).getRange(r.row, 1, 1, row.length).setValues([row]);
    logActivity(userId, 'UPDATE', 'Purchases', parseInt(id), 'Updated: ' + row[PU.NO]);
    return { success: true, message: 'Purchase updated' };
  } catch (e) {
    console.error('updatePurchase:', e);
    return { success: false, message: 'Failed to update purchase' };
  }
}

function deletePurchase(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete' };

    const r = findRowByValue(SHEETS.PURCHASES, PU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Purchase not found' };

    const purNo = r.data[PU.NO];
    getSheet(SHEETS.PURCHASES).deleteRow(r.row);
    logActivity(userId, 'DELETE', 'Purchases', parseInt(id), 'Deleted: ' + purNo);
    return { success: true, message: 'Purchase deleted' };
  } catch (e) {
    console.error('deletePurchase:', e);
    return { success: false, message: 'Failed to delete' };
  }
}

// purchase detail — info + wood stocks + payments
function getPurchaseDetail(id, userId, role) {
  try {
    if (role === 'cashier') return { success: false, message: 'Access denied' };

    const r = findRowByValue(SHEETS.PURCHASES, PU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };

    const p = r.data;
    const spName = p[PU.SUPPLIER_ID] ? (findRowByValue(SHEETS.SUPPLIERS, SP.ID, parseInt(p[PU.SUPPLIER_ID]))?.data[SP.NAME] || 'Unknown') : '—';
    const scName = findRowByValue(SHEETS.SUB_CATEGORIES, SC.ID, parseInt(p[PU.SUBCAT_ID]))?.data[SC.NAME] || 'Unknown';

    // wood stocks
    let stocks = [];
    try {
      const wsData = getSheetData(SHEETS.WOOD_STOCKS);
      stocks = wsData.filter(w => w[WS.PUR_ID] == parseInt(id)).map(w => ({
        id: w[WS.ID], serial: w[WS.SERIAL] || '', width: parseFloat(w[WS.WIDTH]) || 0,
        length: parseFloat(w[WS.LENGTH]) || 0, cft: parseFloat(w[WS.CFT]) || 0,
        status: w[WS.STATUS] || '', buy_price: parseFloat(w[WS.BUY_PRICE]) || 0, sell_price: parseFloat(w[WS.SELL_PRICE]) || 0
      }));
    } catch(e) {}

    // payments
    let payments = [];
    try {
      const pyData = getSheetData(SHEETS.PAYMENTS);
      const uData = getSheetData(SHEETS.USERS);
      const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
      payments = pyData.filter(py => py[PAY.PUR_ID] == parseInt(id) && py[PAY.TYPE] === 'supplier_payment').map(py => ({
        id: py[PAY.ID], amount: parseFloat(py[PAY.AMT]) || 0, method: py[PAY.METHOD] || '',
        reference: py[PAY.REF] || '',
        date: py[PAY.DATE] instanceof Date ? py[PAY.DATE].toISOString().split('T')[0] : (py[PAY.DATE] || ''),
        notes: py[PAY.NOTES] || '', created_by_name: uMap[py[PAY.CREATED_BY]] || 'Unknown'
      }));
    } catch(e) {}

    return {
      success: true,
      data: {
        id: p[PU.ID], purchase_no: p[PU.NO], supplier_name: spName, car_name: scName,
        supplier_id: p[PU.SUPPLIER_ID], sub_category_id: p[PU.SUBCAT_ID],
        total_pieces: parseInt(p[PU.PIECES]) || 0, total_cft: parseFloat(p[PU.CFT]) || 0,
        rate_per_cft: parseFloat(p[PU.RATE]) || 0, total_amount: parseFloat(p[PU.TOTAL]) || 0,
        paid_amount: parseFloat(p[PU.PAID]) || 0, due_amount: parseFloat(p[PU.DUE]) || 0,
        purchase_date: p[PU.DATE] instanceof Date ? p[PU.DATE].toISOString().split('T')[0] : (p[PU.DATE] || ''),
        notes: p[PU.NOTES] || '', status: p[PU.STATUS] || 'pending',
        stocks, payments
      }
    };
  } catch (e) {
    console.error('getPurchaseDetail:', e);
    return { success: false, message: 'Failed to load detail' };
  }
}

// add supplier payment to purchase
function addPayment(payData, userId, role) {
  try {
    if (role === 'cashier') return { success: false, message: 'Access denied' };
    const { purchase_id, amount, payment_method, reference_no, payment_date, notes } = payData;
    if (!purchase_id || !amount || parseFloat(amount) <= 0) return { success: false, message: 'Amount required' };

    const pr = findRowByValue(SHEETS.PURCHASES, PU.ID, parseInt(purchase_id));
    if (!pr) return { success: false, message: 'Purchase not found' };

    const sh = getSheet(SHEETS.PAYMENTS);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.PAYMENTS);
      sh.appendRow([newId, '', parseInt(purchase_id), 'supplier_payment', parseFloat(amount), payment_method || 'cash', reference_no || '', payment_date || ts().split('T')[0], notes || '', userId, ts()]);

      const pRow = pr.data.slice();
      pRow[PU.PAID] = (parseFloat(pRow[PU.PAID]) || 0) + parseFloat(amount);
      pRow[PU.DUE] = Math.round(((parseFloat(pRow[PU.TOTAL]) || 0) - pRow[PU.PAID]) * 100) / 100;
      if (pRow[PU.DUE] <= 0) { pRow[PU.DUE] = 0; pRow[PU.STATUS] = 'completed'; }
      pRow[PU.UPDATED] = ts();
      getSheet(SHEETS.PURCHASES).getRange(pr.row, 1, 1, pRow.length).setValues([pRow]);

      logActivity(userId, 'CREATE', 'Payments', newId, 'Supplier payment ৳' + parseFloat(amount) + ' for ' + pRow[PU.NO]);
      return { success: true, message: 'Payment recorded' };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addPayment:', e);
    return { success: false, message: 'Failed to add payment' };
  }
}

// recalc purchase totals from wood stocks
function recalcPurchase(purchaseId) {
  try {
    const r = findRowByValue(SHEETS.PURCHASES, PU.ID, parseInt(purchaseId));
    if (!r) return;
    const wsData = getSheetData(SHEETS.WOOD_STOCKS);
    const linked = wsData.filter(w => w[WS.PUR_ID] == parseInt(purchaseId));
    const row = r.data.slice();
    // use current qty for unsold, derive original qty for sold/partial-sold
    const getOrigQty = (w) => {
      if (w[WS.STATUS] === 'sold') return parseInt(w[WS.QTY]) || 1; // sold items keep original qty
      // for available items, check if buy_price matches qty*cft*rate (if not, it was partially sold and we can derive)
      const cft = parseFloat(w[WS.CFT]) || 0;
      const bRate = parseFloat(w[WS.BUY_RATE]) || 0;
      const bPrice = parseFloat(w[WS.BUY_PRICE]) || 0;
      if (cft && bRate) return Math.round(bPrice / (cft * bRate)) || (parseInt(w[WS.QTY]) || 1);
      return parseInt(w[WS.QTY]) || 1;
    };
    row[PU.PIECES] = linked.reduce((s, w) => s + getOrigQty(w), 0);
    row[PU.CFT] = Math.round(linked.reduce((s, w) => s + (parseFloat(w[WS.CFT]) || 0) * getOrigQty(w), 0) * 10000) / 10000;
    row[PU.TOTAL] = Math.round(row[PU.CFT] * (parseFloat(row[PU.RATE]) || 1600) * 100) / 100;
    row[PU.DUE] = Math.round((row[PU.TOTAL] - (parseFloat(row[PU.PAID]) || 0)) * 100) / 100;
    row[PU.UPDATED] = ts();
    getSheet(SHEETS.PURCHASES).getRange(r.row, 1, 1, row.length).setValues([row]);
  } catch(e) { console.error('recalcPurchase:', e); }
}

// suppliers dropdown
function getSuppliersForDropdown() {
  try {
    const data = getSheetData(SHEETS.SUPPLIERS);
    return { success: true, data: data.filter(r => isActive(r[SP.ACTIVE])).map(r => ({ id: r[SP.ID], name: r[SP.NAME] })) };
  } catch(e) { return { success: true, data: [] }; }
}

// sub-categories dropdown
function getSubCategoriesForDropdown() {
  try {
    const data = getSheetData(SHEETS.SUB_CATEGORIES);
    const catData = getSheetData(SHEETS.CATEGORIES);
    const catMap = {}; catData.forEach(c => { catMap[c[C.ID]] = c[C.NAME]; });
    return { success: true, data: data.filter(r => isActive(r[SC.ACTIVE])).map(r => ({ id: r[SC.ID], name: r[SC.NAME] + ' (' + (catMap[r[SC.CAT_ID]] || '') + ')' })) };
  } catch(e) { return { success: true, data: [] }; }
}

// wood stocks crud — core table
function calcCft(w, l) { return Math.round((w * w * l) / 2304 * 10000) / 10000; }

function getWoodStocks(userId, role) {
  try {
    const data = getSheetData(SHEETS.WOOD_STOCKS);
    const scData = getSheetData(SHEETS.SUB_CATEGORIES);
    const scMap = {}; scData.forEach(r => { scMap[r[SC.ID]] = r[SC.NAME]; });

    const stocks = data.map(r => {
      const qty = parseInt(r[WS.QTY]) || 1;
      return {
        id: r[WS.ID], serial: r[WS.SERIAL], sub_category_id: r[WS.SUBCAT_ID],
        car_name: scMap[r[WS.SUBCAT_ID]] || 'Unknown', purchase_id: r[WS.PUR_ID] || '',
        width: parseFloat(r[WS.WIDTH]) || 0, length: parseFloat(r[WS.LENGTH]) || 0,
        cft: parseFloat(r[WS.CFT]) || 0, qty,
        buy_rate: parseFloat(r[WS.BUY_RATE]) || 0, buy_price: parseFloat(r[WS.BUY_PRICE]) || 0,
        sell_rate: parseFloat(r[WS.SELL_RATE]) || 0, sell_price: parseFloat(r[WS.SELL_PRICE]) || 0,
        status: r[WS.STATUS] || 'available', notes: r[WS.NOTES] || '',
        image: r[WS.IMG] || '',
        created_at: r[WS.CREATED] instanceof Date ? r[WS.CREATED].toISOString() : r[WS.CREATED]
      };
    });
    return { success: true, data: stocks.reverse() };
  } catch (e) {
    console.error('getWoodStocks:', e);
    return { success: false, message: 'Failed to load wood stocks' };
  }
}

function addWoodStock(wsData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager' && role !== 'warehouse_staff') return { success: false, message: 'Access denied' };
    const { serial, sub_category_id, purchase_id, width, length, buy_rate, sell_rate, notes, qty, imageData } = wsData;
    if (!serial || !sub_category_id || !width || !length) return { success: false, message: 'Serial, car, width and length required' };

    // dup serial
    const existing = findRowByValue(SHEETS.WOOD_STOCKS, WS.SERIAL, serial.trim());
    if (existing) return { success: false, message: 'Serial number already exists' };

    const w = parseFloat(width), l = parseFloat(length);
    const q = parseInt(qty) || 1;
    const cft = calcCft(w, l);
    const bRate = parseFloat(buy_rate) || 1600;
    const sRate = parseFloat(sell_rate) || 16500;
    const bPrice = Math.round(cft * q * bRate * 100) / 100;
    const sPrice = Math.round(cft * q * sRate * 100) / 100;

    // upload image if provided
    let imgId = '';
    if (imageData && imageData.data) {
      imgId = uploadToDrive(imageData.data, imageData.name, imageData.type, 'WoodPOS_Images');
    }

    const sh = getSheet(SHEETS.WOOD_STOCKS);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.WOOD_STOCKS);
      const now = ts();
      sh.appendRow([newId, serial.trim(), parseInt(sub_category_id), purchase_id ? parseInt(purchase_id) : '', w, l, cft, bRate, bPrice, sRate, sPrice, 'available', notes || '', userId, now, now, q, imgId]);
      logActivity(userId, 'CREATE', 'Wood_Stocks', newId, 'Added: ' + serial.trim());

      // recalc purchase if linked
      if (purchase_id) recalcPurchase(parseInt(purchase_id));

      return { success: true, message: 'Wood stock added', data: { id: newId } };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addWoodStock:', e);
    return { success: false, message: 'Failed to add wood stock' };
  }
}

function updateWoodStock(wsData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { id, serial, sub_category_id, purchase_id, width, length, buy_rate, sell_rate, status, notes, qty, imageData, removeImage } = wsData;
    if (!id) return { success: false, message: 'ID required' };

    const r = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, parseInt(id));
    if (!r) return { success: false, message: 'Wood stock not found' };

    // dup serial
    if (serial) {
      const sc = findRowByValue(SHEETS.WOOD_STOCKS, WS.SERIAL, serial.trim());
      if (sc && sc.data[WS.ID] != parseInt(id)) return { success: false, message: 'Serial already exists' };
    }

    const row = r.data.slice();
    if (serial) row[WS.SERIAL] = serial.trim();
    if (sub_category_id) row[WS.SUBCAT_ID] = parseInt(sub_category_id);
    if (purchase_id !== undefined) row[WS.PUR_ID] = purchase_id ? parseInt(purchase_id) : '';
    const w = parseFloat(width) || parseFloat(row[WS.WIDTH]);
    const l = parseFloat(length) || parseFloat(row[WS.LENGTH]);
    row[WS.WIDTH] = w; row[WS.LENGTH] = l;
    row[WS.CFT] = calcCft(w, l);
    const q = qty !== undefined ? (parseInt(qty) || 1) : (parseInt(row[WS.QTY]) || 1);
    row[WS.QTY] = q;
    row[WS.BUY_RATE] = parseFloat(buy_rate) || parseFloat(row[WS.BUY_RATE]) || 1600;
    row[WS.BUY_PRICE] = Math.round(row[WS.CFT] * q * row[WS.BUY_RATE] * 100) / 100;
    row[WS.SELL_RATE] = parseFloat(sell_rate) || parseFloat(row[WS.SELL_RATE]) || 16500;
    row[WS.SELL_PRICE] = Math.round(row[WS.CFT] * q * row[WS.SELL_RATE] * 100) / 100;
    if (status) row[WS.STATUS] = status;
    if (notes !== undefined) row[WS.NOTES] = notes;

    // image
    if (imageData && imageData.data) {
      if (row[WS.IMG]) deleteFromDrive(row[WS.IMG]);
      row[WS.IMG] = uploadToDrive(imageData.data, imageData.name, imageData.type, 'WoodPOS_Images');
    } else if (removeImage) {
      if (row[WS.IMG]) deleteFromDrive(row[WS.IMG]);
      row[WS.IMG] = '';
    }

    row[WS.UPDATED] = ts();
    getSheet(SHEETS.WOOD_STOCKS).getRange(r.row, 1, 1, row.length).setValues([row]);

    logActivity(userId, 'UPDATE', 'Wood_Stocks', parseInt(id), 'Updated: ' + row[WS.SERIAL]);
    return { success: true, message: 'Wood stock updated' };
  } catch (e) {
    console.error('updateWoodStock:', e);
    return { success: false, message: 'Failed to update' };
  }
}

function updateWoodStatus(id, status, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager' && role !== 'warehouse_staff') return { success: false, message: 'Access denied' };
    const r = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };
    const row = r.data.slice();
    row[WS.STATUS] = status;
    row[WS.UPDATED] = ts();
    getSheet(SHEETS.WOOD_STOCKS).getRange(r.row, 1, 1, row.length).setValues([row]);
    logActivity(userId, 'UPDATE', 'Wood_Stocks', parseInt(id), 'Status: ' + status);
    return { success: true, message: 'Status updated' };
  } catch(e) { return { success: false, message: 'Failed' }; }
}

function deleteWoodStock(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete' };
    const r = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };
    if (r.data[WS.STATUS] === 'sold') return { success: false, message: 'Cannot delete sold stock' };

    const serial = r.data[WS.SERIAL];
    const purId = r.data[WS.PUR_ID];
    if (r.data[WS.IMG]) deleteFromDrive(r.data[WS.IMG]);
    getSheet(SHEETS.WOOD_STOCKS).deleteRow(r.row);
    logActivity(userId, 'DELETE', 'Wood_Stocks', parseInt(id), 'Deleted: ' + serial);
    if (purId) recalcPurchase(parseInt(purId));
    return { success: true, message: 'Wood stock deleted' };
  } catch(e) { return { success: false, message: 'Failed to delete' }; }
}

function checkWoodSerial(serial, excludeId) {
  try {
    if (!serial) return { success: true, exists: false };
    const r = findRowByValue(SHEETS.WOOD_STOCKS, WS.SERIAL, serial.trim());
    if (r && (!excludeId || r.data[WS.ID] != parseInt(excludeId))) return { success: true, exists: true };
    return { success: true, exists: false };
  } catch(e) { return { success: true, exists: false }; }
}

// bulk import — array of {serial, width, length}
function bulkImportWood(items, subCatId, purchaseId, buyRate, sellRate, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager' && role !== 'warehouse_staff') return { success: false, message: 'Access denied' };
    if (!items || !items.length || !subCatId) return { success: false, message: 'No items or car selected' };

    const sh = getSheet(SHEETS.WOOD_STOCKS);
    const existing = getSheetData(SHEETS.WOOD_STOCKS);
    const existingSerials = new Set(existing.map(r => String(r[WS.SERIAL]).trim().toLowerCase()));

    const bRate = parseFloat(buyRate) || 1600;
    const sRate = parseFloat(sellRate) || 16500;
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    let success = 0, failed = 0, errors = [];
    try {
      let nextId = getNextId(SHEETS.WOOD_STOCKS);
      const now = ts();
      const rows = [];

      items.forEach((item, idx) => {
        const serial = String(item.serial || '').trim();
        const w = parseFloat(item.width);
        const l = parseFloat(item.length);
        const q = parseInt(item.qty) || 1;

        if (!serial) { failed++; errors.push({ row: idx+1, serial: serial, reason: 'Empty serial' }); return; }
        if (existingSerials.has(serial.toLowerCase())) { failed++; errors.push({ row: idx+1, serial, reason: 'Duplicate serial' }); return; }
        if (!w || w <= 0) { failed++; errors.push({ row: idx+1, serial, reason: 'Invalid width' }); return; }
        if (!l || l <= 0) { failed++; errors.push({ row: idx+1, serial, reason: 'Invalid length' }); return; }

        const cft = calcCft(w, l);
        rows.push([nextId++, serial, parseInt(subCatId), purchaseId ? parseInt(purchaseId) : '', w, l, cft, bRate, Math.round(cft*q*bRate*100)/100, sRate, Math.round(cft*q*sRate*100)/100, 'available', '', userId, now, now, q, '']);
        existingSerials.add(serial.toLowerCase());
        success++;
      });

      if (rows.length > 0) {
        sh.getRange(sh.getLastRow() + 1, 1, rows.length, 18).setValues(rows);
      }

      logActivity(userId, 'BULK_IMPORT', 'Wood_Stocks', '', success + ' imported, ' + failed + ' failed');
      if (purchaseId) recalcPurchase(parseInt(purchaseId));

      // log to import_logs
      try {
        const ilSh = getSheet(SHEETS.IMPORT_LOGS);
        const ilId = getNextId(SHEETS.IMPORT_LOGS);
        ilSh.appendRow([ilId, 'bulk_import.csv', parseInt(subCatId), items.length, success, failed, failed > 0 ? 'completed' : 'completed', JSON.stringify(errors.slice(0, 50)), userId, ts()]);
      } catch(e) {}
    } finally { lock.releaseLock(); }

    return { success: true, message: success + ' imported, ' + failed + ' failed', data: { success, failed, errors } };
  } catch(e) {
    console.error('bulkImportWood:', e);
    return { success: false, message: 'Import failed' };
  }
}

// wood stock detail
function getWoodStockDetail(id) {
  try {
    const r = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };
    const w = r.data;
    const scName = findRowByValue(SHEETS.SUB_CATEGORIES, SC.ID, parseInt(w[WS.SUBCAT_ID]))?.data[SC.NAME] || 'Unknown';
    return {
      success: true,
      data: {
        id: w[WS.ID], serial: w[WS.SERIAL], car_name: scName, sub_category_id: w[WS.SUBCAT_ID],
        purchase_id: w[WS.PUR_ID] || '', width: parseFloat(w[WS.WIDTH]), length: parseFloat(w[WS.LENGTH]),
        cft: parseFloat(w[WS.CFT]), qty: parseInt(w[WS.QTY]) || 1,
        buy_rate: parseFloat(w[WS.BUY_RATE]), buy_price: parseFloat(w[WS.BUY_PRICE]),
        sell_rate: parseFloat(w[WS.SELL_RATE]), sell_price: parseFloat(w[WS.SELL_PRICE]),
        status: w[WS.STATUS], notes: w[WS.NOTES] || '',
        image: w[WS.IMG] || '',
        created_at: w[WS.CREATED] instanceof Date ? w[WS.CREATED].toISOString() : w[WS.CREATED]
      }
    };
  } catch(e) { return { success: false, message: 'Failed' }; }
}

// purchases for dropdown (filtered by car)
function getPurchasesForDropdown(subCatId) {
  try {
    const data = getSheetData(SHEETS.PURCHASES);
    const filtered = subCatId ? data.filter(r => r[PU.SUBCAT_ID] == parseInt(subCatId)) : data;
    return { success: true, data: filtered.map(r => ({ id: r[PU.ID], name: r[PU.NO] })) };
  } catch(e) { return { success: true, data: [] }; }
}

// customers crud
function getCustomers(userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };
    const data = getSheetData(SHEETS.CUSTOMERS);
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });
    const custs = data.map(r => ({
      id: r[CU.ID], name: r[CU.NAME], phone: r[CU.PHONE] || '', address: r[CU.ADDR] || '',
      total_purchase: parseFloat(r[CU.TOTAL]) || 0, total_paid: parseFloat(r[CU.PAID]) || 0,
      total_due: parseFloat(r[CU.DUE]) || 0,
      is_active: isActive(r[CU.ACTIVE]) ? 1 : 0,
      created_by_name: uMap[r[CU.CREATED_BY]] || 'Unknown',
      created_at: r[CU.CREATED] instanceof Date ? r[CU.CREATED].toISOString() : r[CU.CREATED]
    }));
    return { success: true, data: custs.reverse() };
  } catch (e) {
    console.error('getCustomers:', e);
    return { success: false, message: 'Failed to load customers' };
  }
}

function addCustomer(cuData, userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };
    const { name, phone, address } = cuData;
    if (!name) return { success: false, message: 'Name required' };

    const sh = getSheet(SHEETS.CUSTOMERS);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.CUSTOMERS);
      sh.appendRow([newId, name.trim(), phone || '', address || '', 0, 0, 0, 1, userId, ts()]);
      logActivity(userId, 'CREATE', 'Customers', newId, 'Added: ' + name.trim());
      return { success: true, message: 'Customer added', data: { id: newId, name: name.trim() } };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addCustomer:', e);
    return { success: false, message: 'Failed to add customer' };
  }
}

function updateCustomer(cuData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { id, name, phone, address, is_active } = cuData;
    if (!id || !name) return { success: false, message: 'Name required' };

    const r = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Customer not found' };

    const row = r.data.slice();
    row[CU.NAME] = name.trim();
    row[CU.PHONE] = phone || '';
    row[CU.ADDR] = address || '';
    row[CU.ACTIVE] = (is_active == 1 || is_active === true) ? 1 : 0;
    getSheet(SHEETS.CUSTOMERS).getRange(r.row, 1, 1, row.length).setValues([row]);

    logActivity(userId, 'UPDATE', 'Customers', parseInt(id), 'Updated: ' + name.trim());
    return { success: true, message: 'Customer updated' };
  } catch (e) {
    console.error('updateCustomer:', e);
    return { success: false, message: 'Failed to update' };
  }
}

function deleteCustomer(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete' };
    const r = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };

    // check sales
    try {
      const slData = getSheetData(SHEETS.SALES);
      if (slData.some(s => s[SL.CUST_ID] == parseInt(id))) return { success: false, message: 'Cannot delete — has linked sales' };
    } catch(e) {}

    const name = r.data[CU.NAME];
    getSheet(SHEETS.CUSTOMERS).deleteRow(r.row);
    logActivity(userId, 'DELETE', 'Customers', parseInt(id), 'Deleted: ' + name);
    return { success: true, message: 'Customer deleted' };
  } catch (e) { return { success: false, message: 'Failed to delete' }; }
}

function toggleCustomerStatus(id, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const r = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };
    const row = r.data.slice();
    const was = isActive(row[CU.ACTIVE]);
    row[CU.ACTIVE] = was ? 0 : 1;
    getSheet(SHEETS.CUSTOMERS).getRange(r.row, 1, 1, row.length).setValues([row]);
    logActivity(userId, 'TOGGLE_STATUS', 'Customers', parseInt(id), (was ? 'Deactivated' : 'Activated') + ': ' + r.data[CU.NAME]);
    return { success: true, message: 'Customer ' + (was ? 'deactivated' : 'activated') };
  } catch (e) { return { success: false, message: 'Failed' }; }
}

// customer ledger — sales + payments
function getCustomerLedger(custId, userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };
    const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(custId));
    if (!cr) return { success: false, message: 'Customer not found' };

    const customer = {
      id: cr.data[CU.ID], name: cr.data[CU.NAME], phone: cr.data[CU.PHONE] || '', address: cr.data[CU.ADDR] || '',
      total_purchase: parseFloat(cr.data[CU.TOTAL]) || 0, total_paid: parseFloat(cr.data[CU.PAID]) || 0, total_due: parseFloat(cr.data[CU.DUE]) || 0
    };

    // invoices
    let invoices = [];
    try {
      const slData = getSheetData(SHEETS.SALES);
      invoices = slData.filter(s => s[SL.CUST_ID] == parseInt(custId)).map(s => ({
        id: s[SL.ID], invoice_no: s[SL.INV_NO],
        date: s[SL.DATE] instanceof Date ? s[SL.DATE].toISOString().split('T')[0] : (s[SL.DATE] || ''),
        total: parseFloat(s[SL.TOTAL]) || 0, paid: parseFloat(s[SL.PAID]) || 0,
        due: parseFloat(s[SL.DUE]) || 0, status: s[SL.STATUS] || 'pending'
      })).reverse();
    } catch(e) {}

    // payments — by sale_ids OR customer_id in purchase_id col
    let payments = [];
    try {
      const pyData = getSheetData(SHEETS.PAYMENTS);
      const uData = getSheetData(SHEETS.USERS);
      const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
      const custSaleIds = new Set(invoices.map(i => i.id));
      payments = pyData.filter(p => p[PAY.TYPE] === 'customer_payment' && (custSaleIds.has(p[PAY.SALE_ID]) || p[PAY.PUR_ID] == parseInt(custId))).map(p => ({
        id: p[PAY.ID], sale_id: p[PAY.SALE_ID] || '', amount: parseFloat(p[PAY.AMT]) || 0,
        method: p[PAY.METHOD] || '', reference: p[PAY.REF] || '',
        date: p[PAY.DATE] instanceof Date ? p[PAY.DATE].toISOString().split('T')[0] : (p[PAY.DATE] || ''),
        notes: p[PAY.NOTES] || '', created_by_name: uMap[p[PAY.CREATED_BY]] || 'Unknown'
      })).reverse();
    } catch(e) {}

    return { success: true, data: { customer, invoices, payments } };
  } catch (e) {
    console.error('getCustomerLedger:', e);
    return { success: false, message: 'Failed to load ledger' };
  }
}

// receive payment from customer
function addCustomerPayment(payData, userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };
    const { customer_id, sale_id, amount, method, reference, payment_date, notes } = payData;
    if (!customer_id || !amount || parseFloat(amount) <= 0) return { success: false, message: 'Amount required' };

    const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(customer_id));
    if (!cr) return { success: false, message: 'Customer not found' };

    const sh = getSheet(SHEETS.PAYMENTS);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.PAYMENTS);
      // store customer_id in purchase_id col for customer payments (unused for this type)
      sh.appendRow([newId, sale_id ? parseInt(sale_id) : '', parseInt(customer_id), 'customer_payment', parseFloat(amount), method || 'cash', reference || '', payment_date || ts().split('T')[0], notes || '', userId, ts()]);

      // update customer totals
      const crow = cr.data.slice();
      crow[CU.PAID] = (parseFloat(crow[CU.PAID]) || 0) + parseFloat(amount);
      crow[CU.DUE] = Math.round(((parseFloat(crow[CU.TOTAL]) || 0) - crow[CU.PAID]) * 100) / 100;
      if (crow[CU.DUE] < 0) crow[CU.DUE] = 0;
      getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);

      // update sale if linked
      if (sale_id) {
        try {
          const sr = findRowByValue(SHEETS.SALES, SL.ID, parseInt(sale_id));
          if (sr) {
            const srow = sr.data.slice();
            srow[SL.PAID] = (parseFloat(srow[SL.PAID]) || 0) + parseFloat(amount);
            srow[SL.DUE] = Math.round(((parseFloat(srow[SL.TOTAL]) || 0) - srow[SL.PAID]) * 100) / 100;
            if (srow[SL.DUE] <= 0) { srow[SL.DUE] = 0; srow[SL.STATUS] = 'completed'; }
            getSheet(SHEETS.SALES).getRange(sr.row, 1, 1, srow.length).setValues([srow]);
          }
        } catch(e) {}
      }

      logActivity(userId, 'CREATE', 'Payments', newId, 'Customer payment ৳' + parseFloat(amount) + ' from ' + cr.data[CU.NAME]);
      return { success: true, message: 'Payment recorded' };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addCustomerPayment:', e);
    return { success: false, message: 'Failed to record payment' };
  }
}

// unified payments list (standalone page)
function getPayments(userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };
    const data = getSheetData(SHEETS.PAYMENTS);
    const cuData = getSheetData(SHEETS.CUSTOMERS);
    const cuMap = {}; cuData.forEach(r => { cuMap[r[CU.ID]] = r[CU.NAME]; });
    const spData = getSheetData(SHEETS.SUPPLIERS);
    const spMap = {}; spData.forEach(r => { spMap[r[SP.ID]] = r[SP.NAME]; });
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });

    // build sale→customer map and purchase→supplier map
    const slData = getSheetData(SHEETS.SALES);
    const saleCustMap = {}; slData.forEach(r => { saleCustMap[r[SL.ID]] = { inv: r[SL.INV_NO], cust: r[SL.CUST_ID] ? (cuMap[r[SL.CUST_ID]] || 'Walk-in') : 'Walk-in' }; });
    const puData = getSheetData(SHEETS.PURCHASES);
    const purSuppMap = {}; puData.forEach(r => { purSuppMap[r[PU.ID]] = { no: r[PU.NO], supp: spMap[r[PU.SUPPLIER_ID]] || 'Unknown' }; });

    const payments = data.map(r => {
      const isCust = r[PAY.TYPE] === 'customer_payment';
      const saleInfo = r[PAY.SALE_ID] ? saleCustMap[r[PAY.SALE_ID]] : null;
      const purInfo = !isCust && r[PAY.PUR_ID] ? purSuppMap[r[PAY.PUR_ID]] : null;
      return {
        id: r[PAY.ID], payment_type: r[PAY.TYPE],
        ref_no: isCust ? (saleInfo?.inv || '') : (purInfo?.no || ''),
        party_name: isCust ? (saleInfo?.cust || cuMap[r[PAY.PUR_ID]] || 'Walk-in') : (purInfo?.supp || 'Unknown'),
        amount: parseFloat(r[PAY.AMT]) || 0, method: r[PAY.METHOD] || '',
        reference: r[PAY.REF] || '',
        date: r[PAY.DATE] instanceof Date ? r[PAY.DATE].toISOString().split('T')[0] : (r[PAY.DATE] || ''),
        notes: r[PAY.NOTES] || '', created_by_name: uMap[r[PAY.CREATED_BY]] || 'Unknown'
      };
    });

    return { success: true, data: payments.reverse() };
  } catch (e) {
    console.error('getPayments:', e);
    return { success: false, message: 'Failed to load payments' };
  }
}

// customers dropdown
function getCustomersForDropdown() {
  try {
    const data = getSheetData(SHEETS.CUSTOMERS);
    return { success: true, data: data.filter(r => isActive(r[CU.ACTIVE])).map(r => ({ id: r[CU.ID], name: r[CU.NAME] })) };
  } catch(e) { return { success: true, data: [] }; }
}

// sales / POS
function genInvoiceNo() {
  const d = new Date();
  const dt = d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  const data = getSheetData(SHEETS.SALES);
  const today = data.filter(r => String(r[SL.INV_NO]).includes(dt));
  const maxSeq = today.reduce((m, r) => { const parts = String(r[SL.INV_NO]).split('-'); return Math.max(m, parseInt(parts[parts.length-1]) || 0); }, 0);
  return 'INV-' + dt + '-' + String(maxSeq + 1).padStart(3, '0');
}

// search available wood by serial (for POS)
// all available wood for POS default list
function getAvailableWood(subCatId) {
  try {
    const data = getSheetData(SHEETS.WOOD_STOCKS);
    let results = data.filter(r => r[WS.STATUS] === 'available');
    if (subCatId) results = results.filter(r => r[WS.SUBCAT_ID] == parseInt(subCatId));
    const scData = getSheetData(SHEETS.SUB_CATEGORIES);
    const scMap = {}; scData.forEach(r => { scMap[r[SC.ID]] = r[SC.NAME]; });
    return {
      success: true,
      data: results.map(r => ({
        id: r[WS.ID], serial: r[WS.SERIAL], car_name: scMap[r[WS.SUBCAT_ID]] || '',
        sub_category_id: r[WS.SUBCAT_ID],
        width: parseFloat(r[WS.WIDTH]), length: parseFloat(r[WS.LENGTH]),
        cft: parseFloat(r[WS.CFT]), qty: parseInt(r[WS.QTY]) || 1,
        sell_rate: parseFloat(r[WS.SELL_RATE]), sell_price: parseFloat(r[WS.SELL_PRICE]),
        image: r[WS.IMG] || ''
      }))
    };
  } catch(e) { return { success: true, data: [] }; }
}

function searchWoodBySerial(query, subCatId) {
  try {
    const data = getSheetData(SHEETS.WOOD_STOCKS);
    const q = String(query).trim().toLowerCase();
    let results = data.filter(r => r[WS.STATUS] === 'available' && String(r[WS.SERIAL]).toLowerCase().includes(q));
    if (subCatId) results = results.filter(r => r[WS.SUBCAT_ID] == parseInt(subCatId));
    const scData = getSheetData(SHEETS.SUB_CATEGORIES);
    const scMap = {}; scData.forEach(r => { scMap[r[SC.ID]] = r[SC.NAME]; });
    return {
      success: true,
      data: results.slice(0, 20).map(r => ({
        id: r[WS.ID], serial: r[WS.SERIAL], car_name: scMap[r[WS.SUBCAT_ID]] || '',
        sub_category_id: r[WS.SUBCAT_ID],
        width: parseFloat(r[WS.WIDTH]), length: parseFloat(r[WS.LENGTH]),
        cft: parseFloat(r[WS.CFT]), qty: parseInt(r[WS.QTY]) || 1,
        sell_rate: parseFloat(r[WS.SELL_RATE]), sell_price: parseFloat(r[WS.SELL_PRICE]),
        image: r[WS.IMG] || ''
      }))
    };
  } catch(e) { return { success: true, data: [] }; }
}

function completeSale(saleData, userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };
    const { customer_id, items, discount, paid_amount, payment_method, payment_reference, notes, status } = saleData;
    if (!items || !items.length) return { success: false, message: 'Add items to cart' };

    const totalItems = items.reduce((s, i) => s + (parseInt(i.qty) || 1), 0);
    const totalCft = items.reduce((s, i) => s + (parseFloat(i.cft) || 0) * (parseInt(i.qty) || 1), 0);
    const subtotal = items.reduce((s, i) => s + (parseFloat(i.line_total) || 0), 0);
    const disc = parseFloat(discount) || 0;
    const grandTotal = Math.round((subtotal - disc) * 100) / 100;
    const paid = Math.min(parseFloat(paid_amount) || 0, grandTotal);
    const due = Math.round((grandTotal - paid) * 100) / 100;
    const saleStatus = status || (due <= 0 ? 'completed' : 'pending');

    const sh = getSheet(SHEETS.SALES);
    const siSh = getSheet(SHEETS.SALE_ITEMS);
    const wsSh = getSheet(SHEETS.WOOD_STOCKS);
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    try {
      const saleId = getNextId(SHEETS.SALES);
      const invNo = genInvoiceNo();
      const now = ts();

      // sale header
      sh.appendRow([saleId, invNo, customer_id ? parseInt(customer_id) : '', totalItems, Math.round(totalCft*10000)/10000, Math.round(subtotal*100)/100, disc, grandTotal, paid, due, payment_method || 'cash', now, saleStatus, notes || '', userId, now, now]);

      // sale items + mark wood as sold
      let siId = getNextId(SHEETS.SALE_ITEMS);
      const siRows = [];
      const wsUpdates = [];

      items.forEach(item => {
        const soldQty = parseInt(item.qty) || 1;
        siRows.push([siId++, saleId, parseInt(item.wood_stock_id), item.serial, parseFloat(item.width), parseFloat(item.length), parseFloat(item.cft), parseFloat(item.rate), parseFloat(item.line_total)]);

        // update wood stock — full or partial qty
        const wr = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, parseInt(item.wood_stock_id));
        if (wr) {
          const wrow = wr.data.slice();
          const stockQty = parseInt(wrow[WS.QTY]) || 1;
          if (soldQty >= stockQty) {
            // sell all — mark as sold
            wrow[WS.STATUS] = 'sold';
          } else {
            // partial — reduce qty, keep available
            const remain = stockQty - soldQty;
            wrow[WS.QTY] = remain;
            const cft = parseFloat(wrow[WS.CFT]) || 0;
            wrow[WS.BUY_PRICE] = Math.round(cft * remain * (parseFloat(wrow[WS.BUY_RATE]) || 0) * 100) / 100;
            wrow[WS.SELL_PRICE] = Math.round(cft * remain * (parseFloat(wrow[WS.SELL_RATE]) || 0) * 100) / 100;
          }
          wrow[WS.UPDATED] = now;
          wsUpdates.push({ row: wr.row, data: wrow });
        }
      });

      // batch write sale items
      if (siRows.length) siSh.getRange(siSh.getLastRow() + 1, 1, siRows.length, 9).setValues(siRows);

      // batch update wood statuses
      wsUpdates.forEach(u => wsSh.getRange(u.row, 1, 1, u.data.length).setValues([u.data]));

      // update customer totals if customer
      if (customer_id) {
        const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(customer_id));
        if (cr) {
          const crow = cr.data.slice();
          crow[CU.TOTAL] = (parseFloat(crow[CU.TOTAL]) || 0) + grandTotal;
          crow[CU.PAID] = (parseFloat(crow[CU.PAID]) || 0) + paid;
          crow[CU.DUE] = Math.round(((parseFloat(crow[CU.TOTAL])) - (parseFloat(crow[CU.PAID]))) * 100) / 100;
          getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
        }
      }

      // record payment if paid
      if (paid > 0) {
        const pyId = getNextId(SHEETS.PAYMENTS);
        getSheet(SHEETS.PAYMENTS).appendRow([pyId, saleId, customer_id ? parseInt(customer_id) : '', 'customer_payment', paid, payment_method || 'cash', payment_reference || '', now.split('T')[0], '', userId, now]);
      }

      logActivity(userId, 'CREATE', 'Sales', saleId, invNo + ' ৳' + grandTotal);
      return { success: true, message: 'Sale completed', data: { id: saleId, invoice_no: invNo } };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('completeSale:', e);
    return { success: false, message: 'Failed to complete sale' };
  }
}

function getSales(userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };
    const data = getSheetData(SHEETS.SALES);
    const cuData = getSheetData(SHEETS.CUSTOMERS);
    const uData = getSheetData(SHEETS.USERS);
    const cuMap = {}; cuData.forEach(r => { cuMap[r[CU.ID]] = r[CU.NAME]; });
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });

    let sales = data.map(r => ({
      id: r[SL.ID], invoice_no: r[SL.INV_NO],
      customer_id: r[SL.CUST_ID], customer_name: r[SL.CUST_ID] ? (cuMap[r[SL.CUST_ID]] || 'Unknown') : 'Walk-in',
      total_items: parseInt(r[SL.ITEMS]) || 0, total_cft: parseFloat(r[SL.CFT]) || 0,
      grand_total: parseFloat(r[SL.TOTAL]) || 0, paid_amount: parseFloat(r[SL.PAID]) || 0,
      due_amount: parseFloat(r[SL.DUE]) || 0, payment_method: r[SL.METHOD] || 'cash',
      sale_date: r[SL.DATE] instanceof Date ? r[SL.DATE].toISOString() : r[SL.DATE],
      status: r[SL.STATUS] || 'completed',
      created_by: r[SL.CREATED_BY],
      cashier_name: uMap[r[SL.CREATED_BY]] || 'Unknown',
      created_at: r[SL.CREATED] instanceof Date ? r[SL.CREATED].toISOString() : r[SL.CREATED]
    }));

    // cashier sees own only — filter by ID not name
    if (role === 'cashier') sales = sales.filter(s => s.created_by == userId);

    return { success: true, data: sales.reverse() };
  } catch (e) {
    console.error('getSales:', e);
    return { success: false, message: 'Failed to load sales' };
  }
}

function getSaleDetail(id, userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };
    const r = findRowByValue(SHEETS.SALES, SL.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };
    const s = r.data;
    const custName = s[SL.CUST_ID] ? (findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(s[SL.CUST_ID]))?.data[CU.NAME] || 'Unknown') : 'Walk-in';

    // items
    const siData = getSheetData(SHEETS.SALE_ITEMS);
    const items = siData.filter(si => si[SI.SALE_ID] == parseInt(id)).map(si => ({
      id: si[SI.ID], serial: si[SI.SERIAL], width: parseFloat(si[SI.WIDTH]),
      length: parseFloat(si[SI.LENGTH]), cft: parseFloat(si[SI.CFT]),
      rate: parseFloat(si[SI.RATE]), total: parseFloat(si[SI.TOTAL])
    }));

    // payments
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(u => { uMap[u[U.ID]] = u[U.NAME]; });
    let payments = [];
    try {
      const pyData = getSheetData(SHEETS.PAYMENTS);
      payments = pyData.filter(p => p[PAY.SALE_ID] == parseInt(id) && p[PAY.TYPE] === 'customer_payment').map(p => ({
        id: p[PAY.ID], amount: parseFloat(p[PAY.AMT]), method: p[PAY.METHOD] || '',
        reference: p[PAY.REF] || '',
        date: p[PAY.DATE] instanceof Date ? p[PAY.DATE].toISOString().split('T')[0] : (p[PAY.DATE] || ''),
        created_by_name: uMap[p[PAY.CREATED_BY]] || 'Unknown'
      })).reverse();
    } catch(e) {}

    return {
      success: true,
      data: {
        id: s[SL.ID], invoice_no: s[SL.INV_NO], customer_id: s[SL.CUST_ID], customer_name: custName,
        total_items: parseInt(s[SL.ITEMS]), total_cft: parseFloat(s[SL.CFT]),
        subtotal: parseFloat(s[SL.SUBTOTAL]) || 0, discount: parseFloat(s[SL.DISC]) || 0,
        grand_total: parseFloat(s[SL.TOTAL]), paid_amount: parseFloat(s[SL.PAID]),
        due_amount: parseFloat(s[SL.DUE]), payment_method: s[SL.METHOD],
        sale_date: s[SL.DATE] instanceof Date ? s[SL.DATE].toISOString() : s[SL.DATE],
        status: s[SL.STATUS], notes: s[SL.NOTES] || '',
        cashier_name: uMap[s[SL.CREATED_BY]] || 'Unknown',
        items, payments
      }
    };
  } catch (e) {
    console.error('getSaleDetail:', e);
    return { success: false, message: 'Failed to load sale' };
  }
}

function cancelSale(id, reason, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const r = findRowByValue(SHEETS.SALES, SL.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };
    if (r.data[SL.STATUS] === 'cancelled') return { success: false, message: 'Already cancelled' };

    const row = r.data.slice();
    row[SL.STATUS] = 'cancelled';
    row[SL.NOTES] = (row[SL.NOTES] || '') + ' | Cancelled: ' + (reason || 'No reason');
    row[SL.UPDATED] = ts();
    getSheet(SHEETS.SALES).getRange(r.row, 1, 1, row.length).setValues([row]);

    // restore wood stock — handle full and partial qty
    const siData = getSheetData(SHEETS.SALE_ITEMS);
    const saleItems = siData.filter(si => si[SI.SALE_ID] == parseInt(id));
    const wsData = getSheetData(SHEETS.WOOD_STOCKS);
    const wsSh = getSheet(SHEETS.WOOD_STOCKS);
    const soldMap = {};
    saleItems.forEach(si => {
      const cft = parseFloat(si[SI.CFT]) || 0;
      const rate = parseFloat(si[SI.RATE]) || 0;
      const total = parseFloat(si[SI.TOTAL]) || 0;
      soldMap[parseInt(si[SI.WS_ID])] = (cft && rate) ? Math.round(total / (cft * rate)) : 1;
    });
    const nowTs = ts();
    wsData.forEach((w, idx) => {
      const wsId = w[WS.ID];
      if (soldMap[wsId] !== undefined) {
        const wrow = w.slice();
        if (wrow[WS.STATUS] === 'sold') {
          wrow[WS.STATUS] = 'available';
        } else {
          const addBack = soldMap[wsId] || 1;
          const newQty = (parseInt(wrow[WS.QTY]) || 0) + addBack;
          wrow[WS.QTY] = newQty;
          const cft = parseFloat(wrow[WS.CFT]) || 0;
          wrow[WS.BUY_PRICE] = Math.round(cft * newQty * (parseFloat(wrow[WS.BUY_RATE]) || 0) * 100) / 100;
          wrow[WS.SELL_PRICE] = Math.round(cft * newQty * (parseFloat(wrow[WS.SELL_RATE]) || 0) * 100) / 100;
        }
        wrow[WS.UPDATED] = nowTs;
        wsSh.getRange(idx + 2, 1, 1, wrow.length).setValues([wrow]);
      }
    });

    // reverse customer totals
    if (row[SL.CUST_ID]) {
      const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(row[SL.CUST_ID]));
      if (cr) {
        const crow = cr.data.slice();
        crow[CU.TOTAL] = Math.max(0, (parseFloat(crow[CU.TOTAL]) || 0) - (parseFloat(row[SL.TOTAL]) || 0));
        crow[CU.PAID] = Math.max(0, (parseFloat(crow[CU.PAID]) || 0) - (parseFloat(row[SL.PAID]) || 0));
        crow[CU.DUE] = Math.round((crow[CU.TOTAL] - crow[CU.PAID]) * 100) / 100;
        getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
      }
    }

    // flag related payments as cancelled
    try {
      const pySh = getSheet(SHEETS.PAYMENTS);
      const pyData = getSheetData(SHEETS.PAYMENTS);
      pyData.forEach((py, idx) => {
        if (py[PAY.SALE_ID] == parseInt(id) && py[PAY.TYPE] === 'customer_payment') {
          const prow = py.slice();
          prow[PAY.NOTES] = '[CANCELLED] ' + (prow[PAY.NOTES] || '');
          pySh.getRange(idx + 2, 1, 1, prow.length).setValues([prow]);
        }
      });
    } catch(e) {}

    logActivity(userId, 'CANCEL', 'Sales', parseInt(id), 'Cancelled: ' + row[SL.INV_NO]);
    return { success: true, message: 'Sale cancelled, wood restored to stock' };
  } catch (e) {
    console.error('cancelSale:', e);
    return { success: false, message: 'Failed to cancel' };
  }
}

// edit sale metadata — admin & manager
function updateSale(saleData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { id, customer_id, discount, paid_amount, payment_method, notes, status } = saleData;
    if (!id) return { success: false, message: 'Sale ID required' };

    const r = findRowByValue(SHEETS.SALES, SL.ID, parseInt(id));
    if (!r) return { success: false, message: 'Sale not found' };
    if (r.data[SL.STATUS] === 'cancelled') return { success: false, message: 'Cannot edit cancelled sale' };

    const row = r.data.slice();
    const oldCustId = row[SL.CUST_ID];
    const oldTotal = parseFloat(row[SL.TOTAL]) || 0;
    const oldPaid = parseFloat(row[SL.PAID]) || 0;

    // update fields
    const newCustId = customer_id !== undefined ? (customer_id ? parseInt(customer_id) : '') : row[SL.CUST_ID];
    row[SL.CUST_ID] = newCustId;
    const disc = discount !== undefined ? (parseFloat(discount) || 0) : (parseFloat(row[SL.DISC]) || 0);
    row[SL.DISC] = disc;
    const subtotal = parseFloat(row[SL.SUBTOTAL]) || 0;
    const newTotal = Math.round((subtotal - disc) * 100) / 100;
    row[SL.TOTAL] = newTotal;
    const paid = paid_amount !== undefined ? Math.min(parseFloat(paid_amount) || 0, newTotal) : Math.min(parseFloat(row[SL.PAID]) || 0, newTotal);
    row[SL.PAID] = paid;
    row[SL.DUE] = Math.round((newTotal - paid) * 100) / 100;
    if (payment_method) row[SL.METHOD] = payment_method;
    if (notes !== undefined) row[SL.NOTES] = notes;
    if (status && status !== 'cancelled') row[SL.STATUS] = status;
    else row[SL.STATUS] = row[SL.DUE] <= 0 ? 'completed' : 'pending';
    row[SL.UPDATED] = ts();

    getSheet(SHEETS.SALES).getRange(r.row, 1, 1, row.length).setValues([row]);

    // adjust customer totals if customer or amounts changed
    if (oldCustId && oldCustId != newCustId) {
      // remove from old customer
      const ocr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(oldCustId));
      if (ocr) {
        const oc = ocr.data.slice();
        oc[CU.TOTAL] = Math.max(0, (parseFloat(oc[CU.TOTAL]) || 0) - oldTotal);
        oc[CU.PAID] = Math.max(0, (parseFloat(oc[CU.PAID]) || 0) - oldPaid);
        oc[CU.DUE] = Math.round((oc[CU.TOTAL] - oc[CU.PAID]) * 100) / 100;
        getSheet(SHEETS.CUSTOMERS).getRange(ocr.row, 1, 1, oc.length).setValues([oc]);
      }
    }
    if (newCustId) {
      const ncr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(newCustId));
      if (ncr) {
        const nc = ncr.data.slice();
        if (oldCustId == newCustId) {
          // same customer — adjust diff
          nc[CU.TOTAL] = Math.max(0, (parseFloat(nc[CU.TOTAL]) || 0) + (newTotal - oldTotal));
          nc[CU.PAID] = Math.max(0, (parseFloat(nc[CU.PAID]) || 0) + (paid - oldPaid));
        } else {
          // new customer — add full
          nc[CU.TOTAL] = (parseFloat(nc[CU.TOTAL]) || 0) + newTotal;
          nc[CU.PAID] = (parseFloat(nc[CU.PAID]) || 0) + paid;
        }
        nc[CU.DUE] = Math.round((nc[CU.TOTAL] - nc[CU.PAID]) * 100) / 100;
        getSheet(SHEETS.CUSTOMERS).getRange(ncr.row, 1, 1, nc.length).setValues([nc]);
      }
    }

    logActivity(userId, 'UPDATE', 'Sales', parseInt(id), 'Updated: ' + row[SL.INV_NO]);
    return { success: true, message: 'Sale updated' };
  } catch (e) {
    console.error('updateSale:', e);
    return { success: false, message: 'Failed to update sale' };
  }
}

// add item to existing sale
function addSaleItem(saleId, woodStockId, sellRate, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const sr = findRowByValue(SHEETS.SALES, SL.ID, parseInt(saleId));
    if (!sr) return { success: false, message: 'Sale not found' };
    if (sr.data[SL.STATUS] === 'cancelled') return { success: false, message: 'Cannot edit cancelled sale' };

    const wr = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, parseInt(woodStockId));
    if (!wr) return { success: false, message: 'Wood stock not found' };
    if (wr.data[WS.STATUS] !== 'available') return { success: false, message: 'Wood not available (status: ' + wr.data[WS.STATUS] + ')' };

    const w = wr.data;
    const qty = parseInt(w[WS.QTY]) || 1;
    const cft = parseFloat(w[WS.CFT]) || 0;
    const rate = parseFloat(sellRate) || parseFloat(w[WS.SELL_RATE]) || 16500;
    const lineTotal = Math.round(cft * qty * rate * 100) / 100;
    const now = ts();

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // add sale item
      const siId = getNextId(SHEETS.SALE_ITEMS);
      getSheet(SHEETS.SALE_ITEMS).appendRow([siId, parseInt(saleId), parseInt(woodStockId), w[WS.SERIAL], parseFloat(w[WS.WIDTH]), parseFloat(w[WS.LENGTH]), cft, rate, lineTotal]);

      // mark wood sold — handle partial qty
      const wrow = w.slice();
      const stockQty = parseInt(wrow[WS.QTY]) || 1;
      if (qty >= stockQty) {
        wrow[WS.STATUS] = 'sold';
      } else {
        const remain = stockQty - qty;
        wrow[WS.QTY] = remain;
        wrow[WS.BUY_PRICE] = Math.round(cft * remain * (parseFloat(wrow[WS.BUY_RATE]) || 0) * 100) / 100;
        wrow[WS.SELL_PRICE] = Math.round(cft * remain * (parseFloat(wrow[WS.SELL_RATE]) || 0) * 100) / 100;
      }
      wrow[WS.UPDATED] = now;
      getSheet(SHEETS.WOOD_STOCKS).getRange(wr.row, 1, 1, wrow.length).setValues([wrow]);

      // recalc sale
      recalcSaleFromItems(sr, now);

      logActivity(userId, 'UPDATE', 'Sales', parseInt(saleId), 'Added item: ' + w[WS.SERIAL]);
      return { success: true, message: 'Item added' };
    } finally { lock.releaseLock(); }
  } catch(e) {
    console.error('addSaleItem:', e);
    return { success: false, message: 'Failed to add item' };
  }
}

// remove item from existing sale
function removeSaleItem(saleItemId, saleId, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const sr = findRowByValue(SHEETS.SALES, SL.ID, parseInt(saleId));
    if (!sr) return { success: false, message: 'Sale not found' };
    if (sr.data[SL.STATUS] === 'cancelled') return { success: false, message: 'Cannot edit cancelled sale' };

    // find sale item
    const siData = getSheetData(SHEETS.SALE_ITEMS);
    let siRow = -1, siRecord = null;
    siData.forEach((si, idx) => { if (si[SI.ID] == parseInt(saleItemId) && si[SI.SALE_ID] == parseInt(saleId)) { siRow = idx + 2; siRecord = si; } });
    if (!siRecord) return { success: false, message: 'Sale item not found' };

    const now = ts();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // restore wood — handle partial qty
      const wr = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, parseInt(siRecord[SI.WS_ID]));
      if (wr) {
        const wrow = wr.data.slice();
        if (wrow[WS.STATUS] === 'sold') {
          wrow[WS.STATUS] = 'available';
        } else {
          // partial — add back sold qty
          const siCft = parseFloat(siRecord[SI.CFT]) || 0;
          const siRate = parseFloat(siRecord[SI.RATE]) || 0;
          const siTotal = parseFloat(siRecord[SI.TOTAL]) || 0;
          const soldQty = (siCft && siRate) ? Math.round(siTotal / (siCft * siRate)) : 1;
          const newQty = (parseInt(wrow[WS.QTY]) || 0) + soldQty;
          wrow[WS.QTY] = newQty;
          const wsCft = parseFloat(wrow[WS.CFT]) || 0;
          wrow[WS.BUY_PRICE] = Math.round(wsCft * newQty * (parseFloat(wrow[WS.BUY_RATE]) || 0) * 100) / 100;
          wrow[WS.SELL_PRICE] = Math.round(wsCft * newQty * (parseFloat(wrow[WS.SELL_RATE]) || 0) * 100) / 100;
        }
        wrow[WS.UPDATED] = now;
        getSheet(SHEETS.WOOD_STOCKS).getRange(wr.row, 1, 1, wrow.length).setValues([wrow]);
      }

      // delete sale item row
      getSheet(SHEETS.SALE_ITEMS).deleteRow(siRow);

      // recalc sale
      recalcSaleFromItems(sr, now);

      logActivity(userId, 'UPDATE', 'Sales', parseInt(saleId), 'Removed item: ' + siRecord[SI.SERIAL]);
      return { success: true, message: 'Item removed' };
    } finally { lock.releaseLock(); }
  } catch(e) {
    console.error('removeSaleItem:', e);
    return { success: false, message: 'Failed to remove item' };
  }
}

// recalc sale totals from its items
function recalcSaleFromItems(sr, now) {
  const saleId = sr.data[SL.ID];
  const siData = getSheetData(SHEETS.SALE_ITEMS);
  const items = siData.filter(si => si[SI.SALE_ID] == saleId);
  const wsData = getSheetData(SHEETS.WOOD_STOCKS);
  const wsMap = {}; wsData.forEach(w => { wsMap[w[WS.ID]] = w; });

  let totalPcs = 0, totalCft = 0, subtotal = 0;
  items.forEach(si => {
    // derive sold qty from line_total / (cft * rate) — works for both full and partial sales
    const cft = parseFloat(si[SI.CFT]) || 0;
    const rate = parseFloat(si[SI.RATE]) || 0;
    const total = parseFloat(si[SI.TOTAL]) || 0;
    const qty = (cft && rate) ? Math.round(total / (cft * rate)) : 1;
    totalPcs += qty;
    totalCft += cft * qty;
    subtotal += total;
  });

  const row = sr.data.slice();
  const oldTotal = parseFloat(row[SL.TOTAL]) || 0;
  const disc = parseFloat(row[SL.DISC]) || 0;
  const newTotal = Math.round((subtotal - disc) * 100) / 100;
  const paid = parseFloat(row[SL.PAID]) || 0;

  row[SL.ITEMS] = totalPcs;
  row[SL.CFT] = Math.round(totalCft * 10000) / 10000;
  row[SL.SUBTOTAL] = Math.round(subtotal * 100) / 100;
  row[SL.TOTAL] = newTotal;
  row[SL.DUE] = Math.round(Math.max(0, newTotal - paid) * 100) / 100;
  row[SL.STATUS] = row[SL.DUE] <= 0 ? 'completed' : 'pending';
  row[SL.UPDATED] = now;
  getSheet(SHEETS.SALES).getRange(sr.row, 1, 1, row.length).setValues([row]);

  // adjust customer totals
  if (row[SL.CUST_ID]) {
    const diff = newTotal - oldTotal;
    if (diff !== 0) {
      const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(row[SL.CUST_ID]));
      if (cr) {
        const crow = cr.data.slice();
        crow[CU.TOTAL] = Math.max(0, (parseFloat(crow[CU.TOTAL]) || 0) + diff);
        crow[CU.DUE] = Math.round((crow[CU.TOTAL] - (parseFloat(crow[CU.PAID]) || 0)) * 100) / 100;
        getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
      }
    }
  }
}

// delete sale — admin only, full reversal + remove records
function deleteSale(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete sales' };

    const r = findRowByValue(SHEETS.SALES, SL.ID, parseInt(id));
    if (!r) return { success: false, message: 'Sale not found' };

    const row = r.data;
    const invNo = row[SL.INV_NO];
    const notCancelled = row[SL.STATUS] !== 'cancelled';

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
    // restore wood if sale wasn't already cancelled — handle partial qty
    if (notCancelled) {
      const siData = getSheetData(SHEETS.SALE_ITEMS);
      const saleItems = siData.filter(si => si[SI.SALE_ID] == parseInt(id));
      saleItems.forEach(si => {
        const wr = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, parseInt(si[SI.WS_ID]));
        if (wr) {
          const wrow = wr.data.slice();
          if (wrow[WS.STATUS] === 'sold') {
            wrow[WS.STATUS] = 'available';
          } else {
            // partial — add back sold qty
            const siCft = parseFloat(si[SI.CFT]) || 0;
            const siRate = parseFloat(si[SI.RATE]) || 0;
            const siTotal = parseFloat(si[SI.TOTAL]) || 0;
            const soldQty = (siCft && siRate) ? Math.round(siTotal / (siCft * siRate)) : 1;
            const newQty = (parseInt(wrow[WS.QTY]) || 0) + soldQty;
            wrow[WS.QTY] = newQty;
            const wsCft = parseFloat(wrow[WS.CFT]) || 0;
            wrow[WS.BUY_PRICE] = Math.round(wsCft * newQty * (parseFloat(wrow[WS.BUY_RATE]) || 0) * 100) / 100;
            wrow[WS.SELL_PRICE] = Math.round(wsCft * newQty * (parseFloat(wrow[WS.SELL_RATE]) || 0) * 100) / 100;
          }
          wrow[WS.UPDATED] = ts();
          getSheet(SHEETS.WOOD_STOCKS).getRange(wr.row, 1, 1, wrow.length).setValues([wrow]);
        }
      });
    }

    // reverse customer totals if not cancelled
    if (notCancelled && row[SL.CUST_ID]) {
      const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(row[SL.CUST_ID]));
      if (cr) {
        const crow = cr.data.slice();
        crow[CU.TOTAL] = Math.max(0, (parseFloat(crow[CU.TOTAL]) || 0) - (parseFloat(row[SL.TOTAL]) || 0));
        crow[CU.PAID] = Math.max(0, (parseFloat(crow[CU.PAID]) || 0) - (parseFloat(row[SL.PAID]) || 0));
        crow[CU.DUE] = Math.round((crow[CU.TOTAL] - crow[CU.PAID]) * 100) / 100;
        getSheet(SHEETS.CUSTOMERS).getRange(cr.row, 1, 1, crow.length).setValues([crow]);
      }
    }

    // delete sale items (bottom-up to preserve row indexes)
    const siSh = getSheet(SHEETS.SALE_ITEMS);
    const siAll = getSheetData(SHEETS.SALE_ITEMS);
    const siRows = [];
    siAll.forEach((si, idx) => { if (si[SI.SALE_ID] == parseInt(id)) siRows.push(idx + 2); });
    siRows.reverse().forEach(rn => siSh.deleteRow(rn));

    // delete related payments (bottom-up)
    const pySh = getSheet(SHEETS.PAYMENTS);
    const pyAll = getSheetData(SHEETS.PAYMENTS);
    const pyRows = [];
    pyAll.forEach((py, idx) => { if (py[PAY.SALE_ID] == parseInt(id) && py[PAY.TYPE] === 'customer_payment') pyRows.push(idx + 2); });
    pyRows.reverse().forEach(rn => pySh.deleteRow(rn));

    // delete sale row
    getSheet(SHEETS.SALES).deleteRow(r.row);

    logActivity(userId, 'DELETE', 'Sales', parseInt(id), 'Deleted: ' + invNo);
    return { success: true, message: 'Sale deleted permanently' };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('deleteSale:', e);
    return { success: false, message: 'Failed to delete sale' };
  }
}

// expenses crud — admin & manager
function getExpenses(userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const data = getSheetData(SHEETS.EXPENSES);
    const uData = getSheetData(SHEETS.USERS);
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });
    const expenses = data.map(r => ({
      id: r[EX.ID], title: r[EX.TITLE], category: r[EX.CAT] || 'other',
      amount: parseFloat(r[EX.AMT]) || 0,
      expense_date: r[EX.DATE] instanceof Date ? r[EX.DATE].toISOString().split('T')[0] : (r[EX.DATE] || ''),
      notes: r[EX.NOTES] || '', created_by_name: uMap[r[EX.CREATED_BY]] || 'Unknown',
      created_at: r[EX.CREATED] instanceof Date ? r[EX.CREATED].toISOString() : r[EX.CREATED]
    }));
    return { success: true, data: expenses.reverse() };
  } catch (e) {
    console.error('getExpenses:', e);
    return { success: false, message: 'Failed to load expenses' };
  }
}

function addExpense(exData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { title, category, amount, expense_date, notes } = exData;
    if (!title || !amount) return { success: false, message: 'Title and amount required' };

    const sh = getSheet(SHEETS.EXPENSES);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const newId = getNextId(SHEETS.EXPENSES);
      sh.appendRow([newId, title.trim(), category || 'other', parseFloat(amount), expense_date || ts().split('T')[0], notes || '', userId, ts()]);
      logActivity(userId, 'CREATE', 'Expenses', newId, '৳' + parseFloat(amount) + ' - ' + title.trim());
      return { success: true, message: 'Expense added', data: { id: newId } };
    } finally { lock.releaseLock(); }
  } catch (e) {
    console.error('addExpense:', e);
    return { success: false, message: 'Failed to add expense' };
  }
}

function updateExpense(exData, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    const { id, title, category, amount, expense_date, notes } = exData;
    if (!id || !title || !amount) return { success: false, message: 'Title and amount required' };

    const r = findRowByValue(SHEETS.EXPENSES, EX.ID, parseInt(id));
    if (!r) return { success: false, message: 'Expense not found' };

    const row = r.data.slice();
    row[EX.TITLE] = title.trim();
    row[EX.CAT] = category || 'other';
    row[EX.AMT] = parseFloat(amount);
    row[EX.DATE] = expense_date || row[EX.DATE];
    row[EX.NOTES] = notes !== undefined ? notes : row[EX.NOTES];
    getSheet(SHEETS.EXPENSES).getRange(r.row, 1, 1, row.length).setValues([row]);

    logActivity(userId, 'UPDATE', 'Expenses', parseInt(id), 'Updated: ' + title.trim());
    return { success: true, message: 'Expense updated' };
  } catch (e) {
    console.error('updateExpense:', e);
    return { success: false, message: 'Failed to update' };
  }
}

function deleteExpense(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete' };
    const r = findRowByValue(SHEETS.EXPENSES, EX.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };

    const title = r.data[EX.TITLE];
    getSheet(SHEETS.EXPENSES).deleteRow(r.row);
    logActivity(userId, 'DELETE', 'Expenses', parseInt(id), 'Deleted: ' + title);
    return { success: true, message: 'Expense deleted' };
  } catch (e) { return { success: false, message: 'Failed to delete' }; }
}

// import logs
function getImportLogs(userId, role) {
  try {
    if (role === 'cashier') return { success: false, message: 'Access denied' };
    const data = getSheetData(SHEETS.IMPORT_LOGS);
    const scData = getSheetData(SHEETS.SUB_CATEGORIES);
    const uData = getSheetData(SHEETS.USERS);
    const scMap = {}; scData.forEach(r => { scMap[r[SC.ID]] = r[SC.NAME]; });
    const uMap = {}; uData.forEach(r => { uMap[r[U.ID]] = r[U.NAME]; });

    const logs = data.map(r => ({
      id: r[IL.ID], file_name: r[IL.FILE], sub_category_id: r[IL.SUBCAT_ID],
      car_name: scMap[r[IL.SUBCAT_ID]] || 'Unknown',
      total_rows: parseInt(r[IL.TOTAL]) || 0, success_rows: parseInt(r[IL.SUCCESS]) || 0,
      failed_rows: parseInt(r[IL.FAILED]) || 0, status: r[IL.STATUS] || 'completed',
      error_log: r[IL.ERRORS] || '', created_by_name: uMap[r[IL.CREATED_BY]] || 'Unknown',
      created_at: r[IL.CREATED] instanceof Date ? r[IL.CREATED].toISOString() : r[IL.CREATED]
    }));
    return { success: true, data: logs.reverse() };
  } catch (e) {
    console.error('getImportLogs:', e);
    return { success: false, message: 'Failed to load import logs' };
  }
}

function deleteImportLog(id, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can delete' };
    const r = findRowByValue(SHEETS.IMPORT_LOGS, IL.ID, parseInt(id));
    if (!r) return { success: false, message: 'Not found' };
    getSheet(SHEETS.IMPORT_LOGS).deleteRow(r.row);
    return { success: true, message: 'Import log deleted' };
  } catch(e) { return { success: false, message: 'Failed' }; }
}

// settings — admin only
function getSettings() {
  try {
    const data = getSheetData(SHEETS.SETTINGS);
    const settings = {};
    data.forEach(r => { settings[r[ST.KEY]] = r[ST.VAL]; });
    return { success: true, data: settings };
  } catch(e) { return { success: true, data: {} }; }
}

function saveSetting(key, value, userId) {
  try {
    const r = findRowByValue(SHEETS.SETTINGS, ST.KEY, key);
    if (r) {
      const row = r.data.slice();
      row[ST.VAL] = value;
      row[ST.UPDATED_BY] = userId;
      row[ST.UPDATED] = ts();
      getSheet(SHEETS.SETTINGS).getRange(r.row, 1, 1, row.length).setValues([row]);
    } else {
      const sh = getSheet(SHEETS.SETTINGS);
      sh.appendRow([getNextId(SHEETS.SETTINGS), key, value, userId, ts()]);
    }
    return { success: true, message: 'Setting saved' };
  } catch(e) { return { success: false, message: 'Failed to save' }; }
}

function saveAllSettings(settingsObj, userId, role) {
  try {
    if (role !== 'admin') return { success: false, message: 'Only admin can change settings' };
    Object.entries(settingsObj).forEach(([key, value]) => { saveSetting(key, String(value), userId); });
    logActivity(userId, 'UPDATE', 'Settings', '', 'Settings updated');
    return { success: true, message: 'Settings saved' };
  } catch(e) { return { success: false, message: 'Failed to save settings' }; }
}

// dashboard stats — role-aware
function getDashboardStats(userId, role) {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // sales data
    const slData = getSheetData(SHEETS.SALES);
    const activeSales = slData.filter(s => s[SL.STATUS] !== 'cancelled');
    const todaySales = activeSales.filter(s => { const d = s[SL.DATE] instanceof Date ? s[SL.DATE].toISOString().split('T')[0] : String(s[SL.DATE]).split('T')[0]; return d === todayStr; });

    // wood stocks
    const wsData = getSheetData(SHEETS.WOOD_STOCKS);
    const availStock = wsData.filter(w => w[WS.STATUS] === 'available');

    // payments today (customer)
    const pyData = getSheetData(SHEETS.PAYMENTS);
    const todayCollections = pyData.filter(p => p[PAY.TYPE] === 'customer_payment' && (p[PAY.DATE] instanceof Date ? p[PAY.DATE].toISOString().split('T')[0] : String(p[PAY.DATE])) === todayStr);
    const todayCollectionAmt = todayCollections.reduce((s, p) => s + (parseFloat(p[PAY.AMT]) || 0), 0);

    // customer/supplier dues
    const custData = getSheetData(SHEETS.CUSTOMERS);
    const custMap = {}; custData.forEach(c => { custMap[c[CU.ID]] = c[CU.NAME]; });
    const totalCustDue = custData.reduce((s, c) => s + (parseFloat(c[CU.DUE]) || 0), 0);
    const puData = getSheetData(SHEETS.PURCHASES);
    const totalSuppDue = puData.filter(p => p[PU.STATUS] !== 'cancelled').reduce((s, p) => s + (parseFloat(p[PU.DUE]) || 0), 0);

    // stock value
    const stockValue = availStock.reduce((s, w) => s + (parseFloat(w[WS.SELL_PRICE]) || 0), 0);

    // expenses
    const exData = getSheetData(SHEETS.EXPENSES);
    const expThisMonth = exData.filter(e => new Date(e[EX.DATE]) >= mStart).reduce((s, e) => s + (parseFloat(e[EX.AMT]) || 0), 0);

    // daily sales last 30 days
    const dailySales = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayTotal = activeSales.filter(s => { const sd = s[SL.DATE] instanceof Date ? s[SL.DATE].toISOString().split('T')[0] : String(s[SL.DATE]).split('T')[0]; return sd === ds; }).reduce((s, sl) => s + (parseFloat(sl[SL.TOTAL]) || 0), 0);
      dailySales.push({ date: ds.substring(5), amount: dayTotal });
    }

    // stock status dist
    const qtySum = (arr) => arr.reduce((s, w) => s + (parseInt(w[WS.QTY]) || 1), 0);
    const statusDist = { available: qtySum(availStock), sold: qtySum(wsData.filter(w => w[WS.STATUS]==='sold')), reserved: qtySum(wsData.filter(w => w[WS.STATUS]==='reserved')), damaged: qtySum(wsData.filter(w => w[WS.STATUS]==='damaged')) };

    // top 10 customers
    const topCusts = custData.filter(c => parseFloat(c[CU.TOTAL]) > 0).map(c => ({ name: c[CU.NAME], total: parseFloat(c[CU.TOTAL]) || 0 })).sort((a, b) => b.total - a.total).slice(0, 10);

    // expense breakdown
    const expBreakdown = {};
    exData.filter(e => new Date(e[EX.DATE]) >= mStart).forEach(e => { const cat = e[EX.CAT] || 'other'; expBreakdown[cat] = (expBreakdown[cat] || 0) + (parseFloat(e[EX.AMT]) || 0); });

    // recent sales
    const recentSales = activeSales.slice(-10).reverse().map(s => ({
      invoice_no: s[SL.INV_NO], total: parseFloat(s[SL.TOTAL]) || 0,
      customer: s[SL.CUST_ID] ? (custMap[s[SL.CUST_ID]] || 'Unknown') : 'Walk-in',
      date: s[SL.DATE] instanceof Date ? s[SL.DATE].toISOString() : s[SL.DATE]
    }));

    // recent payments
    const recentPayments = pyData.filter(p => p[PAY.TYPE] === 'customer_payment').slice(-5).reverse().map(p => ({
      amount: parseFloat(p[PAY.AMT]) || 0, method: p[PAY.METHOD] || '',
      date: p[PAY.DATE] instanceof Date ? p[PAY.DATE].toISOString().split('T')[0] : (p[PAY.DATE] || '')
    }));

    // role-specific
    const todaySalesAmt = todaySales.reduce((s, sl) => s + (parseFloat(sl[SL.TOTAL]) || 0), 0);
    const myTodaySales = todaySales.filter(s => s[SL.CREATED_BY] == userId);
    const myTodaySalesAmt = myTodaySales.reduce((s, sl) => s + (parseFloat(sl[SL.TOTAL]) || 0), 0);
    const myTodayCollection = todayCollections.filter(p => p[PAY.CREATED_BY] == userId).reduce((s, p) => s + (parseFloat(p[PAY.AMT]) || 0), 0);
    const myMonthSales = activeSales.filter(s => s[SL.CREATED_BY] == userId && new Date(s[SL.DATE] instanceof Date ? s[SL.DATE] : s[SL.DATE]) >= mStart).reduce((s, sl) => s + (parseFloat(sl[SL.TOTAL]) || 0), 0);

    // my recent sales (cashier)
    const myRecentSales = activeSales.filter(s => s[SL.CREATED_BY] == userId).slice(-10).reverse().map(s => ({
      invoice_no: s[SL.INV_NO], total: parseFloat(s[SL.TOTAL]) || 0,
      customer: s[SL.CUST_ID] ? (custMap[s[SL.CUST_ID]] || 'Unknown') : 'Walk-in',
      date: s[SL.DATE] instanceof Date ? s[SL.DATE].toISOString() : s[SL.DATE]
    }));

    // warehouse: today imports
    const todayImports = wsData.filter(w => { const c = w[WS.CREATED] instanceof Date ? w[WS.CREATED].toISOString().split('T')[0] : String(w[WS.CREATED]).split('T')[0]; return c === todayStr; }).length;
    const pendingPurchases = puData.filter(p => p[PU.STATUS] === 'pending').length;
    const recentWood = wsData.slice(-10).reverse().map(w => ({ serial: w[WS.SERIAL], cft: parseFloat(w[WS.CFT]) || 0, status: w[WS.STATUS], created_at: w[WS.CREATED] instanceof Date ? w[WS.CREATED].toISOString() : w[WS.CREATED] }));

    return { success: true, data: {
      todaySalesAmt, todayCollectionAmt, totalCustDue, totalSuppDue, stockValue, expThisMonth,
      dailySales, statusDist, topCusts, expBreakdown, recentSales, recentPayments,
      myTodaySalesAmt, myTodayCollection, myMonthSales, myRecentSales,
      availableStock: qtySum(availStock), todayImports, pendingPurchases, recentWood
    }};
  } catch (e) {
    console.error('getDashboardStats:', e);
    return { success: false, message: 'Failed to load stats' };
  }
}

// logs - admin only
function getLogs(userId, role, limit) {
  try {
    if (role !== 'admin') return { success: false, message: 'Access denied' };

    const data = getSheetData(SHEETS.LOGS);
    const logs = data.map(r => ({
      id: r[L.ID], user_id: r[L.UID], username: r[L.UNAME], action: r[L.ACTION],
      table_name: r[L.TABLE], record_id: r[L.RID], details: r[L.DETAILS] || '',
      created_at: r[L.CREATED] instanceof Date ? r[L.CREATED].toISOString() : r[L.CREATED]
    }));

    const lim = Math.min(parseInt(limit) || 200, 500);
    return { success: true, data: logs.reverse().slice(0, lim) };
  } catch (e) {
    return { success: false, message: 'Failed to load logs' };
  }
}

function logActivity(uid, action, table, rid, details, uname) {
  try {
    const sh = getSheet(SHEETS.LOGS);
    const name = uname || getUsernameById(uid);
    sh.appendRow([getNextId(SHEETS.LOGS), uid, name, action, table, rid || '', details || '', ts()]);
  } catch (e) {
    console.error('logActivity:', e);
  }
}

// reports — admin/manager only
function getReportsData(reportType, filters, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };
    if (!reportType) return { success: false, message: 'Report type required' };

    const f = filters || {};
    const dFrom = f.dateFrom ? new Date(f.dateFrom + 'T00:00:00') : null;
    const dTo = f.dateTo ? new Date(f.dateTo + 'T23:59:59') : null;

    // parse date from cell — could be Date obj or string
    const toD = v => v instanceof Date ? v : new Date(v);
    const toDs = v => { const d = toD(v); return isNaN(d) ? '' : d.toISOString().split('T')[0]; };
    const inRange = v => {
      if (!dFrom && !dTo) return true;
      const d = toD(v);
      if (isNaN(d)) return false;
      if (dFrom && d < dFrom) return false;
      if (dTo && d > dTo) return false;
      return true;
    };

    // === profit_loss ===
    if (reportType === 'profit_loss') {
      const slData = getSheetData(SHEETS.SALES).filter(r => r[SL.STATUS] !== 'cancelled' && inRange(r[SL.DATE]));
      const puData = getSheetData(SHEETS.PURCHASES).filter(r => inRange(r[PU.DATE]));
      const exData = getSheetData(SHEETS.EXPENSES).filter(r => inRange(r[EX.DATE]));

      const totalSales = slData.reduce((s, r) => s + (parseFloat(r[SL.TOTAL]) || 0), 0);
      const totalPurchases = puData.reduce((s, r) => s + (parseFloat(r[PU.TOTAL]) || 0), 0);
      const totalExpenses = exData.reduce((s, r) => s + (parseFloat(r[EX.AMT]) || 0), 0);

      // daily breakdown
      const dayMap = {};
      slData.forEach(r => { const d = toDs(r[SL.DATE]); if (d) { if (!dayMap[d]) dayMap[d] = { date: d, sales: 0, purchases: 0, expenses: 0 }; dayMap[d].sales += parseFloat(r[SL.TOTAL]) || 0; } });
      puData.forEach(r => { const d = toDs(r[PU.DATE]); if (d) { if (!dayMap[d]) dayMap[d] = { date: d, sales: 0, purchases: 0, expenses: 0 }; dayMap[d].purchases += parseFloat(r[PU.TOTAL]) || 0; } });
      exData.forEach(r => { const d = toDs(r[EX.DATE]); if (d) { if (!dayMap[d]) dayMap[d] = { date: d, sales: 0, purchases: 0, expenses: 0 }; dayMap[d].expenses += parseFloat(r[EX.AMT]) || 0; } });

      const dailyData = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

      return { success: true, data: {
        totalSales, totalPurchases, totalExpenses,
        grossProfit: totalSales - totalPurchases,
        netProfit: totalSales - totalPurchases - totalExpenses,
        salesCount: slData.length, purchasesCount: puData.length, dailyData
      }};
    }

    // === sales_summary ===
    if (reportType === 'sales_summary') {
      const slData = getSheetData(SHEETS.SALES);
      const filtered = slData.filter(r => inRange(r[SL.DATE]));
      const active = filtered.filter(r => r[SL.STATUS] !== 'cancelled');

      const totalAmount = active.reduce((s, r) => s + (parseFloat(r[SL.TOTAL]) || 0), 0);
      const totalCount = active.length;
      const avgTicket = totalCount ? totalAmount / totalCount : 0;

      // group by
      const groupBy = f.groupBy || 'daily';
      const gMap = {};
      active.forEach(r => {
        const d = toD(r[SL.DATE]);
        if (isNaN(d)) return;
        let label;
        if (groupBy === 'daily') label = toDs(r[SL.DATE]);
        else if (groupBy === 'weekly') {
          const jan1 = new Date(d.getFullYear(), 0, 1);
          const wk = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
          label = d.getFullYear() + '-W' + String(wk).padStart(2, '0');
        } else {
          label = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        }
        if (!gMap[label]) gMap[label] = { label, amount: 0, count: 0 };
        gMap[label].amount += parseFloat(r[SL.TOTAL]) || 0;
        gMap[label].count++;
      });
      const groupedData = Object.values(gMap).sort((a, b) => a.label.localeCompare(b.label));

      // payment method breakdown
      const methodBreakdown = {};
      active.forEach(r => {
        const m = r[SL.METHOD] || 'unknown';
        methodBreakdown[m] = (methodBreakdown[m] || 0) + (parseFloat(r[SL.TOTAL]) || 0);
      });

      // status breakdown
      const statusBreakdown = {};
      filtered.forEach(r => {
        const st = r[SL.STATUS] || 'unknown';
        if (!statusBreakdown[st]) statusBreakdown[st] = { count: 0, amount: 0 };
        statusBreakdown[st].count++;
        statusBreakdown[st].amount += parseFloat(r[SL.TOTAL]) || 0;
      });

      return { success: true, data: { totalAmount, totalCount, avgTicket, groupedData, methodBreakdown, statusBreakdown }};
    }

    // === stock_aging ===
    if (reportType === 'stock_aging') {
      const wsData = getSheetData(SHEETS.WOOD_STOCKS);
      const now = Date.now();
      const buckets = [
        { label: '0-30 days', min: 0, max: 30, count: 0, cft: 0, value: 0 },
        { label: '31-60 days', min: 31, max: 60, count: 0, cft: 0, value: 0 },
        { label: '61-90 days', min: 61, max: 90, count: 0, cft: 0, value: 0 },
        { label: '90+ days', min: 91, max: Infinity, count: 0, cft: 0, value: 0 }
      ];
      const oldStock = [];
      let totalAvailable = 0, totalValue = 0;

      wsData.forEach(r => {
        if (r[WS.STATUS] !== 'available') return;
        const created = toD(r[WS.CREATED]);
        if (isNaN(created)) return;
        const days = Math.floor((now - created.getTime()) / 86400000);
        const qty = parseInt(r[WS.QTY]) || 1;
        const cft = (parseFloat(r[WS.CFT]) || 0) * qty;
        const val = parseFloat(r[WS.SELL_PRICE]) || 0;
        totalAvailable += qty;
        totalValue += val;

        const b = buckets.find(b => days >= b.min && days <= b.max);
        if (b) { b.count += qty; b.cft += cft; b.value += val; }

        if (days > 90) oldStock.push({ serial: r[WS.SERIAL], car_name: '', days, cft: parseFloat(r[WS.CFT]) || 0, sell_price: val });
      });

      // enrich old stock with sub-cat names — O(1) lookup
      if (oldStock.length) {
        const scData = getSheetData(SHEETS.SUB_CATEGORIES);
        const scMap = scData.reduce((m, r) => (m[r[SC.ID]] = r[SC.NAME], m), {});
        const wsMap = wsData.reduce((m, r) => (m[r[WS.SERIAL]] = r, m), {});
        oldStock.forEach(o => {
          const ws = wsMap[o.serial];
          if (ws) o.car_name = scMap[ws[WS.SUBCAT_ID]] || '';
        });
      }

      return { success: true, data: {
        buckets: buckets.map(b => ({ label: b.label, count: b.count, cft: b.cft, value: b.value })),
        oldStock: oldStock.sort((a, b) => b.days - a.days),
        totalAvailable, totalValue
      }};
    }

    // === customer_profit ===
    if (reportType === 'customer_profit') {
      const slData = getSheetData(SHEETS.SALES).filter(r => r[SL.STATUS] !== 'cancelled' && inRange(r[SL.DATE]));
      const cuData = getSheetData(SHEETS.CUSTOMERS);
      const cuMap = cuData.reduce((m, r) => (m[r[CU.ID]] = { name: r[CU.NAME], phone: r[CU.PHONE] || '' }, m), {});

      // aggregate by customer
      const agg = {};
      slData.forEach(r => {
        const cid = r[SL.CUST_ID];
        if (!cid) return; // skip walk-in
        if (!agg[cid]) agg[cid] = { id: cid, name: '', phone: '', totalSales: 0, saleCount: 0 };
        agg[cid].totalSales += parseFloat(r[SL.TOTAL]) || 0;
        agg[cid].saleCount++;
      });

      const customers = Object.values(agg).map(c => {
        const cu = cuMap[c.id];
        c.name = cu ? cu.name : 'Unknown';
        c.phone = cu ? cu.phone : '';
        c.avgTicket = c.saleCount ? c.totalSales / c.saleCount : 0;
        return c;
      }).sort((a, b) => b.totalSales - a.totalSales);

      return { success: true, data: { customers }};
    }

    // === car_report ===
    if (reportType === 'car_report') {
      const scData = getSheetData(SHEETS.SUB_CATEGORIES);
      const catData = getSheetData(SHEETS.CATEGORIES);
      const catMap = catData.reduce((m, r) => (m[r[C.ID]] = r[C.NAME], m), {});
      const wsData = getSheetData(SHEETS.WOOD_STOCKS);
      const puData = getSheetData(SHEETS.PURCHASES).filter(r => inRange(r[PU.DATE]));
      const slData = getSheetData(SHEETS.SALES).filter(r => r[SL.STATUS] !== 'cancelled' && inRange(r[SL.DATE]));
      const siData = getSheetData(SHEETS.SALE_ITEMS);

      // sale_id -> sale lookup for date filtering
      const saleMap = slData.reduce((m, r) => (m[r[SL.ID]] = r, m), {});

      // ws_id -> sub_cat_id lookup
      const wsScMap = wsData.reduce((m, r) => (m[r[WS.ID]] = r[WS.SUBCAT_ID], m), {});

      // aggregate purchases by sub_cat
      const puAgg = {};
      puData.forEach(r => {
        const scId = r[PU.SUBCAT_ID];
        if (!puAgg[scId]) puAgg[scId] = { cost: 0, pieces: 0, cft: 0 };
        puAgg[scId].cost += parseFloat(r[PU.TOTAL]) || 0;
        puAgg[scId].pieces += parseInt(r[PU.PIECES]) || 0;
        puAgg[scId].cft += parseFloat(r[PU.CFT]) || 0;
      });

      // aggregate sale items by sub_cat (only for sales in range)
      const slAgg = {};
      siData.forEach(r => {
        if (!saleMap[r[SI.SALE_ID]]) return; // sale not in date range
        const scId = wsScMap[r[SI.WS_ID]];
        if (!scId) return;
        if (!slAgg[scId]) slAgg[scId] = { revenue: 0 };
        slAgg[scId].revenue += parseFloat(r[SI.TOTAL]) || 0;
      });

      const cars = scData.map(r => {
        const scId = r[SC.ID];
        const pu = puAgg[scId] || { cost: 0, pieces: 0, cft: 0 };
        const sl = slAgg[scId] || { revenue: 0 };
        return {
          id: scId, name: r[SC.NAME], category: catMap[r[SC.CAT_ID]] || '',
          totalPieces: pu.pieces, totalCft: pu.cft,
          purchaseCost: pu.cost, salesRevenue: sl.revenue,
          profit: sl.revenue - pu.cost
        };
      }).sort((a, b) => b.profit - a.profit);

      return { success: true, data: { cars }};
    }

    return { success: false, message: 'Unknown report type: ' + reportType };
  } catch (e) {
    console.error('getReportsData:', e);
    return { success: false, message: 'Failed to generate report' };
  }
}

// overdue aging for customers & suppliers
function getOverdueSummary(userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };

    const cuData = getSheetData(SHEETS.CUSTOMERS);
    const slData = getSheetData(SHEETS.SALES);
    const puData = getSheetData(SHEETS.PURCHASES);
    const spData = getSheetData(SHEETS.SUPPLIERS);
    const now = Date.now();
    const toD = v => v instanceof Date ? v : new Date(v);
    const daysBetween = v => { const d = toD(v); return isNaN(d) ? 0 : Math.floor((now - d.getTime()) / 86400000); };

    // bucket helper
    const bucket = days => days <= 7 ? 'within_7' : days <= 15 ? 'within_15' : days <= 30 ? 'within_30' : 'over_30';
    const emptyBuckets = () => ({ within_7: 0, within_15: 0, within_30: 0, over_30: 0 });

    // oldest unpaid sale per customer — O(1) map
    const custOldest = {};
    slData.forEach(r => {
      if (r[SL.STATUS] === 'cancelled' || (parseFloat(r[SL.DUE]) || 0) <= 0) return;
      const cid = r[SL.CUST_ID];
      if (!cid) return;
      const d = toD(r[SL.DATE]);
      if (isNaN(d)) return;
      if (!custOldest[cid] || d < custOldest[cid]) custOldest[cid] = d;
    });

    const custBuckets = emptyBuckets();
    const customers = cuData.filter(r => (parseFloat(r[CU.DUE]) || 0) > 0).map(r => {
      const id = r[CU.ID], due = parseFloat(r[CU.DUE]) || 0;
      const oldest = custOldest[id];
      const days = oldest ? daysBetween(oldest) : 0;
      if (days > 0) custBuckets[bucket(days)]++;
      return { id, name: r[CU.NAME], phone: r[CU.PHONE] || '', total_due: due, oldest_sale_date: oldest ? oldest.toISOString() : '', days_overdue: days };
    }).sort((a, b) => b.days_overdue - a.days_overdue);

    // suppliers — aggregate from purchases with due > 0
    const suppAgg = {};
    puData.forEach(r => {
      if (r[PU.STATUS] === 'cancelled' || (parseFloat(r[PU.DUE]) || 0) <= 0) return;
      const sid = r[PU.SUPPLIER_ID];
      const d = toD(r[PU.DATE]);
      const due = parseFloat(r[PU.DUE]) || 0;
      if (!suppAgg[sid]) suppAgg[sid] = { total_due: 0, oldest: null };
      suppAgg[sid].total_due += due;
      if (!isNaN(d) && (!suppAgg[sid].oldest || d < suppAgg[sid].oldest)) suppAgg[sid].oldest = d;
    });

    const spMap = spData.reduce((m, r) => (m[r[SP.ID]] = r, m), {});
    const suppBuckets = emptyBuckets();
    const suppliers = Object.keys(suppAgg).map(sid => {
      const a = suppAgg[sid], sp = spMap[sid];
      const days = a.oldest ? daysBetween(a.oldest) : 0;
      if (days > 0) suppBuckets[bucket(days)]++;
      return { id: parseInt(sid), name: sp ? sp[SP.NAME] : 'Unknown', phone: sp ? (sp[SP.PHONE] || '') : '', total_due: Math.round(a.total_due * 100) / 100, oldest_date: a.oldest ? a.oldest.toISOString() : '', days_overdue: days };
    }).sort((a, b) => b.days_overdue - a.days_overdue);

    const totalCustDue = customers.reduce((s, c) => s + c.total_due, 0);
    const totalSuppDue = suppliers.reduce((s, c) => s + c.total_due, 0);

    return { success: true, data: { customers, suppliers, buckets: { customers: custBuckets, suppliers: suppBuckets }, totalCustDue: Math.round(totalCustDue * 100) / 100, totalSuppDue: Math.round(totalSuppDue * 100) / 100 } };
  } catch (e) {
    console.error('getOverdueSummary:', e);
    return { success: false, message: 'Failed to load overdue summary' };
  }
}

// partial return — reverse one sale item
function returnSaleItem(saleItemId, saleId, reason, userId, role) {
  try {
    if (role !== 'admin' && role !== 'manager') return { success: false, message: 'Access denied' };

    const sr = findRowByValue(SHEETS.SALES, SL.ID, parseInt(saleId));
    if (!sr) return { success: false, message: 'Sale not found' };
    if (sr.data[SL.STATUS] === 'cancelled') return { success: false, message: 'Cannot return from cancelled sale' };

    const siRow = findRowByValue(SHEETS.SALE_ITEMS, SI.ID, parseInt(saleItemId));
    if (!siRow) return { success: false, message: 'Sale item not found' };
    if (siRow.data[SI.SALE_ID] != parseInt(saleId)) return { success: false, message: 'Item does not belong to this sale' };

    const wsId = parseInt(siRow.data[SI.WS_ID]);
    const lineTotal = parseFloat(siRow.data[SI.TOTAL]) || 0;
    const siCft = parseFloat(siRow.data[SI.CFT]) || 0;
    const siRate = parseFloat(siRow.data[SI.RATE]) || 0;
    const serial = siRow.data[SI.SERIAL] || '';

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const now = ts();

      // restore wood stock
      const wr = findRowByValue(SHEETS.WOOD_STOCKS, WS.ID, wsId);
      if (wr) {
        const wrow = wr.data.slice();
        if (wrow[WS.STATUS] === 'sold') {
          wrow[WS.STATUS] = 'available';
        } else {
          // partial qty — add back
          const soldQty = (siCft && siRate) ? Math.round(lineTotal / (siCft * siRate)) : 1;
          const newQty = (parseInt(wrow[WS.QTY]) || 0) + soldQty;
          wrow[WS.QTY] = newQty;
          const wsCft = parseFloat(wrow[WS.CFT]) || 0;
          wrow[WS.BUY_PRICE] = Math.round(wsCft * newQty * (parseFloat(wrow[WS.BUY_RATE]) || 0) * 100) / 100;
          wrow[WS.SELL_PRICE] = Math.round(wsCft * newQty * (parseFloat(wrow[WS.SELL_RATE]) || 0) * 100) / 100;
        }
        wrow[WS.UPDATED] = now;
        getSheet(SHEETS.WOOD_STOCKS).getRange(wr.row, 1, 1, wrow.length).setValues([wrow]);
      }

      // delete sale item row
      getSheet(SHEETS.SALE_ITEMS).deleteRow(siRow.row);

      // recalc sale totals
      const freshSr = findRowByValue(SHEETS.SALES, SL.ID, parseInt(saleId));
      recalcSaleFromItems(freshSr, now);

      // append return note — single cell update to avoid overwriting recalc
      const saleRow = findRowByValue(SHEETS.SALES, SL.ID, parseInt(saleId));
      if (saleRow) {
        const existing = saleRow.data[SL.NOTES] || '';
        getSheet(SHEETS.SALES).getRange(saleRow.row, SL.NOTES + 1).setValue(existing + ' | Return: ' + serial + ' - ' + (reason || 'no reason'));
      }

      logActivity(userId, 'RETURN_ITEM', 'Sale_Items', parseInt(saleItemId), 'Returned ' + serial + ' from sale #' + saleId);
      return { success: true, message: 'Item returned successfully' };
    } finally {
      lock.releaseLock();
    }
  } catch (e) {
    console.error('returnSaleItem:', e);
    return { success: false, message: 'Failed to return item' };
  }
}

// search across multiple sheets
function globalSearch(query, userId, role) {
  try {
    if (!query || !query.trim()) return { success: true, data: [] };
    const q = query.trim().toLowerCase();
    const results = [];
    const limit = 10;

    // customers — not for warehouse_staff
    if (role !== 'warehouse_staff') {
      const cuData = getSheetData(SHEETS.CUSTOMERS);
      let cnt = 0;
      for (let i = 0; i < cuData.length && cnt < limit; i++) {
        const r = cuData[i];
        if ((String(r[CU.NAME]).toLowerCase().includes(q)) || (String(r[CU.PHONE]).toLowerCase().includes(q))) {
          results.push({ type: 'customer', id: r[CU.ID], name: r[CU.NAME], phone: r[CU.PHONE] || '', total_due: parseFloat(r[CU.DUE]) || 0 });
          cnt++;
        }
      }
    }

    // suppliers — not for cashier
    if (role !== 'cashier') {
      const spData = getSheetData(SHEETS.SUPPLIERS);
      let cnt = 0;
      for (let i = 0; i < spData.length && cnt < limit; i++) {
        const r = spData[i];
        if ((String(r[SP.NAME]).toLowerCase().includes(q)) || (String(r[SP.PHONE]).toLowerCase().includes(q))) {
          results.push({ type: 'supplier', id: r[SP.ID], name: r[SP.NAME], phone: r[SP.PHONE] || '' });
          cnt++;
        }
      }
    }

    // sales — not for warehouse_staff
    if (role !== 'warehouse_staff') {
      const slData = getSheetData(SHEETS.SALES);
      let cnt = 0;
      for (let i = 0; i < slData.length && cnt < limit; i++) {
        const r = slData[i];
        if (String(r[SL.INV_NO]).toLowerCase().includes(q)) {
          results.push({ type: 'sale', id: r[SL.ID], invoice_no: r[SL.INV_NO], total: parseFloat(r[SL.TOTAL]) || 0, status: r[SL.STATUS] || '', date: r[SL.DATE] instanceof Date ? r[SL.DATE].toISOString() : r[SL.DATE] });
          cnt++;
        }
      }
    }

    // purchases — not for cashier
    if (role !== 'cashier') {
      const puData = getSheetData(SHEETS.PURCHASES);
      let cnt = 0;
      for (let i = 0; i < puData.length && cnt < limit; i++) {
        const r = puData[i];
        if (String(r[PU.NO]).toLowerCase().includes(q)) {
          results.push({ type: 'purchase', id: r[PU.ID], purchase_no: r[PU.NO], total: parseFloat(r[PU.TOTAL]) || 0, status: r[PU.STATUS] || '', date: r[PU.DATE] instanceof Date ? r[PU.DATE].toISOString() : r[PU.DATE] });
          cnt++;
        }
      }
    }

    // wood stocks — all roles
    const wsData = getSheetData(SHEETS.WOOD_STOCKS);
    let wsCnt = 0;
    for (let i = 0; i < wsData.length && wsCnt < limit; i++) {
      const r = wsData[i];
      if (String(r[WS.SERIAL]).toLowerCase().includes(q)) {
        results.push({ type: 'wood', id: r[WS.ID], serial: r[WS.SERIAL], status: r[WS.STATUS] || '', cft: parseFloat(r[WS.CFT]) || 0, sell_price: parseFloat(r[WS.SELL_PRICE]) || 0 });
        wsCnt++;
      }
    }

    results.sort((a, b) => a.type.localeCompare(b.type));
    return { success: true, data: results };
  } catch (e) {
    console.error('globalSearch:', e);
    return { success: false, message: 'Search failed' };
  }
}

// get sale data for duplicate/repeat sale
function getSaleForDuplicate(saleId, userId, role) {
  try {
    if (role === 'warehouse_staff') return { success: false, message: 'Access denied' };

    const sr = findRowByValue(SHEETS.SALES, SL.ID, parseInt(saleId));
    if (!sr) return { success: false, message: 'Sale not found' };

    const siData = getSheetData(SHEETS.SALE_ITEMS);
    const saleItems = siData.filter(r => r[SI.SALE_ID] == parseInt(saleId));

    // build wood stock lookup by serial — O(1)
    const wsData = getSheetData(SHEETS.WOOD_STOCKS);
    const wsSerialMap = {};
    wsData.forEach(r => {
      if (r[WS.STATUS] === 'available') wsSerialMap[r[WS.SERIAL]] = r[WS.ID];
    });

    // customer name
    const custId = sr.data[SL.CUST_ID];
    let custName = '';
    if (custId) {
      const cr = findRowByValue(SHEETS.CUSTOMERS, CU.ID, parseInt(custId));
      if (cr) custName = cr.data[CU.NAME];
    }

    const items = saleItems.map(r => ({
      serial: r[SI.SERIAL] || '',
      width: parseFloat(r[SI.WIDTH]) || 0,
      length: parseFloat(r[SI.LENGTH]) || 0,
      cft: parseFloat(r[SI.CFT]) || 0,
      rate: parseFloat(r[SI.RATE]) || 0,
      original_total: parseFloat(r[SI.TOTAL]) || 0,
      available_wood_id: wsSerialMap[r[SI.SERIAL]] || null
    }));

    return { success: true, data: { customer_id: custId || null, customer_name: custName, items } };
  } catch (e) {
    console.error('getSaleForDuplicate:', e);
    return { success: false, message: 'Failed to load sale for duplicate' };
  }
}

// run once to setup sheets + seed demo data
function setupDemoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let tmp = ss.insertSheet('_tmp_setup');
  ss.getSheets().forEach(s => { if (s.getName() !== '_tmp_setup') ss.deleteSheet(s); });

  const now = ts();

  // Users
  let sh = ss.insertSheet(SHEETS.USERS);
  sh.appendRow(['ID','Full Name','Email','Phone','Password','Role','Avatar','Is Active','Created At','Updated At','OTP','OTP Expires']);
  sh.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 'Admin User', 'admin@demo.com', '03001000001', 'admin123', 'admin', '', 1, now, now, '', '']);
  sh.appendRow([2, 'Manager 1', 'manager1@demo.com', '03001000002', 'manager123', 'manager', '', 1, now, '', '', '']);
  sh.appendRow([3, 'Cashier 1', 'cashier1@demo.com', '03001000003', 'cashier123', 'cashier', '', 1, now, '', '', '']);
  sh.appendRow([4, 'Cashier 2', 'cashier2@demo.com', '03001000004', 'cashier123', 'cashier', '', 1, now, '', '', '']);
  sh.appendRow([5, 'Warehouse 1', 'warehouse1@demo.com', '03001000005', 'warehouse123', 'warehouse_staff', '', 1, now, '', '', '']);
  sh.appendRow([6, 'Warehouse 2', 'warehouse2@demo.com', '03001000006', 'warehouse123', 'warehouse_staff', '', 0, now, '', '', '']);

  // Categories
  sh = ss.insertSheet(SHEETS.CATEGORIES);
  sh.appendRow(['ID','Name','Description','Is Active','Created By','Created At']);
  sh.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 'Raw Wood', 'Unprocessed wood materials direct from source', 1, 1, now]);
  sh.appendRow([2, 'Processed Wood', 'Treated and processed wood products', 1, 1, now]);
  sh.appendRow([3, 'Plywood', 'Engineered wood panels made from thin sheets', 1, 1, now]);
  sh.appendRow([4, 'Timber', 'Construction grade timber and beams', 1, 2, now]);
  sh.appendRow([5, 'Furniture Wood', 'Premium wood for furniture making', 0, 1, now]);

  // Sub_Categories
  sh = ss.insertSheet(SHEETS.SUB_CATEGORIES);
  sh.appendRow(['ID','Category ID','Name','Arrival Date','Description','Is Active','Created By','Created At']);
  sh.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 1, 'Car 1', '2026-04-10', 'First raw wood shipment', 1, 1, now]);
  sh.appendRow([2, 1, 'Car 5', '2026-04-15', 'Second batch raw wood', 1, 1, now]);
  sh.appendRow([3, 2, 'Car 7', '2026-04-18', 'Processed wood delivery', 1, 2, now]);
  sh.appendRow([4, 3, 'Car 3', '2026-04-20', 'Plywood panels shipment', 1, 1, now]);
  sh.appendRow([5, 4, 'Car 12', '2026-04-22', 'Timber beams delivery', 1, 2, now]);
  sh.appendRow([6, 1, 'Car 9', '', 'Pending arrival', 0, 1, now]);

  // Suppliers
  sh = ss.insertSheet(SHEETS.SUPPLIERS);
  sh.appendRow(['ID','Name','Phone','Address','Is Active','Created By','Created At']);
  sh.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 'Supplier 1', '03001000010', 'House 1, Street 1, Demo City', 1, 1, now]);
  sh.appendRow([2, 'Supplier 2', '03001000011', 'House 2, Street 5, Demo City', 1, 1, now]);
  sh.appendRow([3, 'Supplier 3', '03001000012', 'House 10, Street 8, Demo City', 1, 2, now]);
  sh.appendRow([4, 'Supplier 4', '03001000013', 'House 7, Street 3, Demo City', 0, 1, now]);

  // Wood_Stocks
  sh = ss.insertSheet(SHEETS.WOOD_STOCKS);
  sh.appendRow(['ID','Serial Number','Sub Category ID','Purchase ID','Width Inch','Length Ft','Cubic Ft','Buy Rate','Buy Price','Sell Rate','Sell Price','Status','Notes','Created By','Created At','Updated At','Qty','Image']);
  sh.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  var demoStocks = [
    [1,'W-001',1,1, 12, 8, 0,1600,0,16500,0,'available','',1,now,now,1,''],
    [2,'W-002',1,1, 14, 10,0,1600,0,16500,0,'available','',1,now,now,2,''],
    [3,'W-003',2,2, 10, 6, 0,1600,0,16500,0,'available','',1,now,now,1,''],
    [4,'W-004',2,2, 16, 12,0,1600,0,16500,0,'sold','',1,now,now,1,''],
    [5,'W-005',3,3, 11, 9, 0,1500,0,16500,0,'available','',2,now,now,3,''],
    [6,'W-006',3,3, 13, 7, 0,1500,0,16500,0,'reserved','',2,now,now,1,''],
    [7,'W-007',4,'', 15, 11,0,1600,0,16500,0,'available','',1,now,now,1,''],
    [8,'W-008',1,1, 9,  5, 0,1600,0,16500,0,'damaged','Crack found',1,now,now,1,'']
  ];
  demoStocks.forEach(function(r) {
    var cft = Math.round((r[4]*r[4]*r[5])/2304*10000)/10000;
    var q = r[16] || 1;
    r[6] = cft; r[8] = Math.round(cft*q*r[7]*100)/100; r[10] = Math.round(cft*q*r[9]*100)/100;
    sh.appendRow(r);
  });

  // pre-calc W-004 sold price for customer + sale refs
  var soldCft = demoStocks[3][6];
  var soldSellPrice = demoStocks[3][10];

  // Customers — cust1 bought W-004
  sh = ss.insertSheet(SHEETS.CUSTOMERS);
  sh.appendRow(['ID','Name','Phone','Address','Total Purchase','Total Paid','Total Due','Is Active','Created By','Created At']);
  sh.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 'Customer 1', '03001000020', 'House 5, Street 2, Demo City', soldSellPrice, soldSellPrice, 0, 1, 1, now]);
  sh.appendRow([2, 'Customer 2', '03001000021', 'House 12, Street 7, Demo City', 0, 0, 0, 1, 1, now]);
  sh.appendRow([3, 'Customer 3', '03001000022', 'House 3, Street 10, Demo City', 5000, 3000, 2000, 1, 2, now]);
  sh.appendRow([4, 'Customer 4', '03001000023', '', 0, 0, 0, 0, 1, now]);

  // Purchases — calc from wood stocks
  sh = ss.insertSheet(SHEETS.PURCHASES);
  sh.appendRow(['ID','Purchase No','Supplier ID','Sub Category ID','Total Pieces','Total CFT','Rate/CFT','Total Amount','Paid Amount','Due Amount','Purchase Date','Notes','Status','Created By','Created At','Updated At']);
  sh.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  // pur 1: car1, stocks W-001,W-002,W-008 → 3 pcs
  var p1cft = demoStocks.filter(function(s){return s[3]===1}).reduce(function(a,s){return a+s[6]},0);
  var p1total = Math.round(p1cft*1600*100)/100;
  sh.appendRow([1, 'PUR-20260410-001', 1, 1, 3, Math.round(p1cft*10000)/10000, 1600, p1total, Math.round(p1total*0.6*100)/100, Math.round(p1total*0.4*100)/100, '2026-04-10', 'First purchase', 'pending', 1, now, now]);
  // pur 2: car5(id=2), stocks W-003,W-004 → 2 pcs
  var p2cft = demoStocks.filter(function(s){return s[3]===2}).reduce(function(a,s){return a+s[6]},0);
  var p2total = Math.round(p2cft*1600*100)/100;
  sh.appendRow([2, 'PUR-20260415-001', 2, 2, 2, Math.round(p2cft*10000)/10000, 1600, p2total, p2total, 0, '2026-04-15', '', 'completed', 1, now, now]);
  // pur 3: car7(id=3), stocks W-005,W-006 → 2 pcs
  var p3cft = demoStocks.filter(function(s){return s[3]===3}).reduce(function(a,s){return a+s[6]},0);
  var p3total = Math.round(p3cft*1500*100)/100;
  sh.appendRow([3, 'PUR-20260418-001', 1, 3, 2, Math.round(p3cft*10000)/10000, 1500, p3total, Math.round(p3total*0.5*100)/100, Math.round(p3total*0.5*100)/100, '2026-04-18', 'Processed wood', 'pending', 2, now, now]);

  // Sales — spread across April for dashboard charts
  sh = ss.insertSheet(SHEETS.SALES);
  sh.appendRow(['ID','Invoice No','Customer ID','Total Items','Total CFT','Subtotal','Discount','Grand Total','Paid Amount','Due Amount','Payment Method','Sale Date','Status','Notes','Created By','Created At','Updated At']);
  sh.getRange(1, 1, 1, 17).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 'INV-20260423-001', 1, 1, Math.round(soldCft*10000)/10000, soldSellPrice, 0, soldSellPrice, soldSellPrice, 0, 'cash', '2026-04-23T10:00:00Z', 'completed', '', 3, now, now]);
  sh.appendRow([2, 'INV-20260425-001', 2, 1, 1.2, 19800, 0, 19800, 10000, 9800, 'bank', '2026-04-25T11:00:00Z', 'pending', '', 3, now, now]);
  sh.appendRow([3, 'INV-20260428-001', 3, 2, 2.5, 41250, 1250, 40000, 40000, 0, 'cash', '2026-04-28T14:00:00Z', 'completed', '', 3, now, now]);
  sh.appendRow([4, 'INV-20260403-001', 1, 1, 0.8, 13200, 0, 13200, 13200, 0, 'bkash', '2026-04-03T09:00:00Z', 'completed', '', 3, now, now]);
  sh.appendRow([5, 'INV-20260407-001', 2, 3, 3.1, 51150, 2000, 49150, 25000, 24150, 'credit', '2026-04-07T12:00:00Z', 'pending', '', 4, now, now]);
  sh.appendRow([6, 'INV-20260410-001', 3, 1, 1.5, 24750, 0, 24750, 24750, 0, 'cash', '2026-04-10T10:30:00Z', 'completed', '', 3, now, now]);
  sh.appendRow([7, 'INV-20260413-001', 1, 2, 2.0, 33000, 500, 32500, 32500, 0, 'bank', '2026-04-13T15:00:00Z', 'completed', '', 3, now, now]);
  sh.appendRow([8, 'INV-20260416-001', 2, 1, 0.9, 14850, 0, 14850, 7000, 7850, 'nagad', '2026-04-16T11:00:00Z', 'pending', '', 4, now, now]);
  sh.appendRow([9, 'INV-20260419-001', 1, 2, 2.8, 46200, 0, 46200, 46200, 0, 'cash', '2026-04-19T16:00:00Z', 'completed', '', 3, now, now]);
  sh.appendRow([10, 'INV-20260422-001', 3, 1, 1.1, 18150, 0, 18150, 18150, 0, 'cash', '2026-04-22T09:30:00Z', 'completed', '', 3, now, now]);
  sh.appendRow([11, 'INV-20260424-001', 2, 1, 0.7, 11550, 0, 11550, 0, 11550, 'credit', now, 'pending', 'Today sale', 3, now, now]);

  // Sale_Items
  sh = ss.insertSheet(SHEETS.SALE_ITEMS);
  sh.appendRow(['ID','Sale ID','Wood Stock ID','Serial','Width','Length','CFT','Rate/CFT','Line Total']);
  sh.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 1, 4, 'W-004', 16, 12, Math.round(soldCft*10000)/10000, 16500, soldSellPrice]);

  // Expenses
  sh = ss.insertSheet(SHEETS.EXPENSES);
  sh.appendRow(['ID','Title','Category','Amount','Expense Date','Notes','Created By','Created At']);
  sh.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 'Truck fuel Car 1', 'transport', 5000, '2026-04-24', '', 1, now]);
  sh.appendRow([2, 'Office rent', 'rent', 25000, '2026-04-01', 'Monthly office rent', 1, now]);
  sh.appendRow([3, 'Loading labor', 'labor', 2500, '2026-04-26', '3 workers', 1, now]);
  sh.appendRow([4, 'Electricity bill', 'utility', 3800, '2026-04-04', '', 1, now]);
  sh.appendRow([5, 'Warehouse rent', 'rent', 25000, '2026-04-15', 'Storage facility rent', 1, now]);
  sh.appendRow([6, 'Truck fuel Car 5', 'transport', 6500, '2026-04-05', '', 1, now]);
  sh.appendRow([7, 'Unloading labor', 'labor', 3000, '2026-04-06', '4 workers x 750', 1, now]);
  sh.appendRow([8, 'Warehouse repair', 'maintenance', 8000, '2026-04-10', 'Roof fix', 2, now]);
  sh.appendRow([9, 'Truck fuel Car 7', 'transport', 4500, '2026-04-12', '', 1, now]);
  sh.appendRow([10, 'Mid-month electricity', 'utility', 4500, '2026-04-22', '', 1, now]);
  sh.appendRow([11, 'Packing material', 'other', 2000, '2026-04-18', '', 1, now]);
  sh.appendRow([12, 'Labor sorting', 'labor', 3500, '2026-04-20', '5 workers', 2, now]);
  sh.appendRow([13, 'Diesel generator', 'utility', 1500, '2026-04-22', '', 1, now]);
  sh.appendRow([14, 'Transport delivery', 'transport', 7000, '2026-04-24', 'Customer delivery', 1, now]);

  // Payments (unified) — demo data
  sh = ss.insertSheet(SHEETS.PAYMENTS);
  sh.appendRow(['ID','Sale ID','Purchase ID','Payment Type','Amount','Payment Method','Reference No','Payment Date','Notes','Created By','Created At']);
  sh.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 1, 1, 'customer_payment', soldSellPrice, 'cash', '', '2026-04-23', 'Full payment', 3, now]);
  sh.appendRow([2, '', 1, 'supplier_payment', Math.round(p1total*0.6*100)/100, 'bank', 'TXN-001', '2026-04-05', 'Partial', 1, now]);
  sh.appendRow([3, '', 2, 'supplier_payment', p2total, 'cash', '', '2026-04-08', 'Full', 1, now]);
  sh.appendRow([4, '', 3, 'supplier_payment', Math.round(p3total*0.5*100)/100, 'bkash', 'BK-555', '2026-04-12', 'Partial', 2, now]);
  sh.appendRow([5, '', 3, 'customer_payment', 3000, 'cash', '', '2026-04-15', 'Customer 3 partial', 1, now]);
  sh.appendRow([6, 4, 1, 'customer_payment', 13200, 'bkash', 'BK-100', '2026-04-03', 'Full payment', 3, now]);
  sh.appendRow([7, 6, 3, 'customer_payment', 24750, 'cash', '', '2026-04-10', 'Full payment', 3, now]);
  sh.appendRow([8, 7, 1, 'customer_payment', 32500, 'bank', 'TXN-005', '2026-04-13', 'Full payment', 3, now]);
  sh.appendRow([9, 9, 1, 'customer_payment', 46200, 'cash', '', '2026-04-19', 'Full payment', 3, now]);
  sh.appendRow([10, 10, 3, 'customer_payment', 18150, 'cash', '', '2026-04-22', 'Full payment', 3, now]);
  sh.appendRow([11, 3, 3, 'customer_payment', 40000, 'cash', '', '2026-04-28', 'Full payment', 3, now]);
  sh.appendRow([12, 2, 2, 'customer_payment', 10000, 'bank', 'TXN-002', '2026-04-25', 'Partial payment', 3, now]);
  sh.appendRow([13, 5, 2, 'customer_payment', 25000, 'credit', '', '2026-04-07', 'Partial payment', 4, now]);

  // Import_Logs
  sh = ss.insertSheet(SHEETS.IMPORT_LOGS);
  sh.appendRow(['ID','File Name','Sub Category ID','Total Rows','Success Rows','Failed Rows','Status','Error Log','Created By','Created At']);
  sh.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');

  // Settings
  sh = ss.insertSheet(SHEETS.SETTINGS);
  sh.appendRow(['ID','Setting Key','Setting Value','Updated By','Updated At']);
  sh.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');
  sh.appendRow([1, 'business_name', 'Wood Trading POS', 1, now]);
  sh.appendRow([2, 'business_address', 'Demo City, Demo Country', 1, now]);
  sh.appendRow([3, 'business_phone', '03001000001', 1, now]);
  sh.appendRow([4, 'currency_symbol', '৳', 1, now]);
  sh.appendRow([5, 'default_buy_rate', '1600', 1, now]);
  sh.appendRow([6, 'default_sell_rate', '16500', 1, now]);
  sh.appendRow([7, 'invoice_prefix', 'INV', 1, now]);
  sh.appendRow([8, 'purchase_prefix', 'PUR', 1, now]);
  sh.appendRow([9, 'invoice_footer', 'Thank you for your business!', 1, now]);

  // Activity_Logs
  sh = ss.insertSheet(SHEETS.LOGS);
  sh.appendRow(['ID','User ID','Username','Action','Table','Record ID','Details','Created At']);
  sh.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#001f3f').setFontColor('white');

  ss.deleteSheet(tmp);
  return 'Setup done! Login: admin@demo.com / admin123';
}
