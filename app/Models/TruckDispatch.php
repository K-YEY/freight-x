<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TruckDispatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'dispatch_number',
        'shipment_id',
        'shipment_container_id',
        'trucking_company_id',
        'driver_name',
        'driver_phone',
        'driver_national_id',
        'truck_plate',
        'trailer_plate',
        'origin_address',
        'delivery_address',
        'empty_return_depot',
        'empty_return_receipt',
        'status',
        'dispatched_at',
        'loaded_at',
        'delivered_at',
        'empty_returned_at',
        'driver_cost',
        'client_charge',
        'currency',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'dispatched_at' => 'datetime',
        'loaded_at' => 'datetime',
        'delivered_at' => 'datetime',
        'empty_returned_at' => 'datetime',
        'driver_cost' => 'decimal:2',
        'client_charge' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($dispatch) {
            if (empty($dispatch->dispatch_number)) {
                $year = date('Y');
                $count = static::whereYear('created_at', $year)->count() + 1;
                do {
                    $number = sprintf('TRK-%s-%04d', $year, $count++);
                } while (static::where('dispatch_number', $number)->exists());
                $dispatch->dispatch_number = $number;
            }
        });
    }

    /**
     * @return BelongsTo<Shipment, $this>
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * @return BelongsTo<ShipmentContainer, $this>
     */
    public function container(): BelongsTo
    {
        return $this->belongsTo(ShipmentContainer::class, 'shipment_container_id');
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function truckingCompany(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'trucking_company_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
