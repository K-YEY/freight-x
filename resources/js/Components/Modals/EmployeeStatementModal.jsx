import React from 'react';
import { X, FileText, Printer, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function EmployeeStatementModal({ isOpen, onClose, employee, onAddTransaction }) {
    const { isRTL } = useTranslation();

    if (!isOpen || !employee) return null;

    const summary = employee.financial_summary || {
        basic_salary: employee.basic_salary,
        total_salaries_accrued: 0,
        total_bonuses: 0,
        total_advances: 0,
        total_deductions: 0,
        total_paid: 0,
        net_due: 0,
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0">
            <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm print:hidden" onClick={onClose} />

            <div className="relative w-full max-w-3xl bg-[#161617] print:bg-white print:text-black border border-neutral-800 print:border-none rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-100 flex flex-col max-h-[92vh] print:max-h-none animate-fade-in">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-800 print:border-neutral-200 flex items-center justify-between bg-[#1c1c1e] print:bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 print:hidden">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-white print:text-neutral-900">
                                    كشف حساب الموظف: {employee.name}
                                </h2>
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-800 print:bg-neutral-100 text-neutral-300 print:text-neutral-800">
                                    {employee.employee_code}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400 print:text-neutral-600 mt-0.5">
                                {employee.job_title} &bull; {employee.department} &bull; الراتب الأساسي: {employee.basic_salary} {employee.currency}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5 text-blue-400" />
                            <span>طباعة الكشف</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#1c1c1e] print:bg-neutral-50 border border-neutral-800 print:border-neutral-200">
                            <span className="text-[11px] text-neutral-400 print:text-neutral-600 block">إجمالي المستحقات (رواتب+مكافآت)</span>
                            <span className="text-base font-mono font-bold text-white print:text-neutral-900 block mt-1">
                                {(summary.total_salaries_accrued + summary.total_bonuses).toLocaleString()} {employee.currency}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#1c1c1e] print:bg-neutral-50 border border-neutral-800 print:border-neutral-200">
                            <span className="text-[11px] text-amber-400 block">إجمالي السلف الشخصية</span>
                            <span className="text-base font-mono font-bold text-amber-400 block mt-1">
                                {summary.total_advances.toLocaleString()} {employee.currency}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#1c1c1e] print:bg-neutral-50 border border-neutral-800 print:border-neutral-200">
                            <span className="text-[11px] text-emerald-400 block">إجمالي ما تم صرفه</span>
                            <span className="text-base font-mono font-bold text-emerald-400 block mt-1">
                                {summary.total_paid.toLocaleString()} {employee.currency}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-blue-950/30 print:bg-blue-50 border border-blue-800/50 print:border-blue-200">
                            <span className="text-[11px] text-blue-300 print:text-blue-700 block font-bold">صافي الرصيد المستحق</span>
                            <span className="text-base font-mono font-black text-blue-400 print:text-blue-800 block mt-1">
                                {summary.net_due.toLocaleString()} {employee.currency}
                            </span>
                        </div>
                    </div>

                    {/* Transactions Ledger Table */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white print:text-neutral-900">سجل المعاملات والرواتب والسلف:</span>
                            {onAddTransaction && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onAddTransaction(employee.id);
                                    }}
                                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer print:hidden"
                                >
                                    + تسجيل حركة جديدة
                                </button>
                            )}
                        </div>

                        <div className="border border-neutral-800 print:border-neutral-300 rounded-xl overflow-hidden bg-[#1c1c1e] print:bg-white">
                            <table className="w-full text-start border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-neutral-800 print:border-neutral-200 bg-[#222225] print:bg-neutral-100 text-neutral-400 print:text-neutral-600 font-semibold">
                                        <th className="py-2.5 px-3 text-start">التاريخ</th>
                                        <th className="py-2.5 px-3 text-start">نوع المعاملة</th>
                                        <th className="py-2.5 px-3 text-start">البيان</th>
                                        <th className="py-2.5 px-3 text-start">طريقة السداد</th>
                                        <th className="py-2.5 px-3 text-end">المبلغ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800/60 print:divide-neutral-200">
                                    {employee.transactions?.length > 0 ? (
                                        employee.transactions.map((t) => {
                                            const isAddition = ['salary', 'bonus', 'allowance'].includes(t.type);
                                            return (
                                                <tr key={t.id} className="hover:bg-neutral-800/40 print:hover:bg-transparent">
                                                    <td className="py-2.5 px-3 font-mono text-neutral-300 print:text-neutral-800">
                                                        {t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            t.type === 'salary' ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50' :
                                                            t.type === 'advance' ? 'bg-amber-900/40 text-amber-300 border border-amber-700/50' :
                                                            t.type === 'bonus' ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' :
                                                            t.type === 'payment' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50' :
                                                            'bg-rose-900/40 text-rose-300 border border-rose-700/50'
                                                        }`}>
                                                            {t.type_label || t.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-neutral-300 print:text-neutral-800 max-w-xs truncate">
                                                        {t.description || t.reference_number || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-neutral-400 print:text-neutral-600 font-mono text-[11px]">
                                                        {t.payment_method === 'cash' ? 'خزينة كاش' :
                                                         t.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                                                         t.payment_method === 'instapay' ? 'إنستاباي' : t.payment_method}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-end font-mono font-bold">
                                                        <span className={isAddition ? 'text-emerald-400' : 'text-amber-400'}>
                                                            {isAddition ? '+' : '-'}{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency || employee.currency}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-neutral-500">
                                                لا توجد حركات مالية مسجلة لهذا الموظف حتى الآن.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
