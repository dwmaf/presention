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

## Fitur yang Sudah Ada (Akan terus diupdate)
Projek ini menggunakan Laravel (Backend), React (Frontend), Inertia (Komunikasi antar Laravel dan React sehingga laravel bisa tetap jadi controller biasa dan nda perlu jadi API), dan server C# yang akan dibuat nanti di folder local_services.
1. **Mengelola Divisi**
routenya /divisions, di halaman ini bisa menambah, mengedit, dan menghapus divisi yang ada (Tidak akan bisa hapus jika ada intern yang berelasi ke divisi tersebut). dibuat untuk menjaga integritas data, walau tidak akan pernah diubah, datanya sudah ada di DatabaseSeeder.php. Controllernya adalah DivisionController.php, di situ ada function index, store, update, destroy. File ui nya adalah resources/js/Pages/Division.jsx. Perlu login untuk akses halaman ini, kredensialnya terdapat di DatabaseSeeder.php.

2. **Mengelola Intern**
routenya /interns, di halaman ini bisa menambah, mengedit, dan menghapus data intern (nama, barcode, divisi, dan foto). bbrp datanya sudah ada di DatabaseSeeder.php. Controllernya adalah InternController.php, di situ ada function index, store, update, destroy. File ui nya adalah resources/js/Pages/Division.jsx, di situ menampilkan daftar intern, ada tombol untuk atur fingerprint yang akan mengarah ke /interns/{intern}/fingerprint, di situ nanti fingerprint akan didaftarkan. Perlu login untuk akses halaman ini, kredensialnya terdapat di DatabaseSeeder.php.

3. **Mendaftarkan fingerprint untuk intern**
routenya adalah /interns/{intern}/fingerprint, bisa diakses jika masuk ke /interns dan menekan tombol atur fingerprint. di situ ada tombol mulai scan, ditekan, kemudian taruh jempol ke device HID, kemudian jika device berhasil mendeteksi sidik jari, ada feedback ✓ Data sidik jari berhasil diambil, kemudian tekan tombol Simpan ke Database, dan akan diarahkan kembali ke /interns.

### Fitur yang belum ada tertera di file FUTURE_DEV.md