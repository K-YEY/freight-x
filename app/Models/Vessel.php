<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vessel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'imo_number',
        'mmsi',
        'call_sign',
        'flag_country',
        'vessel_type',
        'carrier_id',
        'status',
    ];

    /**
     * @return BelongsTo<Company, $this>
     */
    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'carrier_id');
    }

    /**
     * @return HasMany<Shipment, $this>
     */
    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }
}
