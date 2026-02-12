<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Intern extends Model
{
    protected $fillable = ['name', 'division', 'is_active'];

    public function fingerprint()
    {
        return $this->hasOne(Fingerprint::class);
    }
}
