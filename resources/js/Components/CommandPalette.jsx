import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Search, User, Building2, Briefcase, CheckSquare, Plus, ArrowRight, X } from 'lucide-react';
import { useTranslation } from '../Context/LanguageContext';

export default function CommandPalette({ isOpen, onClose, onSelectRecord, onOpenCreateModal }) {
    const { t, isRTL } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ contacts: [], companies: [], opportunities: [], tasks: [] });
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
            setResults({ contacts: [], companies: [], opportunities: [], tasks: [] });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults({ contacts: [], companies: [], opportunities: [], tasks: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const totalResults = results.contacts.length + results.companies.length + results.opportunities.length + results.tasks.length;

    const handleSelect = (type, item) => {
        onClose();
        if (onSelectRecord) {
            onSelectRecord(type, item);
        } else {
            if (type === 'contact') router.visit('/contacts');
            if (type === 'company') router.visit('/companies');
            if (type === 'opportunity') router.visit('/opportunities');
            if (type === 'task') router.visit('/tasks');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 glass-modal-backdrop">
            <div 
                className="w-full max-w-xl glass-drawer rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-neutral-200/90 dark:border-neutral-700/70 overflow-hidden animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input Bar */}
                <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
                    <Search className="w-5 h-5 text-neutral-400 me-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('search_command_placeholder')}
                        className="w-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
                    />
                    {query ? (
                        <button onClick={() => setQuery('')} className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <span className="text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded">
                            ESC
                        </span>
                    )}
                </div>

                {/* Quick Actions (when query is empty) */}
                {!query && (
                    <div className="p-3">
                        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 py-1.5">
                            {t('quick_actions')}
                        </div>
                        <div className="space-y-0.5">
                            <button
                                onClick={() => { onClose(); onOpenCreateModal('contact'); }}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg group text-start"
                            >
                                <span className="flex items-center">
                                    <User className="w-4 h-4 me-2.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100" />
                                    {t('create_new_contact_cmd')}
                                </span>
                                <Plus className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100" />
                            </button>
                            <button
                                onClick={() => { onClose(); onOpenCreateModal('opportunity'); }}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg group text-start"
                            >
                                <span className="flex items-center">
                                    <Briefcase className="w-4 h-4 me-2.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100" />
                                    {t('create_new_deal_cmd')}
                                </span>
                                <Plus className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100" />
                            </button>
                            <button
                                onClick={() => { onClose(); onOpenCreateModal('company'); }}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg group text-start"
                            >
                                <span className="flex items-center">
                                    <Building2 className="w-4 h-4 me-2.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100" />
                                    {t('create_new_company_cmd')}
                                </span>
                                <Plus className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100" />
                            </button>
                            <button
                                onClick={() => { onClose(); onOpenCreateModal('task'); }}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg group text-start"
                            >
                                <span className="flex items-center">
                                    <CheckSquare className="w-4 h-4 me-2.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100" />
                                    {t('create_new_task_cmd')}
                                </span>
                                <Plus className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {query && (
                    <div className="max-h-80 overflow-y-auto p-3 space-y-3">
                        {loading && (
                            <div className="py-6 text-center text-xs text-neutral-400">
                                {t('searching_records')}
                            </div>
                        )}

                        {!loading && totalResults === 0 && (
                            <div className="py-8 text-center text-sm text-neutral-400">
                                {t('no_records_for', { query })}
                            </div>
                        )}

                        {results.contacts.length > 0 && (
                            <div>
                                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 py-1">
                                    {t('people')} ({results.contacts.length})
                                </div>
                                <div className="space-y-0.5">
                                    {results.contacts.map((c) => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleSelect('contact', c)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg group text-start"
                                        >
                                            <span className="flex items-center">
                                                <User className="w-4 h-4 me-2.5 text-neutral-400" />
                                                <span className="font-medium text-neutral-900 dark:text-neutral-100 me-2">{c.name}</span>
                                                {c.job_title && <span className="text-xs text-neutral-400 me-2">· {c.job_title}</span>}
                                                {c.company && <span className="text-xs text-neutral-400">({c.company.name})</span>}
                                            </span>
                                            <ArrowRight className={`w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 ${isRTL ? 'rotate-180' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.companies.length > 0 && (
                            <div>
                                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 py-1">
                                    {t('companies')} ({results.companies.length})
                                </div>
                                <div className="space-y-0.5">
                                    {results.companies.map((co) => (
                                        <button
                                            key={co.id}
                                            onClick={() => handleSelect('company', co)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg group text-start"
                                        >
                                            <span className="flex items-center">
                                                <Building2 className="w-4 h-4 me-2.5 text-neutral-400" />
                                                <span className="font-medium text-neutral-900 dark:text-neutral-100 me-2">{co.name}</span>
                                                {co.domain && <span className="text-xs text-neutral-400">({co.domain})</span>}
                                            </span>
                                            <ArrowRight className={`w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 ${isRTL ? 'rotate-180' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.opportunities.length > 0 && (
                            <div>
                                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 py-1">
                                    {t('opportunities')} ({results.opportunities.length})
                                </div>
                                <div className="space-y-0.5">
                                    {results.opportunities.map((opp) => (
                                        <button
                                            key={opp.id}
                                            onClick={() => handleSelect('opportunity', opp)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg group text-start"
                                        >
                                            <span className="flex items-center">
                                                <Briefcase className="w-4 h-4 me-2.5 text-neutral-400" />
                                                <span className="font-medium text-neutral-900 dark:text-neutral-100 me-2">{opp.name}</span>
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium me-2">
                                                    ${Number(opp.amount).toLocaleString()}
                                                </span>
                                                <span className="text-xs text-neutral-400">· {t(opp.stage) || opp.stage}</span>
                                            </span>
                                            <ArrowRight className={`w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 ${isRTL ? 'rotate-180' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.tasks.length > 0 && (
                            <div>
                                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 py-1">
                                    {t('tasks')} ({results.tasks.length})
                                </div>
                                <div className="space-y-0.5">
                                    {results.tasks.map((tk) => (
                                        <button
                                            key={tk.id}
                                            onClick={() => handleSelect('task', tk)}
                                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-lg group text-start"
                                        >
                                            <span className="flex items-center">
                                                <CheckSquare className="w-4 h-4 me-2.5 text-neutral-400" />
                                                <span className="font-medium text-neutral-900 dark:text-neutral-100 me-2">{tk.title}</span>
                                                <span className="text-xs text-neutral-400">({t(tk.status) || tk.status})</span>
                                            </span>
                                            <ArrowRight className={`w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100 ${isRTL ? 'rotate-180' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer hints */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-2">
                        <span>{t('navigate_hint')}</span>
                    </span>
                    <span>{t('app_name')} • {t('personal_edition')}</span>
                </div>
            </div>
        </div>
    );
}
