<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Intern;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $query = Intern::with(['division', 'attendances' => function($q) use ($selectedDate) {
            $q->where('date', $selectedDate);
        }])->where('is_active', true);

        if ($kolomJadwal) {
            $query->where($kolomJadwal, true);
        } else {
            // Jika Sabtu/Minggu, tampilkan kosong (atau sesuaikan kebutuhan)
            $query->whereRaw('1 = 0');
        }

        $interns = $query->get();

        return Inertia::render('Attendance', [
            'interns'      => $interns,
            'selectedDate' => $selectedDate,
            'hariIni'      => Carbon::parse($selectedDate)->locale('id')->isoFormat('dddd'),
            // Tambahkan fingerprint database untuk scanner (hanya untuk hari ini)
            'fingerprintDatabase' => ($selectedDate === $today) ? $interns->map(function($i) {
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
        $selectedDate = $request->input('date', Carbon::today()->toDateString());

        $hariMap = [
            'Monday'    => 'senin',
            'Tuesday'   => 'selasa',
            'Wednesday' => 'rabu',
            'Thursday'  => 'kamis',
            'Friday'    => 'jumat',
        ];
        $hariInggris = Carbon::parse($selectedDate)->format('l');
        $kolomJadwal = $hariMap[$hariInggris] ?? null;

        $hidden = [
            'total_kehadiran', 'total_jam', 'total_izin', 'total_sakit',
            'total_alpha', 'avg_jam_masuk', 'avg_jam_pulang', 'latest_attendance',
            'fingerprint_data', 'second_fingerprint_data',
        ];

        // Semua intern aktif + attendance hari itu (untuk stat card)
        $allInterns = Intern::with(['attendances' => function ($q) use ($selectedDate) {
            $q->where('date', $selectedDate);
        }])->where('is_active', true)->get();

        $totalKaryawan = $allInterns->count();

        // Intern terjadwal hari ini untuk grid + stat hadir/tidakHadir/terlambat
        $query = Intern::with(['attendances' => function ($q) use ($selectedDate) {
            $q->where('date', $selectedDate);
        }])->where('is_active', true);

        if ($kolomJadwal) {
            $query->where($kolomJadwal, true);
        } else {
            $query->whereRaw('1 = 0');
        }

        $scheduledInterns = $query->get();

        $telahHadir = $scheduledInterns->filter(fn($i) => optional($i->attendances->first())->status === 'hadir')->count();
        $tidakHadir = $scheduledInterns->filter(fn($i) => !$i->attendances->first() || $i->attendances->first()->status !== 'hadir')->count();
        $terlambat  = $scheduledInterns->filter(fn($i) => optional($i->attendances->first())->terlambat > 0)->count();

        $interns = $scheduledInterns->makeHidden($hidden);

        return Inertia::render('Dashboard', [
            'interns'       => $interns,
            'selectedDate'  => $selectedDate,
            'stats' => [
                'totalKaryawan' => $totalKaryawan,
                'telahHadir'    => $telahHadir,
                'tidakHadir'    => $tidakHadir,
                'terlambat'     => $terlambat,
            ],
        ]);
    }

    public function updateStatus(Request $request, Attendance $attendance)
    {
        $request->validate([
            'status' => 'required|in:hadir,izin,sakit,alpha'
        ]);

        $attendance->update([
            'status' => $request->status
        ]);

        return redirect()->back()->with('success', 'Status kehadiran berhasil diperbarui.');
    }

    public function store(Request $request)
    {
        
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
            $checkInTime = $now->format('H:i:s');
            
            // Logic Potong Poin jika terlambat (> 08:30)
            $isLate = $now->format('H:i:s') > '08:30:00';
            if ($isLate) {
                $intern->decrement('poin');
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
                ? "Terlambat! Poin berkurang 1. Check In Berhasil pada " . $checkInTime 
                : "Check In Berhasil pada " . $checkInTime;

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
            $checkInTime = Carbon::createFromFormat('Y-m-d H:i:s', $today . ' ' . $attendance->check_in);
            $selisihMenit = abs($now->diffInMinutes($checkInTime));

            if ($selisihMenit < 30) {
                return response()->json([
                    'success' => false,
                    'message' => "Belum 30 menit dari waktu Check In!",
                ], 400); 
            }

            $attendance->update([
                'check_out' => $now->format('H:i:s')
            ]);

            return response()->json([
                'success' => true,
                'message' => "Check Out Berhasil pada " . $now->format('H:i:s'),
                'type' => 'check_out',
                'time' => $now->format('H:i:s'),
                'name' => $intern->name
            ]);
        }

        // 3. Sudah Kedua-duanya
        if ($attendance->check_in && $attendance->check_out) {
            return response()->json([
                'success' => false,
                'message' => "Anda sudah melakukan Check In dan Check Out hari ini.",
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
            ->whereDoesntHave('attendances', function($query) use ($today) {
                $query->where('date', $today);
            })->get();

        if ($internsTanpaPresensi->count() > 0) {
            $now = Carbon::now();
            $data = $internsTanpaPresensi->map(fn($i) => [
                'intern_id' => $i->id,
                'date' => $today,
                'status' => 'alpha',
                'created_at' => $now,
                'updated_at' => $now,
            ])->toArray();

            Attendance::insert($data);
        }
    }
}