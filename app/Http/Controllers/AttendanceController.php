<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use App\Models\Intern;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SystemLog;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        // Ambil filter tanggal dari request, jika kosong gunakan hari ini
        $selectedDate = $request->input('date', Carbon::today()->toDateString());
        $today = Carbon::today()->toDateString();

        // Picu pembuatan record 'alpha' otomatis jika hari ini adalah hari kerja
        if ($selectedDate === $today) {
            $this->generateDailyAttendances();
        }

        // Tentukan kolom jadwal berdasarkan hari dari tanggal yang dipilih
        $hariMap = [
            'Monday'    => 'senin',
            'Tuesday'   => 'selasa',
            'Wednesday' => 'rabu',
            'Thursday'  => 'kamis',
            'Friday'    => 'jumat',
        ];
        $hariInggris = Carbon::parse($selectedDate)->format('l');
        $kolomJadwal = $hariMap[$hariInggris] ?? null;

        // Query intern: filter berdasarkan jadwal hari masuk
        $query = Intern::with(['division', 'attendances' => function ($q) use ($selectedDate) {
            $q->where('date', $selectedDate);
        }])->where('is_active', true);

        if ($kolomJadwal) {
            $query->where($kolomJadwal, true);
        } else {
            // Jika Sabtu/Minggu, tampilkan kosong (atau sesuaikan kebutuhan)
            $query->whereRaw('1 = 0');
        }

        $interns = $query->get();

        // [TAMBAHAN BARU] Ambil data sidik jari semua Admin (User)
        $users = User::all();
        $adminFingerprints = [];
        foreach ($users as $user) {
            // Cek ke-6 slot jari, jika ada isinya, masukkan ke list
            for ($i = 1; $i <= 6; $i++) {
                $col = 'fingerprint_' . $i;
                if (!empty($user->$col)) {
                    $adminFingerprints[] = [
                        'id' => $user->id, // ID Admin
                        'fmd' => $user->$col
                    ];
                }
            }
        }

        return Inertia::render('Attendance', [
            'interns'      => $interns,
            'selectedDate' => $selectedDate,
            'adminFingerprints' => $adminFingerprints, 
            'hariIni'      => Carbon::parse($selectedDate)->locale('id')->isoFormat('dddd'),
            // Tambahkan fingerprint database untuk scanner (hanya untuk hari ini)
            'fingerprintDatabase' => ($selectedDate === $today) ? $interns->map(function ($i) {
                return [
                    'id' => (string)$i->id,
                    'fmd' => $i->fingerprint_data,
                    'second_fmd' => $i->second_fingerprint_data,
                    'fmd_3' => $i->fingerprint_data_3,
                    'fmd_4' => $i->fingerprint_data_4,
                    'fmd_5' => $i->fingerprint_data_5,
                    'fmd_6' => $i->fingerprint_data_6,
                    'name' => $i->name
                ];
            }) : []
        ]);
    }

    public function dashboard(Request $request)
    {
        // Ambil date range dari request atau gunakan default (minggu ini)
        $startDate = $request->input('start_date', Carbon::today()->startOfWeek()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        // Ambil semua intern aktif dengan attendance dalam range
        $interns = Intern::with(['division', 'attendances' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('date', [$startDate, $endDate]);
        }])->where('is_active', true)->get();

        // Hitung statistik untuk setiap intern
        $internStats = $interns->map(function ($intern) {
            $attendances = $intern->attendances;

            $jumlahHadir = $attendances->where('status', 'hadir')->count();
            $jumlahIzin = $attendances->where('status', 'izin')->count() + $attendances->where('status', 'sakit')->count();
            $jumlahAlpha = $attendances->where('status', 'alpha')->count();

            // Hitung total jam kerja
            $totalJam = 0;
            foreach ($attendances->where('status', 'hadir') as $att) {
                if ($att->check_in && $att->check_out) {
                    $checkIn = Carbon::parse($att->check_in);
                    $checkOut = Carbon::parse($att->check_out);
                    $totalJam += $checkOut->diffInHours($checkIn, true);
                }
            }

            return [
                'id' => $intern->id,
                'name' => $intern->name,
                'foto' => $intern->foto,
                'division' => [
                    'nama_divisi' => $intern->division->nama_divisi ?? '-',
                ],
                'jumlah_hadir' => $jumlahHadir,
                'jumlah_izin' => $jumlahIzin,
                'jumlah_alpha' => $jumlahAlpha,
                'total_jam' => round($totalJam, 1),
            ];
        });

        return Inertia::render('Dashboard', [
            'interns' => $internStats,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    public function exportDashboardCsv(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->startOfWeek()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        $interns = Intern::with(['division', 'attendances' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('date', [$startDate, $endDate]);
        }])->where('is_active', true)->get();

        $internStats = $interns->map(function ($intern) {
            $attendances = $intern->attendances;

            $jumlahHadir = $attendances->where('status', 'hadir')->count();
            $jumlahIzin = $attendances->where('status', 'izin')->count() + $attendances->where('status', 'sakit')->count();
            $jumlahAlpha = $attendances->where('status', 'alpha')->count();

            $totalJam = 0;
            foreach ($attendances->where('status', 'hadir') as $att) {
                if ($att->check_in && $att->check_out) {
                    $checkIn = Carbon::parse($att->check_in);
                    $checkOut = Carbon::parse($att->check_out);
                    $totalJam += $checkOut->diffInHours($checkIn, true);
                }
            }

            return [
                'name' => $intern->name,
                'division' => $intern->division->nama_divisi ?? '-',
                'hadir' => $jumlahHadir,
                'izin' => $jumlahIzin,
                'alpha' => $jumlahAlpha,
                'total_jam' => round($totalJam, 1),
            ];
        });

        $filename = 'data_absensi_' . str_replace('-', '_', $startDate) . '_' . str_replace('-', '_', $endDate) . '.csv';

        $handle = fopen('php://memory', 'w+');
        fputcsv($handle, ['Nama', 'Divisi', 'Jumlah Hadir', 'Jumlah Izin', 'Jumlah Alpha', 'Total Jam']);

        foreach ($internStats as $stat) {
            fputcsv($handle, [
                $stat['name'],
                $stat['division'],
                $stat['hadir'],
                $stat['izin'],
                $stat['alpha'],
                $stat['total_jam'] . ' jam',
            ]);
        }

        rewind($handle);
        $csvContent = stream_get_contents($handle);
        fclose($handle);

        return response($csvContent, 200, [
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Type' => 'text/csv;charset=utf-8',
        ]);
    }

    public function updateStatus(Request $request, Attendance $attendance)
    {
        $request->validate([
            'status' => 'required|in:hadir,izin,sakit,alpha'
        ]);

        $oldStatus = $attendance->status;
        $newStatus = $request->status;

        $attendance->update([
            'status' => $newStatus
        ]);

        // Jika berubah dari Alpha ke (Hadir/Izin/Sakit), kembalikan poinnya (+2)
        if ($oldStatus === 'alpha' && in_array($newStatus, ['hadir', 'izin', 'sakit'])) {
            // Pastikan tidak lebih dari 5
            $newPoin = min(5, $attendance->intern->poin + 2);
            $attendance->intern->update(['poin' => $newPoin]);
        }

        // Jika berubah DARI (Hadir/Izin/Sakit) KEMBALI ke Alpha, potong poin lagi (-2)
        if ($newStatus === 'alpha' && in_array($oldStatus, ['hadir', 'izin', 'sakit'])) {
            $newPoin = max(0, $attendance->intern->poin - 2);
            $attendance->intern->update(['poin' => $newPoin]);
        }

        return redirect()->back()->with('success', 'Status kehadiran berhasil diperbarui.');
    }

    public function updateCheckOut(Request $request, Attendance $attendance)
    {
        $request->validate([
            'check_out' => 'nullable|date_format:H:i'
        ]);

        $attendance->update([
            'check_out' => $request->check_out
        ]);

        return redirect()->back()->with('success', 'Jam pulang berhasil diperbarui.');
    }

    public function store(Request $request)
    {
        // === LOGIKA AUTO RESET POIN (Lazy Trigger) ===
        // Cek apakah hari ini tanggal 1
        if (now()->day === 1) {
            $flagName = 'reset_poin_' . now()->format('Y_m'); // Contoh: reset_poin_2024_03

            // Cek cepat apakah flag sudah ada di DB (supaya ga berat)
            $isAlreadyDone = SystemLog::where('action_name', $flagName)->exists();

            if (!$isAlreadyDone) {
                // Gunakan Transaction agar aman dari Race Condition
                DB::beginTransaction();
                try {
                    // Coba buat flag record baru
                    // Jika user A dan user B masuk sini bebarengan, 
                    // salah satu akan gagal create karena constraint UNIQUE di database
                    SystemLog::create([
                        'action_name' => $flagName,
                        'executed_at' => now(),
                    ]);

                    // Update massal poin jadi 5
                    Intern::query()->update(['poin' => 5]);

                    DB::commit();
                } catch (\Exception $e) {
                    // Jika error (biasanya karena Duplicate Entry violation/balapan), rollback.
                    // Artinya reset sudah dilakukan oleh request lain milidetik sebelumnya.
                    DB::rollBack();
                }
            }
        }
        // === END LOGIKA AUTO RESET POIN ===

        
        // Panggil generator data absen harian (Trigger)
        $this->generateDailyAttendances();

        $request->validate([
            'intern_id' => 'required|exists:interns,id',
        ]);

        $intern = Intern::findOrFail($request->intern_id);
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        $attendance = Attendance::where('intern_id', $intern->id)
            ->where('date', $today)
            ->first();

        // 1. Check-In (Belum ada record atau check_in null)
        if (!$attendance || !$attendance->check_in) {
            $checkInTime = $now->format('H:i');

            // === LOGIKA BARU: CEK FLAG toleransi ===
            $dayIndex = strtolower($now->format('l')); // monday, tuesday...
            $toleransiMap = [
                'monday'    => ['flag' => 'toleransi_senin', 'time' => 'toleransi_senin_time'],
                'tuesday'   => ['flag' => 'toleransi_selasa', 'time' => 'toleransi_selasa_time'],
                'wednesday' => ['flag' => 'toleransi_rabu', 'time' => 'toleransi_rabu_time'],
                'thursday'  => ['flag' => 'toleransi_kamis', 'time' => 'toleransi_kamis_time'],
                'friday'    => ['flag' => 'toleransi_jumat', 'time' => 'toleransi_jumat_time'],
            ];

            $deadlineTime = '08:30:00';
            // Cek apakah ada toleransi hari ini?
            if (isset($toleransiMap[$dayIndex])) {
                $cols = $toleransiMap[$dayIndex];
                // Jika Flag Toleransi Aktif (True), gunakan jam khususnya.
                if ($intern->{$cols['flag']}) {
                    $deadlineTime = $intern->{$cols['time']}; // Misal "09:00:00"
                }
            }
            // Cek apakah hari ini statusnya fleksibel untuk intern ini?
            // $toleransiColumn = $toleransiMap[$dayIndex] ?? null;
            // $isTodayToleransi = $toleransiColumn ? $intern->$toleransiColumn : false;

            // Logic Terlambat: Bandingkan jam sekarang vs deadline
            // Jika jam sekarang > deadline, maka late.
            $isLate = ($now->format('H:i:s') > $deadlineTime);

            // === B. LOGIKA POIN (FIX BUG INFINITY) ===
            // Cek: Apakah poin user sudah dipotong sistem tadi pagi?
            // Tandanya adalah record sudah ada DAN statusnya 'alpha'.
            if ($attendance && $attendance->status === 'alpha') {
                // KASUS 1: Datang sesuai jadwal (Poin sudah -2)
                // Kita kembalikan poinnya.
                if ($isLate) {
                    $intern->increment('poin', 1); // Balik 1 (Netto -1)
                } else {
                    $intern->increment('poin', 2); // Balik 2 (Netto 0)
                }
            }

            // Safety net: Pastikan poin tidak pernah lebih dari 5 (Hard Cap)
            if ($intern->poin > 5) {
                $intern->update(['poin' => 5]);
            }

            // LOGIKA BARU: Safety net agar poin tidak pernah kurang dari 0
            if ($intern->poin < 0) {
                $intern->update(['poin' => 0]);
            }

            if (!$attendance) {
                Attendance::create([
                    'intern_id' => $intern->id,
                    'date' => $today,
                    'check_in' => $checkInTime,
                    'status' => 'hadir'
                ]);
            } else {
                $attendance->update([
                    'check_in' => $checkInTime,
                    'status' => 'hadir'
                ]);
            }

            $msg = $isLate
                ? $intern->name . ", Terlambat! Poin -1. Hadir pada " . $checkInTime
                : $intern->name . " Hadir pada " . $checkInTime;

            return response()->json([
                'success' => true,
                'message' => $msg,
                'type' => 'check_in',
                'time' => $checkInTime,
                'name' => $intern->name
            ]);
        }

        // 2. Check-Out (Sudah check_in tapi belum check_out)
        if ($attendance->check_in && !$attendance->check_out) {
            $checkInTime = Carbon::parse($today . ' ' . $attendance->check_in);
            $selisihMenit = abs($now->diffInMinutes($checkInTime));

            if ($selisihMenit < 30) {
                return response()->json([
                    'success' => false,
                    'message' => $intern->name . " Belum 30 menit dari waktu kamu hadir!",
                ], 400);
            }

            $attendance->update([
                'check_out' => $now->format('H:i')
            ]);

            return response()->json([
                'success' => true,
                'message' => $intern->name . " pulang jam " . $now->format('H:i'),
                'type' => 'check_out',
                'time' => $now->format('H:i'),
                'name' => $intern->name
            ]);
        }

        // 3. Sudah Kedua-duanya
        if ($attendance->check_in && $attendance->check_out) {
            return response()->json([
                'success' => false,
                'message' => "Kamu sudah melakukan Check In dan Check Out hari ini.",
            ], 400);
        }

        return response()->json([
            'success' => false,
            'message' => "Terjadi kesalahan pada data presensi.",
        ], 500);
    }

    private function generateDailyAttendances()
    {
        $hariIniIndex = strtolower(now()->locale('en')->isoFormat('dddd')); // Pakai en biar pasti cocok key-nya
        $hariMap = [
            'monday'    => 'senin',
            'tuesday'   => 'selasa',
            'wednesday' => 'rabu',
            'thursday'  => 'kamis',
            'friday'    => 'jumat',
        ];
        $kolom = $hariMap[$hariIniIndex] ?? null;

        if (!$kolom) return;

        $today = Carbon::today()->toDateString();

        $internsTanpaPresensi = Intern::where($kolom, true)
            ->where('is_active', true)
            ->whereDoesntHave('attendances', function ($query) use ($today) {
                $query->where('date', $today);
            })->get();

        if ($internsTanpaPresensi->count() > 0) {
            $now = Carbon::now();
            $data = [];

            foreach ($internsTanpaPresensi as $i) {
                // LOGIKA BARU: Kurangi 2 poin, tapi jangan sampai minus
                // Menggunakan max(0, hitungan) memastikan nilai minimal adalah 0
                $poinBaru = max(0, $i->poin - 2);
                
                $i->update(['poin' => $poinBaru]);

                $data[] = [
                    'intern_id' => $i->id,
                    'date' => $today,
                    'status' => 'alpha',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            Attendance::insert($data);
        }
    }
}
