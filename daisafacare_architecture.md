# DaisafaCare — Homecare Invoice & Treatment Database
## Architecture Overview & Implementation Plan

---

## 1. Analysis of Source App (Wood Trading POS)

### What it does well (to adapt):
- Single-file GAS backend (`.gs`) + single HTML frontend
- Session-based auth via Google Apps Script (no server needed)
- `LockService` for race-condition-safe writes
- Structured SHEETS constant map + column index constants
- Batch read pattern: `getSheetData()` → in-memory filtering
- `genInvoiceNo()` pattern → date-based sequential IDs
- Role-based access (admin / manager / cashier / warehouse)
- Dashboard stats aggregated from raw sheet data
- Invoice print via `html2canvas` / `window.print()`

### Key differences for DaisafaCare:
| Wood POS | DaisafaCare |
|---|---|
| Wood stock items | Homecare treatment catalog |
| Sale → Sale Items | Schedule → Treatment Items |
| Supplier ledger | Therapist management |
| Purchase CFT calc | Treatment duration / session count |
| Walk-in / registered customer | Mama/customer with baby info |
| Currency: ৳ | Currency: Rp |
| Status: available/sold/damaged | Status: scheduled/done/cancelled |

---

## 2. JADWAL DAISAFACARE.xlsx — Data Structure

### Spreadsheet Sheets (actual):
- **PRICELIST**: `[category, sub_treatment, label, price, price_display]`
- **Monthly sheets** (JULI, AGUSTUS, SEPTEMBER, OKTOBER...):
  - JULI/AGUSTUS/SEPTEMBER: `[TANGGAL, NAMA BUNDA, HP, LOKASI, TREATMENT, FEE TREATMENT, TRANSPORT, TOTAL INVOICE, KETERANGAN]`
  - OKTOBER+: `[TANGGAL, NAMA BUNDA, HP, LOKASI, TREATMENT, FEE TREATMENT, KM, TRANSPORT, TOTAL INVOICE, KETERANGAN]`

### Treatment Categories (from PRICELIST):
- **Baby**: Sleep Booster, GTM, Tummy Massage, Hypno Babywearing, etc.
- **Kids**: Sleep Booster, GTM, etc.
- **Mom**: Pijat Nifas, Breast Care, etc.
- **Jaga**: 6 Jam, 8 Jam (babysitting)

### Payment Status (KETERANGAN): `LUNAS TF/QRIS`, `BELUM BAYAR`, `DP`, custom notes

---

## 3. New App — Google Sheets Structure

### Sheets to create:
```
Users          → auth & roles
Customers      → mama/client data
Treatments     → treatment catalog (from PRICELIST)
Schedules      → appointment/booking (main data)
Schedule_Items → treatment items per schedule
Payments       → payment records
Settings       → business config
Activity_Logs  → audit trail
```

### Sheet Schemas:

**Users**: `id, full_name, email, phone, password, role(admin|therapist|receptionist), is_active, created_at`

**Customers**: `id, name, phone, address, baby_name, baby_age, notes, total_purchase, total_paid, total_due, is_active, created_at`

**Treatments**: `id, category(Baby|Kids|Mom|Jaga), name, description, price, duration_min, is_active, created_by, created_at`

**Schedules**: `id, invoice_no, customer_id, therapist_id, schedule_date, schedule_time, location, km_distance, fee_treatment, transport_fee, subtotal, discount, grand_total, paid_amount, due_amount, payment_method, status(scheduled|done|cancelled), keterangan, notes, created_by, created_at`

**Schedule_Items**: `id, schedule_id, treatment_id, treatment_name, price, qty, subtotal`

**Payments**: `id, schedule_id, customer_id, amount, method(TF/QRIS/Cash), reference_no, payment_date, notes, created_by, created_at`

**Settings**: `id, key, value, updated_by, updated_at`

**Activity_Logs**: `id, user_id, username, action, table, record_id, details, created_at`

---

## 4. App Features

### Pages:
1. **Login** — email + password auth
2. **Dashboard** — KPIs, charts, recent activity, overdue payments
3. **Jadwal (Schedule)** — calendar + list view of all appointments
4. **Pelanggan (Customers)** — CRUD, ledger, WhatsApp button
5. **Treatment Catalog** — price list management
6. **Invoice** — generate, preview, print with Daisafa brand
7. **Keuangan (Finance)** — payments, revenue summary
8. **Laporan (Reports)** — monthly revenue, treatment analytics
9. **Pengaturan (Settings)** — business info, user management
10. **Log Aktivitas** — audit trail (admin only)

### Invoice Style:
- Match the brand design from `invoice daisafa.jpeg`
- Colors: `#85957A` (primary green), `#D4C2AA` (beige), `#FCF7F1` (cream)
- Include: moon/baby logo area, DAISAFACARE header, service table, payment info, signature
- Export: Print / html2canvas screenshot

---

## 5. Implementation Plan

### Phase 1 — Foundation
- [x] `Code.gs` — doGet(), sheet constants, utilities
- [x] Sheet setup function (setupSheets)
- [x] Auth: login, session management

### Phase 2 — Core Data
- [x] Customers CRUD
- [x] Treatment catalog CRUD  
- [x] Schedules CRUD + Schedule_Items
- [x] Payment recording

