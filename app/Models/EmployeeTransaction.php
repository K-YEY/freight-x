<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'type',
        'amount',
        'currency',
        'transaction_date',
        'payment_method',
        'status',
        'reference_number',
        'description',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * User who logged this transaction.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Translated Arabic type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'salary' => 'استحقاق راتب',
            'advance' => 'سلفة شخصية',
            'bonus' => 'مكافأة / حافز',
            'deduction' => 'خصم / جزاء',
            'payment' => 'صرف راتب / تسوية',
            'allowance' => 'بدل انتقال / سفر',
            default => $this->type,
        };
    }
}
