# 🚀 Panduan Setup & Instalasi Projek (Kripik Tempe Lakstari)

Dokumen ini berisi panduan lengkap untuk anggota tim baru dalam melakukan instalasi, konfigurasi environment, serta penyelarasan database agar aplikasi dapat berjalan di komputer lokal dengan tampilan dan data yang 100% sama.

---

## 📋 Prasyarat Sistem
Sebelum memulai, pastikan perangkat Anda telah terinstall:
- **Node.js** (v18 atau lebih baru)
- **PHP** (v8.1 atau lebih baru)
- **Composer**
- **Git**
- **MySQL / Web Server** (Laragon / XAMPP)

---

## 🛠️ Langkah 1: Clone Repository
Buka terminal (Git Bash / Command Prompt) dan jalankan perintah berikut:

```bash
# 1. Clone repository dari GitHub
git clone https://github.com/dhynnzz/kripik-tempe-lakstari.git

# 2. Masuk ke folder projek
cd kripik-tempe-lakstari

# 3. Pindah ke branch perbaikan UI & fitur terbaru
git checkout perbaikan-ui-admin
```

---

## 🎨 Langkah 2: Setup Frontend (React + Vite)
Jalankan perintah berikut di folder utama projek (`kripik-tempe-lakstari`):

```bash
# 1. Install seluruh package/library frontend
npm install

# 2. Jalankan server pengembang frontend
npm run dev
```
*Frontend akan berjalan pada: `http://localhost:5173/` (atau `http://localhost:5174/`)*

---

## ⚙️ Langkah 3: Setup Backend (Laravel)
Buka terminal baru, lalu masuk ke direktori `backend`:

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Install paket dependency PHP
composer install

# 3. Buat file konfigurasi .env dari template
cp .env.example .env

# 4. Generate Kunci Aplikasi Laravel
php artisan key:generate
```

---

## 🗄️ Langkah 4: Konfigurasi Database & Seeder
1. Buat database baru di MySQL (phpMyAdmin / Laragon / HeidiSQL) dengan nama:
   `kripik_tempe_lakstari`
2. Buka file `backend/.env` di text editor, pastikan baris berikut disesuaikan:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=kripik_tempe_lakstari
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Impor struktur tabel dan data sampel (produk, kategori, transaksi, admin) dengan menjalankan:
   ```bash
   # Jalankan skema tabel baru
   php artisan migrate:fresh

   # Jalankan seeder data sampel lengkap
   php artisan tinker seed_full.php
   ```

---

## 🚀 Langkah 5: Menjalankan Backend Server
Jalankan backend Laravel dengan perintah:

```bash
php artisan serve
```
*Backend API akan berjalan pada: `http://127.0.0.1:8000/`*

---

## ✅ Selesai!
Buka browser Anda di `http://localhost:5173/admin` untuk masuk ke halaman **Admin Portal Lakstari**. Semua data produk, kategori, dan pesanan kini 100% sama dengan tim pengembang utama.
