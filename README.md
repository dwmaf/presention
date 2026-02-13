## Migrate Ulang (ada penambahan tabel database dan seeding)
```
php artisan migrate:fresh --seed
```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd presention
    ```

2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```

3.  **Install Frontend dependencies:**
    ```bash
    npm install && npm run build
    ```

4.  **Environment Setup:**
    Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi database Anda.
    ```bash
    cp .env.example .env
    ```

5.  **Generate Application Key:**
    ```bash
    php artisan key:generate
    ```

6.  **Run Migrations:**
    ```bash
    php artisan migrate
    ```

## Running the Project

1.  **Start the local development server:**
    ```bash
    php artisan serve
    ```

2.  **Start Vite (untuk development frontend):**
    ```bash
    npm run dev
    ```

3.  **Start keduanya langsung**
    ```bash
    composer run dev
    ```

Akses aplikasi di browser melalui `http://127.0.0.1:8000`.

# Dokumentasi
## lokasi server C# & SDK JS
1. Server C# nanti akan ditempatkan di folder local_services dan sdk js dari digital persona akan ditempatkan di folder public/vendor

## Server :5000, server C# yang akan menangani logic verification sidik jari
1. **Buka terminal baru dan masuk ke path local_services**
    ```bash
    cd .\local_services\
    ```

2. Jalankan command berikut untuk membuat file FingerprintService.exe
    ```bash
    C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /target:winexe /out:FingerprintBridge.exe /r:System.Runtime.Serialization.dll /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:"$PWD\DPUruNet.dll" FingerprintService.cs
    ```

3. Pasang device, double click file FingerprintSerivce.exe, dan web sudah siap untuk mendaftarkan dan tes fingerprint.

## Fitur yang Sudah Ada (Akan terus diupdate)
Projek ini menggunakan Laravel (Backend), React (Frontend), Inertia (Komunikasi antar Laravel dan React sehingga laravel bisa tetap jadi controller biasa dan nda perlu jadi API), dan server C# yang akan dibuat nanti di folder local_services.

1. **Mengelola Divisi**
routenya /divisions, di halaman ini bisa menambah, mengedit, dan menghapus divisi yang ada (Tidak akan bisa hapus jika ada intern yang berelasi ke divisi tersebut). dibuat untuk menjaga integritas data, walau tidak akan pernah diubah, datanya sudah ada di DatabaseSeeder.php. Controllernya adalah DivisionController.php, di situ ada function index, store, update, destroy. File ui nya adalah resources/js/Pages/Division.jsx. Perlu login untuk akses halaman ini, kredensialnya terdapat di DatabaseSeeder.php.

2. **Mengelola Intern**
routenya /interns, di halaman ini bisa menambah, mengedit, dan menghapus data intern (nama, barcode, divisi, dan foto). bbrp datanya sudah ada di DatabaseSeeder.php. Controllernya adalah InternController.php, di situ ada function index, store, update, destroy. File ui nya adalah resources/js/Pages/Division.jsx, di situ menampilkan daftar intern, ada tombol untuk atur fingerprint yang akan mengarah ke /interns/{intern}/fingerprint, di situ nanti fingerprint akan didaftarkan. Perlu login untuk akses halaman ini, kredensialnya terdapat di DatabaseSeeder.php.

3. **Mendaftarkan fingerprint untuk intern**
routenya adalah /interns/{intern}/fingerprint, bisa diakses jika masuk ke /interns dan menekan tombol atur fingerprint. di situ ada tombol mulai scan, ditekan, kemudian taruh jempol ke device HID, kemudian jika device berhasil mendeteksi sidik jari, ada feedback ✓ Data sidik jari berhasil diambil, kemudian tekan tombol Simpan ke Database, dan akan diarahkan kembali ke /interns. Controllernya adalah FingerprintController.php dan file ui nya adalah FingerprintEnrollment.jsx.

4. **Fitur Presensi**
routenya adalah /attendace, tidak perlu login, controllernya AttendanceController.php dan file ui nya adalah Attendance.jsx, file modelnya adalah Attendance.php. Silahkan coba sendiri, jika ada flaw dalam logic nya. Belum bisa dengan fingerprint.

5. **Tes Kecocokan**
routenya adalah /test-fingerprint, tidak perlu login, sejauh ini sudah berhasil coba tes sidik jari dikomparasi dgn sidik jari yang ada di database. File controllernya adalah TesKomparasiSidikJariController.php, tugasnya membawa data semua intern yg ada fingerprintnya di db, kemudin file ui nya adalah FingerprintTest.jsx.

### Fitur yang belum ada tertera di file FUTURE_DEV.md