<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Role;
use Tests\TestCase;

class EmployeeAndPayrollTest extends TestCase
{
    public function test_employees_index_page_is_accessible(): void
    {
        $response = $this->get('/employees');

        $response->assertStatus(200);
    }

    public function test_can_create_new_employee_with_user_account_and_role(): void
    {
        $uniqueEmail = 'staff_test_'.uniqid().'@freight.local';
        $role = Role::first() ?? Role::create([
            'name' => 'operations',
            'display_name_ar' => 'عمليات الشحن',
            'display_name_en' => 'Freight Operations',
        ]);

        $response = $this->from('/employees')->post('/employees', [
            'name' => 'Tarek Nabil',
            'department' => 'operations',
            'job_title' => 'Freight Coordinator',
            'basic_salary' => 8500,
            'hire_date' => now()->toDateString(),
            'status' => 'active',
            'phone' => '+201099887766',
            'email' => $uniqueEmail,
            'create_user_account' => true,
            'user_email' => $uniqueEmail,
            'user_password' => 'password123',
            'role_id' => $role->id,
        ]);

        $response->assertRedirect('/employees');

        $this->assertDatabaseHas('employees', [
            'email' => $uniqueEmail,
            'department' => 'operations',
            'basic_salary' => 8500,
        ]);

        $this->assertDatabaseHas('users', [
            'email' => $uniqueEmail,
        ]);
    }

    public function test_can_create_employee_transaction_and_view_payroll(): void
    {
        $employee = Employee::first() ?? Employee::create([
            'employee_code' => 'EMP-TEST-'.rand(100, 999),
            'name' => 'Ali Fawzy',
            'department' => 'customs',
            'job_title' => 'Clearance Agent',
            'basic_salary' => 7000,
            'status' => 'active',
            'hire_date' => now()->toDateString(),
        ]);

        $response = $this->from('/employee-accounts')->post('/employee-accounts', [
            'employee_id' => $employee->id,
            'type' => 'advance',
            'amount' => 1200,
            'currency' => 'EGP',
            'payment_method' => 'cash',
            'transaction_date' => now()->toDateString(),
            'description' => 'Personal emergency advance',
        ]);

        $response->assertRedirect('/employee-accounts');

        $this->assertDatabaseHas('employee_transactions', [
            'employee_id' => $employee->id,
            'type' => 'advance',
            'amount' => 1200,
        ]);

        $indexResponse = $this->get('/employee-accounts');
        $indexResponse->assertStatus(200);
    }

    public function test_can_generate_monthly_payroll(): void
    {
        $month = now()->addMonths(3)->format('Y-m');

        $response = $this->from('/employee-accounts')->post('/employee-accounts/payroll', [
            'month' => $month,
        ]);

        $response->assertRedirect('/employee-accounts');

        $this->assertDatabaseHas('employee_transactions', [
            'type' => 'salary',
        ]);
    }

    public function test_can_create_office_expense_and_view_expenses(): void
    {
        $response = $this->from('/office-expenses')->post('/office-expenses', [
            'title' => 'High-Speed Fiber Internet Bill',
            'category' => 'utilities',
            'amount' => 1450,
            'currency' => 'EGP',
            'payment_method' => 'bank_transfer',
            'expense_date' => now()->toDateString(),
            'paid_to' => 'Telecom Egypt (WE)',
            'receipt_number' => 'REC-WE-9921',
            'notes' => 'Monthly internet package for Alexandria HQ',
        ]);

        $response->assertRedirect('/office-expenses');

        $this->assertDatabaseHas('office_expenses', [
            'title' => 'High-Speed Fiber Internet Bill',
            'category' => 'utilities',
            'amount' => 1450,
        ]);

        $indexResponse = $this->get('/office-expenses');
        $indexResponse->assertStatus(200);
    }
}
