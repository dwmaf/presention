# Dokumentasi Controller Utama

Dokumen ini menjelaskan controller yang ada di project ini secara lebih rinci, termasuk fungsi utama, alur kerja method, data yang diterima, dan catatan apakah controller tersebut bersifat produksi, legacy, atau testing.

## Ringkasan Struktur

- `app/Http/Controllers/` berisi controller utama aplikasi.
- `app/Http/Controllers/Auth/` berisi controller autentikasi bawaan Laravel.
- `app/Http/Controllers/TesPresensi/` berisi controller khusus pengujian, eksperimen, dan legacy untuk presensi serta fingerprint.
- `TesKomparasiSidikJariController.php` adalah file testing untuk komparasi sidik jari, bukan controller utama produksi.

## 1. Controller Utama

### `Controller.php`
Lokasi: `app/Http/Controllers/Controller.php`

Base controller untuk seluruh controller lain di project ini. Saat ini tidak berisi logika bisnis khusus dan berfungsi sebagai kelas induk umum agar controller lain tetap mengikuti struktur Laravel yang konsisten.

### `AdminFingerprintController.php`
Lokasi: `app/Http/Controllers/AdminFingerprintController.php`

Controller ini menangani enrollment sidik jari untuk user admin yang sedang login. Tujuannya adalah menyimpan dan mengelola fingerprint admin dalam dua grup template, yaitu `primary` dan `backup`.

#### Fungsi yang tersedia

**`index()`**
- Fungsi: menampilkan halaman enrollment fingerprint admin.
- Alur: mengambil user yang sedang login dari `Auth::user()`, lalu membangun status 6 slot fingerprint berdasarkan ada atau tidaknya data di masing-masing kolom fingerprint.
- Data yang dikirim ke frontend:
	- `fingerStatus`: status boolean untuk `fingerprint_1` sampai `fingerprint_6`.
	- `userName`: nama user admin.
- Return: render Inertia ke halaman `Profile/AdminFingerprintEnrollment`.

**`storeGroup(Request $request)`**
- Fungsi: menyimpan 3 template fingerprint sekaligus untuk grup tertentu.
- Payload:
	- `group`: wajib, nilainya hanya `primary` atau `backup`.
	- `samples`: array berisi 3 string fingerprint.
- Alur:
	- validasi input,
	- menentukan kolom target berdasarkan grup,
	- mengecek apakah salah satu kolom sudah terisi,
	- jika sudah ada data, proses dibatalkan agar tidak menimpa template lama,
	- jika kosong, data disimpan ke 3 kolom sekaligus.
- Catatan: method ini sengaja mencegah overwrite tanpa reset lebih dulu.

**`resetGroup(Request $request)`**
- Fungsi: mengosongkan 3 kolom fingerprint untuk grup tertentu.
- Payload:
	- `group`: wajib, `primary` atau `backup`.
- Alur:
	- validasi grup,
	- menentukan daftar kolom yang harus direset,
	- mengisi ketiga kolom dengan `null`.
- Return: redirect back dengan pesan sukses.

### `AttendanceController.php`
Lokasi: `app/Http/Controllers/AttendanceController.php`

Controller ini mengelola absensi intern, dashboard kehadiran, ekspor CSV, update status, dan logika poin terkait presensi. Ini adalah salah satu controller inti aplikasi.

#### Fungsi yang tersedia

**`index(Request $request)`**
- Fungsi: menampilkan daftar absensi untuk tanggal tertentu.
- Input utama:
	- query `date`, opsional. Jika kosong, default ke hari ini.
- Alur:
	- menentukan tanggal yang dipilih,
	- bila tanggal yang dipilih adalah hari ini, sistem memicu generator absensi harian,
	- menentukan hari kerja berdasarkan tanggal,
	- mengambil intern aktif yang jadwalnya sesuai hari tersebut,
	- memuat attendance intern untuk tanggal yang dipilih,
	- mengumpulkan fingerprint admin dan fingerprint database intern untuk dipakai scanner frontend.
- Output:
	- `interns`
	- `selectedDate`
	- `adminFingerprints`
	- `hariIni`
	- `fingerprintDatabase`

**`dashboard(Request $request)`**
- Fungsi: menampilkan ringkasan statistik absensi intern dalam rentang tanggal tertentu.
- Input:
	- `start_date`
	- `end_date`
- Alur:
	- mengambil intern aktif beserta attendance dalam rentang waktu,
	- menghitung jumlah hadir, izin, sakit, alpha, dan total jam kerja,
	- menyusun data statistik per intern untuk ditampilkan di dashboard.
- Return: render Inertia ke halaman `Dashboard`.

**`exportDashboardCsv(Request $request)`**
- Fungsi: mengekspor ringkasan dashboard ke file CSV.
- Input:
	- `start_date`
	- `end_date`
- Alur:
	- menghitung data statistik seperti pada dashboard,
	- membangun CSV di memory,
	- mengirim file CSV sebagai download.

**`updateStatus(Request $request, Attendance $attendance)`**
- Fungsi: mengubah status attendance tertentu.
- Payload:
	- `status`: `hadir`, `izin`, `sakit`, atau `alpha`.
