import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Edit3, Shield, Save } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function EditEmployeeModal({ isOpen, onClose, employee, roles = [], departments = [] }) {
    const { isRTL } = useTranslation();

    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        employee_code: '',
        job_title: '',
        department: 'operations',
        phone: '',
        email: '',
        national_id: '',
        hire_date: '',
        basic_salary: '',
        currency: 'EGP',
        status: 'active',
        notes: '',
        role_id: '',
    });

    useEffect(() => {
        if (employee) {
            setData({
                name: employee.name || '',
                employee_code: employee.employee_code || '',
                job_title: employee.job_title || '',
                department: employee.department || 'operations',
                phone: employee.phone || '',
                email: employee.email || '',
                national_id: employee.national_id || '',
                hire_date: employee.hire_date || '',
                basic_salary: String(employee.basic_salary || ''),
                currency: employee.currency || 'EGP',
                status: employee.status || 'active',
                notes: employee.notes || '',
                role_id: employee.user?.roles?.[0]?.id || '',
            });
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/employees/${employee.id}`, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#161617] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-100 flex flex-col max-h-[92vh] animate-fade-in">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#1c1c1e]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                            <Edit3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">تعديل بيانات الموظف ({employee.name})</h2>
                            <span className="text-[11px] text-neutral-400 font-mono">{employee.employee_code}</span>
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
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                                اسم الموظف <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.name && <span className="text-[11px] text-rose-400">{errors.name}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">كود الموظف</label>
                            <input
                                type="text"
                                required
                                value={data.employee_code}
                                onChange={(e) => setData('employee_code', e.target.value.toUpperCase())}
                                className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700/80 rounded-lg text-white uppercase"
                            />
                        </div>
                    </div>

                    {/* Job Title & Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">المسمى الوظيفي</label>
                            <input
                                type="text"
                                required
                                value={data.job_title}
                                onChange={(e) => setData('job_title', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700/80 rounded-lg text-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">القسم</label>
                            <select
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700/80 rounded-lg text-white"
                            >
                                {departments.map((d) => (
                                    <option key={d.value} value={d.value}>
                                        {isRTL ? d.label_ar : d.label_en}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Salary & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#1c1c1e] border border-neutral-800">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">الراتب الأساسي</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={data.basic_salary}
                                onChange={(e) => setData('basic_salary', e.target.value)}
                                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#121213] border border-neutral-700 rounded-lg text-emerald-400"
                            />
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

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">حالة الموظف</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            >
                                <option value="active">نشط (Active)</option>
                                <option value="inactive">غير نشط (Inactive)</option>
                                <option value="on_leave">في إجازة (On Leave)</option>
                                <option value="terminated">منتهي الخدمة (Terminated)</option>
                            </select>
                        </div>
                    </div>

                    {/* Role in System (if user linked) */}
                    {employee.user && (
                        <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-2">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-white">
                                    تخصيص صلاحيات المستخدم ({employee.user.email}):
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] text-neutral-300 block">الدور الوظيفي في النظام (Role):</label>
                                <select
                                    value={data.role_id}
                                    onChange={(e) => setData('role_id', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                                >
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {isRTL ? r.display_name_ar : r.display_name_en}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">ملاحظات</label>
                        <textarea
                            rows="2"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700/80 rounded-lg text-white"
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
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>{processing ? 'جاري الحفظ...' : 'تحديث البيانات'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
