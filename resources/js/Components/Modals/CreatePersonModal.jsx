import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, User, Mail, Phone, Building2, MapPin, ShieldCheck, DollarSign, FileText, Globe } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreatePersonModal({ isOpen, onClose, companies = [] }) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        company_name: '',
        customer_type: 'importer',
        email: '',
        phone: '',
        tax_id: '',
        commercial_registry: '',
        customs_card_number: '',
        nafeza_id: '',
        job_title: '',
        city: 'Cairo',
        country: 'Egypt',
        billing_address: '',
        company_id: '',
        status: 'active',
        payment_terms: 'cash',
        credit_limit: '0',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/contacts', form, {
            onSuccess: () => {
                onClose();
                setSubmitting(false);
                setForm({
                    first_name: '',
                    last_name: '',
                    company_name: '',
                    customer_type: 'importer',
                    email: '',
                    phone: '',
                    tax_id: '',
                    commercial_registry: '',
                    customs_card_number: '',
                    nafeza_id: '',
                    job_title: '',
                    city: 'Cairo',
                    country: 'Egypt',
                    billing_address: '',
                    company_id: '',
                    status: 'active',
                    payment_terms: 'cash',
                    credit_limit: '0',
                    notes: '',
                });
            },
            onError: () => setSubmitting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-backdrop">
            <div className="w-full max-w-2xl glass-drawer rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-neutral-200/90 dark:border-neutral-700/70 overflow-hidden animate-fade-in-scale max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/40 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                {t('new_customer') || 'إضافة عميل شحن جديد'}
                            </h3>
                            <p className="text-[11px] text-neutral-400">
                                تسجيل بيانات العميل الجمركية والتجارية وشروط الائتمان
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                    
                    {/* Section 1: Customer Profile & Activity */}
                    <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-3">
                        <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" />
                            <span>بيانات المنشأة والنشاط التجاري (Customer Profile)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    اسم المنشأة / الشركة التجارية <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.company_name}
                                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                    placeholder="مثال: شركة الأهرام للاستيراد والتصدير"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('customer_type') || 'نوع النشاط التجاري'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.customer_type}
                                    onChange={(e) => setForm({ ...form, customer_type: e.target.value })}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium"
                                >
                                    <option value="importer">{t('importer') || 'مستورد (وارد)'}</option>
                                    <option value="exporter">{t('exporter') || 'مُصدّر (صادر)'}</option>
                                    <option value="trader">{t('trader') || 'تاجر / وسيط تجاري'}</option>
                                    <option value="broker_client">{t('broker_client') || 'عميل تخليص جمركي'}</option>
                                    <option value="individual">{t('individual') || 'أفراد / أمتعة شخصية'}</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    اسم مسؤول الاتصال (Contact Person) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.first_name}
                                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                    placeholder="الاسم الأول"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    اسم العائلة / اللقب
                                </label>
                                <input
                                    type="text"
                                    value={form.last_name}
                                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                    placeholder="اسم العائلة"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('phone')} / واتساب <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        required
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="+20 100 123 4567"
                                        className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('email')}
                                </label>
                                <div className="relative">
                                    <Mail className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="import@company.com"
                                        className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Customs & Legal Identity */}
                    <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-3">
                        <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>الهوية الجمركية والضريبية (Customs & Tax Identity)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('tax_id') || 'الرقم الضريبي / البطاقة الضريبية'}
                                </label>
                                <input
                                    type="text"
                                    value={form.tax_id}
                                    onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                                    placeholder="e.g. 542-890-123"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('commercial_registry') || 'رقم السجل التجاري'}
                                </label>
                                <input
                                    type="text"
                                    value={form.commercial_registry}
                                    onChange={(e) => setForm({ ...form, commercial_registry: e.target.value })}
                                    placeholder="e.g. CR-89421"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('customs_card_number') || 'بطاقة المتعاملين مع الجمارك'}
                                </label>
                                <input
                                    type="text"
                                    value={form.customs_card_number}
                                    onChange={(e) => setForm({ ...form, customs_card_number: e.target.value })}
                                    placeholder="e.g. CUST-2026-99"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('nafeza_id') || 'رقم حساب نافذة / المصنع'}
                                </label>
                                <input
                                    type="text"
                                    value={form.nafeza_id}
                                    onChange={(e) => setForm({ ...form, nafeza_id: e.target.value })}
                                    placeholder="e.g. NFZ-EG-4402"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Financial Terms & Address */}
                    <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-3">
                        <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                            <span>شروط السداد وموقع المستودع (Payment & Address)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('payment_terms') || 'شروط السداد'}
                                </label>
                                <select
                                    value={form.payment_terms}
                                    onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="cash">{t('cash') || 'سداد نقدي (Cash)'}</option>
                                    <option value="credit_15">{t('credit_15') || 'آجل 15 يوم (15 Days)'}</option>
                                    <option value="credit_30">{t('credit_30') || 'آجل 30 يوم (30 Days)'}</option>
                                    <option value="credit_60">{t('credit_60') || 'آجل 60 يوم (60 Days)'}</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('credit_limit') || 'الحد الائتماني ($)'}
                                </label>
                                <input
                                    type="number"
                                    step="100"
                                    value={form.credit_limit}
                                    onChange={(e) => setForm({ ...form, credit_limit: e.target.value })}
                                    placeholder="e.g. 5000"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('city') || 'المدينة'}
                                </label>
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    placeholder="e.g. Alexandria, Cairo, Port Said"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('country') || 'الدولة'}
                                </label>
                                <input
                                    type="text"
                                    value={form.country}
                                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                                    placeholder="e.g. Egypt"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('billing_address') || 'عنوان مقر الشركة والمستودع'}
                            </label>
                            <input
                                type="text"
                                value={form.billing_address}
                                onChange={(e) => setForm({ ...form, billing_address: e.target.value })}
                                placeholder="مثال: المنطقة الصناعية الرابعة، العاشر من رمضان، مخزن رقم 12"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                    </div>

                    {/* Section 4: Notes */}
                    <div>
                        <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                            ملاحظات ونوع البضاعة المعتادة (Commodity & Notes)
                        </label>
                        <textarea
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="مثال: استيراد قطع غيار سيارات من شنغهاي وجوانزو، شحنات بحرية FCL حاويات 40HC..."
                            className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 sticky bottom-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? (t('creating') || 'جاري الحفظ...') : (t('create') || 'إضافة العميل')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

