<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Intern extends Model
{
    protected $fillable = ['name', 'division_id', 'is_active', 'foto', 'barcode','fingerprint_data'];

    public function fingerprint()
    {
        return $this->hasOne(Fingerprint::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }
}
