import React from 'react';
import { useTranslation } from '../Context/LanguageContext';

export default function StatusBadge({ type, value }) {
    const { t } = useTranslation();
    if (!value) return null;

    const getBadgeStyle = () => {
        const val = String(value).toLowerCase();

        // Contact Statuses
        if (val === 'customer' || val === 'won' || val === 'completed') {
            return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50';
        }
        if (val === 'lead' || val === 'new' || val === 'todo') {
            return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50';
        }
        if (val === 'meeting' || val === 'screening' || val === 'in_progress') {
            return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50';
        }
        if (val === 'proposal' || val === 'high' || val === 'urgent') {
            return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50';
        }
        if (val === 'lost' || val === 'inactive') {
            return 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700';
        }

        return 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
    };

    const labelKey = String(value).toLowerCase();
    const translated = t(labelKey);
    const displayLabel = translated !== labelKey ? translated : String(value).replace('_', ' ');

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 shrink-0"></span>
            <span className="capitalize">{displayLabel}</span>
        </span>
    );
}