- Alur:
	- validasi status,
	- update status attendance,
	- menyesuaikan poin intern bila status berubah dari atau ke `alpha`.
- Catatan: update poin dibatasi agar tidak melebihi 5 dan tidak kurang dari 0.

**`updateCheckOut(Request $request, Attendance $attendance)`**
- Fungsi: memperbarui jam pulang attendance.
- Payload:
	- `check_out`: opsional, format jam `H:i`.
- Return: redirect back dengan pesan sukses.

**`store(Request $request)`**
- Fungsi: menyimpan presensi dan menjalankan logika reset poin bulanan.
- Alur penting:
	- bila hari ini tanggal 1, sistem mengecek apakah reset poin bulan ini sudah pernah dilakukan,
	- jika belum, sistem membuat flag log di `SystemLog` dalam transaksi database,
	- setelah itu proses presensi berjalan sesuai alur attendance yang berlaku.
- Catatan: method ini berisi logika penting yang menghindari reset poin ganda.

**Method tambahan terkait generator**
- Di dalam controller ini terdapat mekanisme pembangkit attendance harian untuk status `alpha`.
- Fungsinya memastikan intern yang seharusnya masuk pada hari tertentu tetap punya record attendance meskipun belum melakukan presensi manual.

### `DivisionController.php`
Lokasi: `app/Http/Controllers/DivisionController.php`

Controller ini mengelola data divisi dan relasi intern ke divisi.

#### Fungsi yang tersedia

**`index()`**
- Fungsi: menampilkan daftar divisi beserta intern yang tergabung.
- Data tambahan: mengambil semua intern untuk kebutuhan assignment ke divisi.

**`assignIntern(Division $division, Request $request)`**
- Fungsi: menambahkan intern ke divisi tertentu.
- Payload:
	- `intern_id`: wajib dan harus valid di tabel interns.
- Alur: validasi intern, lalu update `division_id` pada record intern.

**`removeIntern(Division $division, Intern $intern)`**
- Fungsi: menghapus intern dari divisi tertentu.
- Alur: hanya mengosongkan `division_id` jika intern memang sedang berada di divisi tersebut.

**`store(Request $request)`**
- Fungsi: membuat divisi baru.
- Payload:
	- `nama_divisi`
	- `deskripsi` opsional

**`update(Request $request, Division $division)`**
- Fungsi: memperbarui data divisi yang sudah ada.

**`destroy(Division $division)`**
- Fungsi: menghapus divisi.
- Catatan penting: penghapusan diblok jika masih ada intern yang terhubung ke divisi tersebut.

### `FingerprintController.php`
Lokasi: `app/Http/Controllers/FingerprintController.php`

Controller fingerprint versi lama untuk intern. Ini masih dipakai untuk alur enrollment lama yang hanya menyimpan satu template fingerprint.

#### Fungsi yang tersedia

**`index(Intern $intern)`**
- Fungsi: menampilkan halaman enrollment fingerprint untuk satu intern.
- Return: render Inertia ke halaman `FingerprintEnrollment`.

**`store(Request $request, Intern $intern)`**
- Fungsi: menyimpan satu template fingerprint ke kolom `fingerprint_data`.
- Payload:
	- `fingerprint_data`: string fingerprint.
- Catatan: method ini menimpa data lama karena desain awal memang hanya satu slot.

### `InternController.php`
Lokasi: `app/Http/Controllers/InternController.php`

Controller inti untuk mengelola data intern atau karyawan magang. Controller ini menangani data master intern, foto, jadwal, toleransi, ekspor absensi, dan penghapusan data.

#### Fungsi yang tersedia

**`index()`**
- Fungsi: menampilkan daftar intern beserta divisi dan data attendance mereka.

**`store(Request $request)`**
- Fungsi: membuat data intern baru.
- Payload:
	- `name`
	- `division_id`
	- `barcode` opsional
	- `foto` opsional
	- jadwal `senin`, `selasa`, `rabu`, `kamis`, `jumat`
	- `poin` opsional
- Alur:
	- validasi input,
	- checkbox jadwal diubah menjadi boolean pasti,
	- jika ada foto, file disimpan ke storage public,
	- data intern dibuat di database.

**`update(Request $request, Intern $intern)`**
- Fungsi: memperbarui data intern.
- Catatan penting:
	- validasi barcode dibuat unik terhadap intern lain,
	- foto lama dihapus jika diganti,
	- jika tidak ada foto baru, nilai foto lama tidak dihapus.

**`updatePhoto(Request $request, Intern $intern)`**
- Fungsi: mengganti foto intern secara terpisah.
- Payload:
	- `foto`: file gambar.

**`updateToleransi(Request $request, Intern $intern)`**
- Fungsi: menyimpan pengaturan toleransi keterlambatan per hari.
- Payload:
	- `senin.checked`, `senin.time`
	- `selasa.checked`, `selasa.time`
	- `rabu.checked`, `rabu.time`
	- `kamis.checked`, `kamis.time`
	- `jumat.checked`, `jumat.time`
- Alur: mengubah data dari frontend ke kolom toleransi hari yang sesuai.

