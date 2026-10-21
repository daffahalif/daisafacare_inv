# DaisafaCare — Changelog

Google Apps Script + Google Sheets app for a mom & baby homecare in Surabaya. Two files only: `Code.gs` (backend) and `index.html` (frontend), pasted manually into the Apps Script editor.

Newest release first, grouped as `Added` / `Changed` / `Fixed`.

---

## 1.6 - 2026-10-21

### Added

- Jadwal pagination (owner's shape): list loads **10 per page** — filtering/sorting/search run server-side in `getSchedules` (`{page, q, sort, from, to, status}`) which returns `total`/`totalPages` with the page. Pager bar `[«] 1 2 3 [»]` + `Muat lebih` (appends the next page), page resets on every filter change, server clamps out-of-range pages. Calendar mode still fetches by month; `getSchedules` called without `page` behaves exactly as before.
- `Settings` key `signature_show` (allowed list + setup seed id 16, default `'0'`). `saveAllSettings` appends missing key rows, so the live spreadsheet gains it on the first save — no manual sheet edit.

### Changed

- Invoice signature behind a master toggle: Pengaturan > Info Bisnis checkbox "Tampilkan tanda tangan di invoice" stores `signature_show`. Invoice renders the image only when on AND `signature_url` set; off omits the whole block. `prefetchBrandAssets` skips the fetch while off.
- Pricelist dense mode (`pls-dense`, on when `Tampilkan deskripsi` is on): tighter rows, description clipped to one muted 13px line with ellipsis, name/price 19px — 26 items + descriptions still fit one 1080 × 1350 slide. Layout without descriptions unchanged.
- Harness states: 286 → **324 assertions** (paging 33, `signature_show` 5, mock seeds Settings id 16).

### Fixed

- Dashboard overlap on mobile (390px): `1fr` grid tracks inflated by `nowrap` dashboard text pushed rows past the card edges. `.grid-*` now `minmax(0,1fr)` ≤1100px, `today-item` wraps to a second line (badge + 40px maps button), Piutang/DP/recent rows get gap + `min-width:0`. Desktop verified byte-identical.

---

## 1.5 - 2026-10-21

### Added

- Regression harness in `harness/` (plain Node, no npm): `mock.js` loads the real `Code.gs` into a vm with in-memory Sheets seeds mirroring production (15 Settings keys, 26 Treatments, legacy numeric phones); `h1_read` (64), `h2_write` (78), `h3_packages` (88), `h4_crosscheck` (56). Run with `$env:TZ='Asia/Jakarta'; node harness\run_all.js`; an optional path argument runs a sabotaged copy to prove failures are caught.

- Searchable customer picker in `Tambah Jadwal` and `Tambah Paket NB`: type a name or phone digits (legacy phones match without the leading `0`), tap a result, arrow-key navigation. The native select stays hidden but keeps working, so `saveSchedule` / `saveSchedulePackage` are untouched.
- Invoice signature image: Settings key `signature_url` (backend + `Tanda Tangan URL` field with preview in Pengaturan). The invoice shows it above the dashed line with the business name as the label, only when set.
- Pricelist slides rebuilt compact: short header, two columns with a hairline divider, balanced split by measured height. The current catalog (26 treatments, 7 categories) fits one 1080 × 1350 image instead of 5; the preview shows `Akan dibuat N gambar...`.
- `Code.gs`: Settings allow-list and setup seed for `signature_url`.

### Fixed

- Customer picker showed legacy numeric phones raw (`82136267808`); the picker rows and the chip now format them with dashes (`0821-3626-7808`).

---

## 1.4 — 2026-10-21

Documentation and repo housekeeping.

### Added

- `Settings` key `signature_url` (seed id 15, empty by default): admin-only field for the invoice signature image, wired like `logo_url` / `qris_url`.
- Preview PNGs for the pricelist slides.

### Docs

- `daisafacare_architecture.md`: section 10 (brand assets) and section 11 (pricelist generator).
- `CHANGELOG.md` created from the work log.
- `prompt.txt`: all 25 request items marked `[done]`.

---

## 1.3 — 2026-10-21

Pricelist image generator.

### Added

- `Buat Gambar Pricelist` on the Pricelist page: 1080 × 1350 (4:5) PNG slides for WhatsApp, themes `Cream` and `Sage`.
- Pagination measured against real DOM height in an offscreen 1080 px stage; one `html2canvas` call per slide at `scale: 2`.
- Contact card on the last slide only; other slides get a continuation line and a `1/2` indicator.
- Options: title, second line, categories, duration, contact, note, description. Plus `Salin Caption`.
- iPhone shares all slides at once; other devices get a download overlay.

### Changed

- Duration ≥ 120 minutes shown as `6 jam`, hidden when the item name already states it.
- Category labels use Plus Jakarta Sans 800 — Playfair made `NB 1x` read as `NB ıx`.

### Fixed

- Dead space above the contact card on the last slide.
- `Simpan Gambar` unreachable at 390 px (sticky action row).

> No backend call added; `getTreatments` is reused.

---

## 1.2 — 2026-10-20

Brand assets: logo and QRIS.

### Added

- Logo in the sidebar, invoice header and print window.
- QRIS inside the invoice payment box, shown only while an amount is outstanding; a paid invoice shows `✓ Sudah dibayar`.
- `Logo URL` / `QRIS URL` in Pengaturan with live previews. Settings keys `logo_url`, `qris_url`; blank means the default image.

### Fixed

- Invoice export could capture a blank logo/QR because the images were lazy-loaded. Now `waitInvImages()` runs before `html2canvas`, capped at 2.5 s.

---

## 1.1 — 2026-10-20

Maps, sorting, search, quick customer.

### Added

- Map button on every `Jadwal Hari Ini` / `Jadwal Besok` row and in the Jadwal and Invoice tables, only when a link exists.
- `Urutkan` on Jadwal: newest, oldest, time, name A-Z, highest total.
- `Cari` on Jadwal: customer name, phone digits, invoice number, treatment, location — client-side, no reload.
- `+ Pelanggan Baru` inside the schedule and NB package modals; saves, selects, and prefills an empty location.

### Changed

- Calendar events sorted by time, blank time last.
- An odd last Dashboard card now spans the full width instead of leaving an empty cell.
- Jadwal `Treatment` column shows the real treatments, address underneath.

### Fixed

- `Tidak ada jadwal yang cocok` empty state, separate from `Belum ada jadwal`.

---

## 1.0 — 2026-10-20

Real spreadsheet schema, NB packages, DP invoice, no login.

### Added

- NB 1x / NB 2x packages (`createSchedulePackage`): one booking creates every visit row, one invoice per package on the master row, transport charged per visit (`perVisit × visits`), deleting the package removes every visit, package visits edit date/time/location/maps/notes only.
- Columns: `Schedules` W–AB (`Maps Link`, `Package ID`, `Package Name`, `Visit No`, `Total Visits`, `Master Schedule ID`), `Customers` N–O (`Tanggal Lahir`, `Maps Link`).
- Invoice DP as its own document (`printDpInvoiceById`, `invoice-dp-<no>.png`).
- `Ubah Jadwal` (`updateSchedule`): re-prices the booking, keeps the invoice number and the paid amount.
- Date of birth with automatic baby age; maps link per customer and per schedule (`Buka Maps`); `Jadwal Besok` dashboard card.

### Changed

- Login removed; the app boots as Admin through `getAppUser()` with a fallback user.
- Transport fee floors the distance to whole km first; `≤ 5 km` is free, otherwise `km × rate` (5,8 km free, 6,3 km = Rp 12.000, 27,6 km = Rp 54.000).
- Invoice numbers use the Settings key `last_invoice_no` as a high-water mark, so a deleted number is never reused.
- `Print` renamed to `Cetak`; payments no longer flip a booking to `done`.

### Fixed

- Numeric legacy phone numbers crashing the Pelanggan page.
- Category dropdown built from the data; `CASH` matched case-insensitively; `00:00` shown as blank.
- Mobile layout at 390 px (iPhone 12/13); invoice image export via `navigator.share`.

---

## How to deploy

1. Paste `Code.gs` and `index.html` into the Apps Script editor.
2. **Deploy → Manage deployments → Edit → Version: New version**.
3. Hard refresh the browser.

> **Warning:** never run `setupSheets()` on the real spreadsheet — it deletes all data.

## Files that are not the app

`invoice_daisafa_code.gs`, `invoice_daisafa_index.html` and the Wood Trading POS files are an old template.

## Known quirks (accepted, not bugs)

- Package visit rows show Rp 0; only the master row carries the money.
- Deleting a package keeps its DP `Payments` row (appears in Keuangan with an empty invoice number).
- Cancelling only visit 1 reverses the money; the other visits stay scheduled.
- Legacy `Schedule_Items` names still carry the `| Rp 85K` suffix.
- `Pendapatan Bulan Ini` is not capped at today.
