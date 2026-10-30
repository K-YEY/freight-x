<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'symbol',
        'flag',
        'rate_to_usd',
        'is_auto_sync',
        'last_synced_at',
        'sort_order',
    ];

    protected $casts = [
        'rate_to_usd' => 'decimal:6',
        'is_auto_sync' => 'boolean',
        'last_synced_at' => 'datetime',
        'sort_order' => 'integer',
    ];
}
