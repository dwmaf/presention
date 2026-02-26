<?php

//namespace App\Http\Controllers\TesPresensi;

// use App\Http\Controllers\Controller;
// use App\Models\Intern;
// use App\Models\Attendance;
// use Illuminate\Http\Request;
// use Inertia\Inertia;
// use Carbon\Carbon;

//class KehadiranController extends Controller
//{
    // public function index()
    // {
    //     // Panggil generator data absen harian (Trigger)
    //     $this->generateDailyAttendances();

    //     // Dapatkan nama hari ini dalam bahasa Indonesia
    //     $hariIni = strtolower(now()->locale('id')->isoFormat('dddd'));

    //     // Jika Sabtu/Minggu, kosongkan list saja (karena magang hanya Senin-Jumat)
    //     $interns = collect([]);
    //     $today = Carbon::today()->toDateString();
    //     $formattedDate = now()->locale('id')->isoFormat('D MMMM YYYY');

    //     if (in_array($hariIni, ['senin', 'selasa', 'rabu', 'kamis', 'jumat'])) {
    //         // Ambil intern yang jadwal hari ininya true DAN memiliki minimal satu sidik jari
    //         $interns = Intern::with(['attendances' => function ($query) use ($today) {
    //                 $query->where('date', $today);
    //             }])
    //             ->where($hariIni, true)
    //             ->where('is_active', true)
    //             ->get(['id', 'name', 'fingerprint_data', 'second_fingerprint_data'])
    //             ->map(function ($intern) {
    //                 $attendance = $intern->attendances->first();
    //                 return [
    //                     'id' => (string)$intern->id,
    //                     'fmd' => $intern->fingerprint_data,
    //                     'second_fmd' => $intern->second_fingerprint_data,
    //                     'fmd_3' => $intern->fingerprint_data_3,
    //                     'fmd_4' => $intern->fingerprint_data_4,
    //                     'fmd_5' => $intern->fingerprint_data_5,
    //                     'fmd_6' => $intern->fingerprint_data_6,
    //                     'name' => $intern->name,
    //                     'check_in' => $attendance && $attendance->check_in ? $attendance->check_in : '-',
    //                     'check_out' => $attendance && $attendance->check_out ? $attendance->check_out : '-',
    //                 ];
    //             });
    //     }

    //     return Inertia::render('Tes Presensi/Kehadiran', [
    //         'fingerprintDatabase' => $interns,
    //         'hariIni' => ucfirst($hariIni),
    //         'tanggalHariIni' => $formattedDate
    //     ]);
    // }

    // public function store(Request $request)
    // {
    //     // Opsional: jalankan generator jaga-jaga kalau page index tidak di-refresh siang ini
    //     $this->generateDailyAttendances();

    //     $request->validate([
    //         'intern_id' => 'required|exists:interns,id',
    //     ]);

    //     $intern = Intern::findOrFail($request->intern_id);
    //     $today = Carbon::today()->toDateString();
    //     $now = Carbon::now();

    //     // Cari record attendances hari ini
    //     $attendance = Attendance::where('intern_id', $intern->id)
    //                             ->where('date', $today)
    //                             ->first();

    //     // Skenario 1: Belum ada record sama sekali, atau check_in masih NULL (artinya proses Check-In)
    //     if (!$attendance || !$attendance->check_in) {
            
    //         if (!$attendance) {
    //             Attendance::create([
    //                 'intern_id' => $intern->id,
    //                 'date' => $today,
    //                 'check_in' => $now->format('H:i:s'),
    //                 'status' => 'hadir' // Otomatis diset hadir
    //             ]);
    //         } else {
    //             $attendance->update([
    //                 'check_in' => $now->format('H:i:s'),
    //                 'status' => 'hadir'
    //             ]);
    //         }

    //         return response()->json([
    //             'success' => true,
    //             'message' => "Check In Berhasil pada " . $now->format('H:i:s'),
    //             'type' => 'check_in',
    //             'time' => $now->format('H:i:s')
    //         ]);
    //     }

    //     // Skenario 2: Sudah ada check_in, tapi belum check_out (artinya proses Check-Out)
    //     if ($attendance->check_in && !$attendance->check_out) {
    //         $checkInTime = Carbon::createFromFormat('Y-m-d H:i:s', $today . ' ' . $attendance->check_in);
            
    //         // Hitung selisih mutlak (positif) dalam menit
    //         $selisihMenit = abs($now->diffInMinutes($checkInTime));

    //         // Mencegah Check-Out yang terlalu cepat (kurang dari 30 menit)
    //         if ($selisihMenit < 30) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => "Belum 30 menit dari waktu Check In!",
    //             ], 400); 
    //         }

    //         $attendance->update([
    //             'check_out' => $now->format('H:i:s')
    //         ]);

    //         return response()->json([
    //             'success' => true,
    //             'message' => "Check Out Berhasil pada " . $now->format('H:i:s'),
    //             'type' => 'check_out',
    //             'time' => $now->format('H:i:s')
    //         ]);
    //     }

    //     // Skenario 3: Jika check_in dan check_out dua-duanya sudah terisi (Selesai presensi hari ini)
    //     if ($attendance->check_in && $attendance->check_out) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => "Anda sudah melakukan Check In dan Check Out hari ini.",
    //         ], 400);
    //     }
        
    //     // Fallback jika terjadi anomali tak terduga
    //     return response()->json([
    //         'success' => false,
    //         'message' => "Terjadi kesalahan struktur data pada presensi Anda.",
    //     ], 500);
    // }

    /**
     * Membangkitkan / meng-generate kerangka record presensi dengan status 'alpha'
     * khusus untuk karyawan yang memang ada jadwal wajib masuk di hari saat ini.
     * Fungsi ini tidak akan menimpa data attendance yang sudah ada.
     */
    // private function generateDailyAttendances()
    // {
    //     $hariIni = strtolower(now()->locale('id')->isoFormat('dddd'));
        
    //     // Cuma generate di hari kerja yang valid
    //     if (!in_array($hariIni, ['senin', 'selasa', 'rabu', 'kamis', 'jumat'])) {
    //         return;
    //     }

    //     $today = Carbon::today()->toDateString();

    //     // Cari siapa saja Intern yang wajib masuk HARI INI, aktif, TAPI belum ada record Attendances samsek.
    //     $internsTanpaPresensi = Intern::where($hariIni, true)
    //         ->where('is_active', true)
    //         ->whereDoesntHave('attendances', function($query) use ($today) {
    //             $query->where('date', $today);
    //         })->get();

    //     $inserts = [];
    //     $now = Carbon::now();

    //     foreach ($internsTanpaPresensi as $intern) {
    //         $inserts[] = [
    //             'intern_id' => $intern->id,
    //             'date' => $today,
    //             'status' => 'alpha',
    //             'created_at' => $now,
    //             'updated_at' => $now,
    //         ];
    //     }

    //     // Kalau ada data intern kosong, tembak ke database (Bulk Insert agar cepat dan tidak lemot)
    //     if (count($inserts) > 0) {
    //         Attendance::insert($inserts);
    //     }
    // }
//}