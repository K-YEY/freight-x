<?php

namespace App\Models;

use Carbon\Carbon;
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
        'discharged_at',
        'gate_out_at',
        'empty_returned_at',
        'demurrage_days_incurred',
        'detention_days_incurred',
        'demurrage_amount',
        'detention_amount',
    ];

    protected $casts = [
        'tare_weight_kg' => 'decimal:2',
        'cargo_weight_kg' => 'decimal:2',
        'vgm_weight_kg' => 'decimal:2',
        'cbm' => 'decimal:3',
        'packages_count' => 'integer',
        'temperature_celsius' => 'decimal:2',
        'discharged_at' => 'date:Y-m-d',
        'gate_out_at' => 'date:Y-m-d',
        'empty_returned_at' => 'date:Y-m-d',
        'demurrage_days_incurred' => 'integer',
        'detention_days_incurred' => 'integer',
        'demurrage_amount' => 'decimal:2',
        'detention_amount' => 'decimal:2',
    ];

    protected $appends = [
        'demurrage_days_used',
        'demurrage_days_remaining',
        'demurrage_status',
        'detention_days_used',
        'detention_days_remaining',
        'detention_status',
    ];

    /**
     * @return BelongsTo<Shipment, $this>
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function getDemurrageDaysUsedAttribute(): int
    {
        if (! $this->discharged_at) {
            return 0;
        }

        $endDate = $this->gate_out_at ? Carbon::parse($this->gate_out_at) : now();
        $startDate = Carbon::parse($this->discharged_at);

        return max(0, $startDate->diffInDays($endDate));
    }

    public function getDemurrageDaysRemainingAttribute(): int
    {
        $freeDays = $this->shipment->demurrage_free_days ?? 14;
        $used = $this->demurrage_days_used;

        return max(0, $freeDays - $used);
    }

    public function getDemurrageStatusAttribute(): string
    {
        if (! $this->discharged_at) {
            return 'not_started';
        }

        if ($this->gate_out_at) {
            return $this->demurrage_days_incurred > 0 ? 'overdue_closed' : 'cleared_free';
        }

        $remaining = $this->demurrage_days_remaining;
        if ($remaining === 0) {
            return 'overdue';
        }

        if ($remaining <= 3) {
            return 'warning';
        }

        return 'safe';
    }

    public function getDetentionDaysUsedAttribute(): int
    {
        if (! $this->gate_out_at) {
            return 0;
        }

        $endDate = $this->empty_returned_at ? Carbon::parse($this->empty_returned_at) : now();
        $startDate = Carbon::parse($this->gate_out_at);

        return max(0, $startDate->diffInDays($endDate));
    }

    public function getDetentionDaysRemainingAttribute(): int
    {
        $freeDays = $this->shipment->detention_free_days ?? 7;
        $used = $this->detention_days_used;

        return max(0, $freeDays - $used);
    }

    public function getDetentionStatusAttribute(): string
    {
        if (! $this->gate_out_at) {
            return 'not_started';
        }

        if ($this->empty_returned_at) {
            return $this->detention_days_incurred > 0 ? 'overdue_closed' : 'returned_free';
        }

        $remaining = $this->detention_days_remaining;
        if ($remaining === 0) {
            return 'overdue';
        }

        if ($remaining <= 2) {
            return 'warning';
        }

        return 'safe';
    }

    public function calculateDemurrageAndDetention(): void
    {
        $shipment = $this->shipment;
        if (! $shipment) {
            return;
        }

        $demFree = $shipment->demurrage_free_days ?? 14;
        $demRate = (float) ($shipment->demurrage_daily_rate ?? 50.00);
        $detFree = $shipment->detention_free_days ?? 7;
        $detRate = (float) ($shipment->detention_daily_rate ?? 75.00);

        $demDaysIncurred = 0;
        $demAmount = 0.0;
        if ($this->discharged_at) {
            $demDaysUsed = $this->demurrage_days_used;
            if ($demDaysUsed > $demFree) {
                $demDaysIncurred = $demDaysUsed - $demFree;
                $demAmount = $demDaysIncurred * $demRate;
            }
        }

        $detDaysIncurred = 0;
        $detAmount = 0.0;
        if ($this->gate_out_at) {
            $detDaysUsed = $this->detention_days_used;
            if ($detDaysUsed > $detFree) {
                $detDaysIncurred = $detDaysUsed - $detFree;
                $detAmount = $detDaysIncurred * $detRate;
            }
        }

        $this->update([
            'demurrage_days_incurred' => $demDaysIncurred,
            'demurrage_amount' => $demAmount,
            'detention_days_incurred' => $detDaysIncurred,
            'detention_amount' => $detAmount,
        ]);
    }
}
