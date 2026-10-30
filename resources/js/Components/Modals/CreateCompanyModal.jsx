import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Building2, Globe, Users, DollarSign, MapPin, Ship, Truck, ShieldCheck, Phone, Mail } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreateCompanyModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        code: '',
        partner_type: 'shipping_line',
        contact_person: '',
        phone: '',
        email: '',
        tax_number: '',
        domain: '',
        website_url: '',
        industry: 'Maritime Shipping & Logistics',
        city: 'Alexandria',
        country: 'Egypt',
        address: '',
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/companies', form, {
            onSuccess: () => {
                onClose();
                setSubmitting(false);
                setForm({
                    name: '',
                    code: '',
                    partner_type: 'shipping_line',
                    contact_person: '',
                    phone: '',
                    email: '',
                    tax_number: '',
                    domain: '',
                    website_url: '',
                    industry: 'Maritime Shipping & Logistics',
                    city: 'Alexandria',
                    country: 'Egypt',
                    address: '',
                    description: '',
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
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <Ship className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                {t('new_partner') || 'إضافة شريك لوجستي / خط ملاحي'}
                            </h3>
                            <p className="text-[11px] text-neutral-400">
                                تسجيل بيانات الخطوط الملاحية، شركات النقل البري، ومكاتب التخليص الجمركي
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
                    
                    {/* Partner Type & Code */}
                    <div className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('partner_category') || 'تصنيف الشريك / نوع الخدمة'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.partner_type}
                                    onChange={(e) => setForm({ ...form, partner_type: e.target.value })}
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-bold"
                                >
                                    <option value="shipping_line">{t('shipping_line') || 'خط ملاحي / توكيل ملاحي (Shipping Line)'}</option>
                                    <option value="trucker">{t('trucker_partner') || 'شركة نقل وتعتيق حاويات (Trucking & Drayage)'}</option>
                                    <option value="customs_broker">{t('customs_broker_partner') || 'مكتب تخليص جمركي (Customs Broker)'}</option>
                                    <option value="overseas_agent">{t('overseas_agent_partner') || 'وكيل ملاحي بالخارج (Overseas Agent)'}</option>
                                    <option value="airline">{t('airline') || 'خط طيران / شحن جوي (Airline Cargo)'}</option>
                                    <option value="warehouse_operator">{t('warehouse_operator') || 'محطة حاويات ومستودع (CFS / Terminal)'}</option>
                                    <option value="vendor">{t('vendor_partner') || 'مورد خدمات لوجستية عام (Vendor)'}</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('partner_code') || 'كود الخط / الشريك (SCAC)'}
                                </label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. MAEU, MSCU"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono uppercase font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                اسم الخط الملاحي أو الشركة <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="مثال: Maersk Line, MSC, أسطول النقل البري بالإسكندرية"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-bold"
                            />
                        </div>
                    </div>

                    {/* Contact Person & Communications */}
                    <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800 space-y-3">
                        <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-blue-500" />
                            <span>بيانات الاتصال ومسؤول الحساب (Contact Details)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('contact_person') || 'المسؤول / جهة الاتصال'}
                                </label>
                                <input
                                    type="text"
                                    value={form.contact_person}
                                    onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                                    placeholder="e.g. Captain Ahmed, Lin Zhang"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('phone')} / واتساب
                                </label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+20 3 487 0000"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('email')}
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="booking@line.com"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('tax_id') || 'الرقم الضريبي / السجل التجاري'}
                                </label>
                                <input
                                    type="text"
                                    value={form.tax_number}
                                    onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
                                    placeholder="e.g. 100-349-218"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                    {t('website')} / بوابة التتبع
                                </label>
                                <input
                                    type="text"
                                    value={form.website_url}
                                    onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                                    placeholder="https://www.maersk.com"
                                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location & Address */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                المدينة / الميناء
                            </label>
                            <input
                                type="text"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                                placeholder="Alexandria Port, Cairo, Damietta"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                الدولة
                            </label>
                            <input
                                type="text"
                                value={form.country}
                                onChange={(e) => setForm({ ...form, country: e.target.value })}
                                placeholder="Egypt"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                            عنوان المقر / مكتب التوكيل بالميناء
                        </label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="ميناء الدخيلة، رصيف الحاويات 96، أو مبنى التوكيلات الملاحية"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                            ملاحظات ونطاق الخدمات (Services & Notes)
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            placeholder="خدمات الشحن المباشر من موانئ الشرق الأقصى، أسعار نولون خاصة، فترات سماح 21 يوم..."
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
                            className="px-5 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? (t('creating') || 'جاري الحفظ...') : (t('create') || 'إضافة الشريك')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


