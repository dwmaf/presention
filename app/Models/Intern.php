<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Intern extends Model
{
    protected $fillable = [
        'name',
        'division_id',
        'is_active',
        'foto',
        'barcode',
        'fingerprint_data',
        'second_fingerprint_data',
        'fingerprint_data_3',
        'fingerprint_data_4',
        'fingerprint_data_5',
        'fingerprint_data_6',
        'senin',
        'selasa',
        'rabu',
        'kamis',
        'jumat',
        'poin',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'senin' => 'boolean',
        'selasa' => 'boolean',
        'rabu' => 'boolean',
        'kamis' => 'boolean',
        'jumat' => 'boolean',
        'poin' => 'integer',
    ];

    protected $appends = [
        'total_kehadiran',
        'total_jam',
        'total_izin',
        'total_sakit',
        'total_alpha',
        'avg_jam_masuk',
        'avg_jam_pulang',
        'latest_attendance',
    ];

    public function getLatestAttendanceAttribute()
    {
        return $this->attendances()->latest('date')->first();
    }

    public function fingerprint()
    {
        return $this->hasOne(Fingerprint::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class)->orderBy('date', 'desc');
    }

    public function latestAttendance()
    {
        return $this->hasOne(Attendance::class)->latestOfMany();
    }

    // --- Accessors for Stats ---

    public function getTotalKehadiranAttribute()
    {
        return $this->attendances()->where('status', 'hadir')->count();
    }

    public function getTotalJamAttribute()
    {
        // Menghitung selisih jam langsung dari database (dalam detik) lalu dikonversi ke jam
        // $seconds = $this->attendances()
        //     ->where('status', 'hadir')
        //     ->whereNotNull('check_in')
        //     ->whereNotNull('check_out')
        //     ->sum(\DB::raw('TIME_TO_SEC(TIMEDIFF(check_out, check_in))'));
            
        // return round($seconds / 3600, 2);

        $attendances = $this->attendances()
            ->where('status', 'hadir')
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->get();

        $totalSeconds = $attendances->sum(function ($attendance) {
            $in = Carbon::parse($attendance->check_in);
            $out = Carbon::parse($attendance->check_out);
            return $out->diffInSeconds($in);
        });

        return round($totalSeconds / 3600, 2);
    }

    public function getTotalIzinAttribute()
    {
        return $this->attendances()->where('status', 'izin')->count();
    }

    public function getTotalSakitAttribute()
    {
        return $this->attendances()->where('status', 'sakit')->count();
    }

    public function getTotalAlphaAttribute()
    {
        return $this->attendances()->where('status', 'alpha')->count();
    }

    public function getAvgJamMasukAttribute()
    {
        // $avg = $this->attendances()
        //     ->whereNotNull('check_in')
        //     ->where('status', 'hadir')
        //     ->avg(\DB::raw('TIME_TO_SEC(check_in)'));
        
        // return $avg ? gmdate("H:i", $avg) : '-';
        $attendances = $this->attendances()
            ->where('status', 'hadir')
            ->whereNotNull('check_in')
            ->get();

        if ($attendances->isEmpty()) return '-';

        $totalSeconds = $attendances->sum(function ($attendance) {
            // Ambil jam saja misal "08:00:00" -> convert ke detik dari awal hari
            return Carbon::parse($attendance->check_in)->secondsSinceMidnight();
        });

        $avgContext = $totalSeconds / $attendances->count();
        return gmdate("H:i", $avgContext);
    }

    public function getAvgJamPulangAttribute()
    {
        // $avg = $this->attendances()
        //     ->whereNotNull('check_out')
        //     ->where('status', 'hadir')
        //     ->avg(\DB::raw('TIME_TO_SEC(check_out)'));
            
        // return $avg ? gmdate("H:i", $avg) : '-';
        $attendances = $this->attendances()
            ->where('status', 'hadir')
            ->whereNotNull('check_out')
            ->get();

        if ($attendances->isEmpty()) return '-';

        $totalSeconds = $attendances->sum(function ($attendance) {
            return Carbon::parse($attendance->check_out)->secondsSinceMidnight();
        });

        $avgContext = $totalSeconds / $attendances->count();
        return gmdate("H:i", $avgContext);
    }
}
