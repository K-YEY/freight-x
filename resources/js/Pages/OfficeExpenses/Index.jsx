import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    DollarSign, Calendar, Filter, Plus, Edit3, Trash2, 
    Search, Tag, CreditCard, Building, FileText, CheckCircle2, TrendingDown, Wallet
} from 'lucide-react';
import AppLayout from '../../Components/AppLayout';
import { useTranslation } from '../../Context/LanguageContext';
import CreateExpenseModal from '../../Components/Modals/CreateExpenseModal';
import EditExpenseModal from '../../Components/Modals/EditExpenseModal';

export default function OfficeExpensesIndex({ expenses, employees, categoryOptions, filters, stats }) {
    const { t, isRTL } = useTranslation();

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(filters.payment_method || 'all');
    const [fromDate, setFromDate] = useState(filters.from || '');
    const [toDate, setToDate] = useState(filters.to || '');

    // Modals
    const [createOpen, setCreateOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/office-expenses', {
            search,
            category: selectedCategory,
            payment_method: selectedPaymentMethod,
            from: fromDate,
            to: toDate,
        }, { preserveState: true });
    };

    const handleFilterChange = (cat, method, from, to) => {
        setSelectedCategory(cat);
        setSelectedPaymentMethod(method);
        setFromDate(from);
        setToDate(to);

        router.get('/office-expenses', {
            search,
            category: cat,
            payment_method: method,
            from,
            to,
        }, { preserveState: true });
    };

    const handleDeleteExpense = (exp) => {
        if (window.confirm(`هل أنت متأكد من حذف مصروف (${exp.title} - ${exp.amount} ${exp.currency})؟`)) {
            router.delete(`/office-expenses/${exp.id}`);
        }
    };

    const expenseData = expenses.data || [];

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'rent': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
            case 'utilities': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25';
            case 'hospitality': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
            case 'stationery': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
            case 'maintenance_it': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25';
            case 'government_fees': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
            case 'bank_charges': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
            default: return 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/25';
        }
    };

    return (
        <AppLayout title="مصاريف المكتب والمصروفات الإدارية">
            <Head title="مصاريف المكتب والمصروفات الإدارية | Freight-X" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                
                {/* Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                                مصاريف المكتب والمصروفات الإدارية والعمومية
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                رقابة المصروفات
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            تسجيل ومتابعة إيجارات المقرات، فواتير الإنترنت والمرافق، ضيافة العملاء، المطبوعات، ورسوم الغرفة الملاحية.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-sm shadow-rose-600/30 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة مصروف مكتب جديد</span>
                    </button>
                </div>

                {/* KPI Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                            <span>مصاريف الشهر الحالي</span>
                            <Calendar className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
                            {Number(stats.this_month_total).toLocaleString()} <span className="text-xs font-normal text-neutral-400">EGP</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            إجمالي المنصرف خلال الشهر الجاري
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                            <span>مصروفات اليوم</span>
                            <Wallet className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                            {Number(stats.today_total).toLocaleString()} <span className="text-xs font-normal text-neutral-400">EGP</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            حركات الخزينة المنصرفة اليوم
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-xs font-medium">
                            <span>إجمالي المصروفات التراكمي</span>
                            <TrendingDown className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
                            {Number(stats.all_time_total).toLocaleString()} <span className="text-xs font-normal text-neutral-400">EGP</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            المصروفات العمومية والإدارية المسجلة
                        </div>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#161617] border border-neutral-200/90 dark:border-neutral-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-neutral-400">
                            <Search className="w-3.5 h-3.5" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="بحث ببيان المصروف، رقم السند، المورد..."
                            className="w-full ps-9 pe-3 py-1.5 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Category Filter */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span>التصنيف:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleFilterChange(e.target.value, selectedPaymentMethod, fromDate, toDate)}
                                className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-medium"
                            >
                                <option value="all">كل التصنيفات</option>
                                {categoryOptions.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {isRTL ? cat.label_ar : cat.label_en}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Method Filter */}
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span>طريقة السداد:</span>
                            <select
                                value={selectedPaymentMethod}
                                onChange={(e) => handleFilterChange(selectedCategory, e.target.value, fromDate, toDate)}
                                className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-[#121213] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-medium"
                            >
                                <option value="all">كل الطرق</option>
                                <option value="cash">خزينة نقدية (كاش)</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                                <option value="credit_card">فيزا / بطاقة</option>
                                <option value="instapay">إنستاباي</option>
                                <option value="cheque">شيك</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Expenses Table */}
                <div className="border border-neutral-200/90 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-[#161617] shadow-2xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#1c1c1e] text-neutral-500 dark:text-neutral-400 font-semibold">
                                    <th className="py-3 px-4 text-start">رقم المصروف</th>
                                    <th className="py-3 px-3 text-start">بيان المصروف</th>
                                    <th className="py-3 px-3 text-start">التصنيف</th>
                                    <th className="py-3 px-3 text-start">الجهة المستفيدة</th>
                                    <th className="py-3 px-3 text-start">التاريخ</th>
                                    <th className="py-3 px-3 text-start">طريقة السداد</th>
                                    <th className="py-3 px-3 text-end">المبلغ</th>
                                    <th className="py-3 px-4 text-center w-24">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
                                {expenseData.length > 0 ? (
                                    expenseData.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#1c1c1f] transition-colors">
                                            
                                            {/* Expense # */}
                                            <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                                                {exp.expense_number}
                                            </td>

                                            {/* Title */}
                                            <td className="py-3 px-3">
                                                <span className="font-bold text-neutral-900 dark:text-white block">
                                                    {exp.title}
                                                </span>
                                                {exp.receipt_number && (
                                                    <span className="text-[10px] text-neutral-400 font-mono">
                                                        إيصال: {exp.receipt_number}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Category */}
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeColor(exp.category)}`}>
                                                    {exp.category_label}
                                                </span>
                                            </td>

                                            {/* Paid To & Custody */}
                                            <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                                                <span>{exp.paid_to || '-'}</span>
                                                {exp.employee_name && (
                                                    <span className="block text-[10px] text-neutral-400">
                                                        عهدة: {exp.employee_name}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="py-3 px-3 font-mono text-neutral-500 dark:text-neutral-400">
                                                {exp.expense_date}
                                            </td>

                                            {/* Payment Method */}
                                            <td className="py-3 px-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                                                {exp.payment_method === 'cash' ? 'خزينة كاش' :
                                                 exp.payment_method === 'bank_transfer' ? 'تحويل بنكي' :
                                                 exp.payment_method === 'credit_card' ? 'بطاقة ائتمان' :
                                                 exp.payment_method === 'instapay' ? 'إنستاباي' : exp.payment_method}
                                            </td>

                                            {/* Amount */}
                                            <td className="py-3 px-3 text-end font-mono font-bold text-rose-600 dark:text-rose-400">
                                                {Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {exp.currency}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingExpense(exp)}
                                                        className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                                                        title="تعديل المصروف"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteExpense(exp)}
                                                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                        title="حذف المصروف"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-neutral-400">
                                            لم يتم العثور على مصروفات مكتبية مطابقة لشروط البحث.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateExpenseModal
                isOpen={createOpen}
                onClose={() => setCreateOpen(false)}
                categoryOptions={categoryOptions}
                employees={employees}
            />

            <EditExpenseModal
                isOpen={!!editingExpense}
                onClose={() => setEditingExpense(null)}
                expense={editingExpense}
                categoryOptions={categoryOptions}
                employees={employees}
            />
        </AppLayout>
    );
}
