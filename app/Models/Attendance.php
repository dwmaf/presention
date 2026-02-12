<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['intern_id', 'date', 'check_in', 'check_out'];

    public function intern()
    {
        return $this->belongsTo(Intern::class);
    }
}
