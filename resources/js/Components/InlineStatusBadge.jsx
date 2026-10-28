import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useTranslation } from '../Context/LanguageContext';

export default function InlineStatusBadge({ value, options = [], onSelect, type = 'status' }) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSelectOption = (e, optValue) => {
        e.stopPropagation();
        setIsOpen(false);
        if (optValue !== value) {
            onSelect(optValue);
        }
    };

    return (
        <div className="relative inline-block" ref={popoverRef}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="group/badge inline-flex items-center gap-1 cursor-pointer focus:outline-none"
                title={t('click_to_edit')}
            >
                <StatusBadge type={type} value={value} />
                <ChevronDown className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover/badge:opacity-100 transition-opacity" />
            </button>

            {isOpen && (
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute start-0 top-full mt-1.5 z-40 w-40 glass-popover rounded-xl shadow-xl border border-neutral-200/90 dark:border-neutral-700/80 p-1 space-y-0.5 animate-fade-in-scale"
                >
                    <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
                        {t('status')} / {t(type.toLowerCase()) || type}
                    </div>
                    {options.map((opt) => {
                        const optVal = typeof opt === 'string' ? opt : opt.value;
                        const rawLabel = typeof opt === 'string' ? opt.replace('_', ' ') : opt.label;
                        const optLabel = t(String(optVal).toLowerCase()) || rawLabel;
                        const isSelected = optVal === value;

                        return (
                            <button
                                key={optVal}
                                onClick={(e) => handleSelectOption(e, optVal)}
                                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors text-start cursor-pointer ${
                                    isSelected
                                        ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-neutral-100'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'
                                }`}
                            >
                                <span className="capitalize">{optLabel}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

