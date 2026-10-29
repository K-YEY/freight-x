<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_id',
        'stage',
        'title_en',
        'title_ar',
        'location',
        'planned_date',
        'actual_date',
        'status',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'planned_date' => 'datetime',
        'actual_date' => 'datetime',
    ];

    /**
     * @return BelongsTo<Shipment, $this>
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
