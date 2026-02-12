<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Intern;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->toDateString();

        // Ambil semua intern beserta data presensi HARI INI
        $interns = Intern::with(['division', 'attendance' => function($query) use ($today) {
            $query->where('date', $today);
        }])->get();

        return Inertia::render('Attendance', [
            'interns' => $interns
        ]);
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