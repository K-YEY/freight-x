import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, CheckSquare, Calendar, Building2, User, Briefcase, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreateTaskModal({ isOpen, onClose, companies = [], contacts = [], opportunities = [] }) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        status: 'todo',
        company_id: '',
        contact_id: '',
        opportunity_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/tasks', form, {
            onSuccess: () => {
                onClose();
                setSubmitting(false);
                setForm({
                    title: '',
                    description: '',
                    due_date: '',
                    priority: 'medium',
                    status: 'todo',
                    company_id: '',
                    contact_id: '',
                    opportunity_id: '',
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
                        <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <CheckSquare className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {t('create_task_title')}
                            </h3>
                            <p className="text-[11px] text-neutral-400">
                                {t('create_task_desc')}
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
                            {t('task_title')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Follow up on proposal with CFO"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('priority')}
                            </label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            >
                                <option value="low">{t('low')}</option>
                                <option value="medium">{t('medium')}</option>
                                <option value="high">{t('high')}</option>
                                <option value="urgent">{t('urgent')}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('due_date')}
                            </label>
                            <div className="relative">
                                <Calendar className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="date"
                                    value={form.due_date}
                                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                    className="w-full text-xs ps-9 pe-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                            </div>
                        </div>
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
                            <option value="">{t('no_company')}</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('people')}
                            </label>
                            <select
                                value={form.contact_id}
                                onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            >
                                <option value="">{t('no_contact')}</option>
                                {contacts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name || `${c.first_name} ${c.last_name}`}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1">
                                {t('deals')}
                            </label>
                            <select
                                value={form.opportunity_id}
                                onChange={(e) => setForm({ ...form, opportunity_id: e.target.value })}
                                className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                            >
                                <option value="">{t('select_opportunity')}</option>
                                {opportunities.map((o) => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
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
                            placeholder="Extra details, links, preparation instructions..."
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

