<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\EmployeeTransaction;
use App\Models\OfficeExpense;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StaffAndExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $opsRole = Role::where('name', 'operations')->first();
        $billingRole = Role::where('name', 'accountant')->first();
        $salesRole = Role::where('name', 'sales')->first();
        $customsRole = Role::where('name', 'customs_agent')->first();

        // 1. Link or create Alex Rivera (Admin)
        $alex = User::firstOrCreate(
            ['email' => 'alex@twenty.local'],
            [
                'name' => 'Alex Rivera',
                'password' => Hash::make('password'),
                'job_title' => 'المدير العام',
                'phone' => '+20 10 1111 2222',
                'status' => 'active',
            ]
        );
        if ($adminRole) {
            $alex->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        $empAlex = Employee::updateOrCreate(
            ['employee_code' => 'EMP-001'],
            [
                'user_id' => $alex->id,
                'name' => 'Alex Rivera',
                'job_title' => 'المدير العام والتنفيذي',
                'department' => 'management',
                'phone' => '+20 10 1111 2222',
                'email' => 'alex@twenty.local',
                'national_id' => '29001010101234',
                'hire_date' => '2022-01-01',
                'basic_salary' => 38000.00,
                'currency' => 'EGP',
                'status' => 'active',
                'notes' => 'المشرف العام على حركة الشحن والعمليات والمالية بالشركة.',
            ]
        );

        // 2. Operations Manager (Eng. Ahmed Gamal)
        $opsUser = User::firstOrCreate(
            ['email' => 'operations@freight.local'],
            [
                'name' => 'م. أحمد جمال',
                'password' => Hash::make('password'),
                'job_title' => 'مدير عمليات الشحن البحري والجوي',
                'phone' => '+20 12 3456 7891',
                'status' => 'active',
            ]
        );
        if ($opsRole) {
            $opsUser->roles()->syncWithoutDetaching([$opsRole->id]);
        }

        $empOps = Employee::updateOrCreate(
            ['employee_code' => 'EMP-002'],
            [
                'user_id' => $opsUser->id,
                'name' => 'م. أحمد جمال',
                'job_title' => 'مدير عمليات الشحن البحري والجوي',
                'department' => 'operations',
                'phone' => '+20 12 3456 7891',
                'email' => 'operations@freight.local',
                'national_id' => '29205121204481',
                'hire_date' => '2023-03-15',
                'basic_salary' => 22000.00,
                'currency' => 'EGP',
                'status' => 'active',
                'notes' => 'مسؤول الحجوزات مع ميرسك وMSC وإصدار بوالص HBL وتنسيق التعتيق.',
            ]
        );

        // 3. Senior Accountant (Youssef El-Masry)
        $accUser = User::firstOrCreate(
            ['email' => 'accountant@freight.local'],
            [
                'name' => 'يوسف المصري',
                'password' => Hash::make('password'),
                'job_title' => 'المحاسب المالي الأول',
                'phone' => '+20 11 2233 4455',
                'status' => 'active',
            ]
        );
        if ($billingRole) {
            $accUser->roles()->syncWithoutDetaching([$billingRole->id]);
        }

        $empAcc = Employee::updateOrCreate(
            ['employee_code' => 'EMP-003'],
            [
                'user_id' => $accUser->id,
                'name' => 'يوسف المصري',
                'job_title' => 'المحاسب المالي الأول',
                'department' => 'finance',
                'phone' => '+20 11 2233 4455',
                'email' => 'accountant@freight.local',
                'national_id' => '29408221405910',
                'hire_date' => '2023-06-01',
                'basic_salary' => 18000.00,
                'currency' => 'EGP',
                'status' => 'active',
                'notes' => 'مسؤول فواتير الشحن، تسويات الوكلاء الخارجيين، ومطابقة النوالين والضرائب.',
            ]
        );

        // 4. Customs Clearance Broker (Tamer Mostafa)
        $customsUser = User::firstOrCreate(
            ['email' => 'customs@freight.local'],
            [
                'name' => 'تامر مصطفى',
                'password' => Hash::make('password'),
                'job_title' => 'أخصائي التخليص الجمركي ونافذة',
                'phone' => '+20 10 9988 7766',
                'status' => 'active',
            ]
        );
        if ($customsRole) {
            $customsUser->roles()->syncWithoutDetaching([$customsRole->id]);
        }

        $empCust = Employee::updateOrCreate(
            ['employee_code' => 'EMP-004'],
            [
                'user_id' => $customsUser->id,
                'name' => 'تامر مصطفى',
                'job_title' => 'أخصائي التخليص الجمركي ونافذة',
                'department' => 'customs',
                'phone' => '+20 10 9988 7766',
                'email' => 'customs@freight.local',
                'national_id' => '28911041602930',
                'hire_date' => '2023-09-10',
                'basic_salary' => 15000.00,
                'currency' => 'EGP',
                'status' => 'active',
                'notes' => 'رخصة تخليص معتمدة رقم 3941 - ميناء الدخيلة والإسكندرية.',
            ]
        );

        // 5. Freight Sales Executive (Nourhan Radwan)
        $salesUser = User::firstOrCreate(
            ['email' => 'sales@freight.local'],
            [
                'name' => 'نورهان رضوان',
                'password' => Hash::make('password'),
                'job_title' => 'مسؤول مبيعات الشحن الدولي',
                'phone' => '+20 12 8877 6655',
                'status' => 'active',
            ]
        );
        if ($salesRole) {
            $salesUser->roles()->syncWithoutDetaching([$salesRole->id]);
        }

        $empSales = Employee::updateOrCreate(
            ['employee_code' => 'EMP-005'],
            [
                'user_id' => $salesUser->id,
                'name' => 'نورهان رضوان',
                'job_title' => 'مسؤول مبيعات الشحن الدولي',
                'department' => 'sales',
                'phone' => '+20 12 8877 6655',
                'email' => 'sales@freight.local',
                'national_id' => '29603152109420',
                'hire_date' => '2024-02-01',
                'basic_salary' => 16500.00,
                'currency' => 'EGP',
                'status' => 'active',
                'notes' => 'استقطاب العملاء المستوردين والمصدرين وتقديم عروض أسعار النولون.',
            ]
        );

        // 6. Inland Fleet & Dispatch Supervisor (Hassan Sabry)
        $empFleet = Employee::updateOrCreate(
            ['employee_code' => 'EMP-006'],
            [
                'user_id' => null,
                'name' => 'حسن صبري',
                'job_title' => 'مشرف حركة ونقل الحاويات البرية',
                'department' => 'logistics',
                'phone' => '+20 11 5566 7788',
                'email' => 'dispatch@freight.local',
                'national_id' => '28807091801120',
                'hire_date' => '2024-04-15',
                'basic_salary' => 12500.00,
                'currency' => 'EGP',
                'status' => 'active',
                'notes' => 'تنسيق أوامر التعتيق مع سائقي التريلات والمقطورات من بوابات الميناء.',
            ]
        );

        // 7. Seed Employee Account Transactions (حسابات الموظفين)
        $sampleTxns = [
            // Ahmed Gamal
            [
                'employee_id' => $empOps->id,
                'type' => 'salary',
                'amount' => 22000.00,
                'currency' => 'EGP',
                'transaction_date' => now()->subMonth()->endOfMonth()->toDateString(),
                'payment_method' => 'bank_transfer',
                'status' => 'completed',
                'reference_number' => 'SAL-2609-EMP002',
                'description' => 'استحقاق الراتب الشهري لشهر سبتمبر',
                'created_by' => $alex->id,
            ],
            [
                'employee_id' => $empOps->id,
                'type' => 'bonus',
                'amount' => 3000.00,
                'currency' => 'EGP',
                'transaction_date' => now()->subDays(12)->toDateString(),
                'payment_method' => 'cash',
                'status' => 'completed',
                'reference_number' => 'BON-2610-091',
                'description' => 'مكافأة تميز في إنهاء شحنة الـ 10 حاويات لشركة العربي بدون غرامات',
                'created_by' => $alex->id,
            ],
            [
                'employee_id' => $empOps->id,
                'type' => 'advance',
                'amount' => 4000.00,
                'currency' => 'EGP',
                'transaction_date' => now()->subDays(8)->toDateString(),
                'payment_method' => 'instapay',
                'status' => 'completed',
                'reference_number' => 'ADV-2610-104',
                'description' => 'سلفة شخصية طارئة تخصم من راتب شهر أكتوبر',
                'created_by' => $alex->id,
            ],
            // Youssef El-Masry (Accountant)
            [
                'employee_id' => $empAcc->id,
                'type' => 'salary',
                'amount' => 18000.00,
                'currency' => 'EGP',
                'transaction_date' => now()->subMonth()->endOfMonth()->toDateString(),
                'payment_method' => 'bank_transfer',
                'status' => 'completed',
                'reference_number' => 'SAL-2609-EMP003',
                'description' => 'استحقاق الراتب الشهري لشهر سبتمبر',
                'created_by' => $alex->id,
            ],
            [
                'employee_id' => $empAcc->id,
                'type' => 'payment',
                'amount' => 18000.00,
                'currency' => 'EGP',
                'transaction_date' => now()->subMonth()->endOfMonth()->addDays(2)->toDateString(),
                'payment_method' => 'bank_transfer',
                'status' => 'completed',
                'reference_number' => 'PAY-2610-001',
                'description' => 'صرف راتب شهر سبتمبر عبر التحويل البنكي لحساب الموظف',
                'created_by' => $alex->id,
            ],
            // Tamer Mostafa (Customs)
            [
                'employee_id' => $empCust->id,
                'type' => 'salary',
                'amount' => 15000.00,
                'currency' => 'EGP',
                'transaction_date' => now()->subMonth()->endOfMonth()->toDateString(),
                'payment_method' => 'cash',
                'status' => 'completed',
                'reference_number' => 'SAL-2609-EMP004',
                'description' => 'استحقاق الراتب الشهري لشهر سبتمبر',
                'created_by' => $alex->id,
            ],
            [
                'employee_id' => $empCust->id,
                'type' => 'allowance',
                'amount' => 1500.00,
                'currency' => 'EGP',
                'transaction_date' => now()->subDays(5)->toDateString(),
                'payment_method' => 'cash',
                'status' => 'completed',
                'reference_number' => 'ALW-2610-022',
                'description' => 'بدل انتقال ومأمورية كشف جمركي ميناء العين السخنة',
                'created_by' => $alex->id,
            ],
        ];

        foreach ($sampleTxns as $txn) {
            EmployeeTransaction::firstOrCreate(
                ['reference_number' => $txn['reference_number']],
                $txn
            );
        }

        // 8. Seed Office Expenses (مصاريف المكتب والمصروفات الإدارية)
        $sampleExpenses = [
            [
                'expense_number' => 'EXP-2026-0001',
                'title' => 'إيجار مقر الشركة الرئيسي - فرع الإسكندرية (سموحة)',
                'category' => 'rent',
                'amount' => 25000.00,
                'currency' => 'EGP',
                'expense_date' => now()->startOfMonth()->toDateString(),
                'payment_method' => 'bank_transfer',
                'paid_to' => 'شركة الأفق للاستثمار العقاري',
                'employee_id' => $empAcc->id,
                'receipt_number' => 'REC-ALX-9941',
                'notes' => 'سداد القيمة الإيجارية الشهرية للمقر الإداري لشهر أكتوبر.',
                'created_by' => $alex->id,
            ],
            [
                'expense_number' => 'EXP-2026-0002',
                'title' => 'فاتورة الإنترنت فايبر فائق السرعة وخطوط الهاتف الدولية',
                'category' => 'utilities',
                'amount' => 3450.00,
                'currency' => 'EGP',
                'expense_date' => now()->subDays(4)->toDateString(),
                'payment_method' => 'credit_card',
                'paid_to' => 'الشركة المصرية للاتصالات WE',
                'employee_id' => $empAcc->id,
                'receipt_number' => 'INV-WE-88301',
                'notes' => 'سداد اشتراك الفايبر المخصص للربط بنظام نافذة وخطوط التوكيلات الملاحية.',
                'created_by' => $alex->id,
            ],
            [
                'expense_number' => 'EXP-2026-0003',
                'title' => 'طباعة بوالص شحن HBL رسمية وأوراق مروسة وأظرف شحن مؤمنة',
                'category' => 'stationery',
                'amount' => 4800.00,
                'currency' => 'EGP',
                'expense_date' => now()->subDays(9)->toDateString(),
                'payment_method' => 'cash',
                'paid_to' => 'مطبعة النيل الحديثة للأوراق المالية',
                'employee_id' => $empOps->id,
                'receipt_number' => 'PRT-2026-441',
                'notes' => 'طباعة 5,000 نسخة أصلية من بولايص الشحن البحري والجوي بعلامة مائية.',
                'created_by' => $alex->id,
            ],
            [
                'expense_number' => 'EXP-2026-0004',
                'title' => 'بوفيه وضيافة عملاء ووفود الخطوط الملاحية ومشتريات نظافة',
                'category' => 'hospitality',
                'amount' => 2150.00,
                'currency' => 'EGP',
                'expense_date' => now()->subDays(6)->toDateString(),
                'payment_method' => 'cash',
                'paid_to' => 'هايبر كارفور ومورد الضيافة',
                'employee_id' => $empFleet->id,
                'receipt_number' => 'CSH-PNT-109',
                'notes' => 'بن، شاي، مياه معدنية، مستلزمات نظافة وضيافة الاجتماعات الأسبوعية.',
                'created_by' => $alex->id,
            ],
            [
                'expense_number' => 'EXP-2026-0005',
                'title' => 'رسوم اشتراك غرفة ملاحة الإسكندرية السنوية',
                'category' => 'government_fees',
                'amount' => 7500.00,
                'currency' => 'EGP',
                'expense_date' => now()->subDays(14)->toDateString(),
                'payment_method' => 'cheque',
                'paid_to' => 'غرفة ملاحة الإسكندرية',
                'employee_id' => $empAcc->id,
                'receipt_number' => 'CHQ-CHAMBER-2026',
                'notes' => 'سداد رسم تجديد شهادة عضوية غرفة الملاحة لشركات الشحن والترانزيت.',
                'created_by' => $alex->id,
            ],
            [
                'expense_number' => 'EXP-2026-0006',
                'title' => 'صيانة شبكة الحاسب الآلي وسيرفرات تتبع الحاويات',
                'category' => 'maintenance_it',
                'amount' => 3800.00,
                'currency' => 'EGP',
                'expense_date' => now()->subDays(11)->toDateString(),
                'payment_method' => 'bank_transfer',
                'paid_to' => 'سمارت تكنولوجي للحلول البرمجية',
                'employee_id' => $empOps->id,
                'receipt_number' => 'IT-SRV-901',
                'notes' => 'صيانة دورية لأجهزة مكتب العمليات والشاشات وأنظمة النسخ الاحتياطي.',
                'created_by' => $alex->id,
            ],
            [
                'expense_number' => 'EXP-2026-0007',
                'title' => 'عمولات سويفت وتحويلات نوالين للخطوط الملاحية',
                'category' => 'bank_charges',
                'amount' => 1450.00,
                'currency' => 'EGP',
                'expense_date' => now()->subDays(3)->toDateString(),
                'payment_method' => 'bank_transfer',
                'paid_to' => 'البنك التجاري الدولي CIB',
                'employee_id' => $empAcc->id,
                'receipt_number' => 'SWIFT-CIB-4820',
                'notes' => 'رسوم حوالات بنكية وسويفت لصالح خط ميرسك وهاباج لويد.',
                'created_by' => $alex->id,
            ],
        ];

        foreach ($sampleExpenses as $exp) {
            OfficeExpense::firstOrCreate(
                ['expense_number' => $exp['expense_number']],
                $exp
            );
        }
    }
}
