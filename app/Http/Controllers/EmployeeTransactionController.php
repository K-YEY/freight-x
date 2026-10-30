<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeTransactionController extends Controller
{
    /**
     * Display a listing of employee accounts and payroll transactions.
     */
    public function index(Request $request): Response
    {
        $employeeId = $request->input('employee_id');
        $type = $request->input('type');
        $from = $request->input('from');
        $to = $request->input('to');

        $query = EmployeeTransaction::with(['employee', 'creator'])->latest('transaction_date')->latest('id');

        if ($employeeId && $employeeId !== 'all') {
            $query->where('employee_id', $employeeId);
        }

        if ($type && $type !== 'all') {
            $query->where('type', $type);
        }

        if ($from) {
            $query->whereDate('transaction_date', '>=', $from);
        }
        if ($to) {
            $query->whereDate('transaction_date', '<=', $to);
        }

        $transactions = $query->paginate(20)->withQueryString()->through(function ($t) {
            return [
                'id' => $t->id,
                'employee_id' => $t->employee_id,
                'employee_name' => $t->employee ? $t->employee->name : 'N/A',
                'employee_code' => $t->employee ? $t->employee->employee_code : 'N/A',
                'department' => $t->employee ? $t->employee->department : 'N/A',
                'type' => $t->type,
                'type_label' => $t->type_label,
                'amount' => (float) $t->amount,
                'currency' => $t->currency,
                'transaction_date' => $t->transaction_date ? $t->transaction_date->format('Y-m-d') : null,
                'payment_method' => $t->payment_method,
                'status' => $t->status,
                'reference_number' => $t->reference_number,
                'description' => $t->description,
                'creator_name' => $t->creator ? $t->creator->name : null,
            ];
        });

        // Summary calculations
        $totalSalaries = (float) EmployeeTransaction::where('type', 'salary')->where('status', 'completed')->sum('amount');
        $totalBonuses = (float) EmployeeTransaction::whereIn('type', ['bonus', 'allowance'])->where('status', 'completed')->sum('amount');
        $totalAdvances = (float) EmployeeTransaction::where('type', 'advance')->where('status', 'completed')->sum('amount');
        $totalDeductions = (float) EmployeeTransaction::where('type', 'deduction')->where('status', 'completed')->sum('amount');
        $totalPaid = (float) EmployeeTransaction::where('type', 'payment')->where('status', 'completed')->sum('amount');
        $netDue = ($totalSalaries + $totalBonuses) - ($totalAdvances + $totalDeductions + $totalPaid);

        $employeesList = Employee::orderBy('name')->get(['id', 'employee_code', 'name', 'basic_salary', 'currency', 'status']);

        return Inertia::render('EmployeeAccounts/Index', [
            'transactions' => $transactions,
            'employees' => $employeesList,
            'filters' => [
                'employee_id' => $employeeId ?? 'all',
                'type' => $type ?? 'all',
                'from' => $from,
                'to' => $to,
            ],
            'stats' => [
                'total_salaries' => $totalSalaries,
                'total_bonuses' => $totalBonuses,
                'total_advances' => $totalAdvances,
                'total_deductions' => $totalDeductions,
                'total_paid' => $totalPaid,
                'net_due' => round($netDue, 2),
            ],
        ]);
    }

    /**
     * Store a newly created transaction (advance, bonus, deduction, payment, salary).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'type' => ['required', 'string', 'in:salary,advance,bonus,deduction,payment,allowance'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'transaction_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,instapay,cheque'],
            'reference_number' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $employee = Employee::findOrFail($validated['employee_id']);

        // Generate ref number if not provided
        $ref = $validated['reference_number'] ?? null;
        if (! $ref) {
            $prefix = match ($validated['type']) {
                'salary' => 'SAL-',
                'advance' => 'ADV-',
                'bonus' => 'BON-',
                'deduction' => 'DED-',
                'payment' => 'PAY-',
                default => 'TXN-',
            };
            $ref = $prefix.now()->format('ymd').'-'.rand(100, 999);
        }

        EmployeeTransaction::create([
            'employee_id' => $employee->id,
            'type' => $validated['type'],
            'amount' => (float) $validated['amount'],
            'currency' => strtoupper($validated['currency'] ?? $employee->currency ?? 'EGP'),
            'transaction_date' => $validated['transaction_date'],
            'payment_method' => $validated['payment_method'],
            'status' => 'completed',
            'reference_number' => $ref,
            'description' => $validated['description'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'تم تسجيل حركة حساب الموظف بنجاح.');
    }

    /**
     * Bulk action: generate monthly salary accrual for all active employees.
     */
    public function generateMonthlyPayroll(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
            'notes' => ['nullable', 'string'],
        ]);

        $targetDate = Carbon::createFromFormat('Y-m', $validated['month'])->endOfMonth();
        $monthName = $targetDate->translatedFormat('F Y');

        $activeEmployees = Employee::where('status', 'active')->where('basic_salary', '>', 0)->get();

        if ($activeEmployees->isEmpty()) {
            return redirect()->back()->with('error', 'لا يوجد موظفين نشطين برواتب محددة لإصدار مسير الرواتب لهم.');
        }

        $issuedCount = 0;

        DB::transaction(function () use ($activeEmployees, $targetDate, $monthName, $validated, &$issuedCount) {
            foreach ($activeEmployees as $emp) {
                // Check if salary for this month already exists to avoid duplication
                $alreadyExists = EmployeeTransaction::where('employee_id', $emp->id)
                    ->where('type', 'salary')
                    ->whereYear('transaction_date', $targetDate->year)
                    ->whereMonth('transaction_date', $targetDate->month)
                    ->exists();

                if (! $alreadyExists) {
                    EmployeeTransaction::create([
                        'employee_id' => $emp->id,
                        'type' => 'salary',
                        'amount' => (float) $emp->basic_salary,
                        'currency' => $emp->currency,
                        'transaction_date' => $targetDate->toDateString(),
                        'payment_method' => 'cash',
                        'status' => 'completed',
                        'reference_number' => 'SAL-'.$targetDate->format('ym').'-'.$emp->employee_code,
                        'description' => 'استحقاق الراتب الشهري لشهر '.$monthName.' ('.$emp->job_title.')'.(! empty($validated['notes']) ? ' - '.$validated['notes'] : ''),
                        'created_by' => Auth::id(),
                    ]);
                    $issuedCount++;
                }
            }
        });

        if ($issuedCount === 0) {
            return redirect()->back()->with('error', 'تم إصدار رواتب شهر '.$monthName.' لجميع الموظفين بالفعل مسبقاً.');
        }

        return redirect()->back()->with('success', "تم إصدار مسير رواتب شهر {$monthName} لعدد ({$issuedCount}) موظف بنجاح.");
    }

    /**
     * Delete/void an employee transaction.
     */
    public function destroy(EmployeeTransaction $transaction): RedirectResponse
    {
        $transaction->delete();

        return redirect()->back()->with('success', 'تم حذف حركة حساب الموظف بنجاح.');
    }
}
