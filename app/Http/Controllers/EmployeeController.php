<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees and staff.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $department = $request->input('department');
        $status = $request->input('status');

        $query = Employee::with(['user.roles', 'transactions'])->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%")
                    ->orWhere('job_title', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($department && $department !== 'all') {
            $query->where('department', $department);
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $employees = $query->paginate(15)->withQueryString()->through(function ($emp) {
            return [
                'id' => $emp->id,
                'employee_code' => $emp->employee_code,
                'name' => $emp->name,
                'job_title' => $emp->job_title,
                'department' => $emp->department,
                'phone' => $emp->phone,
                'email' => $emp->email,
                'national_id' => $emp->national_id,
                'hire_date' => $emp->hire_date ? $emp->hire_date->format('Y-m-d') : null,
                'basic_salary' => (float) $emp->basic_salary,
                'currency' => $emp->currency,
                'status' => $emp->status,
                'notes' => $emp->notes,
                'user' => $emp->user ? [
                    'id' => $emp->user->id,
                    'name' => $emp->user->name,
                    'email' => $emp->user->email,
                    'roles' => $emp->user->roles->map(fn ($r) => [
                        'id' => $r->id,
                        'name' => $r->name,
                        'display_name_ar' => $r->display_name_ar,
                    ]),
                ] : null,
                'financial_summary' => $emp->financial_summary,
            ];
        });

        // Overview stats
        $totalCount = Employee::count();
        $activeCount = Employee::where('status', 'active')->count();
        $totalPayroll = (float) Employee::where('status', 'active')->sum('basic_salary');

        $roles = Role::all(['id', 'name', 'display_name_ar', 'display_name_en']);
        $departments = [
            ['value' => 'management', 'label_ar' => 'الإدارة العامة والتشغيل', 'label_en' => 'General Management'],
            ['value' => 'operations', 'label_ar' => 'عمليات الشحن واللوجستيات', 'label_en' => 'Freight Operations'],
            ['value' => 'finance', 'label_ar' => 'المحاسبة والمالية', 'label_en' => 'Finance & Accounting'],
            ['value' => 'customs', 'label_ar' => 'التخليص الجمركي ونافذة', 'label_en' => 'Customs Clearance'],
            ['value' => 'sales', 'label_ar' => 'مبيعات الشحن والعملاء', 'label_en' => 'Freight Sales'],
            ['value' => 'logistics', 'label_ar' => 'الحركة والنقل البري', 'label_en' => 'Trucking & Inland'],
        ];

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'roles' => $roles,
            'departments' => $departments,
            'filters' => [
                'search' => $search,
                'department' => $department ?? 'all',
                'status' => $status ?? 'all',
            ],
            'stats' => [
                'total_count' => $totalCount,
                'active_count' => $activeCount,
                'total_payroll' => $totalPayroll,
            ],
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'employee_code' => ['nullable', 'string', 'max:20', 'unique:employees,employee_code'],
            'job_title' => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'national_id' => ['nullable', 'string', 'max:30'],
            'hire_date' => ['nullable', 'date'],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'status' => ['required', 'string', 'in:active,inactive,on_leave,terminated'],
            'notes' => ['nullable', 'string'],
            'create_user_account' => ['nullable', 'boolean'],
            'user_email' => ['nullable', 'required_if:create_user_account,true', 'email', 'unique:users,email'],
            'user_password' => ['nullable', 'required_if:create_user_account,true', 'string', 'min:6'],
            'role_id' => ['nullable', 'required_if:create_user_account,true', 'exists:roles,id'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            // Auto-generate employee code if missing
            $code = $validated['employee_code'] ?? null;
            if (! $code) {
                $maxId = (Employee::max('id') ?? 0) + 1;
                $code = 'EMP-'.str_pad((string) $maxId, 3, '0', STR_PAD_LEFT);
            }

            $userId = null;

            if ($request->boolean('create_user_account') && ! empty($validated['user_email'])) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => strtolower(trim($validated['user_email'])),
                    'password' => Hash::make($validated['user_password']),
                    'job_title' => $validated['job_title'],
                    'phone' => $validated['phone'],
                    'status' => $validated['status'] === 'terminated' ? 'inactive' : 'active',
                ]);

                if (! empty($validated['role_id'])) {
                    $user->roles()->sync([$validated['role_id']]);
                }

                $userId = $user->id;
            }

            Employee::create([
                'user_id' => $userId,
                'employee_code' => $code,
                'name' => $validated['name'],
                'job_title' => $validated['job_title'],
                'department' => $validated['department'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? ($validated['user_email'] ?? null),
                'national_id' => $validated['national_id'] ?? null,
                'hire_date' => $validated['hire_date'] ?? now()->toDateString(),
                'basic_salary' => (float) $validated['basic_salary'],
                'currency' => strtoupper($validated['currency'] ?? 'EGP'),
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return redirect()->back()->with('success', 'تمت إضافة الموظف بنجاح.');
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'employee_code' => ['required', 'string', 'max:20', 'unique:employees,employee_code,'.$employee->id],
            'job_title' => ['required', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'national_id' => ['nullable', 'string', 'max:30'],
            'hire_date' => ['nullable', 'date'],
            'basic_salary' => ['required', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'status' => ['required', 'string', 'in:active,inactive,on_leave,terminated'],
            'notes' => ['nullable', 'string'],
            'role_id' => ['nullable', 'exists:roles,id'],
        ]);

        DB::transaction(function () use ($validated, $employee) {
            $employee->update([
                'employee_code' => $validated['employee_code'],
                'name' => $validated['name'],
                'job_title' => $validated['job_title'],
                'department' => $validated['department'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'national_id' => $validated['national_id'] ?? null,
                'hire_date' => $validated['hire_date'] ?? null,
                'basic_salary' => (float) $validated['basic_salary'],
                'currency' => strtoupper($validated['currency'] ?? 'EGP'),
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // If employee has a linked user, update their role & status
            if ($employee->user) {
                $employee->user->update([
                    'name' => $validated['name'],
                    'job_title' => $validated['job_title'],
                    'phone' => $validated['phone'] ?? null,
                    'status' => $validated['status'] === 'terminated' ? 'inactive' : 'active',
                ]);

                if (! empty($validated['role_id'])) {
                    $employee->user->roles()->sync([$validated['role_id']]);
                }
            }
        });

        return redirect()->back()->with('success', 'تم تعديل بيانات الموظف بنجاح.');
    }

    /**
     * Remove the specified employee.
     */
    public function destroy(Employee $employee): RedirectResponse
    {
        $employee->delete();

        return redirect()->back()->with('success', 'تم حذف الموظف بنجاح.');
    }
}
