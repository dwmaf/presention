<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Intern extends Model
{
    protected $fillable = [
        'name',
        'division_id',
        'is_active',
        'foto',
        'barcode',
        'fingerprint_data',

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

    public function fingerprint()
    {
        return $this->hasOne(Fingerprint::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function attendance()
    {
        // Mengambil satu attendance terbaru (berguna untuk eager loading harian)
        return $this->hasOne(Attendance::class)->latestOfMany();
    }
}
