import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    DollarSign, Calendar, Filter, Plus, Printer, Trash2, 
    CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft, 
    Sparkles, Users, FileText, Check, X, ShieldCheck
} from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import { useTranslation } from '../../Context/LanguageContext';
import AddEmployeeTransactionModal from '../../Components/Modals/AddEmployeeTransactionModal';

export default function EmployeeAccountsIndex({ transactions, employees, filters, stats }) {
    const { t, isRTL } = useTranslation();

    const [selectedEmployee, setSelectedEmployee] = useState(filters.employee_id || 'all');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [fromDate, setFromDate] = useState(filters.from || '');
    const [toDate, setToDate] = useState(filters.to || '');

    // Modals
    const [addTxnOpen, setAddTxnOpen] = useState(false);
    const [payrollModalOpen, setPayrollModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [isIssuingPayroll, setIsIssuingPayroll] = useState(false);
    const [printableVoucher, setPrintableVoucher] = useState(null);

    const handleFilterChange = (emp, type, from, to) => {
        setSelectedEmployee(emp);
        setSelectedType(type);
        setFromDate(from);
        setToDate(to);

        router.get('/employee-accounts', {
            employee_id: emp,
            type,
            from,
            to,
        }, { preserveState: true });
    };

    const handleGeneratePayrollSubmit = (e) => {
        e.preventDefault();
        setIsIssuingPayroll(true);
        router.post('/employee-accounts/payroll', {
            month: selectedMonth,
        }, {
            onFinish: () => {
                setIsIssuingPayroll(false);
                setPayrollModalOpen(false);
            },
        });
    };

    const handleDeleteTransaction = (txn) => {
        if (window.confirm(`هل أنت متأكد من حذف حركة (${txn.type_label} - ${txn.amount} ${txn.currency})؟`)) {
            router.delete(`/employee-accounts/${txn.id}`);
        }
    };

    const handlePrintVoucher = (txn) => {
        setPrintableVoucher(txn);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const txnData = transactions.data || [];

    return (
        <AppLayout title={t('employee_accounts')}>
            <Head title={`${t('employee_accounts')} | ${t('app_name')}`} />

            <div className="p-6 space-y-6 max-w-7xl mx-auto print:p-0">
                
                {/* Title & Top Actions (Hidden in Print) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                {t('employee_accounts')}
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {isRTL ? 'رواتب • سلف • حوافز' : 'Payroll • Advances • Bonuses'}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {isRTL 
                                ? 'متابعة استحقاقات الرواتب الشهرية، السلف الشخصية، الخصومات والبدلات، وسندات الصرف النقدية والبنكية.'
                                : 'Track staff monthly salaries, cash advances, deductions, allowances, and payment vouchers.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPayrollModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer shadow-sm shadow-purple-600/30 active:scale-95"
                        >
                            <Calendar className="w-4 h-4" />
                            <span>{t('issue_monthly_payroll')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setAddTxnOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm shadow-emerald-600/30 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t('record_transaction')}</span>
                        </button>
                    </div>
                </div>

                {/* KPI Overview Cards (Hidden in Print) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">{t('salary')}</span>
                        <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 block mt-1">
                            {Number(stats.total_salaries).toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">EGP</span>
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">{t('total_advances')}</span>
                        <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 block mt-1">
                            {Number(stats.total_advances).toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">EGP</span>
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">{t('total_bonuses')}</span>
                        <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 block mt-1">
                            {Number(stats.total_bonuses).toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">EGP</span>
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">{t('total_deductions')}</span>
                        <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400 block mt-1">
                            {Number(stats.total_deductions).toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">EGP</span>
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">{t('paid_amount')}</span>
                        <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                            {Number(stats.total_paid).toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">EGP</span>
                        </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-950/20 dark:bg-blue-950/30 border border-blue-800/40 shadow-2xs">
                        <span className="text-[11px] text-blue-600 dark:text-blue-300 block font-bold">{t('remaining_balance')}</span>
                        <span className="text-base font-black font-mono text-blue-600 dark:text-blue-400 block mt-1">
                            {Number(stats.net_due).toLocaleString()} <span className="text-[10px] font-normal text-blue-400">EGP</span>
                        </span>
                    </div>
                </div>

                {/* Filters Bar (Hidden in Print) */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Employee Filter */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span>الموظف:</span>
                            <select
                                value={selectedEmployee}
                                onChange={(e) => handleFilterChange(e.target.value, selectedType, fromDate, toDate)}
                                className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-medium"
                            >
                                <option value="all">كل الموظفين</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.employee_code} - {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Transaction Type Filter */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span>نوع المعاملة:</span>
                            <select
                                value={selectedType}
                                onChange={(e) => handleFilterChange(selectedEmployee, e.target.value, fromDate, toDate)}
                                className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-medium"
                            >
                                <option value="all">كل المعاملات</option>
                                <option value="salary">استحقاق راتب شهري</option>
                                <option value="advance">سلفة شخصية</option>
                                <option value="bonus">مكافأة / حافز</option>
                                <option value="deduction">خصم / جزاء</option>
                                <option value="payment">صرف راتب / تسوية</option>
                                <option value="allowance">بدل انتقال / مأمورية</option>
                            </select>
                        </div>
                    </div>

                    {/* Date range filters */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>من:</span>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => handleFilterChange(selectedEmployee, selectedType, e.target.value, toDate)}
                            className="px-2 py-1 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
                        />
                        <span>إلى:</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => handleFilterChange(selectedEmployee, selectedType, fromDate, e.target.value)}
                            className="px-2 py-1 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
                        />
                    </div>
                </div>

                {/* Ledger Transactions Table (Hidden when printing single voucher) */}
                <div className="border border-neutral-200/90 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-[#161617] shadow-2xs print:hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1c1c1e] text-neutral-500 dark:text-neutral-400 font-semibold">
                                    <th className="py-3 px-4 text-start">رقم القيد / السند</th>
                                    <th className="py-3 px-3 text-start">الموظف</th>
                                    <th className="py-3 px-3 text-start">نوع المعاملة</th>
                                    <th className="py-3 px-3 text-start">البيان والتفاصيل</th>
                                    <th className="py-3 px-3 text-start">تاريخ الحركة</th>
                                    <th className="py-3 px-3 text-start">طريقة السداد</th>
                                    <th className="py-3 px-3 text-end">المبلغ</th>
                                    <th className="py-3 px-4 text-center w-28">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
                                {txnData.length > 0 ? (
                                    txnData.map((t) => {
                                        const isAddition = ['salary', 'bonus', 'allowance'].includes(t.type);

                                        return (
                                            <tr key={t.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#1c1c1f] transition-colors">
                                                
                                                {/* Ref */}
                                                <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                                                    {t.reference_number || `TXN-${t.id}`}
                                                </td>

                                                {/* Employee */}
                                                <td className="py-3 px-3">
                                                    <span className="font-bold text-neutral-900 dark:text-white block">
                                                        {t.employee_name}
                                                    </span>
                                                    <span className="font-mono text-[10px] text-neutral-400">
                                                        {t.employee_code} &bull; {t.department}
                                                    </span>
                                                </td>

                                                {/* Type Badge */}
                                                <td className="py-3 px-3">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                                        t.type === 'salary' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' :
                                                        t.type === 'advance' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                        t.type === 'bonus' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                                                        t.type === 'payment' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                                                        'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                    }`}>
                                                        {t.type_label}
                                                    </span>
                                                </td>

                                                {/* Description */}
                                                <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300 max-w-xs truncate">
                                                    {t.description || '-'}
                                                </td>

                                                {/* Date */}
                                                <td className="py-3 px-3 font-mono text-neutral-500 dark:text-neutral-400">
                                                    {t.transaction_date}
                                                </td>

                                                {/* Method */}
                                                <td className="py-3 px-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                                                    {t.payment_method === 'cash' ? 'خزينة كاش' :
                                                     t.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                                                     t.payment_method === 'instapay' ? 'إنستاباي' : t.payment_method}
                                                </td>

                                                {/* Amount */}
                                                <td className="py-3 px-3 text-end font-mono font-bold">
                                                    <span className={isAddition ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                                                        {isAddition ? '+' : '-'}{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrintVoucher(t)}
                                                            className="p-1.5 rounded-lg text-neutral-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                                                            title="طباعة سند الصرف"
                                                        >
                                                            <Printer className="w-3.5 h-3.5" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteTransaction(t)}
                                                            className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                            title="حذف القيد"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-neutral-400">
                                            لم يتم العثور على قيود أو معاملات مالية مطابقة.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Printable Official Cash Payment Voucher (سند صرف نقدية رسمي) */}
                {printableVoucher && (
                    <div className="hidden print:block p-8 bg-white text-black font-sans max-w-2xl mx-auto border-2 border-neutral-900 rounded-xl space-y-6">
                        {/* Company Header */}
                        <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4">
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-wider">Freight-X Logistics Ltd</h1>
                                <p className="text-xs text-neutral-600">شركة خدمات الشحن الدولي والنقل والتخليص الجمركي</p>
                                <p className="text-xs text-neutral-500 font-mono">الإسكندرية - القاهرة &bull; ت: +20 3 481 9000</p>
                            </div>
                            <div className="text-end">
                                <div className="inline-block border-2 border-neutral-900 px-4 py-1.5 rounded font-bold text-sm bg-neutral-100">
                                    سند صرف نقدية / تحويل
                                </div>
                                <div className="text-xs font-mono mt-1 font-bold">
                                    رقم: {printableVoucher.reference_number}
                                </div>
                                <div className="text-xs text-neutral-600 font-mono">
                                    التاريخ: {printableVoucher.transaction_date}
                                </div>
                            </div>
                        </div>

                        {/* Amount Box */}
                        <div className="p-3 bg-neutral-100 border border-neutral-400 rounded-lg flex items-center justify-between text-sm">
                            <span className="font-bold">المبلغ المصروف:</span>
                            <span className="font-mono font-black text-lg">
                                {Number(printableVoucher.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {printableVoucher.currency}
                            </span>
                        </div>

                        {/* Details Table */}
                        <div className="space-y-3 text-sm">
                            <div className="flex border-b border-neutral-300 py-1.5">
                                <span className="w-32 font-bold text-neutral-700">يُصرف إلى السيد:</span>
                                <span className="font-bold text-neutral-900">{printableVoucher.employee_name} ({printableVoucher.employee_code})</span>
                            </div>

                            <div className="flex border-b border-neutral-300 py-1.5">
                                <span className="w-32 font-bold text-neutral-700">الوظيفة والقسم:</span>
                                <span>{printableVoucher.department}</span>
                            </div>

                            <div className="flex border-b border-neutral-300 py-1.5">
                                <span className="w-32 font-bold text-neutral-700">نوع الحركة:</span>
                                <span className="font-bold">{printableVoucher.type_label}</span>
                            </div>

                            <div className="flex border-b border-neutral-300 py-1.5">
                                <span className="w-32 font-bold text-neutral-700">طريقة الصرف:</span>
                                <span>{printableVoucher.payment_method === 'cash' ? 'خزينة نقدية (كاش)' : printableVoucher.payment_method}</span>
                            </div>

                            <div className="flex border-b border-neutral-300 py-1.5">
                                <span className="w-32 font-bold text-neutral-700">وذلك عن (البيان):</span>
                                <span className="font-medium">{printableVoucher.description || 'صرف مستحقات موظف'}</span>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs">
                            <div className="border-t border-neutral-400 pt-2">
                                <span className="block font-bold">المستلم (الموظف)</span>
                                <span className="block text-[11px] text-neutral-500 mt-6">التوقيع: .....................</span>
                            </div>
                            <div className="border-t border-neutral-400 pt-2">
                                <span className="block font-bold">المحاسب المالي</span>
                                <span className="block text-[11px] text-neutral-500 mt-6">التوقيع: .....................</span>
                            </div>
                            <div className="border-t border-neutral-400 pt-2">
                                <span className="block font-bold">اعتماد الإدارة العامة</span>
                                <span className="block text-[11px] text-neutral-500 mt-6">التوقيع والختم: .....................</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Add Transaction */}
            <AddEmployeeTransactionModal
                isOpen={addTxnOpen}
                onClose={() => setAddTxnOpen(false)}
                employees={employees}
            />

            {/* Modal: Bulk Generate Monthly Payroll */}
            {payrollModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm" onClick={() => setPayrollModalOpen(false)} />
                    <div className="relative w-full max-w-md bg-[#161617] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 text-neutral-100 space-y-4 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-400" />
                                <h2 className="text-sm font-bold text-white">إصدار مسير رواتب الشهر</h2>
                            </div>
                            <button onClick={() => setPayrollModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-neutral-400">
                            سيقوم النظام آلياً بإصدار قيد استحقاق الراتب الشهري (Salary Accrual) لجميع الموظفين النشطين حسب الراتب الأساسي المسجل لكل موظف.
                        </p>

                        <form onSubmit={handleGeneratePayrollSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">
                                    شهر الاستحقاق (Year - Month):
                                </label>
                                <input
                                    type="month"
                                    required
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#121213] border border-neutral-700 rounded-lg text-white"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setPayrollModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-neutral-800"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={isIssuingPayroll}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{isIssuingPayroll ? 'جاري الإصدار...' : 'توليد قيود الرواتب الآن'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
