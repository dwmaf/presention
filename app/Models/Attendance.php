<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'intern_id', 
        'date', 
        'check_in', 
        'check_out', 
        'status'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    protected $appends = ['hari', 'terlambat'];

    public function getTerlambatAttribute()
    {
        if (!$this->check_in || $this->status !== 'hadir') {
            return null;
        }
        // Ambil string jam saja (biar gak bentrok sama tanggal)
        $jamMasuk = \Carbon\Carbon::parse($this->check_in)->format('H:i:s');
        
        $checkIn = \Carbon\Carbon::createFromFormat('H:i:s', $jamMasuk);
        $deadline = \Carbon\Carbon::createFromFormat('H:i:s', '08:30:00');
        if ($checkIn->gt($deadline)) {
            // Parameter 'true' di bawah ini gunanya biar hasilnya PASTI POSITIF
            return (int) $checkIn->diffInMinutes($deadline, true);
        }
        return null;
    }

    public function getDateAttribute($value)
    {
        return \Carbon\Carbon::parse($value)->locale('id')->isoFormat('D MMMM YYYY');
    }

    public function getHariAttribute()
    {
        return \Carbon\Carbon::parse($this->attributes['date'])->locale('id')->isoFormat('dddd');
    }

    public function intern()
    {
        return $this->belongsTo(Intern::class);
    }
}