### Phase 3 — Dashboard & Reports
- [x] getDashboardStats()
- [x] getReportsData() — monthly, treatment breakdown
- [x] overdue summary

### Phase 4 — Invoice
- [x] Invoice HTML template (Daisafa brand)
- [x] Print / export functionality

### Phase 5 — UI
- [x] Sidebar navigation
- [x] All CRUD pages
- [x] Calendar view for schedules
- [x] Mobile responsive

### Phase 6 — Hardening (post-audit)
- [x] Role guards on every mutating endpoint (`canWrite` = admin/receptionist; therapist read-only; deletes admin-only)
- [x] Status-change UI wired to `updateScheduleStatus` (Selesai / Batalkan)
- [x] Server-side pricing authority — client prices ignored, master `Treatments` price used
- [x] Money integrity: negative values rejected, overpayment rejected, payments on cancelled invoices rejected
- [x] `keterangan` derived server-side: `LUNAS TF/QRIS` / `LUNAS CASH` / `DP` / `BELUM BAYAR`
- [x] Cancel/un-cancel reverses customer totals atomically
- [x] `invoice_prefix` + `currency_symbol` settings actually consumed
- [x] `getNextId()` locked everywhere (`saveAllSettings`, `logActivity`)
- [x] `is_active` preserved on edit; settings keys whitelisted; user roles whitelisted

---

## 7. Known limitation

Role is asserted by the browser on every call (`ga(fn, [..., S.user.id, S.user.role])`), so the per-function guards are a UI-consistency and accident-prevention boundary, not a security boundary against a hostile user who opens the web-app URL. Closing that requires server-side session tokens (a `Sessions` sheet + token issued at login and verified per call), which is a deliberate future step — it changes every endpoint signature.


---

## 8. Serialization rule (do not break this)

`google.script.run` **cannot transport `Date` objects**. A returned object that contains a `Date` — even nested, even inside an array — is silently dropped and the browser's success handler receives `null`. The page then dies with `Cannot read properties of null (reading 'success')`.

Because Google Sheets stores date and time cells as `Date` values, every server function that returns sheet data must convert them first:

- Read endpoints use `getSheetDataClient(name)` (Date → local `yyyy-MM-dd'T'HH:mm:ss` text) instead of `getSheetData(name)`.
- Write paths keep the plain `getSheetData`, so real Dates are written back to the sheet unchanged.
- Date columns go through `fmtDate` / `fmtTs`; time columns go through `fmtTime`.
- Time cells need extra care: Sheets keeps a time-of-day as a number on the 1899-12-30 epoch, and pre-1901 timezone rules differ per engine, so a formatted `Date` can read `09:07` for a cell that visibly says `09:00`. `getScheduleTimeById()` therefore reads the **displayed** text of the `Schedule Time` column.
- The frontend `ga()` wrapper also treats a `null` response as a visible error instead of letting the page crash.

---

## 6. Files to Create
```
d:\proyek\inv-daisafa\
├── Code.gs              ← Google Apps Script backend
├── index.html           ← Single-file frontend (all CSS+JS inline)
└── (deploy as Google Web App)
```

Both files already exist and implement all of the above. To deploy: open the bound spreadsheet → Extensions → Apps Script, paste `Code.gs` and `index.html`, then Deploy → New deployment → Web app.

**Do not run `setupSheets()` against the live spreadsheet** — it deletes every sheet. It is only for a fresh/thrown-away copy.



---

## 9. Columns added in the "next update" round

Three columns were **appended** (existing indices never shift, so old data keeps working):

| Sheet | Column | Header | Used for |
|---|---|---|---|
| Customers | index 13 (N) | `Tanggal Lahir` | `dob` as `yyyy-MM-dd`; the frontend computes the baby's age from it |
| Customers | index 14 (O) | `Maps Link` | pasted Google Maps URL, shown as a "Buka Maps" button |
| Schedules | index 22 (W) | `Maps Link` | per-visit Google Maps URL (can differ from the customer's) |

These headers must be typed once in the live spreadsheet. `setupSheets()` already writes them for a fresh copy, but it must never run on the real sheet.

### Phone numbers

Legacy rows store phones as **numbers**, so the leading `0` is gone and `.includes()` would crash. Every read endpoint therefore returns two strings: `phone` (pretty, e.g. `0852-5898-8480`) for display and search, and `phone_wa` (digits, e.g. `6285258988480`) for `wa.me` links. Writes store the pretty string as text.

### Transport fee

One rule, enforced in `calcTransportFee()` on the server and `hitungTransport()` on the client:

1. Round the distance **down** to whole km.
2. `<= 5` km is free; otherwise `whole * transport_rate_per_km` (real data: 27,6 km -> 27 -> Rp54.000, 9,2 -> 18.000, 5,8 -> 5 -> free).
3. The field stays editable: when the owner types a number the app stops auto-calculating, and the backend keeps whatever the client sent (only if `transport_fee` is absent does it compute the value itself).

### Edit Jadwal

`updateSchedule(userId, role, scheduleId, payload)` re-prices the booking from the Treatments sheet, replaces that schedule's `Schedule_Items`, keeps the same invoice number and the already-paid amount (clamped to the new total), and moves the customer totals by the delta (old value out, new value in).

### Invoice numbers

`genInvoiceNo()` uses the Settings key `last_invoice_no` as a high-water mark, so deleting the newest invoice can no longer free its number for reuse.
