<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'name_ar',
        'description',
        'status',
    ];
}
