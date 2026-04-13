# Dokumentasi Route

Dokumen ini menjelaskan semua route yang didefinisikan di aplikasi, termasuk route publik, route yang dilindungi middleware `auth`, route resource, dan route autentikasi bawaan Laravel.

## 1. Gambaran Umum

- File utama route aplikasi ada di [routes/web.php](routes/web.php).
- Route autentikasi tambahan ada di [routes/auth.php](routes/auth.php).
- Aplikasi ini menggunakan kombinasi route publik, route authenticated, route resource Laravel, dan beberapa route testing / development.

## 2. Route Publik

Route di bagian ini dapat diakses tanpa login, kecuali jika controller atau middleware di dalamnya membatasi akses secara internal.

### `GET /`
- Nama route: tidak diberi nama.
- Controller: closure langsung.
- Fungsi: menampilkan halaman `Welcome`.
- Data yang dikirim ke frontend:
	- `canLogin`
	- `canRegister`
	- `laravelVersion`
	- `phpVersion`

### `GET /attendance`
- Nama route: `attendance.index`
- Controller: `AttendanceController@index`
- Fungsi: menampilkan halaman absensi intern berdasarkan tanggal yang dipilih.
- Catatan: route ini tidak dibungkus middleware `auth` pada file route, jadi secara struktur ia termasuk public route.

### `POST /attendance`
- Nama route: `attendance.store`
- Controller: `AttendanceController@store`
- Fungsi: menyimpan atau memproses presensi intern.
- Catatan: route ini dipakai oleh alur scan / presensi kehadiran.

### `GET /test-fingerprint`
- Nama route: `test.fingerprint`
- Controller: `TesKomparasiSidikJariController@index`
- Fungsi: halaman testing untuk komparasi sidik jari.
- Catatan: route ini memang disiapkan untuk pengujian fingerprint, bukan alur utama produksi.

### `GET /dev/fingerprints`
- Nama route: `dev.fingerprints`
- Controller: `FingerprintDevController@index`
- Fungsi: menampilkan daftar fingerprint intern untuk kebutuhan development / debugging.

## 3. Route Authenticated

Route di grup ini dilindungi middleware `auth`, jadi hanya bisa diakses oleh user yang sudah login.

### `GET /dashboard`
- Nama route: `dashboard`
- Controller: `AttendanceController@dashboard`
- Fungsi: menampilkan dashboard statistik kehadiran intern.

### `GET /dashboard/export`
- Nama route: `dashboard.export`
- Controller: `AttendanceController@exportDashboardCsv`
- Fungsi: mengekspor ringkasan dashboard ke CSV.

## 4. Route Admin Fingerprint

Route di bawah ini masih berada dalam grup `auth`, dan digunakan untuk enrollment fingerprint admin.

### `GET /profile/fingerprint`
- Nama route: `profile.fingerprint`
- Controller: `AdminFingerprintController@index`
- Fungsi: menampilkan halaman enrollment fingerprint admin.

### `POST /profile/fingerprint/store-group`
- Nama route: `profile.fingerprint.storeGroup`
- Controller: `AdminFingerprintController@storeGroup`
- Fungsi: menyimpan 3 template fingerprint sekaligus ke grup admin `primary` atau `backup`.

### `DELETE /profile/fingerprint/reset-group`
- Nama route: `profile.fingerprint.resetGroup`
- Controller: `AdminFingerprintController@resetGroup`
- Fungsi: mengosongkan fingerprint admin per grup.

## 5. Route Divisi

Route ini didefinisikan lewat `Route::resource('divisions', DivisionController::class)` dan beberapa route tambahan untuk assignment intern.

### Route resource standar divisi

### `GET /divisions`
- Nama route: `divisions.index`
- Controller: `DivisionController@index`
- Fungsi: menampilkan daftar divisi dan intern yang berada di dalamnya.

### `GET /divisions/create`
- Nama route: `divisions.create`
- Controller: `DivisionController@create`
- Fungsi: form pembuatan divisi baru.
- Catatan: route ini ada karena resource route, meskipun pada implementasi controller yang terlihat di project tidak ada method `create()`.

### `POST /divisions`
- Nama route: `divisions.store`
- Controller: `DivisionController@store`
- Fungsi: menyimpan divisi baru.

### `GET /divisions/{division}`
- Nama route: `divisions.show`
- Controller: `DivisionController@show`
- Fungsi: menampilkan detail satu divisi.
- Catatan: route ini dibuat otomatis oleh resource route, walaupun controller yang ada saat ini tidak menampilkan method `show()`.

### `GET /divisions/{division}/edit`
- Nama route: `divisions.edit`
- Controller: `DivisionController@edit`
- Fungsi: form edit divisi.
- Catatan: route ini otomatis dari resource route.

### `PUT /divisions/{division}`
- Nama route: `divisions.update`
- Controller: `DivisionController@update`
- Fungsi: memperbarui data divisi.

### `PATCH /divisions/{division}`
- Nama route: `divisions.update`
- Controller: `DivisionController@update`
- Fungsi: alternatif update dengan method PATCH.