**`exportAttendanceCsv(Intern $intern)`**
- Fungsi: mengekspor riwayat absensi intern ke CSV.
- Isi file CSV:
	- daftar attendance per tanggal,
	- ringkasan total hadir, izin, sakit, alpha, total jam, dan rata-rata jam masuk/pulang.

**`destroy(Intern $intern)`**
- Fungsi: menghapus intern.
- Alur:
	- hapus foto dari storage jika ada,
	- hapus semua attendance terkait,
	- hapus data intern.

**`resetPoints()`**
- Fungsi: mengatur poin semua intern menjadi 5.
- Catatan: method ini bekerja secara global pada seluruh data intern.

### `ProfileController.php`
Lokasi: `app/Http/Controllers/ProfileController.php`

Controller standar Laravel Breeze untuk pengelolaan profil user yang sedang login.

#### Fungsi yang tersedia

**`edit(Request $request)`**
- Fungsi: menampilkan form edit profil.
- Data yang dikirim:
	- apakah user wajib verifikasi email,
	- status flash session.

**`update(ProfileUpdateRequest $request)`**
- Fungsi: memperbarui informasi profil user.
- Alur:
	- validasi menggunakan request khusus,
	- jika email berubah, status verifikasi email direset,
	- data disimpan.

**`destroy(Request $request)`**
- Fungsi: menghapus akun user.
- Payload:
	- `password` dengan rule `current_password`.
- Alur:
	- validasi password,
	- logout,
	- hapus user,
	- invalidate session.

### `TesKomparasiSidikJariController.php`
Lokasi: `app/Http/Controllers/TesKomparasiSidikJariController.php`

Controller ini khusus testing untuk komparasi sidik jari. Statusnya bukan controller produksi utama.

#### Fungsi yang tersedia

**`index()`**
- Fungsi: mengambil intern yang memiliki fingerprint lalu mengirimnya ke halaman testing.
- Alur:
	- mengambil intern yang `fingerprint_data`-nya tidak kosong,
	- memetakan data menjadi format sederhana untuk frontend,
	- render Inertia ke halaman `FingerprintTest`.

#### Catatan
- File ini dipakai untuk pengujian komparasi fingerprint.
- Jangan menganggapnya sebagai jalur utama enrollment atau presensi produksi.

# Dokumentasi Models

Bagian ini menjelaskan model-model Eloquent yang dipakai aplikasi. Model menjadi penghubung utama antara controller dan tabel database, jadi penjelasannya penting untuk memahami alur data keseluruhan.

### `Attendance.php`
Lokasi: `app/Models/Attendance.php`

Model ini merepresentasikan satu baris data absensi intern per tanggal. Isinya bukan hanya data mentah, tetapi juga accessor tambahan untuk tampilan frontend.

#### Struktur data utama

- `intern_id`: relasi ke intern.
- `date`: tanggal absensi.
- `check_in`: jam masuk.
- `check_out`: jam pulang.
- `status`: status kehadiran seperti `hadir`, `izin`, `sakit`, atau `alpha`.

#### Properti penting

- `fillable`: membatasi atribut yang boleh diisi mass assignment.
- `casts`:
	- `date` diperlakukan sebagai tanggal.
- `appends`:
	- `hari`
	- `terlambat`

#### Fungsi / accessor yang tersedia

**`getTerlambatAttribute()`**
- Fungsi: menghitung keterlambatan dalam menit.
- Alur:
	- hanya dihitung jika `check_in` ada dan status adalah `hadir`,
	- membandingkan jam masuk dengan deadline pukul 08:30,
	- jika check-in lebih lambat dari deadline, hasil selisih menit dikembalikan.
- Output: integer menit keterlambatan atau `null`.

**`getDateAttribute($value)`**
- Fungsi: memformat tanggal ke format Indonesia, misalnya `13 April 2026`.
- Catatan: accessor ini membuat nilai `date` yang dibaca dari model langsung tampil lebih ramah untuk UI.

**`getHariAttribute()`**
- Fungsi: menampilkan nama hari dari tanggal attendance dalam bahasa Indonesia.
- Output contoh: `senin`, `selasa`, dan seterusnya sesuai locale.

#### Relasi

**`intern()`**
- Tipe relasi: `belongsTo(Intern::class)`.
- Arti: satu attendance milik satu intern.

### `Division.php`
Lokasi: `app/Models/Division.php`

Model ini merepresentasikan divisi atau unit kerja tempat intern ditempatkan.

#### Struktur data utama

- `nama_divisi`
- `deskripsi`

#### Properti penting

- `fillable`: hanya dua kolom di atas yang bisa diisi secara mass assignment.

#### Relasi

**`interns()`**
- Tipe relasi: `hasMany(Intern::class)`.
- Arti: satu divisi bisa memiliki banyak intern.

### `Fingerprint.php`
Lokasi: `app/Models/Fingerprint.php`

Model ini adalah model sederhana untuk menyimpan fingerprint. Dari isi file, model ini tampak dipakai sebagai penampung data fingerprint generik yang berelasi dengan user atau intern, tergantung kebutuhan implementasi.

#### Struktur data utama

- `user_id`
- `user_name`
- `fingerprint_data`

#### Properti penting

