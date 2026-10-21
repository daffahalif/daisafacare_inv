<div align="center">

<!-- 📸 Logo: upload ke `docs/images/logo.png`, lalu ganti 🌸 di bawah dengan:
     <img src="docs/images/logo.png" width="120" alt="DaisafaCare" /> -->
🌸

# DaisafaCare

**Mom & Baby Treatment · Homecare Booking, Invoices & Payments**

*Gentle care, happy baby, peaceful family — booked, priced and paid in one place.*

<br />

[![Made with](https://img.shields.io/badge/Made%20with-Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://script.google.com)
[![Database](https://img.shields.io/badge/Database-Google%20Sheets-34A853?logo=googlesheets&logoColor=white)](https://sheets.google.com)
[![Mobile](https://img.shields.io/badge/Perfect%20on-iPhone%2012%2F13-85957A)]()
[![Version](https://img.shields.io/badge/version-1.5-D4C2AA)](CHANGELOG.md)

</div>

---

## ✨ About

DaisafaCare runs the day-to-day of a mom & baby homecare in Surabaya: bookings,
customers, treatment packages, invoices, down payments, transport fees, and the
money trail behind them.

It is deliberately tiny — the whole app is **two files** on Google Apps Script with
a Google Sheet as the database. No server, no monthly bill, deploy is a copy-paste.

> `Code.gs` is the brain · `index.html` is the face.

The UI is **Indonesian** and every amount is in **Rupiah**, because the app is used
by one family business and its customers. Code comments are also mostly Indonesian.

## 🖼 Screenshots

<!-- 📸 Upload to `docs/images/…`, then replace each placeholder with a real image, e.g.:
     | ![Dashboard](docs/images/dashboard.png) | ![Jadwal](docs/images/jadwal.png) | -->

| Dashboard | Jadwal | Pelanggan | Invoice |
|:---:|:---:|:---:|:---:|
| 📸 *dashboard* | 📸 *schedule* | 📸 *customers* | 📸 *invoice* |

| Pricelist image | Paket NB | Keuangan | Pengaturan |
|:---:|:---:|:---:|:---:|
| 📸 *pricelist* | 📸 *paket NB* | 📸 *payments* | 📸 *settings* |

## 💚 Features

**Scheduling**
- Dashboard with **Jadwal Hari Ini / Jadwal Besok**, sorted by time, one tap to open maps
- List + calendar view, time-sorted, searchable and sortable
- **NB 1x / NB 2x packages**: one booking creates every daily visit automatically
  (NB 2x × 3 days → 6 visits at 07:00 & 15:30) while keeping **one invoice** per package
- Status changes only by buttons — payments never silently complete a visit

**Money**
- Invoices that print and export as an image (WhatsApp ready), with **QRIS** for payment
  and the owner's **signature image**
- **Invoice DP**: a separate document for down payments — tracked as a badge + a
  dashboard "Belum DP" list instead of a hard lock
- Transport fee with a fair rounding rule (see rules below)
- Reports, charts, and customer totals that always reconcile with payments

**Pricelist generator**
- One click turns the treatment catalog into a **1080 × 1350 (4:5) image** — two brand
  themes, balanced two columns, paginated only if the catalog truly grows
- Built for WhatsApp: `Simpan Gambar` shares every slide, `Salin Caption` copies the text

**Daily convenience**
- Customer picker with **type-to-search** (matches phone digits even without the leading 0)
- Automatic baby age, maps links per customer and per visit, per-visit notes
- **Pengaturan** holds the brand: logo, QRIS, signature, payment info, transport rate
- Role-aware (`admin` · `therapist` · `receptionist`; the app boots straight as admin on purpose)

## 🧬 Database — Google Sheets

<details>
<summary><b>Sheet structure</b> (click to expand)</summary>

| Sheet | Purpose |
|---|---|
| `Users` | users & roles |
| `Customers` | moms, baby name/DOB, totals, maps link |
| `Treatments` | catalog & canonical prices (26 active rows) |
| `Schedules` | 28 columns — visits, package columns `W…AB`, maps link |
| `Schedule_Items` | treatments per visit |
| `Payments` | money trail (`LUNAS TF/QRIS` · `DP` · `BELUM BAYAR`) |
| `Settings` | brand, transport rate, invoice prefix, asset URLs |
| `Activity_Logs` | audit trail |

> ⚠️ Never run `setupSheets()` on a live sheet — it rewrites the headers.

</details>

## 🧾 Rules built in

| Rule | Value |
|---|---|
| Transport fee | ≤ 5 km free · 5.8 → free · 6.3 → Rp 12.000 · 27.6 → Rp 54.000 |
| NB package | one invoice per package, kept by the master row; visits show Rp 0 |
| Invoice numbers | high-water mark — a deleted invoice never frees its number |
| Payment notes | `LUNAS TF/QRIS` · `DP` · `BELUM BAYAR` |
| Status | `scheduled` · `done` · `cancelled` — buttons only |

## 🚀 Getting started

1. Create a Google Sheet with the 8 sheets above (or an empty sheet, then
   `setupSheets()` **once** from the Apps Script editor).
2. Open **Extensions → Apps Script**, paste `Code.gs` and `index.html`.
3. To see any change: `Deploy → Manage deployments → Edit → Version: New version`.
4. Hard refresh the deployed web URL — that's it.

Working updates are documented in [CHANGELOG.md](CHANGELOG.md), business rules in
[daisafacare_architecture.md](daisafacare_architecture.md).

## 📁 Repo layout

```
├── Code.gs              backend — every endpoint, the pricing authority, invoice numbering
├── index.html           frontend — all pages, invoice renderer, pricelist generator
├── harness/             286-assertion regression suite · node harness/run_all.js
├── CHANGELOG.md         release history
├── daisafacare_architecture.md   the spec: sheet columns, serialization rules, quirks
└── docs/                images uploaded here (logo, screenshots)
```

> `invoice_daisafa_code.gs`, `invoice_daisafa_index.html` and the Wood Trading POS
> files are leftovers from an old template the app once grew out of — they are not
> part of the running app.

## 🎨 Brand

| | |
|---|---|
| ![Sage](https://img.shields.io/badge/Sage-%2385957A-85957A) | primary green |
| ![Beige](https://img.shields.io/badge/Beige-%23D4C2AA-D4C2AA) | warm beige |
| ![Cream](https://img.shields.io/badge/Cream-%23FCF7F1-FCF7F1) | cream base |
| | |
| Logo 🌸 · QRIS · tanda tangan | live in Pengaturan, no re-paste needed |

---

<div align="center">

Made with ♥ in Surabaya · powered by Google Apps Script + Sheets

</div>
