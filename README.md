# Note Tabungan: Your Financial Journey

Build a production-ready, highly polished, fully responsive Mobile-First Financial Management Web Application named "NOTE TABUNGAN" using React, Tailwind CSS, Lucide Icons, and Supabase (Auth & Database).

=== 1. BRANDING & VISUAL SYSTEM (LUXURY GLASSMORPHISM) ===

- App background: soft grayish-blue (#F4F6F9) across all screens — no harsh black/contrasting section cuts.

- Primary accent & card headers: deep navy gradient (#0D253A → #163C5E) with subtle wave/geometric pattern overlay.

- Secondary accent / active indicators: metallic royal gold (#D4AF37).

- Transaction colors: success green (#10B981) for income/deposits, expense red (#EF4444) for outcomes/withdrawals.

- Typography: Inter or Poppins, clear hierarchy, generous padding, clean native iOS/Android feel.

- Cards use soft shadows + rounded corners (glassmorphic style), avoid clutter.

=== 2. AUTHENTICATION (SUPABASE EMAIL & PASSWORD) ===

- No PIN or biometric overlays.

- Tabbed Login/Register view.

- Header: deep navy background, gold "NOTE TABUNGAN" logo, subtitle "Selamat Datang Kembali".

- Login form: Email input (envelope icon), Password input (lock icon + eye toggle), wide gold "MASUK / LOGIN" button, "Lupa Kata Sandi?" and "Belum punya akun? Daftar" links.

- Register form: Full Name, Email, Password, "Daftar Akun" button.

- Backend: supabase.auth.signInWithPassword() and supabase.auth.signUp().

=== 3. NAVIGATION (4 FIXED BOTTOM TABS) ===

Fixed glassmorphic bottom nav on all main screens:

1. Beranda (Home Dashboard)

2. Impian (Savings Goals Manager)

3. Mutasi (Transaction History & Search)

4. Profil (Account & Security Settings)

- Active tab: icon + label highlighted gold (#D4AF37); inactive: muted gray.

=== 4. SCREEN SPECIFICATIONS ===

[SCREEN 1 — BERANDA]

- Header: gold "NOTE TABUNGAN" title, notification bell icon, user avatar (photo).

- Top balance summary: "Total Seluruh Tabungan" with formatted total (e.g. "Rp 28.450.000") + eye icon to show/hide value.

- Swipeable multi-bank card carousel:

  - Navy gradient card per bank: account holder name, bank name (SeaBank/BCA/Mandiri/etc.), account number (with 1-click copy button), card balance.

  - Inline "Masuk Hari Ini" (green) and "Keluar Hari Ini" (red) mini summary.

  - Page indicator dots below cards + "+ Tambah Rekening" action.

- Action buttons (50/50 split): "Saldo Masuk" (light green #ECFDF5, '+' icon → Income Modal) and "Saldo Keluar" (light red #FEF2F2, '-' icon → Expense Modal).

- Target Impian widget: preview of active savings goal with progress bar (e.g. "Liburan Bali — 45% (Rp 5.230.000 / Rp 12.000.000)") + "+ Tambah Impian" quick action.

- Recent transactions list: last 3–4 items with status icon, category, date, color-coded amount.

[SCREEN 2 — IMPIAN (SAVINGS GOALS)]

- Header: "Halaman Impian Saya" + "+ Buat Impian Baru" button.

- Goal cards with thumbnail image/icon per goal (e.g. "Beli Laptop ASUS TUF", "Liburan Bali", "Dana Darurat").

- Each card shows: collected vs target amount (e.g. "Rp 7.500.000 / Rp 15.000.000"), percentage badge, progress bar, target date.

- "Setor Tabungan" button per card to allocate funds from a selected bank account.

[SCREEN 3 — MUTASI (TRANSACTION HISTORY)]

- Header: "Riwayat Mutasi" + real-time search input ("Cari transaksi...").

- Scrollable bank filter pills: [Semua Bank] [SeaBank] [BCA] [Mandiri].

- Transactions grouped by date (e.g. "Hari Ini - 13 Sep 2026", "Kemarin - 12 Sep 2026").

- Each row: direction icon (green ↓ for in / red ↑ for out), transaction name, source bank, timestamp, formatted amount. Include recurring/automatic entries such as "Bunga Tabungan" (interest credit).

[SCREEN 4 — PROFIL]

- Navy header: avatar photo, user name, green "Cloud Synced" status badge.

- Settings list:

  1. "Kelola Rekening Bank" — add/edit multi-bank accounts & custom colors.

  2. "Keamanan Kata Sandi" — update Supabase password.

  3. "Export Data Transaksi" — download CSV/PDF summary.

- Prominent red "Logout / Keluar" button at bottom with exit-door icon. On tap: supabase.auth.signOut() then redirect immediately to Login screen.

=== 5. DATABASE & LOGIC (SUPABASE) ===

Tables: profiles, bank_accounts, transactions, savings_goals.

- Single-user application — no need for multi-tenant access control or role-based permissions.

- Income/Expense modals: fields for Amount, Category, Date, Note, and Account Selector dropdown (which bank balance to update).

- All derived values (Total Balance, per-Bank Balance, Goal %, Transaction Log) must recalculate and update in real time after any CRUD operation.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0d7b0ee4-948f-4db1-80e0-87fb5098bc92).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
