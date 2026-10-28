import React, { useState, useRef, useEffect } from 'react';
import { 
    Search, Filter, X, ChevronDown, Check, SlidersHorizontal, 
    Download, Trash2, Plus, Tag, Building2, Briefcase, AlertCircle,
    MapPin, Layers
} from 'lucide-react';
import { useTranslation } from '../Context/LanguageContext';

export default function FilterBar({ 
    search, 
    onSearchChange, 
    filterOptions = [], 
    activeFilters = {}, 
    onFilterChange, 
    onClearFilters,
    totalCount = 0,
    unit = 'records',
    density = 'normal',
    onToggleDensity,
    onExportCsv
}) {
    const { t, locale, isRTL } = useTranslation();
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [densityMenuOpen, setDensityMenuOpen] = useState(false);
    const [addFieldMenuOpen, setAddFieldMenuOpen] = useState(false);
    const [editingKey, setEditingKey] = useState(null);

    const filterMenuRef = useRef(null);
    const densityMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) {
                setFilterMenuOpen(false);
                setAddFieldMenuOpen(false);
                setEditingKey(null);
            }
            if (densityMenuRef.current && !densityMenuRef.current.contains(e.target)) {
                setDensityMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter out active entries that have truthy values
    const activeEntries = Object.entries(activeFilters).filter(([_, val]) => val !== '' && val !== null && val !== undefined);
    const activeFilterCount = activeEntries.length;

    // Remaining fields that can still be added
    const availableFilterOptions = filterOptions.filter((f) => !activeFilters[f.key]);

    // Field Icon Resolver
    const getFieldIcon = (key) => {
        const lower = String(key).toLowerCase();
        if (lower.includes('status')) return Tag;
        if (lower.includes('company')) return Building2;
        if (lower.includes('stage') || lower.includes('industry')) return Briefcase;
        if (lower.includes('priority')) return AlertCircle;
        if (lower.includes('city') || lower.includes('country')) return MapPin;
        return Layers;
    };

    // Color Dot Resolver for option values
    const getOptionColor = (val) => {
        const str = String(val).toLowerCase();
        if (['customer', 'completed', 'won'].includes(str)) return 'bg-emerald-500';
        if (['lead', 'todo', 'low', 'new'].includes(str)) return 'bg-blue-500';
        if (['meeting', 'screening', 'in_progress', 'medium'].includes(str)) return 'bg-amber-500';
        if (['proposal', 'high', 'urgent'].includes(str)) return 'bg-purple-500';
        if (['lost', 'inactive'].includes(str)) return 'bg-neutral-400';
        return 'bg-neutral-400';
    };

    const handleOpenFieldFilter = (key) => {
        setEditingKey(key);
        setFilterMenuOpen(true);
        setAddFieldMenuOpen(false);
    };

    return (
        <div className="glass-header border-b border-neutral-200/70 dark:border-white/[0.08] shrink-0 transition-colors">
            
            {/* Top Toolbar */}
            <div className="px-5 py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap gap-y-2">
                    
                    {/* Glassmorphic Search Input */}
                    <div className="relative shrink-0">
                        <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`${t('search')} ${unit}...`}
                            className="ps-8 pe-7 py-1.5 text-xs rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 backdrop-blur-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/50 w-48 focus:w-64 transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute end-2 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Twenty CRM Filter Button & Glassmorphic Popover */}
                    {filterOptions.length > 0 && (
                        <div className="relative shrink-0" ref={filterMenuRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setFilterMenuOpen(!filterMenuOpen);
                                    setAddFieldMenuOpen(false);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer backdrop-blur-xs shadow-2xs ${
                                    activeFilterCount > 0
                                        ? 'bg-neutral-100/90 dark:bg-neutral-800/90 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                                        : 'border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/80 dark:hover:bg-[#1f1f1f] hover:text-neutral-900 dark:hover:text-neutral-200'
                                }`}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                                <span>{t('filter')}</span>
                                {activeFilterCount > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-2xs">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>

                            {/* Twenty-style Glassmorphism Filter Popover */}
                            {filterMenuOpen && (
                                <div className="absolute start-0 top-full mt-2 z-50 w-80 glass-popover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-neutral-200/90 dark:border-neutral-700/70 p-3.5 space-y-3 animate-fade-in-scale">
                                    
                                    {/* Popover Header */}
                                    <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-2.5">
                                        <div className="flex items-center gap-2">
                                            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                {t('filters')}
                                            </span>
                                            {activeFilterCount > 0 && (
                                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                                    {activeFilterCount} {t('active')}
                                                </span>
                                            )}
                                        </div>
                                        {activeFilterCount > 0 && (
                                            <button
                                                onClick={() => {
                                                    onClearFilters();
                                                    setFilterMenuOpen(false);
                                                }}
                                                className="text-[11px] text-neutral-400 hover:text-red-500 font-medium transition-colors cursor-pointer"
                                            >
                                                {t('clear_all')}
                                            </button>
                                        )}
                                    </div>

                                    {/* Active Filter Condition Cards */}
                                    {activeEntries.length > 0 ? (
                                        <div className="space-y-2 max-h-72 overflow-y-auto pe-1">
                                            {activeEntries.map(([k, val]) => {
                                                const optGroup = filterOptions.find((f) => f.key === k);
                                                if (!optGroup) return null;
                                                const Icon = getFieldIcon(k);
                                                const currentOpt = optGroup.options.find((o) => (typeof o === 'string' ? o : o.value) == val);
                                                const currentLabel = currentOpt ? (typeof currentOpt === 'string' ? currentOpt : currentOpt.label) : val;

                                                return (
                                                    <div 
                                                        key={k} 
                                                        className="p-2.5 rounded-lg border border-neutral-200/80 dark:border-neutral-700/80 bg-neutral-50/70 dark:bg-neutral-800/50 space-y-2"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-1.5">
                                                                <Icon className="w-3.5 h-3.5 text-neutral-400" />
                                                                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                                                    {t(optGroup.label.toLowerCase()) || optGroup.label}
                                                                </span>
                                                                <span className="text-[10px] uppercase font-bold text-neutral-400 px-1 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-700/60">
                                                                    {t('is')}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => onFilterChange(k, '')}
                                                                className="text-neutral-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                                                                title="Remove filter"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {/* Option Selector Pills */}
                                                        <div className="flex flex-wrap gap-1 pt-1">
                                                            {optGroup.options.map((opt) => {
                                                                const optVal = typeof opt === 'string' ? opt : opt.value;
                                                                const rawLabel = typeof opt === 'string' ? opt : opt.label;
                                                                const optLabel = t(String(optVal).toLowerCase()) || rawLabel;
                                                                const isSelected = String(optVal) === String(val);

                                                                return (
                                                                    <button
                                                                        key={optVal}
                                                                        type="button"
                                                                        onClick={() => onFilterChange(k, optVal)}
                                                                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                                                                            isSelected
                                                                                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs'
                                                                                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/70 hover:border-neutral-400 dark:hover:border-neutral-500'
                                                                        }`}
                                                                    >
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${getOptionColor(optVal)}`}></span>
                                                                        <span>{optLabel}</span>
                                                                        {isSelected && <Check className="w-3 h-3" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-xs text-neutral-400 space-y-1">
                                            <p>{t('no_filters_applied')}</p>
                                            <p className="text-[11px] text-neutral-500">{t('select_field_below')}</p>
                                        </div>
                                    )}

                                    {/* Add Filter Section */}
                                    {availableFilterOptions.length > 0 && (
                                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                                            {!addFieldMenuOpen ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setAddFieldMenuOpen(true)}
                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-dashed border-neutral-300 dark:border-neutral-700 transition-colors cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>{t('add_filter_rule')}</span>
                                                </button>
                                            ) : (
                                                <div className="space-y-1.5 animate-fade-in-scale">
                                                    <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-1">
                                                        {t('select_field_to_filter')}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {availableFilterOptions.map((f) => {
                                                            const Icon = getFieldIcon(f.key);
                                                            return (
                                                                <button
                                                                    key={f.key}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const firstVal = typeof f.options[0] === 'string' ? f.options[0] : f.options[0]?.value;
                                                                        onFilterChange(f.key, firstVal || '');
                                                                        setAddFieldMenuOpen(false);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-start transition-colors cursor-pointer"
                                                                >
                                                                    <Icon className="w-3.5 h-3.5 text-neutral-400" />
                                                                    <span className="capitalize font-medium">{t(f.label.toLowerCase()) || f.label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Twenty CRM Authentic Inline Filter Chips */}
                    {activeEntries.map(([k, val]) => {
                        const optGroup = filterOptions.find((f) => f.key === k);
                        if (!optGroup) return null;
                        const Icon = getFieldIcon(k);
                        const currentOpt = optGroup.options.find((o) => (typeof o === 'string' ? o : o.value) == val);
                        const rawLabel = currentOpt ? (typeof currentOpt === 'string' ? currentOpt : currentOpt.label) : val;
                        const currentLabel = t(String(val).toLowerCase()) || rawLabel;

                        return (
                            <div
                                key={k}
                                onClick={() => handleOpenFieldFilter(k)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border border-neutral-200/80 dark:border-neutral-700/80 glass-chip shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-600 cursor-pointer transition-all shrink-0 group"
                                title="Click to modify filter"
                            >
                                <Icon className="w-3 h-3 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors" />
                                <span className="font-medium text-neutral-500 dark:text-neutral-400">
                                    {t(optGroup.label.toLowerCase()) || optGroup.label}
                                </span>
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold">
                                    {t('is')}
                                </span>
                                <span className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-neutral-100">
                                    <span className={`w-1.5 h-1.5 rounded-full ${getOptionColor(val)}`}></span>
                                    <span>{currentLabel}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFilterChange(k, '');
                                    }}
                                    className="p-0.5 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors cursor-pointer"
                                    title="Remove this filter"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}

                    {/* Reset All inline button if chips exist */}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={onClearFilters}
                            className="text-[11px] text-neutral-400 hover:text-red-500 font-medium px-1 transition-colors shrink-0 cursor-pointer"
                            title={t('clear_all')}
                        >
                            {t('reset')}
                        </button>
                    )}
                </div>

                {/* Right Utilities: Total Count, Density Switcher & Export */}
                <div className="flex items-center gap-2.5 shrink-0">
                    
                    {/* Record Count Badge */}
                    <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 px-2 py-0.5 rounded bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200/50 dark:border-neutral-800/50">
                        {totalCount} {t(unit.toLowerCase()) || unit}
                    </span>

                    {/* Density Toggle */}
                    {onToggleDensity && (
                        <div className="relative" ref={densityMenuRef}>
                            <button
                                type="button"
                                onClick={() => setDensityMenuOpen(!densityMenuOpen)}
                                className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 rounded-lg transition-colors border border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur-xs shadow-2xs cursor-pointer"
                                title={t('density')}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {densityMenuOpen && (
                                <div className="absolute end-0 top-full mt-2 z-50 w-38 glass-popover rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] border border-neutral-200/90 dark:border-neutral-700/70 p-1.5 space-y-0.5 animate-fade-in-scale">
                                    <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
                                        {t('density')}
                                    </div>
                                    <button
                                        onClick={() => { onToggleDensity('compact'); setDensityMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                            density === 'compact'
                                                ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-neutral-100'
                                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#1f1f1f]'
                                        }`}
                                    >
                                        <span>{t('compact')}</span>
                                        {density === 'compact' && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => { onToggleDensity('normal'); setDensityMenuOpen(false); }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                            density === 'normal'
                                                ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-neutral-100'
                                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#1f1f1f]'
                                        }`}
                                    >
                                        <span>{t('comfortable')}</span>
                                        {density === 'normal' && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* CSV Export */}
                    {onExportCsv && (
                        <button
                            type="button"
                            onClick={onExportCsv}
                            className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 rounded-lg transition-colors border border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur-xs shadow-2xs cursor-pointer"
                            title={t('export_csv')}
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
