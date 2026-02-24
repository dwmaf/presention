<?php

namespace App\Http\Controllers\TesPresensi;

use App\Http\Controllers\Controller;
use App\Models\Intern;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class KehadiranController extends Controller
{
    public function index()
    {
        // Dapatkan nama hari ini dalam bahasa Indonesia
        $hariIni = strtolower(now()->locale('id')->isoFormat('dddd'));

        // Jika Sabtu/Minggu, kosongkan list saja (karena magang hanya Senin-Jumat)
        $interns = collect([]);
        $today = Carbon::today()->toDateString();
        $formattedDate = now()->locale('id')->isoFormat('D MMMM YYYY');

        if (in_array($hariIni, ['senin', 'selasa', 'rabu', 'kamis', 'jumat'])) {
            // Ambil intern yang jadwal hari ininya true DAN memiliki minimal satu sidik jari
            $interns = Intern::with(['attendances' => function ($query) use ($today) {
                    $query->where('date', $today);
                }])
                ->where($hariIni, true)
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNotNull('fingerprint_data')
                          ->orWhereNotNull('second_fingerprint_data');
                })
                ->get(['id', 'name', 'fingerprint_data', 'second_fingerprint_data'])
                ->map(function ($intern) {
                    $attendance = $intern->attendances->first();
                    return [
                        'id' => (string)$intern->id,
                        'fmd' => $intern->fingerprint_data,
                        'second_fmd' => $intern->second_fingerprint_data,
                        'name' => $intern->name,
                        'check_in' => $attendance && $attendance->check_in ? $attendance->check_in : '-',
                        'check_out' => $attendance && $attendance->check_out ? $attendance->check_out : '-',
                    ];
                });
        }

        return Inertia::render('Tes Presensi/Kehadiran', [
            'fingerprintDatabase' => $interns,
            'hariIni' => ucfirst($hariIni),
            'tanggalHariIni' => $formattedDate
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'intern_id' => 'required|exists:interns,id',
        ]);

        $intern = Intern::findOrFail($request->intern_id);
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        // Cari record attendances hari ini
        $attendance = Attendance::where('intern_id', $intern->id)
                                ->where('date', $today)
                                ->first();

        if (!$attendance) {
            // Belum ada record kehadiran sama sekali hari ini (Berarti Check-In)
            Attendance::create([
                'intern_id' => $intern->id,
                'date' => $today,
                'check_in' => $now->format('H:i:s'),
                'status' => 'hadir'
            ]);

            return response()->json([
                'success' => true,
                'message' => "Check In Berhasil pada " . $now->format('H:i:s'),
                'type' => 'check_in',
                'time' => $now->format('H:i:s')
            ]);
        }

        // Jika sudah check_in tapi belum check_out
        if ($attendance->check_in && !$attendance->check_out) {
            $checkInTime = Carbon::createFromFormat('Y-m-d H:i:s', $today . ' ' . $attendance->check_in);
            $diffInMinutes = $now->diffInMinutes($checkInTime);

            if ($diffInMinutes < 30) {
                return response()->json([
                    'success' => false,
                    'message' => "Belum 30 menit dari waktu Check In!",
                ], 400); 
            }

            // Jika lebih dari 30 menit, berarti Check-Out
            $attendance->update([
                'check_out' => $now->format('H:i:s')
            ]);

            return response()->json([
                'success' => true,
                'message' => "Check Out Berhasil pada " . $now->format('H:i:s'),
                'type' => 'check_out',
                'time' => $now->format('H:i:s')
            ]);
        }

        // Jika check_in dan check_out sudah terisi
        if ($attendance->check_in && $attendance->check_out) {
            return response()->json([
                'success' => false,
                'message' => "Anda sudah melakukan Check In dan Check Out untuk hari ini!",
            ], 400);
        }
        
        return response()->json([
            'success' => false,
            'message' => "Terjadi kesalahan pada data presensi.",
        ], 500);
    }
}