import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Briefcase, DollarSign, Calendar, Building2, User, Percent, FileText } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreateDealModal({ isOpen, onClose, companies = [], contacts = [] }) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: '',
        amount: '',
        stage: 'new',
        close_date: '',
        probability: 50,
        company_id: '',
        contact_id: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/opportunities', form, {
            onSuccess: () => {
                onClose();
                setSubmitting(false);
                setForm({
                    name: '',
                    amount: '',
                    stage: 'new',
                    close_date: '',
                    probability: 50,
                    company_id: '',
                    contact_id: '',
                    notes: '',
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
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {t('create_deal_title')}
                            </h3>
                            <p className="text-[11px] text-neutral-400">
                                {t('create_deal_desc')}
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
                            {t('deal_name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Acme Corp Enterprise Expansion"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('amount')} ($) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DollarSign className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="any"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    placeholder="50000"
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('stage')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.stage}
                                onChange={(e) => setForm({ ...form, stage: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            >
                                <option value="new">{t('new_stage')}</option>
                                <option value="screening">{t('screening')}</option>
                                <option value="meeting">{t('meeting')}</option>
                                <option value="proposal">{t('proposal')}</option>
                                <option value="won">{t('won')} 🎉</option>
                                <option value="lost">{t('lost')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('close_date')}
                            </label>
                            <div className="relative">
                                <Calendar className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="date"
                                    value={form.close_date}
                                    onChange={(e) => setForm({ ...form, close_date: e.target.value })}
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('priority')} ({form.probability}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={form.probability}
                                onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })}
                                className="w-full mt-2 accent-neutral-900 dark:accent-neutral-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('people')}
                            </label>
                            <select
                                value={form.contact_id}
                                onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            >
                                <option value="">{t('select_contact')}</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name || `${c.first_name} ${c.last_name}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                            {t('notes')}
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            rows={2}
                            placeholder="Key requirements, decision criteria, competitors..."
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

