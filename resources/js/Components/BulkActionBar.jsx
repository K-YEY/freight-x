import React from 'react';
import { Trash2, X, CheckSquare } from 'lucide-react';
import { useTranslation } from '../Context/LanguageContext';

export default function BulkActionBar({ 
    selectedCount = 0, 
    onClearSelection, 
    onBulkDelete,
    statusOptions = [],
    onBulkChangeStatus
}) {
    const { t } = useTranslation();
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/90 dark:bg-[#1c1c1c]/90 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-neutral-700/80 dark:border-neutral-700/60 flex items-center gap-4 animate-fade-in-scale">
            <div className="flex items-center gap-2 border-e border-neutral-700 dark:border-neutral-700 pe-3">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold">
                    {selectedCount} {t('selected')}
                </span>
            </div>

            {statusOptions.length > 0 && onBulkChangeStatus && (
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-400">{t('set_status_label')}</span>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                onBulkChangeStatus(e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className="text-xs py-1 px-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none cursor-pointer"
                    >
                        <option value="">{t('choose')}</option>
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {t(opt.value.toLowerCase()) || opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {onBulkDelete && (
                <button
                    onClick={onBulkDelete}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('delete')}</span>
                </button>
            )}

            <button
                onClick={onClearSelection}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                title={t('deselect_all')}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