- `fillable`: mengizinkan mass assignment untuk data fingerprint dasar.
- `HasFactory`: mendukung pembuatan data dummy melalui factory.

#### Catatan

- Model ini paling sederhana dibanding model lain.
- Jika alur fingerprint di project sudah sepenuhnya memakai kolom fingerprint pada `User` atau `Intern`, model ini bisa jadi hanya model pendukung atau cadangan.

### `Intern.php`
Lokasi: `app/Models/Intern.php`

Model inti untuk data intern atau karyawan magang. Model ini punya banyak relasi, cast, dan accessor statistik yang dipakai langsung oleh controller dashboard, attendance, dan ekspor CSV.

#### Struktur data utama

- Identitas:
	- `name`
	- `division_id`
	- `is_active`
	- `foto`
	- `barcode`
- Fingerprint:
	- `fingerprint_data`
	- `second_fingerprint_data`
	- `fingerprint_data_3`
	- `fingerprint_data_4`
	- `fingerprint_data_5`
	- `fingerprint_data_6`
- Jadwal kerja:
	- `senin`
	- `selasa`
	- `rabu`
	- `kamis`
	- `jumat`
- Poin dan toleransi:
	- `poin`
	- `toleransi_senin`
	- `toleransi_selasa`
	- `toleransi_rabu`
	- `toleransi_kamis`
	- `toleransi_jumat`
	- waktu toleransi masing-masing hari

#### Properti penting

- `fillable`: semua kolom yang boleh diisi oleh controller.
- `casts`:
	- `is_active` sebagai boolean,
	- jadwal hari sebagai boolean,
	- `poin` sebagai integer.
- `appends`:
	- `total_kehadiran`
	- `total_jam`
	- `total_izin`
	- `total_sakit`
	- `total_alpha`
	- `avg_jam_masuk`
	- `avg_jam_pulang`
	- `latest_attendance`

#### Relasi

**`fingerprint()`**
- Tipe relasi: `hasOne(Fingerprint::class)`.
- Arti: intern dapat dihubungkan dengan satu fingerprint generik.

**`division()`**
- Tipe relasi: `belongsTo(Division::class)`.
- Arti: setiap intern berada pada satu divisi.

**`attendances()`**
- Tipe relasi: `hasMany(Attendance::class)`.
- Urutan: diurutkan dari tanggal terbaru ke lama.
- Arti: satu intern memiliki banyak catatan attendance.

**`latestAttendance()`**
- Tipe relasi: `hasOne(Attendance::class)->latestOfMany()`.
- Arti: mengambil attendance paling baru secara langsung.

#### Fungsi / accessor statistik

**`getLatestAttendanceAttribute()`**
- Fungsi: mengembalikan attendance terbaru milik intern.

**`getTotalKehadiranAttribute()`**
- Fungsi: menghitung jumlah attendance dengan status `hadir`.

**`getTotalJamAttribute()`**
- Fungsi: menghitung total jam kerja dari attendance yang statusnya `hadir` dan memiliki `check_in` serta `check_out`.
- Output: dibulatkan ke 2 desimal.

**`getTotalIzinAttribute()`**
- Fungsi: menghitung jumlah attendance dengan status `izin`.

**`getTotalSakitAttribute()`**
- Fungsi: menghitung jumlah attendance dengan status `sakit`.

**`getTotalAlphaAttribute()`**
- Fungsi: menghitung jumlah attendance dengan status `alpha`.

**`getAvgJamMasukAttribute()`**
- Fungsi: menghitung rata-rata jam masuk dari attendance `hadir`.
- Output: format jam `H:i`, atau `-` jika belum ada data.

**`getAvgJamPulangAttribute()`**
- Fungsi: menghitung rata-rata jam pulang dari attendance `hadir`.
- Output: format jam `H:i`, atau `-` jika belum ada data.

#### Catatan

- Model ini adalah pusat banyak fitur laporan.
- Banyak controller mengambil data statistik dari accessor model ini, bukan menghitungnya ulang secara manual.

### `SystemLog.php`
Lokasi: `app/Models/SystemLog.php`

Model ini dipakai sebagai log ringan untuk menandai aksi sistem tertentu yang harus hanya dieksekusi sekali per periode.

#### Struktur data utama

- `action_name`
- `executed_at`

#### Properti penting

- `fillable`: hanya dua kolom di atas yang dapat diisi mass assignment.

#### Catatan penggunaan

- Model ini dipakai untuk menyimpan flag, misalnya penanda reset poin bulanan.
- Dengan pola ini, sistem bisa mengecek apakah suatu aksi sudah pernah dilakukan tanpa membuat tabel log yang terlalu kompleks.

### `User.php`
Lokasi: `app/Models/User.php`

Model autentikasi utama aplikasi. User dipakai untuk login admin, menyimpan fingerprint admin, dan mengelola sesi autentikasi Laravel.

#### Struktur data utama

- `name`
- `email`
- `password`
- `fingerprint_1`
- `fingerprint_2`
- `fingerprint_3`
- `fingerprint_4`
- `fingerprint_5`
- `fingerprint_6`

#### Properti penting

