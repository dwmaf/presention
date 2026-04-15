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

## Garis Besar Repo
Projek ini menggunakan Laravel (Backend), React (Frontend), Inertia (Komunikasi antar Laravel dan React sehingga laravel bisa tetap jadi controller biasa dan nda perlu jadi API), dan server C# yang akan dibuat nanti di folder local_services.

Untuk dokumentasi controller, models, server C# ada di file DOCUMENTATION.md di root. Untuk dokumentasi route" yang ada (di web.php) ada di ROUTE_DOCUMENTATION.md