<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_number',
        'title',
        'category',
        'amount',
        'currency',
        'expense_date',
        'payment_method',
        'paid_to',
        'employee_id',
        'receipt_number',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'expense_date' => 'date',
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
     * User who logged this expense.
     *
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Category label in Arabic.
     */
    public function getCategoryLabelAttribute(): string
    {
        return match ($this->category) {
            'rent' => 'إيجار المقرات والفروع',
            'utilities' => 'كهرباء ومياه وإنترنت وهاتف',
            'hospitality' => 'بوفيه وضيافة ونظافة',
            'stationery' => 'أدوات مكتبية ومطبوعات وبولايص',
            'maintenance_it' => 'صيانة وأجهزة حاسوب وتقنية',
            'government_fees' => 'رسوم حكومية واشتراكات وغرفة الملاحة',
            'bank_charges' => 'مصاريف وعمولات بنكية',
            'transportation' => 'انتقالات وعلاقات عامة',
            default => 'مصروفات أخرى',
        };
    }
}