- `fillable`: atribut yang boleh diisi langsung.
- `hidden`:
	- `password`
	- `remember_token`
- `casts()`:
	- `email_verified_at` sebagai `datetime`,
	- `password` sebagai `hashed`.

#### Relasi

**`fingerprint()`**
- Tipe relasi: `hasOne(Fingerprint::class)`.
- Arti: user dapat punya satu fingerprint generik yang terhubung ke model `Fingerprint`.

#### Catatan

- Di model ini, fingerprint admin disimpan langsung pada 6 kolom terpisah.
- Itu sebabnya controller admin fingerprint membaca dan menulis langsung ke kolom-kolom tersebut.

# Dokumentasi Controller Testing (Legacy Code)

## 3. Folder TesPresensi

Folder ini berisi controller yang dipakai untuk eksperimen, pengujian, dan beberapa pola implementasi fingerprint / presensi yang masih berkembang. Sebagian method di dalamnya berstatus legacy atau alternatif.

### `TesPresensi/FingerprintDevController.php`
Lokasi: `app/Http/Controllers/TesPresensi/FingerprintDevController.php`

Controller ini menampilkan data fingerprint intern dalam format list untuk kebutuhan testing atau debugging.

#### Fungsi yang tersedia

**`index()`**
- Fungsi: mengambil semua intern lalu merender halaman daftar fingerprint.
- Return: Inertia ke halaman `Tes Presensi/FingerprintList`.

#### Catatan
- Di file ini ada kode export CSV yang masih dikomentari.
- Karena sifatnya dev/testing, controller ini lebih tepat dipakai sebagai alat bantu pengembangan.

### `TesPresensi/FingerprintGroupController.php`
Lokasi: `app/Http/Controllers/TesPresensi/FingerprintGroupController.php`

Controller ini menangani fingerprint dalam bentuk grup template. Konsepnya sama seperti menyimpan 3 template sekaligus untuk `primary` atau `backup`, tetapi diterapkan pada kolom fingerprint intern.

#### Fungsi yang tersedia

**`storeGroup(Request $request, Intern $intern)`**
- Fungsi: menyimpan 3 template fingerprint sekaligus ke grup yang dipilih.
- Payload:
	- `group`: `primary` atau `backup`
	- `samples`: array 3 string fingerprint
- Alur:
	- validasi input,
	- menentukan mapping kolom berdasarkan grup,
	- mengecek apakah salah satu kolom sudah terisi,
	- jika ada data, proses dibatalkan agar tidak menimpa data lama,
	- jika kosong, 3 template disimpan sekaligus.

**`resetGroup(Request $request, Intern $intern)`**
- Fungsi: mengosongkan fingerprint untuk grup yang dipilih.
- Payload:
	- `group`: `primary` atau `backup`
- Alur: mapping kolom fingerprint lalu mengisi nilainya dengan `null`.

### `TesPresensi/KehadiranController.php`
Lokasi: `app/Http/Controllers/TesPresensi/KehadiranController.php`

File ini berisi banyak kode yang saat ini dikomentari. Secara isi, file ini menyimpan referensi implementasi lama atau alternatif untuk proses presensi harian.

#### Isi logika yang tercatat di file

- Menampilkan daftar intern yang harus presensi berdasarkan hari kerja.
- Mengambil fingerprint dan status check-in / check-out.
- Memproses check-in jika attendance hari itu belum ada atau belum punya jam masuk.
- Memproses check-out jika jam masuk sudah ada tetapi jam pulang belum diisi.
- Menolak check-out yang terlalu cepat.
- Menyimpan attendance alpha harian jika intern belum melakukan presensi.

#### Catatan
- Karena kode inti masih dikomentari, file ini lebih cocok dibaca sebagai arsip logika eksperimen.
- Jika ingin dipakai lagi, perlu diaktifkan dan diuji ulang sebelum masuk produksi.

### `TesPresensi/SidikJariController.php`
Lokasi: `app/Http/Controllers/TesPresensi/SidikJariController.php`

Controller ini menangani alur tambah sidik jari pada intern, termasuk mode legacy dan mode grup.

#### Fungsi yang tersedia

**`index(Intern $intern)`**
- Fungsi: menampilkan halaman tambah sidik jari untuk satu intern.
- Return: Inertia ke halaman `Tes Presensi/NambahSidikJari`.

**`store(Request $request, Intern $intern)`**
- Fungsi: menyimpan 1 template fingerprint ke `fingerprint_data`.
- Catatan: ini adalah metode legacy dan memang menimpa data lama.

**`storeSecond(Request $request, Intern $intern)`**
- Fungsi: menyimpan 1 template fingerprint ke `second_fingerprint_data`.
- Catatan: juga legacy dan menimpa nilai lama.

**`storeGroup(Request $request, Intern $intern)`**
- Fungsi: menyimpan 3 template sekaligus untuk grup `primary` atau `backup`.
- Payload:
	- `group`
	- `samples`
- Alur:
	- validasi input,
	- memilih mapping kolom,
	- blok overwrite jika salah satu kolom sudah terisi,
	- simpan 3 template jika masih kosong.

**`resetGroup(Request $request, Intern $intern)`**
- Fungsi: menghapus isi kolom fingerprint untuk grup yang dipilih.

