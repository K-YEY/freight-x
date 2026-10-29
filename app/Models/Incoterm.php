<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incoterm extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'name_ar',
        'description',
        'applicable_modes',
        'status',
    ];
}
