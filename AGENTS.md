# AGENTS.md

## Rules (must follow)

### Responses
- Keep answers short and simple, unless I ask for more.
- All text users see in the app must be in Indonesian.
- Money is in Rupiah (Rp).
- Use English for basic response. But for real case, variables, or data, use the real data

### Planning
- Always ask questions first. Never assume the design, tools, or features.
- Use sub-agents to research and to double-check the plan before showing it to me.

### Making changes
- Don't do the work yourself when possible. Use sub-agents.
- Split the plan into parts that can run in parallel, and act only as the coordinator.
- Use a strong model for hard tasks (like coding) and a cheaper one for easy tasks (like docs).
- After every change, check your work. This project has no automatic checks, so manually confirm that the front end and back end still match up.

### Data changes
- If you change the sheet columns, update everything that uses them (the column maps, the setup headers, and all code that reads or writes them).
- NEVER run `setupSheets()` on the real spreadsheet. It deletes all data.

### Testing
- Never assume a change works.
- This project has no test tools, so ask me whether to skip testing or whether I'll test it myself in the Apps Script editor.

---

## About this project

**DaisafaCare** is an app to manage bookings, customers, invoices, and payments for a mom & baby homecare business in Surabaya. It is built with Google Apps Script and uses Google Sheets as the database.

### The real app is only two files
- `Code.gs` is the backend.
- `index.html` is the whole front end (design and code in one file). Keep this name.
- Changes are pasted manually into the Apps Script editor. There is nothing to run locally.

### Files to ignore
- Do NOT edit `invoice_daisafa_code.gs`, `invoice_daisafa_index.html`, or the "Wood Trading POS" files. They are from an old template the app was based on, not the real app.
- `JADWAL DAISAFACARE.xlsx` is old business data, for reference only.

### What the app does
Pages: Login, Dashboard, Jadwal (schedule), Pelanggan (customers), Treatment catalog, Invoice, Keuangan (payments), Laporan (reports), Pengaturan (settings), Log Aktivitas (admin only).

### Users
Three roles: `admin`, `therapist`, `receptionist`. Any new feature that changes data must check the user's role.

### Business terms
- Treatment types: Baby, Kids, Mom, Jaga (babysitting).
- Booking status: scheduled, done, cancelled.
- Payment notes: `LUNAS TF/QRIS` (paid), `BELUM BAYAR` (unpaid), `DP` (down payment).
- A booking's total = treatment fee + transport fee (minus any discount).

### Data (Google Sheets)
Users, Customers, Treatments, Schedules, Schedule_Items, Payments, Settings, Activity_Logs.

### Design
- Use the brand colors: green `#85957A`, beige `#D4C2AA`, cream `#FCF7F1`. See `DAISAFA_PALETTE.png`.
- Invoices should look like `invoice daisafa.jpeg`: DAISAFACARE header, service table, payment info, signature. Users can print or save them as an image.
- Must work well on mobile.