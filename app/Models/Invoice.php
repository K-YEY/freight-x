<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'type',
        'category',
        'shipment_id',
        'partner_id',
        'currency',
        'exchange_rate',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'total_amount',
        'paid_amount',
        'balance_due',
        'status',
        'issue_date',
        'due_date',
        'payment_terms',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
        'exchange_rate' => 'decimal:4',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_due' => 'decimal:2',
    ];

    /**
     * @return BelongsTo<Shipment, $this>
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    /**
     * @return BelongsTo<Company, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'partner_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<InvoiceItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /**
     * Recalculate invoice totals from items
     */
    public function recalculateTotals(): void
    {
        $subtotal = (float) $this->items()->sum('total_price');
        $tax = (float) $this->items()->sum('tax_amount');
        $total = ($subtotal + $tax) - (float) $this->discount_amount;
        $balance = $total - (float) $this->paid_amount;

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total_amount' => $total,
            'balance_due' => max(0, $balance),
        ]);

        // Also update parent shipment financials
        if ($this->shipment_id && $this->shipment) {
            $this->shipment->recalculateFinancials();
        }
    }
}
