<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'address',
        'city',
        'country',
        'capacity_cbm',
        'manager_name',
        'phone',
        'email',
        'status',
    ];

    /**
     * @return HasMany<Shipment, $this>
     */
    public function shipmentsAsLoading(): HasMany
    {
        return $this->hasMany(Shipment::class, 'loading_warehouse_id');
    }

    /**
     * @return HasMany<Shipment, $this>
     */
    public function shipmentsAsDischarge(): HasMany
    {
        return $this->hasMany(Shipment::class, 'discharge_warehouse_id');
    }
}
