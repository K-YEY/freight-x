import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, UserPlus, Shield, User, DollarSign, Calendar, Phone, Mail, Building, FileText, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreateEmployeeModal({ isOpen, onClose, roles = [], departments = [] }) {
    const { isRTL } = useTranslation();
    const [createUserAccount, setCreateUserAccount] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        employee_code: '',
        job_title: '',
        department: 'operations',
        phone: '',
        email: '',
        national_id: '',
        hire_date: new Date().toISOString().split('T')[0],
        basic_salary: '',
        currency: 'EGP',
        status: 'active',
        notes: '',
        create_user_account: false,
        user_email: '',
        user_password: '',
        role_id: roles[0]?.id || '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/employees', {
            onSuccess: () => {
                reset();
                setCreateUserAccount(false);
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-2xl bg-[#161617] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-neutral-100 flex flex-col max-h-[92vh] animate-fade-in">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-[#1c1c1e]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white">إضافة موظف جديد</h2>
                            <p className="text-[11px] text-neutral-400">تسجيل بيانات الموظف والراتب وتخصيص صلاحيات الدخول للنظام</p>
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
                                اسم الموظف بالكامل <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="مثال: محمد السيد إبراهيم"
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.name && <span className="text-[11px] text-rose-400">{errors.name}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                                كود الموظف (اتركه فارغاً للتوليد الآلي)
                            </label>
                            <input
                                type="text"
                                value={data.employee_code}
                                onChange={(e) => setData('employee_code', e.target.value.toUpperCase())}
                                placeholder="EMP-007"
                                className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700/80 rounded-lg text-white uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Job Title & Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                                المسمى الوظيفي <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={data.job_title}
                                onChange={(e) => setData('job_title', e.target.value)}
                                placeholder="مثال: منسق عمليات شحن بحري"
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {errors.job_title && <span className="text-[11px] text-rose-400">{errors.job_title}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                                القسم / الإدارة <span className="text-rose-400">*</span>
                            </label>
                            <select
                                value={data.department}
                                onChange={(e) => setData('department', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                {departments.map((d) => (
                                    <option key={d.value} value={d.value}>
                                        {isRTL ? d.label_ar : d.label_en}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Contact & National ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">رقم الهاتف</label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="+20 10 ..."
                                className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="employee@freight.local"
                                className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">الرقم القومي / الهوية</label>
                            <input
                                type="text"
                                value={data.national_id}
                                onChange={(e) => setData('national_id', e.target.value)}
                                placeholder="2950..."
                                className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Salary & Hire Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#1c1c1e] border border-neutral-800">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">
                                الراتب الأساسي الشهري <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="100"
                                value={data.basic_salary}
                                onChange={(e) => setData('basic_salary', e.target.value)}
                                placeholder="15000"
                                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#121213] border border-neutral-700 rounded-lg text-emerald-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">عملة الراتب</label>
                            <select
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            >
                                <option value="EGP">جنيه مصري (EGP)</option>
                                <option value="USD">دولار أمريكي (USD)</option>
                                <option value="SAR">ريال سعودي (SAR)</option>
                                <option value="AED">درهم إماراتي (AED)</option>
                                <option value="EUR">يورو (EUR)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-300">تاريخ التعيين</label>
                            <input
                                type="date"
                                value={data.hire_date}
                                onChange={(e) => setData('hire_date', e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
                            >
                            </input>
                        </div>
                    </div>

                    {/* User Account & Role Toggle */}
                    <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={createUserAccount}
                                    onChange={(e) => {
                                        setCreateUserAccount(e.target.checked);
                                        setData('create_user_account', e.target.checked);
                                        if (e.target.checked && !data.user_email && data.email) {
                                            setData('user_email', data.email);
                                        }
                                    }}
                                    className="rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                                    <span>إنشاء حساب دخول للنظام لهذا الموظف (Software Login Account)</span>
                                </span>
                            </label>
                        </div>

                        {createUserAccount && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-blue-900/40 animate-fade-in">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-neutral-300">
                                        بريد الدخول <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required={createUserAccount}
                                        value={data.user_email}
                                        onChange={(e) => setData('user_email', e.target.value)}
                                        placeholder="ops@freight.local"
                                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    {errors.user_email && <span className="text-[10px] text-rose-400">{errors.user_email}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-neutral-300">
                                        كلمة المرور <span className="text-rose-400">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required={createUserAccount}
                                        value={data.user_password}
                                        onChange={(e) => setData('user_password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3 py-1.5 text-xs font-mono bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    {errors.user_password && <span className="text-[10px] text-rose-400">{errors.user_password}</span>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-neutral-300">
                                        الدور والصلاحيات (Role) <span className="text-rose-400">*</span>
                                    </label>
                                    <select
                                        value={data.role_id}
                                        onChange={(e) => setData('role_id', e.target.value)}
                                        className="w-full px-3 py-1.5 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white"
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
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">ملاحظات إضافية</label>
                        <textarea
                            rows="2"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="ملاحظات حول الخبرة، تراخيص التخليص، أو الشروط الخاصة..."
                            className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700/80 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>{processing ? 'جاري الحفظ...' : 'حفظ الموظف'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
