<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Port extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'country',
        'city',
        'type',
        'terminal_name',
        'latitude',
        'longitude',
        'status',
    ];

    /**
     * @return HasMany<Shipment, $this>
     */
    public function shipmentsAsOrigin(): HasMany
    {
        return $this->hasMany(Shipment::class, 'origin_port_id');
    }

    /**
     * @return HasMany<Shipment, $this>
     */
    public function shipmentsAsDestination(): HasMany
    {
        return $this->hasMany(Shipment::class, 'destination_port_id');
    }
}
