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

### Dokumentasi
## lokasi server C# & SDK JS
1. Server C# nanti akan ditempatkan di folder local_services dan sdk js dari digital persona akan ditempatkan di folder public/vendor

## Keterangan Model, Controller, dan Resources yang Ada (Akan terus diupdate)
Projek ini menggunakan Laravel (Backend), React (Frontend), Inertia (Komunikasi antar Laravel dan React sehingga laravel bisa tetap jadi controller biasa dan nda perlu jadi API), dan server C# yang akan dibuat nanti di folder local_services.
1. **resources/js/Pages/FingerprintEnrollment.jsx**
    File ini adalah ui untuk mendaftarkan data fingerprint_data ke tabel fingerprints
2. **app/Http/Controllers/FingerprintController.php**
    Controller ini menangani untuk menampilkan halaman pendaftaran data fingerprint_data dan menyimpan data tersebut ke database
3. **app/Models/Fingerprint.php**
    Ini adalah model dari tabel fingerprints, isinya ada intern_id (relasi ke tabel intern), fingerprint_data (data feature set dari sidik jari yang didaftarin).
4. **app/Models/Intern.php**
    Ini adalah model dari tabel intern, isinya adalah nama dan divisi, tabel ini untuk menyimpan data mahasiswa yang magang di UPA.

## Daftar Route yang Sudah Ada (Akan Terus diupdate)
| HTTP Method | URI | Nama Route | Deskripsi |
| :--- | :--- | :--- | :--- |
| **GET** | `/fingerprint/enroll` | `fingerprint.enroll` | Menampilkan antarmuka pendaftaran sidik jari. |