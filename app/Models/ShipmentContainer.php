<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentContainer extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_id',
        'container_number',
        'type',
        'seal_number',
        'tare_weight_kg',
        'cargo_weight_kg',
        'vgm_weight_kg',
        'cbm',
        'packages_count',
        'temperature_celsius',
        'status',
    ];

    protected $casts = [
        'tare_weight_kg' => 'decimal:2',
        'cargo_weight_kg' => 'decimal:2',
        'vgm_weight_kg' => 'decimal:2',
        'cbm' => 'decimal:3',
        'packages_count' => 'integer',
        'temperature_celsius' => 'decimal:2',
    ];

    /**
     * @return BelongsTo<Shipment, $this>
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