### `DELETE /divisions/{division}`
- Nama route: `divisions.destroy`
- Controller: `DivisionController@destroy`
- Fungsi: menghapus divisi jika tidak ada intern yang masih terhubung.

### Route tambahan divisi

### `POST /divisions/{division}/assign-intern`
- Nama route: `divisions.assignIntern`
- Controller: `DivisionController@assignIntern`
- Fungsi: menambahkan intern ke divisi tertentu.

### `DELETE /divisions/{division}/remove-intern/{intern}`
- Nama route: `divisions.removeIntern`
- Controller: `DivisionController@removeIntern`
- Fungsi: menghapus intern dari divisi tertentu.

## 6. Route Intern

Route ini didefinisikan lewat `Route::resource('interns', InternController::class)` dan beberapa route tambahan untuk poin, toleransi, foto, export, dan fingerprint.

### Route resource standar intern

### `GET /interns`
- Nama route: `interns.index`
- Controller: `InternController@index`
- Fungsi: menampilkan daftar intern.

### `GET /interns/create`
- Nama route: `interns.create`
- Controller: `InternController@create`
- Fungsi: menampilkan form tambah intern.
- Catatan: route ini otomatis dari resource route.

### `POST /interns`
- Nama route: `interns.store`
- Controller: `InternController@store`
- Fungsi: menyimpan data intern baru.

### `GET /interns/{intern}`
- Nama route: `interns.show`
- Controller: `InternController@show`
- Fungsi: menampilkan detail intern.
- Catatan: route ini otomatis dari resource route.

### `GET /interns/{intern}/edit`
- Nama route: `interns.edit`
- Controller: `InternController@edit`
- Fungsi: form edit intern.
- Catatan: route ini otomatis dari resource route.

### `PUT /interns/{intern}`
- Nama route: `interns.update`
- Controller: `InternController@update`
- Fungsi: memperbarui data intern.

### `PATCH /interns/{intern}`
- Nama route: `interns.update`
- Controller: `InternController@update`
- Fungsi: alternatif update dengan method PATCH.

### `DELETE /interns/{intern}`
- Nama route: `interns.destroy`
- Controller: `InternController@destroy`
- Fungsi: menghapus intern beserta riwayat attendance-nya.

### Route tambahan intern

### `POST /interns/reset-points`
- Nama route: `interns.resetPoints`
- Controller: `InternController@resetPoints`
- Fungsi: mereset poin semua intern menjadi nilai default.

### `PUT /interns/{intern}/update-toleransi`
- Nama route: `interns.updateToleransi`
- Controller: `InternController@updateToleransi`
- Fungsi: mengatur toleransi keterlambatan per hari untuk intern tertentu.

### `PUT /interns/{intern}/update-photo`
- Nama route: `interns.updatePhoto`
- Controller: `InternController@updatePhoto`
- Fungsi: memperbarui foto intern.

### `GET /interns/{intern}/export-attendance`
- Nama route: `interns.exportAttendance`
- Controller: `InternController@exportAttendanceCsv`
- Fungsi: mengunduh CSV riwayat absensi intern.

## 7. Route Attendance

### `PUT /attendances/{attendance}/status`
- Nama route: `attendances.updateStatus`
- Controller: `AttendanceController@updateStatus`
- Fungsi: mengubah status attendance tertentu.

### `PUT /attendances/{attendance}/check-out`
- Nama route: `attendances.updateCheckOut`
- Controller: `AttendanceController@updateCheckOut`
- Fungsi: memperbarui jam pulang attendance.

## 8. Route Fingerprint Intern

Bagian ini adalah route untuk enrollment fingerprint intern. Ada dua jalur yang masih dipakai: jalur fingerprint lama dan jalur tes / legacy.

### Jalur fingerprint lama

### `GET /interns/{intern}/fingerprint-enrollment`
- Nama route: `interns.fingerprint-enrollment`
- Controller: `FingerprintController@index`
- Fungsi: menampilkan halaman enrollment fingerprint lama untuk intern.

### `POST /interns/{intern}/fingerprint-enrollment`
- Nama route: `interns.fingerprint-enrollment.store`
- Controller: `FingerprintController@store`
- Fungsi: menyimpan satu template fingerprint ke `fingerprint_data`.

### Jalur testing / legacy fingerprint

### `GET /interns/{intern}/create-fingerprint`
- Nama route: `interns.fingerprint.create`
- Controller: `SidikJariController@index`
- Fungsi: menampilkan halaman testing tambah sidik jari.

### `POST /interns/{intern}/store-fingerprint`
- Nama route: `interns.fingerprint.store`
- Controller: `SidikJariController@store`
- Fungsi: menyimpan fingerprint ke slot legacy `fingerprint_data`.

### `POST /interns/{intern}/store-second-fingerprint`
- Nama route: `interns.fingerprint.storeSecond`
- Controller: `SidikJariController@storeSecond`
- Fungsi: menyimpan fingerprint ke slot legacy `second_fingerprint_data`.