**`storeSlot(Request $request, Intern $intern)`**
- Fungsi: menyimpan fingerprint ke slot 1 sampai 6 berdasarkan nomor slot.
- Payload:
	- `slot`: angka 1-6
	- `fingerprint_data`: string fingerprint
- Catatan penting:
	- method ini bersifat legacy,
	- di dalam file ada komentar bahwa overwrite bisa diblok jika diperlukan,
	- cocok dipakai jika frontend lama masih mengirim data per slot, bukan per grup.

### `TesPresensi/FingerprintDevController.php`, `FingerprintGroupController.php`, `KehadiranController.php`, `SidikJariController.php`
Keempat file ini bukan controller inti produksi utama. Mereka lebih tepat dipahami sebagai area eksperimen, migrasi, atau pembanding untuk alur fingerprint dan presensi.

## 4. Auth Controllers

Controller di folder ini mengikuti struktur autentikasi standar Laravel. Fungsinya bukan domain spesifik aplikasi, tetapi mendukung login, registrasi, reset password, dan verifikasi email.

### `Auth/AuthenticatedSessionController.php`
Lokasi: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

Mengelola sesi login user.

#### Fungsi yang tersedia

**`create()`**
- Fungsi: menampilkan halaman login.
- Data tambahan:
	- apakah link reset password tersedia,
	- status flash session.

**`store(LoginRequest $request)`**
- Fungsi: memproses login user.
- Alur: autentikasi request, regenerasi session, lalu redirect ke dashboard.

**`destroy(Request $request)`**
- Fungsi: logout user.
- Alur: logout dari guard web, invalidate session, regenerasi CSRF token.

### `Auth/ConfirmablePasswordController.php`
Lokasi: `app/Http/Controllers/Auth/ConfirmablePasswordController.php`

Digunakan untuk konfirmasi password pada aksi yang sensitif.

#### Fungsi yang tersedia

**`show()`**
- Fungsi: menampilkan halaman konfirmasi password.

**`store(Request $request)`**
- Fungsi: memvalidasi ulang password user.
- Alur: cocokkan email dan password dari user login, lalu simpan timestamp konfirmasi ke session jika valid.

### `Auth/EmailVerificationNotificationController.php`
Lokasi: `app/Http/Controllers/Auth/EmailVerificationNotificationController.php`

Mengirim ulang email verifikasi.

#### Fungsi yang tersedia

**`store(Request $request)`**
- Fungsi: mengirim notifikasi verifikasi email jika email belum diverifikasi.
- Jika email sudah diverifikasi, user langsung diarahkan ke dashboard.

### `Auth/EmailVerificationPromptController.php`
Lokasi: `app/Http/Controllers/Auth/EmailVerificationPromptController.php`

Menampilkan prompt verifikasi email.

#### Fungsi yang tersedia

**`__invoke(Request $request)`**
- Fungsi: menampilkan halaman verifikasi email atau mengarahkan ke dashboard bila email sudah diverifikasi.

### `Auth/NewPasswordController.php`
Lokasi: `app/Http/Controllers/Auth/NewPasswordController.php`

Mengelola reset password dari token reset yang dikirim lewat email.

#### Fungsi yang tersedia

**`create(Request $request)`**
- Fungsi: menampilkan form reset password.
- Data yang dikirim: email dan token dari route.

**`store(Request $request)`**
- Fungsi: memproses reset password.
- Payload:
	- `token`
	- `email`
	- `password`
	- `password_confirmation`
- Alur: validasi input, reset password via service Laravel, lalu redirect ke login jika sukses.

### `Auth/PasswordController.php`
Lokasi: `app/Http/Controllers/Auth/PasswordController.php`

Mengelola perubahan password user yang sedang login.

#### Fungsi yang tersedia

**`update(Request $request)`**
- Fungsi: memperbarui password user.
- Payload:
	- `current_password`
	- `password`
	- `password_confirmation`
- Alur: validasi password lama, hash password baru, lalu simpan ke user.

### `Auth/PasswordResetLinkController.php`
Lokasi: `app/Http/Controllers/Auth/PasswordResetLinkController.php`

Mengelola permintaan link reset password.

#### Fungsi yang tersedia

**`create()`**
- Fungsi: menampilkan form lupa password.

**`store(Request $request)`**
- Fungsi: mengirim link reset password ke email user.
- Payload:
	- `email`

### `Auth/RegisteredUserController.php`
Lokasi: `app/Http/Controllers/Auth/RegisteredUserController.php`

Mengelola registrasi user baru.

#### Fungsi yang tersedia

**`create()`**
- Fungsi: menampilkan form registrasi.

**`store(Request $request)`**
- Fungsi: memvalidasi dan membuat user baru.
- Payload:
	- `name`
	- `email`
	- `password`
	- `password_confirmation`
- Alur:
	- validasi input,
	- simpan user baru,
	- trigger event `Registered`,
	- login otomatis,
	- redirect ke dashboard.

### `Auth/VerifyEmailController.php`
Lokasi: `app/Http/Controllers/Auth/VerifyEmailController.php`

Mengelola proses verifikasi email user.

