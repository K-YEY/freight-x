<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quotation extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'quotation_number',
        'customer_id',
        'contact_id',
        'mode',
        'service_type',
        'incoterm',
        'origin_port_id',
        'destination_port_id',
        'commodity',
        'estimated_transit_days',
        'cargo_ready_date',
        'valid_until',
        'currency',
        'subtotal',
        'tax_amount',
        'total_amount',
        'status',
        'payment_terms',
        'terms_conditions',
        'notes',
        'converted_shipment_id',
        'converted_at',
        'created_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cargo_ready_date' => 'date',
            'valid_until' => 'date',
            'converted_at' => 'datetime',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'estimated_transit_days' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $quotation): void {
            if (empty($quotation->quotation_number)) {
                $year = date('Y');
                $count = self::whereYear('created_at', $year)->count() + 1;
                $quotation->quotation_number = sprintf('QT-%s-%04d', $year, $count);
            }
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'customer_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }

    public function originPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'origin_port_id');
    }

    public function destinationPort(): BelongsTo
    {
        return $this->belongsTo(Port::class, 'destination_port_id');
    }

    public function convertedShipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class, 'converted_shipment_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    public function recalculateTotals(): void
    {
        $subtotal = $this->items()->sum('total_price');
        $taxAmount = $this->items()->get()->sum(function (QuotationItem $item): float {
            return ($item->total_price * $item->tax_rate) / 100;
        });

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $subtotal + $taxAmount,
        ]);
    }
}
