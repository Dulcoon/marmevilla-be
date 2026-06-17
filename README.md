<div align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="300" alt="Laravel Logo">
  <br>
  <h1>🌴 Marme Villa - Backend & Admin Console</h1>
  <p><strong>Sistem Manajemen Properti & Dasbor Admin Berbasis Laravel + React (Inertia.js)</strong></p>

  <p>
    <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-11-FF2D20.svg?style=flat&logo=laravel" alt="Laravel 11"></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react&logoColor=black" alt="React 18"></a>
    <a href="https://inertiajs.com"><img src="https://img.shields.io/badge/Inertia.js-Modern_Monolith-9553E9.svg?style=flat&logo=inertia" alt="Inertia.js"></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?style=flat&logo=tailwind-css" alt="Tailwind CSS"></a>
  </p>
</div>

---

## ✨ Tentang Proyek

**Marme Villa Backend** adalah inti dari sistem manajemen properti untuk *Javanese Villa Escapes*. Repositori ini tidak hanya menyediakan API yang tangguh, namun juga memiliki antarmuka (UI) Dasbor Admin *Full-stack* yang dibangun menggunakan konsep *Modern Monolith* (Inertia.js). 

Dengan arsitektur ini, Anda mendapatkan kecepatan dan *Developer Experience* (DX) dari **React (SPA)** tanpa kerumitan membangun REST API terpisah secara manual—seluruh *routing* dan otorisasi tetap ditangani secara elegan oleh **Laravel**.

## 🚀 Fitur Utama Dasbor Admin

Sistem admin dirancang dengan antarmuka yang sangat modern, bersih (UI premium), dan 100% responsif (termasuk *bottom-sheet modals* yang dioptimasi untuk sentuhan di layar HP).

- 🏡 **Manajemen Villa (CRUD)**: Kelola data villa, fasilitas, detail lokasi, dan galeri foto dengan sangat mudah.
- 💰 **Sistem Aturan Harga Cerdas**:
  - Penetapan *Base Price*.
  - *Toggle* otomatis untuk kenaikan harga di Akhir Pekan (*Weekend Premium*).
  - Manajemen aturan rentang tanggal khusus (*Custom Date Range*) untuk *High Season* / Libur Nasional (misal: Lebaran, Tahun Baru).
- 🎟️ **Manajemen Voucher Diskon**: 
  - Buat kode voucher promosi dengan potongan nominal (Rp).
  - Pembatasan masa aktif (*start & end date*) menggunakan *Range Date Picker*.
  - Kuota batas penggunaan voucher (*Usage Limits*).
  - *Tracking* jumlah pemakaian (*Redeemed*).

## 🛠️ Tech Stack

- **Framework**: [Laravel 11](https://laravel.com/)
- **Frontend Engine**: [Inertia.js](https://inertiajs.com/)
- **UI Library**: [React.js](https://reactjs.org/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Komponen**: *Custom Design System* + [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/) (Popovers, Calendars)
- **Bundler**: [Vite](https://vitejs.dev/)

---

## 💻 Panduan Instalasi (Development)

Untuk menjalankan proyek ini di *local machine* Anda, ikuti langkah-langkah berikut:

### Prasyarat
- PHP >= 8.2
- Composer
- Node.js & npm (Disarankan Node v18+)
- MySQL atau PostgreSQL

### Langkah-langkah

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/Dulcoon/marmevilla-be.git
   cd marmevilla-be
   ```

2. **Install dependensi PHP & Node.js:**
   ```bash
   composer install
   npm install
   ```

3. **Pengaturan Environment:**
   Salin file konfigurasi lalu buat *application key*:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Penting:* Jangan lupa atur konfigurasi *Database* Anda (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) di dalam file `.env`.

4. **Jalankan Migrasi Database:**
   ```bash
   php artisan migrate --seed
   ```
   *(Opsional)* `--seed` digunakan jika Anda sudah memiliki *Database Seeder* untuk data admin bawaan.

5. **Link Storage (Untuk Foto/Galeri):**
   ```bash
   php artisan storage:link
   ```

6. **Jalankan Server Lokal:**
   Anda perlu menjalankan **2 terminal** secara bersamaan.
   
   **Terminal 1 (Backend - PHP):**
   ```bash
   php artisan serve
   ```
   **Terminal 2 (Frontend - Vite):**
   ```bash
   npm run dev
   ```

7. **Akses Aplikasi:**
   Buka browser Anda dan kunjungi `http://127.0.0.1:8000/admin`.

---

## 🎨 Arsitektur & Bahasa Desain

Kami menerapkan bahasa desain antarmuka yang sangat spesifik dan seragam (*Unified Design Language*):
- Penggunaan warna *earth-tone* yang premium (Coklat Kopi, Emas/Mustard, Putih Bersih).
- Efek *Ghost Border* dan *Ambient Shadows* untuk menciptakan kesan *floating* (melayang) yang elegan pada kartu.
- Tipografi menggunakan **Manrope** (Headings) dan **Plus Jakarta Sans** (Body) untuk keterbacaan yang berkelas.
- Transisi *Micro-interactions* (seperti efek *scale down* pada tombol ketika ditekan).

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk memberikan pengalaman liburan terbaik.</p>
</div>
