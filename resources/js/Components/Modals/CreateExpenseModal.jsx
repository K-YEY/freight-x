import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, Plus, DollarSign, Calendar, Tag, CreditCard, User, FileText } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreateExpenseModal({ isOpen, onClose, categoryOptions = [], employees = [] }) {
    const { isRTL } = useTranslation();

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        category: 'hospitality',
        amount: '',
        currency: 'EGP',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        paid_to: '',
        employee_id: '',
        receipt_number: '',
        notes: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/office-expenses', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-[#161617] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-100 flex flex-col max-h-[92vh] animate-fade-in">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#1c1c1e]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-rose-600/15 border border-rose-500/25 flex items-center justify-center text-rose-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">إضافة مصروف مكتب جديد</h2>
                            <p className="text-[11px] text-neutral-400">تسجيل المصاريف الإدارية والعمومية وتصنيفها وطريقة السداد</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">
                            عنوان / بيان المصروف <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="مثال: فاتورة الإنترنت فايبر - شهر أكتوبر"
                            className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {errors.title && <span className="text-[11px] text-rose-400">{errors.title}</span>}
                    </div>

                    {/* Category & Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                                تصنيف المصروف <span className="text-rose-400">*</span>
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            >
                                {categoryOptions.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {isRTL ? cat.label_ar : cat.label_en}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">
                                    المبلغ <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="any"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#121213] border border-neutral-700 rounded-lg text-rose-400"
                                />
                                {errors.amount && <span className="text-[11px] text-rose-400">{errors.amount}</span>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-neutral-300">العملة</label>
                                <select
                                    value={data.currency}
                                    onChange={(e) => setData('currency', e.target.value)}
                                    className="w-full px-2 py-2 text-xs font-mono bg-[#121213] border border-neutral-700 rounded-lg text-white"
                                >
                                    <option value="EGP">EGP</option>
                                    <option value="USD">USD</option>
                                    <option value="SAR">SAR</option>
                                    <option value="AED">AED</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Date & Payment Method */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">تاريخ الصرف</label>
                            <input
                                type="date"
                                required
                                value={data.expense_date}
                                onChange={(e) => setData('expense_date', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">طريقة السداد</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            >
                                <option value="cash">نقداً (خزينة كاش)</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                                <option value="credit_card">بطاقة ائتمان / فيزا</option>
                                <option value="instapay">إنستاباي / محفظة إلكترونية</option>
                                <option value="cheque">شيك بنكي</option>
                            </select>
                        </div>
                    </div>

                    {/* Paid To & Employee Custody */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">الجهة المصروف لها / المورد</label>
                            <input
                                type="text"
                                value={data.paid_to}
                                onChange={(e) => setData('paid_to', e.target.value)}
                                placeholder="مثال: المصرية للاتصالات WE"
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">الموظف القائم بالصرف (العهدة)</label>
                            <select
                                value={data.employee_id}
                                onChange={(e) => setData('employee_id', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            >
                                <option value="">-- بدون تحديد موظف --</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.employee_code} - {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Receipt Number */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">رقم الفاتورة / الإيصال</label>
                        <input
                            type="text"
                            value={data.receipt_number}
                            onChange={(e) => setData('receipt_number', e.target.value)}
                            placeholder="مثال: INV-99042"
                            className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700 rounded-lg text-white"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">ملاحظات إضافية</label>
                        <textarea
                            rows="2"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="أي تفاصيل أو ملاحظات حول المصروف..."
                            className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-neutral-800 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{processing ? 'جاري الحفظ...' : 'حفظ المصروف'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
