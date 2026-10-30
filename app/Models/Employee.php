<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_code',
        'name',
        'job_title',
        'department',
        'phone',
        'email',
        'national_id',
        'hire_date',
        'basic_salary',
        'currency',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'basic_salary' => 'decimal:2',
        ];
    }

    /**
     * Associated software login user (if any).
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Financial transactions (salaries, advances, bonuses, deductions, disbursements).
     *
     * @return HasMany<EmployeeTransaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(EmployeeTransaction::class)->orderByDesc('transaction_date')->orderByDesc('id');
    }

    /**
     * Office expenses paid by this employee or under their custody.
     *
     * @return HasMany<OfficeExpense, $this>
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(OfficeExpense::class);
    }

    /**
     * Calculate summary financials for the employee.
     */
    public function getFinancialSummaryAttribute(): array
    {
        $transactions = $this->transactions;

        $salaries = (float) $transactions->where('type', 'salary')->where('status', 'completed')->sum('amount');
        $bonuses = (float) $transactions->whereIn('type', ['bonus', 'allowance'])->where('status', 'completed')->sum('amount');
        $advances = (float) $transactions->where('type', 'advance')->where('status', 'completed')->sum('amount');
        $deductions = (float) $transactions->where('type', 'deduction')->where('status', 'completed')->sum('amount');
        $paid = (float) $transactions->where('type', 'payment')->where('status', 'completed')->sum('amount');

        // Total accrued entitlements vs total deducted/disbursed
        $totalEntitlements = $salaries + $bonuses;
        $totalDeductedOrPaid = $advances + $deductions + $paid;
        $netDue = $totalEntitlements - $totalDeductedOrPaid;

        return [
            'basic_salary' => (float) $this->basic_salary,
            'total_salaries_accrued' => $salaries,
            'total_bonuses' => $bonuses,
            'total_advances' => $advances,
            'total_deductions' => $deductions,
            'total_paid' => $paid,
            'net_due' => round($netDue, 2),
        ];
    }
}
