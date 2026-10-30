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
        'quotation_id',
        'bl_type',
        'freight_term',
        'shipper_name',
        'shipper_address',
        'consignee_name',
        'consignee_address',
        'notify_party_name',
        'notify_party_address',
        'place_of_receipt',
        'place_of_delivery',
        'bl_issue_place',
        'bl_issue_date',
        'marks_and_numbers',
        'cargo_description',
        'demurrage_free_days',
        'detention_free_days',
        'demurrage_daily_rate',
        'detention_daily_rate',
        'acid_number',
        'bayan_number',
        'customs_office',
        'customs_stage',
        'customs_duty_amount',
        'customs_vat_amount',
        'customs_fees_amount',
        'customs_assessment_date',
        'customs_payment_date',
        'delivery_order_number',
        'delivery_order_date',
        'delivery_order_status',
        'overseas_agent_id',
        'agent_share_type',
        'agent_share_percentage',
        'agent_profit_share_amount',
        'agent_debit_credit_type',
        'agent_settlement_status',
        'agent_settlement_reference',
        'financial_status',
        'financial_closed_at',
        'financial_closed_by',
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
        'bl_issue_date' => 'date:Y-m-d',
        'customs_assessment_date' => 'date:Y-m-d',
        'customs_payment_date' => 'date:Y-m-d',
        'delivery_order_date' => 'date:Y-m-d',
        'financial_closed_at' => 'datetime',
        'demurrage_free_days' => 'integer',
        'detention_free_days' => 'integer',
        'demurrage_daily_rate' => 'decimal:2',
        'detention_daily_rate' => 'decimal:2',
        'total_gross_weight_kg' => 'decimal:2',
        'total_net_weight_kg' => 'decimal:2',
        'total_volume_cbm' => 'decimal:3',
        'total_revenue' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'gross_profit' => 'decimal:2',
        'margin_percentage' => 'decimal:2',
        'customs_duty_amount' => 'decimal:2',
        'customs_vat_amount' => 'decimal:2',
        'customs_fees_amount' => 'decimal:2',
        'agent_share_percentage' => 'decimal:2',
        'agent_profit_share_amount' => 'decimal:2',
    ];

    protected $appends = [
        'documents_checklist',
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
     * @return BelongsTo<Quotation, $this>
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * @return HasMany<ShipmentDocument, $this>
     */
    public function documents(): HasMany
    {
        return $this->hasMany(ShipmentDocument::class)->latest('id');
    }

    /**
     * @return HasMany<Invoice, $this>
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Calculate documents compliance checklist
     *
     * @return array{total_required: int, uploaded_count: int, verified_count: int, percent_complete: int, items: array<string, bool>}
     */
    public function getDocumentsChecklistAttribute(): array
    {
        $requiredTypes = [
            'commercial_invoice' => 'Commercial Invoice',
            'packing_list' => 'Packing List',
            'bill_of_lading' => 'Bill of Lading / Sea Waybill',
            'certificate_of_origin' => 'Certificate of Origin',
            'delivery_order' => 'Delivery Order (D/O)',
        ];

        $uploadedDocs = $this->documents;
        $items = [];
        $verifiedCount = 0;
        $uploadedCount = 0;

        foreach ($requiredTypes as $type => $label) {
            $doc = $uploadedDocs->firstWhere('document_type', $type);
            $isUploaded = $doc !== null;
            $isVerified = $doc && $doc->status === 'verified';

            if ($isUploaded) {
                $uploadedCount++;
            }
            if ($isVerified) {
                $verifiedCount++;
            }

            $items[$type] = [
                'label' => $label,
                'uploaded' => $isUploaded,
                'verified' => $isVerified,
                'document' => $doc,
            ];
        }

        $total = count($requiredTypes);
        $percent = $total > 0 ? (int) round(($uploadedCount / $total) * 100) : 0;

        return [
            'total_required' => $total,
            'uploaded_count' => $uploadedCount,
            'verified_count' => $verifiedCount,
            'percent_complete' => $percent,
            'items' => $items,
        ];
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function overseasAgent(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'overseas_agent_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function financialClosedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'financial_closed_by');
    }

    /**
     * @return HasMany<TruckDispatch, $this>
     */
    public function truckDispatches(): HasMany
    {
        return $this->hasMany(TruckDispatch::class);
    }

    /**
     * Recalculate financial totals from associated invoices (multi-currency aware)
     */
    public function recalculateFinancials(): void
    {
        $revenue = (float) $this->invoices()
            ->whereIn('type', ['receivable', 'debit_note'])
            ->where('status', '!=', 'cancelled')
            ->selectRaw('COALESCE(SUM(total_amount * COALESCE(exchange_rate, 1)), 0) as total')
            ->value('total');

        $cost = (float) $this->invoices()
            ->whereIn('type', ['payable', 'credit_note'])
            ->where('status', '!=', 'cancelled')
            ->selectRaw('COALESCE(SUM(total_amount * COALESCE(exchange_rate, 1)), 0) as total')
            ->value('total');

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
