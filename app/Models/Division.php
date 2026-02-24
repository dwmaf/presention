<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    protected $fillable = ['nama_divisi', 'deskripsi'];

    public function interns()
    {
        return $this->hasMany(Intern::class);
    }
}
