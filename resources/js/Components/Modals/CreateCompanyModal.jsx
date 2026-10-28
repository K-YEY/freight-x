import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Building2, Globe, Users, DollarSign, MapPin, AlignLeft } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreateCompanyModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        domain: '',
        website_url: '',
        industry: '',
        employees_count: '',
        annual_revenue: '',
        city: '',
        country: '',
        address: '',
        linkedin_url: '',
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
                    domain: '',
                    website_url: '',
                    industry: '',
                    employees_count: '',
                    annual_revenue: '',
                    city: '',
                    country: '',
                    address: '',
                    linkedin_url: '',
                    description: '',
                });
            },
            onError: () => setSubmitting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-backdrop">
            <div className="w-full max-w-lg glass-drawer rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-neutral-200/90 dark:border-neutral-700/70 overflow-hidden animate-fade-in-scale">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/40">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {t('create_company_title')}
                            </h3>
                            <p className="text-[11px] text-neutral-400">
                                {t('create_company_desc')}
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
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                            {t('company_name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. OpenAI, Stripe, Linear"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('domain')}
                            </label>
                            <div className="relative">
                                <Globe className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={form.domain}
                                    onChange={(e) => setForm({ ...form, domain: e.target.value })}
                                    placeholder="openai.com"
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('industry')}
                            </label>
                            <input
                                type="text"
                                value={form.industry}
                                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                                placeholder="Artificial Intelligence & SaaS"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('employees')}
                            </label>
                            <div className="relative">
                                <Users className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="number"
                                    value={form.employees_count}
                                    onChange={(e) => setForm({ ...form, employees_count: e.target.value })}
                                    placeholder="e.g. 500"
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('annual_revenue')} ($)
                            </label>
                            <div className="relative">
                                <DollarSign className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="number"
                                    value={form.annual_revenue}
                                    onChange={(e) => setForm({ ...form, annual_revenue: e.target.value })}
                                    placeholder="e.g. 25000000"
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('city')}
                            </label>
                            <div className="relative">
                                <MapPin className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    placeholder="San Francisco"
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('country')}
                            </label>
                            <input
                                type="text"
                                value={form.country}
                                onChange={(e) => setForm({ ...form, country: e.target.value })}
                                placeholder="United States"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                            {t('about')}
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            placeholder="Brief notes about company services, market position, etc."
                            className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? t('creating') : t('create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

