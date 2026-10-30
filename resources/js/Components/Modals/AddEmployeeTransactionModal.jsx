import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, DollarSign, PlusCircle, Calendar, CreditCard, FileText } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function AddEmployeeTransactionModal({ isOpen, onClose, employees = [], defaultEmployeeId = null }) {
    const { isRTL } = useTranslation();

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: defaultEmployeeId || (employees[0]?.id || ''),
        type: 'advance', // advance, bonus, deduction, payment, salary, allowance
        amount: '',
        currency: 'EGP',
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        description: '',
    });

    useEffect(() => {
        if (defaultEmployeeId) {
            setData('employee_id', defaultEmployeeId);
        } else if (employees.length && !data.employee_id) {
            setData('employee_id', employees[0].id);
        }
    }, [defaultEmployeeId, employees]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/employee-accounts', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#161617] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-100 flex flex-col max-h-[92vh] animate-fade-in">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#1c1c1e]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">تسجيل حركة مالية / حساب موظف</h2>
                            <p className="text-[11px] text-neutral-400">صرف راتب، سلفة شخصية، مكافأة، خصم جزاء، أو بدل</p>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Employee Selection */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">
                            الموظف المعني <span className="text-rose-400">*</span>
                        </label>
                        <select
                            required
                            value={data.employee_id}
                            onChange={(e) => setData('employee_id', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white font-medium"
                        >
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.employee_code} - {emp.name} ({emp.basic_salary} {emp.currency})
                                </option>
                            ))}
                        </select>
                        {errors.employee_id && <span className="text-[11px] text-rose-400">{errors.employee_id}</span>}
                    </div>

                    {/* Transaction Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">
                            نوع الحركة المالية <span className="text-rose-400">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'advance', label: 'سلفة على الراتب', color: 'border-amber-500/40 text-amber-300 bg-amber-950/20' },
                                { id: 'payment', label: 'صرف راتب / تسوية', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' },
                                { id: 'bonus', label: 'مكافأة / حافز', color: 'border-blue-500/40 text-blue-300 bg-blue-950/20' },
                                { id: 'deduction', label: 'خصم / جزاء', color: 'border-rose-500/40 text-rose-300 bg-rose-950/20' },
                                { id: 'allowance', label: 'بدل انتقال / سفر', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/20' },
                                { id: 'salary', label: 'استحقاق راتب شهري', color: 'border-purple-500/40 text-purple-300 bg-purple-950/20' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setData('type', item.id)}
                                    className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                                        data.type === item.id
                                            ? `${item.color} ring-1 ring-white/20 font-bold shadow-xs`
                                            : 'border-neutral-800 bg-[#121213] text-neutral-400 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount & Currency */}
                    <div className="grid grid-cols-3 gap-3">
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
                                className="w-full px-3 py-2 text-sm font-mono font-bold bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.amount && <span className="text-[11px] text-rose-400">{errors.amount}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">العملة</label>
                            <select
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            >
                                <option value="EGP">EGP</option>
                                <option value="USD">USD</option>
                                <option value="SAR">SAR</option>
                                <option value="AED">AED</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>

                    {/* Date & Payment Method */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">تاريخ المعاملة</label>
                            <input
                                type="date"
                                required
                                value={data.transaction_date}
                                onChange={(e) => setData('transaction_date', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">طريقة السداد / الصرف</label>
                            <select
                                value={data.payment_method}
                                onChange={(e) => setData('payment_method', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            >
                                <option value="cash">نقداً (خزينة كاش)</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                                <option value="instapay">إنستاباي / محفظة</option>
                                <option value="cheque">شيك بنكي</option>
                            </select>
                        </div>
                    </div>

                    {/* Description / Reason */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">
                            البيان / سبب المعاملة <span className="text-neutral-500 font-normal">(اختياري)</span>
                        </label>
                        <input
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="مثال: سلفة علاجية طارئة تخصم على قسطين"
                            className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{processing ? 'جاري الحفظ...' : 'تسجيل القيد والحفظ'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
