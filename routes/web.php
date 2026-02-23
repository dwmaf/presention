<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FingerprintController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\InternController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\TesKomparasiSidikJariController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // route profil bawaan package breeze tidak/belum diperlukan
    // Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // untuk nampilin halaman daftar divisi yg ada, nambah, edit, dan hapus
    Route::resource('divisions', DivisionController::class);
    // untuk nampilin halaman daftar intern, nambah, edit, dan hapus
    Route::resource('interns', InternController::class);

    // untuk nampilin halaman presensi bagi para intern
    Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::put('/attendances/{attendance}/status', [AttendanceController::class, 'updateStatus'])->name('attendances.updateStatus');
    Route::put('/interns/{intern}/update-photo', [InternController::class, 'updatePhoto'])->name('interns.updatePhoto');
    Route::get('/interns/{intern}/export-attendance', [InternController::class, 'exportAttendanceCsv'])->name('interns.exportAttendance');
    // untuk buka halaman untuk nambah fingerprint
    Route::get('/interns/{intern}/fingerprint-enrollment', [FingerprintController::class, 'index'])->name('interns.fingerprint-enrollment');
    Route::post('/interns/{intern}/fingerprint-enrollment', [FingerprintController::class, 'store'])->name('interns.fingerprint-enrollment.store');
});

require __DIR__.'/auth.php';

// utk tes fingerprint
Route::get('/test-fingerprint', [TesKomparasiSidikJariController::class, 'index'])->name('test.fingerprint');