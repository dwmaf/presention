<?php

use App\Http\Controllers\SidikJariController;
use App\Http\Controllers\AdminFingerprintController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\InternController;
use App\Http\Controllers\AttendanceController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return redirect()->route('login');
});


// untuk nampilin halaman presensi bagi para intern
Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [AttendanceController::class, 'dashboard'])->name('dashboard');
    Route::get('/dashboard/export', [AttendanceController::class, 'exportDashboardCsv'])->name('dashboard.export');


    // --- ADMIN FINGERPRINT ENROLLMENT ---
    Route::get('/profile/fingerprint', [AdminFingerprintController::class, 'index'])->name('profile.fingerprint');
    Route::post('/profile/fingerprint/store-group', [AdminFingerprintController::class, 'storeGroup'])->name('profile.fingerprint.storeGroup');
    Route::delete('/profile/fingerprint/reset-group', [AdminFingerprintController::class, 'resetGroup'])->name('profile.fingerprint.resetGroup');

    // untuk nampilin halaman daftar divisi yg ada, nambah, edit, dan hapus
    Route::resource('divisions', DivisionController::class);
    Route::post('/divisions/{division}/assign-intern', [DivisionController::class, 'assignIntern'])->name('divisions.assignIntern');
    Route::delete('/divisions/{division}/remove-intern/{intern}', [DivisionController::class, 'removeIntern'])->name('divisions.removeIntern');

    // untuk nampilin halaman daftar intern, nambah, edit, dan hapus
    Route::resource('interns', InternController::class);
    // reset poin tiap intern
    Route::post('/interns/reset-points', [InternController::class, 'resetPoints'])->name('interns.resetPoints');

    // untuk update toleransi keterlambatan
    Route::put('/interns/{intern}/update-toleransi', [InternController::class, 'updateToleransi'])->name('interns.updateToleransi');

    Route::put('/attendances/{attendance}/status', [AttendanceController::class, 'updateStatus'])->name('attendances.updateStatus');
    Route::put('/attendances/{attendance}/check-out', [AttendanceController::class, 'updateCheckOut'])->name('attendances.updateCheckOut');
    Route::put('/interns/{intern}/update-photo', [InternController::class, 'updatePhoto'])->name('interns.updatePhoto');
    Route::get('/interns/{intern}/export-attendance', [InternController::class, 'exportAttendanceCsv'])->name('interns.exportAttendance');

    // untuk buka halaman untuk nambah fingerprint
    Route::get('/interns/{intern}/create-fingerprint', [SidikJariController::class, 'index'])->name('interns.fingerprint.create');

    Route::post('/interns/{intern}/fingerprint/store-group', [SidikJariController::class, 'storeGroup'])
        ->name('interns.fingerprint.storeGroup');

    Route::delete('/interns/{intern}/fingerprint/reset-group', [SidikJariController::class, 'resetGroup'])
        ->name('interns.fingerprint.resetGroup');

    Route::put('/interns/{intern}/toggle-active', [InternController::class, 'toggleActive'])->name('interns.toggleActive');
});

require __DIR__ . '/auth.php';
