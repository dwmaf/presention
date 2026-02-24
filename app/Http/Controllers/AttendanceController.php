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
        }]);

        if ($kolomJadwal) {
            $query->where($kolomJadwal, true);
        } else {
            $query->whereRaw('0 = 1');
        }

        $interns = $query->get();

        return Inertia::render('Attendance', [
            'interns'      => $interns,
            'selectedDate' => $selectedDate,
            'hariIni'      => Carbon::parse($selectedDate)->locale('id')->isoFormat('dddd'),
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
        $request->validate([
            'barcode' => 'required|string'
        ]);

        $barcode = $request->barcode;
        $intern = Intern::where('barcode', $barcode)->first();

        if (!$intern) {
            return redirect()->back()->with('error', 'Barcode tidak dikenali.');
        }

        $today = Carbon::today()->toDateString();
        $now = Carbon::now();
        
        // Cari data presensi hari ini
        $attendance = Attendance::where('intern_id', $intern->id)
                                ->where('date', $today)->first();

        if (!$attendance) {
            // Check In
            Attendance::create([
                'intern_id' => $intern->id,
                'date' => $today,
                'check_in' => $now->toTimeString(),
            ]);
            return redirect()->back()->with('success', "Selamat Pagi, {$intern->name}! Berhasil Check-in.");
        } else {
            // Logic Cooldown & Check Out
            $lastUpdate = $attendance->updated_at;
            
            // Cooldown 30 Detik (bisa diubah jadi menit) biar ga double scan ketidaksengajaan
            if ($lastUpdate->diffInMinutes($now) < 30) { 
                return redirect()->back()->with('error', "Terlalu cepat! Harap tunggu 30 menit sebelum check-out.");
            }

            if ($attendance->check_out) {
                return redirect()->back()->with('info', "Anda sudah melakukan Check-out hari ini.");
            }

            $attendance->update([
                'check_out' => $now->toTimeString()
            ]);
            
            return redirect()->back()->with('success', "Sampai Jumpa, {$intern->name}! Berhasil Check-out.");
        }
    }
}