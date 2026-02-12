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


## lokasi server C# & SDK JS
1. Server C# nanti akan ditempatkan di folder local_services dan sdk js dari digital persona akan ditempatkan di folder public/vendor