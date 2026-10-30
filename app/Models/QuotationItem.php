<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationItem extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'quotation_id',
        'charge_code',
        'description',
        'category',
        'unit_type',
        'quantity',
        'unit_price',
        'tax_rate',
        'total_price',
        'currency',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $item): void {
            $item->total_price = $item->quantity * $item->unit_price;
        });

        static::saved(function (self $item): void {
            $item->quotation?->recalculateTotals();
        });

        static::deleted(function (self $item): void {
            $item->quotation?->recalculateTotals();
        });
    }

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }
}
