import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, TrendingUp, RefreshCw, Calculator, Globe, Plus } from 'lucide-react';
import { useCurrency } from '../Context/CurrencyContext';
import { useTranslation } from '../Context/LanguageContext';
import LiveRatesModal from './Modals/LiveRatesModal';

export default function CurrencySwitcher() {
    const { t } = useTranslation();
    const { 
        currentCurrency, 
        setCurrency, 
        activeCurrency, 
        currencies, 
        rates, 
        lastSyncedAt,
        isSyncing,
        refreshLiveRates,
        isLiveModalOpen,
        setIsLiveModalOpen
    } = useCurrency();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectCurrency = (code) => {
        setCurrency(code);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Header Switcher Pill */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/60 dark:border-neutral-700/60 transition-all cursor-pointer shadow-2xs group active:scale-95"
                title="تبديل العملة وأسعار الصرف الحية"
            >
                <span className="text-sm select-none">{activeCurrency?.flag || '💵'}</span>
                <span className="font-bold tracking-tight font-mono">{currentCurrency}</span>
                <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute end-0 top-full mt-2 z-50 w-64 glass-popover rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.75)] border border-neutral-200/90 dark:border-neutral-700/70 p-1.5 space-y-1 animate-fade-in-scale">
                    
                    {/* Header info */}
                    <div className="px-2.5 py-2 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 block">
                                {t('active_currency') || 'العملات وأسعار الصرف'}
                            </span>
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>تحديث فوري مباشر (Live FX)</span>
                            </span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                refreshLiveRates();
                            }}
                            disabled={isSyncing}
                            className="p-1 rounded-md text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="تحديث أسعار الصرف الآن"
                        >
                            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
                        </button>
                    </div>

                    {/* Currencies List */}
                    <div className="max-h-60 overflow-y-auto space-y-0.5 py-1">
                        {currencies.map((currency) => {
                            const isSelected = currency.code === currentCurrency;
                            const rate = rates[currency.code] || currency.rate_to_usd;

                            return (
                                <button
                                    key={currency.code}
                                    type="button"
                                    onClick={() => handleSelectCurrency(currency.code)}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-start ${
                                        isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold'
                                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-base select-none shrink-0">{currency.flag}</span>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="font-mono font-bold">{currency.code}</span>
                                                <span className="text-[10px] text-neutral-400 font-mono">({currency.symbol})</span>
                                            </div>
                                            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                                                {currency.name_ar || currency.name_en}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                                            {Number(rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </span>
                                        {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Open Live Rates & Converter Modal */}
                    <div className="pt-1.5 border-t border-neutral-100 dark:border-neutral-800/60 grid grid-cols-2 gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setIsLiveModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors shadow-2xs cursor-pointer truncate"
                        >
                            <Calculator className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">جدول الأسعار</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                setIsLiveModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-2xs cursor-pointer truncate"
                        >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">إضافة عملة</span>
                        </button>
                    </div>

                </div>
            )}

            {/* Live Rates Modal */}
            <LiveRatesModal
                isOpen={isLiveModalOpen}
                onClose={() => setIsLiveModalOpen(false)}
            />
        </div>
    );
}