#### Fungsi yang tersedia

**`__invoke(EmailVerificationRequest $request)`**
- Fungsi: menandai email user sebagai terverifikasi.
- Alur:
	- jika email sudah verified, langsung redirect ke dashboard dengan query `verified=1`,
	- jika belum, tandai email sebagai verified dan kirim event `Verified`,
	- lalu redirect ke dashboard.

## 5. Catatan Penting

- Folder `TesPresensi` dipakai untuk fitur testing, eksperimen, dan beberapa controller legacy.
- `TesKomparasiSidikJariController.php` adalah file testing, bukan controller inti produksi.
- `KehadiranController.php` di folder TesPresensi saat ini lebih mirip arsip implementasi karena isi aktifnya banyak yang masih dikomentari.
- Jika controller testing sudah tidak dipakai, sebaiknya dipisahkan dari jalur produksi agar dokumentasi dan routing lebih bersih.

# Dokumentasi Server C#

Bagian ini menjelaskan service C# yang menjadi bridge antara aplikasi Laravel dan hardware fingerprint DigitalPersona (DPUruNet). Service berjalan sebagai HTTP server lokal di port 5000 dan menyediakan endpoint untuk capture serta verifikasi sidik jari.

## 1. Tujuan dan Arsitektur

Server C# dipakai karena SDK scanner fingerprint bekerja di sisi desktop Windows, sedangkan aplikasi utama berjalan di Laravel.

Alur umumnya:

- Frontend / Laravel mengirim request HTTP ke service lokal C# di `http://localhost:5000`.
- Service C# mengakses reader fingerprint via DPUruNet.
- Service menghasilkan data FMD (Fingerprint Minutiae Data) dari hasil scan.
- Untuk verifikasi, service membandingkan FMD hasil scan terhadap database FMD yang dikirim aplikasi.
- Service mengembalikan JSON hasil capture atau hasil match.

## 2. File Utama Server

### `local_services/FingerprintService.cs`

Ini adalah implementasi utama bridge fingerprint yang aktif dipakai.

#### Peran utama file ini

- Menjalankan Windows Forms app (`ServiceForm`) sebagai host service.
- Membuka `HttpListener` pada port 5000.
- Menyediakan endpoint:
	- `/capture` dan `/enroll` untuk perekaman fingerprint.
	- `/identify` dan `/verify` untuk verifikasi fingerprint.
- Menangani lifecycle reader (init, open, capture, cleanup).
- Menghindari konflik request paralel dengan `SemaphoreSlim` (`_requestGate`).

#### Konstanta penting

- `CAPTURE_TIMEOUT_MS = 12000`
	- Timeout per percobaan scan sidik jari.
- `CAPTURE_MAX_TRIES = 3`
	- Jumlah retry maksimal untuk capture atau verify sebelum dianggap gagal.
- `MATCH_THRESHOLD = 21474`
	- Ambang skor kecocokan. Semakin kecil skor, semakin mirip.

#### Data contract JSON

**`EnrollResponse`**
- `success` (bool)
- `message` (string)
- `fmd` (string base64)
- `image` (string data URL PNG)

**`VerifyRequest`**
- `database` (array `UserFingerprint`)

**`UserFingerprint`**
- `id` (string)
- `fmd` (string base64)

**`VerifyResponse`**
- `match` (bool)
- `user_id` (string)
- `message` (string)
- `best_score` (int)

## 3. Endpoint HTTP Server

Base URL:

- `http://localhost:5000`

CORS yang diaktifkan:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, GET, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

### A. Endpoint Capture

Path:

- `POST /capture`
- `POST /enroll`

Fungsi:

- Meminta user menempelkan jari ke scanner.
- Mengubah hasil scan (`Fid`) menjadi FMD ANSI.
- Mengembalikan hasil FMD base64 untuk disimpan di database.
- Mengembalikan image preview fingerprint (opsional untuk UI).

Contoh respons sukses:

```json
{
	"success": true,
	"message": "Success (attempt 1/3)",
	"fmd": "BASE64_FMD...",
	"image": "data:image/png;base64,...."
}
```

Contoh respons gagal:

```json
{
	"success": false,
	"message": "Failed: bad quality / no finger after several attempts"
}
```

### B. Endpoint Verify / Identify

Path:

- `POST /verify`
- `POST /identify`

Payload body:

```json
{
	"database": [
		{ "id": "12", "fmd": "BASE64_FMD_1..." },
		{ "id": "27", "fmd": "BASE64_FMD_2..." }
	]
}
```

Fungsi:

- Men-scan jari pengguna saat ini.
- Menghasilkan candidate FMD.
- Membandingkan candidate ke setiap record database.
- Menyimpan skor terbaik (`best_score`) dan id terbaik (`bestId`).
- Menentukan match jika `best_score < MATCH_THRESHOLD`.

Contoh respons match:

```json
{
	"match": true,
	"user_id": "27",
	"message": "Match Found (Score: 1540)",
	"best_score": 1540
}
```

Contoh respons tidak match:

```json
{
	"match": false,
	"user_id": null,
	"message": "No Match Found",
	"best_score": 2147483647
}
```

## 4. Alur Internal Service

