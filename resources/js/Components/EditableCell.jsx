import React, { useState, useEffect, useRef } from 'react';
import { Check, Edit2, Loader2 } from 'lucide-react';
import { useTranslation } from '../Context/LanguageContext';

export default function EditableCell({ 
    value, 
    onSave, 
    type = 'text', 
    placeholder, 
    className = '',
    prefix = '',
    suffix = '',
    disabled = false
}) {
    const { t } = useTranslation();
    const effectivePlaceholder = placeholder || t('empty');
    const [isEditing, setIsEditing] = useState(false);
    const [currentVal, setCurrentVal] = useState(value ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        setCurrentVal(value ?? '');
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            if (type === 'text') {
                inputRef.current.select();
            }
        }
    }, [isEditing, type]);

    const handleCommit = async () => {
        setIsEditing(false);
        const trimmed = typeof currentVal === 'string' ? currentVal.trim() : currentVal;
        if (trimmed === (value ?? '')) {
            return;
        }

        setIsSaving(true);
        try {
            await onSave(trimmed);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 1500);
        } catch (err) {
            console.error('Failed to save inline cell', err);
            setCurrentVal(value ?? '');
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCommit();
        } else if (e.key === 'Escape') {
            setCurrentVal(value ?? '');
            setIsEditing(false);
        }
    };

    if (disabled) {
        return (
            <span className={`text-neutral-700 dark:text-neutral-300 ${className}`}>
                {value ? `${prefix}${value}${suffix}` : <span className="text-neutral-400 italic">{effectivePlaceholder}</span>}
            </span>
        );
    }

    if (isEditing) {
        return (
            <div className="relative inline-flex items-center w-full min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type={type}
                    value={currentVal}
                    onChange={(e) => setCurrentVal(e.target.value)}
                    onBlur={handleCommit}
                    onKeyDown={handleKeyDown}
                    className="w-full text-xs px-2 py-1 rounded bg-white dark:bg-[#202020] border border-blue-500 shadow-2xs text-neutral-900 dark:text-neutral-100 focus:outline-none ring-1 ring-blue-500/30"
                />
            </div>
        );
    }

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            className={`group/cell relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:ring-1 hover:ring-neutral-200 dark:hover:ring-neutral-700/60 transition-all w-full min-h-[24px] ${className}`}
            title={t('click_to_edit')}
        >
            <span className="truncate">
                {value !== null && value !== undefined && value !== '' ? (
                    `${prefix}${value}${suffix}`
                ) : (
                    <span className="text-neutral-400 dark:text-neutral-500 italic text-[11px]">{effectivePlaceholder}</span>
                )}
            </span>

            {isSaving && (
                <Loader2 className="w-3 h-3 text-blue-500 animate-spin shrink-0" />
            )}

            {justSaved && (
                <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            )}

            {!isSaving && !justSaved && (
                <Edit2 className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />
            )}
        </div>
    );
}

