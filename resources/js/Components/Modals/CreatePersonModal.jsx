import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, User, Mail, Phone, Building2, Briefcase, MapPin, Tag } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreatePersonModal({ isOpen, onClose, companies = [] }) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        job_title: '',
        city: '',
        company_id: '',
        status: 'lead',
        tags_input: '',
        linkedin_url: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const tags = form.tags_input 
            ? form.tags_input.split(',').map((t) => t.trim()).filter(Boolean)
            : [];

        router.post('/contacts', {
            ...form,
            tags,
        }, {
            onSuccess: () => {
                onClose();
                setSubmitting(false);
                setForm({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    job_title: '',
                    city: '',
                    company_id: '',
                    status: 'lead',
                    tags_input: '',
                    linkedin_url: '',
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
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {t('create_person_title')}
                            </h3>
                            <p className="text-[11px] text-neutral-400">
                                {t('create_person_desc')}
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
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('first_name')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.first_name}
                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                placeholder="e.g. Marc"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('last_name')}
                            </label>
                            <input
                                type="text"
                                value={form.last_name}
                                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                placeholder="e.g. Benioff"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('email')}
                            </label>
                            <div className="relative">
                                <Mail className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="marc@company.com"
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('phone')}
                            </label>
                            <div className="relative">
                                <Phone className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+1 (415) 555-0199"
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('job_title')}
                            </label>
                            <input
                                type="text"
                                value={form.job_title}
                                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                                placeholder="e.g. Chief Executive Officer"
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('company_name')}
                            </label>
                            <select
                                value={form.company_id}
                                onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            >
                                <option value="">{t('select_company')}</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
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
                                    placeholder="e.g. San Francisco"
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('status')}
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            >
                                <option value="lead">{t('lead')}</option>
                                <option value="customer">{t('customer')}</option>
                                <option value="inactive">{t('inactive')}</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                            {t('tags') || 'الوسوم'}
                        </label>
                        <div className="relative">
                            <Tag className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={form.tags_input}
                                onChange={(e) => setForm({ ...form, tags_input: e.target.value })}
                                placeholder="VIP, Decision Maker, Engineering"
                                className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            />
                        </div>
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
