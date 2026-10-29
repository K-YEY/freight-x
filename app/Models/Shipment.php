<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_number',
        'booking_number',
        'mbl_number',
        'hbl_number',
        'mode',
        'service_type',
        'direction',
        'customer_id',
        'shipper_id',
        'consignee_id',
        'notify_party_id',
        'carrier_id',
        'customs_broker_id',
        'trucker_id',
        'origin_port_id',
        'destination_port_id',
        'loading_warehouse_id',
        'discharge_warehouse_id',
        'vessel_id',
        'voyage_flight_number',
        'incoterm',
        'move_type',
        'commodity',
        'hs_code',
        'total_packages',
        'package_type',
        'total_gross_weight_kg',
        'total_net_weight_kg',
        'total_volume_cbm',
        'status',
        'booking_date',
        'cargo_ready_date',
        'etd',
        'atd',
        'eta',
        'ata',
        'customs_cleared_date',
        'delivery_date',
        'currency',
        'total_revenue',
        'total_cost',
        'gross_profit',
        'margin_percentage',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'booking_date' => 'date:Y-m-d',
        'cargo_ready_date' => 'date:Y-m-d',
        'etd' => 'date:Y-m-d',
        'atd' => 'date:Y-m-d',
        'eta' => 'date:Y-m-d',
        'ata' => 'date:Y-m-d',
        'customs_cleared_date' => 'date:Y-m-d',
        'delivery_date' => 'date:Y-m-d',
        'total_gross_weight_kg' => 'decimal:2',
        'total_net_weight_kg' => 'decimal:2',
        'total_volume_cbm' => 'decimal:3',
        'total_revenue' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'gross_profit' => 'decimal:2',
        'margin_percentage' => 'decimal:2',
    ];

    /**
     * @return BelongsTo<Company, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'customer_id');
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function shipper(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'shipper_id');
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function consignee(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'consignee_id');
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'carrier_id');
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function customsBroker(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'customs_broker_id');
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function trucker(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'trucker_id');
    }

    /**
     * @return BelongsTo<Port, $this>
     */
    public function originPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'origin_port_id');
    }

    /**
     * @return BelongsTo<Port, $this>
     */
    public function destinationPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'destination_port_id');
    }

    /**
     * @return BelongsTo<Warehouse, $this>
     */
    public function loadingWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'loading_warehouse_id');
    }

    /**
     * @return BelongsTo<Warehouse, $this>
     */
    public function dischargeWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'discharge_warehouse_id');
    }

    /**
     * @return BelongsTo<Vessel, $this>
     */
    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class, 'vessel_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<ShipmentContainer, $this>
     */
    public function containers(): HasMany
    {
        return $this->hasMany(ShipmentContainer::class);
    }

    /**
     * @return HasMany<ShipmentMilestone, $this>
     */
    public function milestones(): HasMany
    {
        return $this->hasMany(ShipmentMilestone::class)->orderBy('planned_date')->orderBy('id');
    }

    /**
     * @return HasMany<Invoice, $this>
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Recalculate financial totals from associated invoices
     */
    public function recalculateFinancials(): void
    {
        $revenue = (float) $this->invoices()->where('type', 'receivable')->where('status', '!=', 'cancelled')->sum('total_amount');
        $cost = (float) $this->invoices()->where('type', 'payable')->where('status', '!=', 'cancelled')->sum('total_amount');
        $profit = $revenue - $cost;
        $margin = $revenue > 0 ? round(($profit / $revenue) * 100, 2) : 0;

        $this->update([
            'total_revenue' => $revenue,
            'total_cost' => $cost,
            'gross_profit' => $profit,
            'margin_percentage' => $margin,
        ]);
    }
}