### `POST /interns/{intern}/store-fingerprint-slot`
- Nama route: `interns.fingerprint.storeSlot`
- Controller: `SidikJariController@storeSlot`
- Fungsi: menyimpan fingerprint ke slot 1 sampai 6 berdasarkan nomor slot.

### `POST /interns/{intern}/fingerprint/store-group`
- Nama route: `interns.fingerprint.storeGroup`
- Controller: `SidikJariController@storeGroup`
- Fungsi: menyimpan 3 template fingerprint sekaligus untuk grup `primary` atau `backup`.

### `DELETE /interns/{intern}/fingerprint/reset-group`
- Nama route: `interns.fingerprint.resetGroup`
- Controller: `SidikJariController@resetGroup`
- Fungsi: mengosongkan fingerprint grup tertentu.

## 9. Route Authentication

Route autentikasi didefinisikan di [routes/auth.php](routes/auth.php).

### Route untuk guest

### `GET /register`
- Nama route: `register`
- Controller: `RegisteredUserController@create`
- Middleware: `guest`
- Fungsi: menampilkan form registrasi user baru.

### `POST /register`
- Nama route: tidak diberi nama.
- Controller: `RegisteredUserController@store`
- Middleware: `guest`
- Fungsi: memproses registrasi user baru.

### `GET /login`
- Nama route: `login`
- Controller: `AuthenticatedSessionController@create`
- Middleware: `guest`
- Fungsi: menampilkan halaman login.

### `POST /login`
- Nama route: tidak diberi nama.
- Controller: `AuthenticatedSessionController@store`
- Middleware: `guest`
- Fungsi: memproses autentikasi login.

### `GET /forgot-password`
- Nama route: `password.request`
- Controller: `PasswordResetLinkController@create`
- Middleware: `guest`
- Fungsi: menampilkan form lupa password.

### `POST /forgot-password`
- Nama route: `password.email`
- Controller: `PasswordResetLinkController@store`
- Middleware: `guest`
- Fungsi: mengirim link reset password ke email.

### `GET /reset-password/{token}`
- Nama route: `password.reset`
- Controller: `NewPasswordController@create`
- Middleware: `guest`
- Fungsi: menampilkan form reset password berdasarkan token.

### `POST /reset-password`
- Nama route: `password.store`
- Controller: `NewPasswordController@store`
- Middleware: `guest`
- Fungsi: memproses penyimpanan password baru.

### Route untuk user authenticated

### `GET /verify-email`
- Nama route: `verification.notice`
- Controller: `EmailVerificationPromptController`
- Middleware: `auth`
- Fungsi: menampilkan prompt verifikasi email.

### `GET /verify-email/{id}/{hash}`
- Nama route: `verification.verify`
- Controller: `VerifyEmailController`
- Middleware: `auth`, `signed`, `throttle:6,1`
- Fungsi: memverifikasi email user.

### `POST /email/verification-notification`
- Nama route: `verification.send`
- Controller: `EmailVerificationNotificationController@store`
- Middleware: `auth`, `throttle:6,1`
- Fungsi: mengirim ulang email verifikasi.

### `GET /confirm-password`
- Nama route: `password.confirm`
- Controller: `ConfirmablePasswordController@show`
- Middleware: `auth`
- Fungsi: menampilkan halaman konfirmasi password.

### `POST /confirm-password`
- Nama route: tidak diberi nama.
- Controller: `ConfirmablePasswordController@store`
- Middleware: `auth`
- Fungsi: memvalidasi password user yang sedang login.

### `PUT /password`
- Nama route: `password.update`
- Controller: `PasswordController@update`
- Middleware: `auth`
- Fungsi: memperbarui password user.

### `POST /logout`
- Nama route: `logout`
- Controller: `AuthenticatedSessionController@destroy`
- Middleware: `auth`
- Fungsi: mengakhiri sesi login.

## 10. Route / Controller yang Saat Ini Tidak Aktif di File Route

Beberapa import controller ada di `web.php`, tetapi tidak dipakai langsung sebagai route aktif pada file yang terlihat saat ini. Contohnya:

- `ProfileController`
- `KehadiranController`

Ini biasanya berarti route tersebut pernah dipakai, masih disiapkan untuk masa depan, atau sudah dipindahkan ke bagian lain.

## 11. Catatan Penting

- Route resource `divisions` dan `interns` otomatis menambah route standar `index`, `create`, `store`, `show`, `edit`, `update`, dan `destroy`.
- Di controller yang ada saat ini, tidak semua method standar resource terlihat diimplementasikan. Jika route standar tersebut dipanggil tanpa method yang sesuai, Laravel akan error.
- Route fingerprint testing dan development masih sengaja dibiarkan aktif untuk kebutuhan pengujian.
- Route public `GET /attendance` dan `POST /attendance` perlu diperhatikan dari sisi keamanan jika memang hanya boleh dipakai pada alur tertentu.
- Jika nanti ingin dokumentasi ini lebih teknis, bisa ditambah kolom: request payload, response, middleware, dan halaman Inertia yang dirender.
