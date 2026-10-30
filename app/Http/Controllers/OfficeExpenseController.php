<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\OfficeExpense;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OfficeExpenseController extends Controller
{
    /**
     * Display a listing of office and general expenses.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $category = $request->input('category');
        $paymentMethod = $request->input('payment_method');
        $from = $request->input('from');
        $to = $request->input('to');

        $query = OfficeExpense::with(['employee', 'creator'])->latest('expense_date')->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('expense_number', 'like', "%{$search}%")
                    ->orWhere('paid_to', 'like', "%{$search}%")
                    ->orWhere('receipt_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($paymentMethod && $paymentMethod !== 'all') {
            $query->where('payment_method', $paymentMethod);
        }

        if ($from) {
            $query->whereDate('expense_date', '>=', $from);
        }
        if ($to) {
            $query->whereDate('expense_date', '<=', $to);
        }

        $expenses = $query->paginate(15)->withQueryString()->through(function ($exp) {
            return [
                'id' => $exp->id,
                'expense_number' => $exp->expense_number,
                'title' => $exp->title,
                'category' => $exp->category,
                'category_label' => $exp->category_label,
                'amount' => (float) $exp->amount,
                'currency' => $exp->currency,
                'expense_date' => $exp->expense_date ? $exp->expense_date->format('Y-m-d') : null,
                'payment_method' => $exp->payment_method,
                'paid_to' => $exp->paid_to,
                'employee_id' => $exp->employee_id,
                'employee_name' => $exp->employee ? $exp->employee->name : null,
                'receipt_number' => $exp->receipt_number,
                'notes' => $exp->notes,
                'creator_name' => $exp->creator ? $exp->creator->name : null,
            ];
        });

        // Analytics & Totals
        $now = now();
        $thisMonthTotal = (float) OfficeExpense::whereYear('expense_date', $now->year)
            ->whereMonth('expense_date', $now->month)
            ->sum('amount');

        $todayTotal = (float) OfficeExpense::whereDate('expense_date', $now->toDateString())->sum('amount');
        $allTimeTotal = (float) OfficeExpense::sum('amount');

        // Category breakdown
        $categoriesBreakdown = OfficeExpense::selectRaw('category, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('category')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->category => (float) $row->total])
            ->toArray();

        $employeesList = Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_code', 'department']);

        $categoryOptions = [
            ['value' => 'rent', 'label_ar' => 'إيجار المقرات والفروع', 'label_en' => 'Office Rent'],
            ['value' => 'utilities', 'label_ar' => 'كهرباء ومياه وإنترنت وهاتف', 'label_en' => 'Utilities & Internet'],
            ['value' => 'hospitality', 'label_ar' => 'بوفيه وضيافة ونظافة', 'label_en' => 'Hospitality & Buffet'],
            ['value' => 'stationery', 'label_ar' => 'أدوات مكتبية ومطبوعات وبولايص', 'label_en' => 'Stationery & Printing'],
            ['value' => 'maintenance_it', 'label_ar' => 'صيانة وأجهزة حاسوب وتقنية', 'label_en' => 'IT & Maintenance'],
            ['value' => 'government_fees', 'label_ar' => 'رسوم حكومية واشتراكات وغرفة الملاحة', 'label_en' => 'Govt Fees & Licensing'],
            ['value' => 'bank_charges', 'label_ar' => 'مصاريف وعمولات بنكية', 'label_en' => 'Bank Charges'],
            ['value' => 'transportation', 'label_ar' => 'انتقالات وسفريات وعلاقات عامة', 'label_en' => 'Transportation & Travel'],
            ['value' => 'other', 'label_ar' => 'مصروفات مكتبية متنوعة', 'label_en' => 'Other Expenses'],
        ];

        return Inertia::render('OfficeExpenses/Index', [
            'expenses' => $expenses,
            'employees' => $employeesList,
            'categoryOptions' => $categoryOptions,
            'filters' => [
                'search' => $search,
                'category' => $category ?? 'all',
                'payment_method' => $paymentMethod ?? 'all',
                'from' => $from,
                'to' => $to,
            ],
            'stats' => [
                'this_month_total' => $thisMonthTotal,
                'today_total' => $todayTotal,
                'all_time_total' => $allTimeTotal,
                'categories_breakdown' => $categoriesBreakdown,
            ],
        ]);
    }

    /**
     * Store a newly created office expense.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:rent,utilities,hospitality,stationery,maintenance_it,government_fees,bank_charges,transportation,other'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'expense_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,credit_card,cheque,instapay'],
            'paid_to' => ['nullable', 'string', 'max:255'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'receipt_number' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        $year = now()->format('Y');
        $maxId = (OfficeExpense::whereYear('created_at', $year)->max('id') ?? 0) + 1;
        $expNumber = 'EXP-'.$year.'-'.str_pad((string) $maxId, 4, '0', STR_PAD_LEFT);

        OfficeExpense::create([
            'expense_number' => $expNumber,
            'title' => $validated['title'],
            'category' => $validated['category'],
            'amount' => (float) $validated['amount'],
            'currency' => strtoupper($validated['currency'] ?? 'EGP'),
            'expense_date' => $validated['expense_date'],
            'payment_method' => $validated['payment_method'],
            'paid_to' => $validated['paid_to'] ?? null,
            'employee_id' => $validated['employee_id'] ?? null,
            'receipt_number' => $validated['receipt_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'تم تسجيل مصروف المكتب بنجاح.');
    }

    /**
     * Update the specified office expense.
     */
    public function update(Request $request, OfficeExpense $officeExpense): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'in:rent,utilities,hospitality,stationery,maintenance_it,government_fees,bank_charges,transportation,other'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'expense_date' => ['required', 'date'],
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,credit_card,cheque,instapay'],
            'paid_to' => ['nullable', 'string', 'max:255'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'receipt_number' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string'],
        ]);

        $officeExpense->update([
            'title' => $validated['title'],
            'category' => $validated['category'],
            'amount' => (float) $validated['amount'],
            'currency' => strtoupper($validated['currency'] ?? $officeExpense->currency),
            'expense_date' => $validated['expense_date'],
            'payment_method' => $validated['payment_method'],
            'paid_to' => $validated['paid_to'] ?? null,
            'employee_id' => $validated['employee_id'] ?? null,
            'receipt_number' => $validated['receipt_number'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'تم تعديل مصروف المكتب بنجاح.');
    }

    /**
     * Remove the specified office expense.
     */
    public function destroy(OfficeExpense $officeExpense): RedirectResponse
    {
        $officeExpense->delete();

        return redirect()->back()->with('success', 'تم حذف المصروف بنجاح.');
    }
}