### A. Startup

- Form load memulai log service.
- Reader diinisialisasi untuk cek perangkat tersedia.
- Listener HTTP dibuka pada port 5000.
- Thread background server dimulai (`ServerLoop`).

### B. Request Handling

- Setiap request diproses di threadpool (`ThreadPool.QueueUserWorkItem`).
- Routing berdasarkan path request.
- Untuk operasi capture/verify, dipakai gate semaphore agar request tidak tumpang tindih.

### C. Reader Lifecycle

Urutan aman yang dipakai:

- `CleanupReader()` sebelum init baru.
- `InitReader()` untuk ambil reader pertama yang terdeteksi.
- `Open()` dengan mode exclusive.
- `CaptureAsync(...)` untuk menunggu sidik jari.
- Event `OnReaderCaptured(...)` menyimpan hasil capture.
- `CleanupReader()` langsung setelah capture untuk mencegah state nyangkut.

### D. Retry dan Timeout

- Capture dan verify sama-sama menerapkan retry hingga 3 kali.
- Setiap attempt dibatasi timeout 12 detik.
- Jika timeout atau kualitas jelek, service mencoba ulang sampai batas percobaan.

## 5. Mekanisme Matching Fingerprint

Pipeline verifikasi di `PerformVerification(...)`:

- Scan candidate jari saat ini.
- Ekstraksi candidate FMD (`FeatureExtraction.CreateFmdFromFid`).
- Iterasi seluruh data fingerprint pada payload.
- Validasi per item:
	- objek tidak null,
	- id tidak kosong,
	- fmd string tidak kosong,
	- panjang string minimal,
	- base64 valid,
	- import FMD sukses (`Importer.ImportFmd`).
- Bandingkan candidate dengan data DB (`Comparison.Compare`).
- Ambil skor terkecil sebagai best match.
- Optimasi: jika skor 0 (perfect match), loop dihentikan lebih cepat.

Interpretasi skor:

- Skor lebih kecil = fingerprint lebih mirip.
- Skor 0 = sangat identik.
- Match final ditentukan terhadap threshold (`21474`).

## 6. Logging dan Debugging

Service menyediakan panel log di form untuk membantu troubleshooting runtime:

- startup listener,
- status reader,
- request masuk,
- attempt capture,
- timeout,
- error import/compare per record,
- skor terbaik hasil verifikasi.

Log ini sangat penting untuk membedakan kasus:

- scanner tidak terbaca,
- kualitas scan buruk,
- data FMD database rusak / bukan base64 valid,
- mismatch murni (finger memang berbeda).

## 7. File Pendukung di local_services

### `local_services/StartFingerPrintBridge.bat`

Script helper untuk:

- menjalankan `FingerprintBridge.exe`,
- lalu menjalankan `php artisan serve --host=0.0.0.0 --port=8000`.

Tujuan file ini adalah mempercepat startup service bridge + web server lokal dalam satu klik.

### `local_services/Program.cs`

Implementasi server C# yang lebih lama/sederhana.

Ciri utamanya:

- menerima payload yang berisi `candidate` + `database`,
- langsung membandingkan candidate ke DB,
- threshold lama menggunakan `Score < 2000`,
- tidak memiliki mekanisme retry dan gate sekuat versi terbaru.

Status: referensi legacy, bukan implementasi utama yang paling robust.

### `local_services/FingerprintServiceTes.cs`

Versi eksperimen/testing dari bridge fingerprint.

Ciri utamanya:

- sudah punya endpoint capture/verify,
- punya timeout 20 detik,
- belum sekuat versi final dalam hal kontrol konkurensi dan validasi defensif.

Status: file pengujian/perbandingan implementasi.

### `local_services/Capture.cs` dan `local_services/Verification.cs`

Kedua file ini merupakan bagian sample UI SDK (`UareUSampleCSharp`) untuk demonstrasi capture dan perbandingan sidik jari berbasis form.

Status: bukan backend HTTP bridge utama, tetapi berguna sebagai referensi SDK dan debugging perangkat.

## 8. Dependensi dan Kebutuhan Runtime

- Windows OS (service ini berbasis WinForms + driver scanner).
- SDK/Library DigitalPersona (`DPUruNet.dll`).
- Reader fingerprint terpasang dan terdeteksi oleh OS.
- Port lokal 5000 tersedia.

## 9. Catatan Integrasi dengan Laravel

- Data FMD yang disimpan di database Laravel berbentuk base64 string.
- Endpoint verify menerima array database fingerprint dari Laravel frontend/backend.
- Hasil `user_id` dari service dipakai aplikasi untuk menentukan intern/admin yang teridentifikasi.
- Karena ini bridge lokal, deployment production harus memastikan service C# aktif di mesin yang terhubung scanner.

## 10. Rekomendasi Operasional

- Jalankan bridge sebelum mulai proses presensi fingerprint.
- Pastikan hanya satu instance bridge aktif agar port 5000 tidak bentrok.
- Jika sering timeout, cek kualitas scan, kebersihan sensor, dan driver reader.
- Jika sering gagal match padahal user benar, evaluasi kualitas data enrollment serta threshold yang dipakai.