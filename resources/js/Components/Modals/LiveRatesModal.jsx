import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, RefreshCw, ArrowRightLeft, DollarSign, TrendingUp, CheckCircle2, 
    ShieldCheck, Globe, Plus, Trash2, Edit3, Save, AlertCircle, Sparkles, Check
} from 'lucide-react';
import { useCurrency } from '../../Context/CurrencyContext';
import { useTranslation } from '../../Context/LanguageContext';

// Popular freight forwarding currency presets for 1-click addition
const CURRENCY_PRESETS = [
    { code: 'KWD', name_ar: 'دينار كويتي', name_en: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', rate: 0.308 },
    { code: 'QAR', name_ar: 'ريال قطري', name_en: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦', rate: 3.64 },
    { code: 'OMR', name_ar: 'ريال عماني', name_en: 'Omani Rial', symbol: 'ر.ع', flag: '🇴🇲', rate: 0.385 },
    { code: 'BHD', name_ar: 'دينار بحريني', name_en: 'Bahraini Dinar', symbol: 'د.ب', flag: '🇧🇭', rate: 0.377 },
    { code: 'JOD', name_ar: 'دينار أردني', name_en: 'Jordanian Dinar', symbol: 'د.أ', flag: '🇯🇴', rate: 0.709 },
    { code: 'TRY', name_ar: 'ليرة تركية', name_en: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', rate: 34.20 },
    { code: 'JPY', name_ar: 'ين ياباني', name_en: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 152.40 },
    { code: 'CAD', name_ar: 'دولار كندي', name_en: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', rate: 1.39 },
    { code: 'CHF', name_ar: 'فرنك سويسري', name_en: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', rate: 0.865 },
    { code: 'INR', name_ar: 'روبية هندية', name_en: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 84.10 },
];

export default function LiveRatesModal({ isOpen, onClose }) {
    const { t, isRTL } = useTranslation();
    const { 
        currentCurrency, 
        setCurrency, 
        rates, 
        currencies, 
        lastSyncedAt, 
        isSyncing, 
        refreshLiveRates,
        addCurrency,
        updateCurrency,
        deleteCurrency,
        convert
    } = useCurrency();

    const [activeTab, setActiveTab] = useState('rates'); // 'rates' | 'add' | 'manage'

    // Converter State
    const [calcAmount, setCalcAmount] = useState('1000');
    const [fromCurr, setFromCurr] = useState('USD');
    const [toCurr, setToCurr] = useState(currentCurrency === 'USD' ? 'EGP' : currentCurrency);

    // Feedback Notification
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

    // Add Currency Form State
    const [newCurrency, setNewCurrency] = useState({
        code: '',
        name_ar: '',
        name_en: '',
        symbol: '',
        flag: '🌐',
        rate_to_usd: '',
        is_auto_sync: true,
    });
    const [isAdding, setIsAdding] = useState(false);

    // Inline Editing State in Manage Tab
    const [editingCode, setEditingCode] = useState(null);
    const [editingRate, setEditingRate] = useState('');
    const [editingAutoSync, setEditingAutoSync] = useState(true);
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Close on Escape key
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

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4500);
    };

    const handleRefresh = async () => {
        const res = await refreshLiveRates();
        showFeedback(res.success ? 'success' : 'error', res.message);
    };

    const handleSwap = () => {
        setFromCurr(toCurr);
        setToCurr(fromCurr);
    };

    const handleApplyPreset = (preset) => {
        setNewCurrency({
            code: preset.code,
            name_ar: preset.name_ar,
            name_en: preset.name_en,
            symbol: preset.symbol,
            flag: preset.flag,
            rate_to_usd: preset.rate ? String(preset.rate) : '',
            is_auto_sync: true,
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!newCurrency.code) {
            showFeedback('error', 'يرجى إدخال رمز العملة (مثال: KWD)');
            return;
        }

        setIsAdding(true);
        const res = await addCurrency({
            code: newCurrency.code.trim().toUpperCase(),
            name_ar: newCurrency.name_ar.trim() || newCurrency.code,
            name_en: newCurrency.name_en.trim() || newCurrency.code,
            symbol: newCurrency.symbol.trim() || newCurrency.code,
            flag: newCurrency.flag.trim() || '🌐',
            rate_to_usd: parseFloat(newCurrency.rate_to_usd) || 0,
            is_auto_sync: Boolean(newCurrency.is_auto_sync),
        });
        setIsAdding(false);

        if (res.success) {
            showFeedback('success', `تمت إضافة عملة (${newCurrency.code.toUpperCase()}) بنجاح!`);
            setNewCurrency({
                code: '',
                name_ar: '',
                name_en: '',
                symbol: '',
                flag: '🌐',
                rate_to_usd: '',
                is_auto_sync: true,
            });
            setActiveTab('rates');
        } else {
            showFeedback('error', res.message);
        }
    };

    const startEditing = (curr) => {
        setEditingCode(curr.code);
        setEditingRate(String(rates[curr.code] || curr.rate_to_usd || 1));
        setEditingAutoSync(curr.is_auto_sync !== false);
    };

    const handleSaveEdit = async (code) => {
        const numericRate = parseFloat(editingRate);
        if (isNaN(numericRate) || numericRate <= 0) {
            showFeedback('error', 'يرجى إدخال سعر صرف صحيح أكبر من الصفر.');
            return;
        }

        setIsSavingEdit(true);
        const res = await updateCurrency({
            code,
            rate_to_usd: numericRate,
            is_auto_sync: editingAutoSync,
        });
        setIsSavingEdit(false);

        if (res.success) {
            showFeedback('success', `تم تحديث سعر صرف ${code} بنجاح.`);
            setEditingCode(null);
        } else {
            showFeedback('error', res.message);
        }
    };

    const handleDelete = async (code) => {
        if (!window.confirm(`هل أنت متأكد من حذف عملة (${code}) من المنصة؟`)) {
            return;
        }

        const res = await deleteCurrency(code);
        if (res.success) {
            showFeedback('success', `تم حذف عملة ${code} بنجاح.`);
        } else {
            showFeedback('error', res.message);
        }
    };

    const convertedResult = convert(calcAmount || 0, fromCurr, toCurr);
    const unitRate = convert(1, fromCurr, toCurr);

    const formattedLastSync = lastSyncedAt 
        ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : 'الآن';

    const modalMarkup = (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            style={{ isolation: 'isolate' }}
        >
            {/* Opaque Backdrop to fully mask background elements */}
            <div 
                className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Solid Modal Dialog Window */}
            <div className="relative w-full max-w-3xl bg-[#161617] dark:bg-[#161617] border border-neutral-700/80 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] z-10 text-neutral-100 animate-fade-in">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-800 bg-[#1c1c1e] flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-white">
                                    أسعار الصرف ومحول العملات الحية
                                </h2>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>LIVE FX API</span>
                                </span>
                            </div>
                            <p className="text-xs text-neutral-400 mt-0.5">
                                أسعار معتمدة ومباشرة من البورصة العالمية (Open Market FX APIs) مع تحويل فوري ودعم الشحن الدولي.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isSyncing}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm border border-emerald-500/50 transition-all cursor-pointer ${
                                isSyncing ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                            title="تحديث أسعار الصرف الحية من البورصة العالمية"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>{isSyncing ? 'جاري السحب من الـ API...' : 'تحديث من الـ API'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Sub-navigation Tabs */}
                <div className="px-6 py-2.5 border-b border-neutral-800/80 flex items-center gap-2 bg-[#19191b] shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('rates')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'rates'
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                        }`}
                    >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>جدول العملات والأسعار</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            activeTab === 'rates' ? 'bg-neutral-200 text-neutral-900' : 'bg-neutral-800 text-neutral-300'
                        }`}>
                            {currencies.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('add')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'add'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-neutral-400 hover:text-blue-400 hover:bg-neutral-800/60'
                        }`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة عملة جديدة</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('manage')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'manage'
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                        }`}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل وحذف العملات</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#161617]">
                    
                    {/* Feedback Toast Banner */}
                    {feedback && (
                        <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs animate-fade-in ${
                            feedback.type === 'success'
                                ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                                : 'bg-rose-950/60 border-rose-700/80 text-rose-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                {feedback.type === 'success' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                )}
                                <span className="font-semibold">{feedback.message}</span>
                            </div>
                            <button type="button" onClick={() => setFeedback(null)} className="p-1 opacity-60 hover:opacity-100">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* TAB 1: RATES TABLE & QUICK CONVERTER */}
                    {activeTab === 'rates' && (
                        <div className="space-y-5">
                            
                            {/* FX Calculator Card */}
                            <div className="p-4 rounded-xl bg-[#1c1c1e] border border-neutral-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <DollarSign className="w-4 h-4 text-emerald-400" />
                                        <span>حاسبة التحويل السريع</span>
                                    </span>
                                    <span className="text-[11px] text-neutral-400 font-mono bg-neutral-800/70 px-2 py-0.5 rounded">
                                        1 {fromCurr} = {unitRate.toFixed(4)} {toCurr}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                                    {/* From */}
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-[11px] text-neutral-400 block font-medium">
                                            من عملة:
                                        </label>
                                        <div className="flex items-center gap-2 bg-[#121213] border border-neutral-700 rounded-lg p-2.5">
                                            <select
                                                value={fromCurr}
                                                onChange={(e) => setFromCurr(e.target.value)}
                                                className="bg-transparent border-0 text-xs font-bold text-white focus:ring-0 p-0 cursor-pointer"
                                            >
                                                {currencies.map(c => (
                                                    <option key={c.code} value={c.code} className="bg-[#1a1a1a] text-white">
                                                        {c.flag} {c.code} ({c.symbol})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={calcAmount}
                                                onChange={(e) => setCalcAmount(e.target.value)}
                                                className="w-full text-end bg-transparent border-0 font-mono font-bold text-sm text-white focus:ring-0 p-0"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    {/* Swap Button */}
                                    <div className="flex justify-center pt-4">
                                        <button
                                            type="button"
                                            onClick={handleSwap}
                                            className="p-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 border border-neutral-700"
                                            title="تبديل العملتين"
                                        >
                                            <ArrowRightLeft className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* To */}
                                    <div className="sm:col-span-2 space-y-1.5">
                                        <label className="text-[11px] text-neutral-400 block font-medium">
                                            إلى عملة:
                                        </label>
                                        <div className="flex items-center gap-2 bg-[#121213] border border-neutral-700 rounded-lg p-2.5">
                                            <select
                                                value={toCurr}
                                                onChange={(e) => setToCurr(e.target.value)}
                                                className="bg-transparent border-0 text-xs font-bold text-white focus:ring-0 p-0 cursor-pointer"
                                            >
                                                {currencies.map(c => (
                                                    <option key={c.code} value={c.code} className="bg-[#1a1a1a] text-white">
                                                        {c.flag} {c.code} ({c.symbol})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="w-full text-end font-mono font-bold text-sm text-emerald-400 truncate">
                                                {convertedResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clean Currencies Table */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-white flex items-center gap-2">
                                        <span>أسعار الصرف المعتمدة (الأساس: 1 دولار أمريكي USD)</span>
                                    </span>
                                    <span className="text-neutral-400 font-mono text-[11px]">
                                        آخر مزامنة: {formattedLastSync}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {currencies.map((currency) => {
                                        const isCurrent = currency.code === currentCurrency;
                                        const rate = rates[currency.code] || currency.rate_to_usd;

                                        return (
                                            <div
                                                key={currency.code}
                                                onClick={() => setCurrency(currency.code)}
                                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group select-none ${
                                                    isCurrent
                                                        ? 'bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-500/40'
                                                        : 'bg-[#1c1c1e] hover:bg-[#222225] border-neutral-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-lg shrink-0">
                                                        {currency.flag || '🌐'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="font-mono font-bold text-sm text-white">
                                                                {currency.code}
                                                            </span>
                                                            <span className="text-xs text-neutral-400 font-mono">
                                                                ({currency.symbol})
                                                            </span>
                                                            {isCurrent && (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white flex items-center gap-0.5">
                                                                    <Check className="w-2.5 h-2.5" />
                                                                    <span>النشطة</span>
                                                                </span>
                                                            )}
                                                            {currency.is_auto_sync === false && (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                                                    يدوي
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-neutral-400 truncate mt-0.5">
                                                            {isRTL ? currency.name_ar : currency.name_en}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-end shrink-0 ps-3">
                                                    <div className="font-mono text-sm font-bold text-white">
                                                        {Number(rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-400 font-mono">
                                                        لكل $1 USD
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ADD NEW CURRENCY FORM */}
                    {activeTab === 'add' && (
                        <div className="space-y-5">
                            
                            {/* Quick Presets */}
                            <div className="p-4 rounded-xl bg-[#1c1c1e] border border-neutral-800 space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    <span>عملات دولية وعربية شائعة للشحن (إضافة بنقرة واحدة):</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {CURRENCY_PRESETS.map((preset) => {
                                        const alreadyExists = currencies.some(c => c.code === preset.code);
                                        return (
                                            <button
                                                key={preset.code}
                                                type="button"
                                                disabled={alreadyExists}
                                                onClick={() => handleApplyPreset(preset)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                    alreadyExists
                                                        ? 'bg-neutral-800/40 text-neutral-500 border border-neutral-800 cursor-not-allowed opacity-50'
                                                        : newCurrency.code === preset.code
                                                            ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                                                            : 'bg-[#252528] text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
                                                }`}
                                            >
                                                <span>{preset.flag}</span>
                                                <span className="font-mono font-bold">{preset.code}</span>
                                                <span className="text-[10px] text-neutral-400">({preset.symbol})</span>
                                                {alreadyExists && <span className="text-[10px] text-emerald-400">✓ مضافة</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Add Form */}
                            <form onSubmit={handleAddSubmit} className="p-5 rounded-xl bg-[#1c1c1e] border border-neutral-800 space-y-4">
                                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Plus className="w-4 h-4 text-blue-400" />
                                        <span>بيانات العملة الجديدة</span>
                                    </h3>
                                    <span className="text-[11px] text-neutral-400">
                                        كود قياسي مكون من 3 أحرف
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* Currency Code */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutral-300">
                                            كود العملة (ISO) <span className="text-rose-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={3}
                                            placeholder="مثال: KWD"
                                            value={newCurrency.code}
                                            onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                                            className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#121213] border border-neutral-700 rounded-lg text-white uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Currency Symbol */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutral-300">
                                            رمز العملة
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={8}
                                            placeholder="مثال: د.ك أو KD"
                                            value={newCurrency.symbol}
                                            onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                                            className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Flag Emoji */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutral-300">
                                            علم الدولة (إيموجي)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="مثال: 🇰🇼 أو 🌐"
                                            value={newCurrency.flag}
                                            onChange={(e) => setNewCurrency({ ...newCurrency, flag: e.target.value })}
                                            className="w-full px-3 py-2 text-xs text-center bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Arabic Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutral-300">
                                            اسم العملة بالعربية
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="مثال: دينار كويتي"
                                            value={newCurrency.name_ar}
                                            onChange={(e) => setNewCurrency({ ...newCurrency, name_ar: e.target.value })}
                                            className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* English Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutral-300">
                                            اسم العملة بالإنجليزية
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Kuwaiti Dinar"
                                            value={newCurrency.name_en}
                                            onChange={(e) => setNewCurrency({ ...newCurrency, name_en: e.target.value })}
                                            className="w-full px-3 py-2 text-xs bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Rate to USD */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-neutral-300 flex items-center justify-between">
                                            <span>سعر الصرف لـ $1 USD</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            placeholder="مثال: 0.308 (أو اتركه فارغاً)"
                                            value={newCurrency.rate_to_usd}
                                            onChange={(e) => setNewCurrency({ ...newCurrency, rate_to_usd: e.target.value })}
                                            className="w-full px-3 py-2 text-xs font-mono bg-[#121213] border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Auto Sync Toggle */}
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="is_auto_sync"
                                        checked={newCurrency.is_auto_sync}
                                        onChange={(e) => setNewCurrency({ ...newCurrency, is_auto_sync: e.target.checked })}
                                        className="rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-0 cursor-pointer"
                                    />
                                    <label htmlFor="is_auto_sync" className="text-xs text-neutral-300 select-none cursor-pointer">
                                        تفعيل التحديث التلقائي مع أسواق الصرف العالمية (Live Market Auto-Sync)
                                    </label>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('rates')}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-neutral-800 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAdding}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>{isAdding ? 'جاري الإضافة...' : 'حفظ وإضافة العملة'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB 3: MANAGE & EDIT CURRENCIES */}
                    {activeTab === 'manage' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-400 bg-[#1c1c1e] p-3 rounded-xl border border-neutral-800">
                                <div>
                                    <span className="text-white font-semibold block">إدارة وتعديل أسعار العملات:</span>
                                    <span className="text-[11px] text-neutral-400">يمكنك تعديل الأسعار يدوياً أو تفعيل السحب الآلي من البورصة.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={isSyncing}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shrink-0 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                                    <span>مزامنة كافة العملات من الـ API الحية</span>
                                </button>
                            </div>

                            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#1c1c1e]">
                                <table className="w-full text-start border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-800 bg-[#222225] text-neutral-400 font-semibold">
                                            <th className="py-3 px-4 text-start">العملة</th>
                                            <th className="py-3 px-3 text-start">الاسم</th>
                                            <th className="py-3 px-3 text-start">الرمز</th>
                                            <th className="py-3 px-3 text-start">سعر الصرف (لكل $1)</th>
                                            <th className="py-3 px-3 text-center">المزامنة</th>
                                            <th className="py-3 px-4 text-center w-28">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/70">
                                        {currencies.map((curr) => {
                                            const isEditing = editingCode === curr.code;
                                            const isUsd = curr.code === 'USD';

                                            return (
                                                <tr key={curr.code} className="hover:bg-[#252529] transition-colors">
                                                    {/* Code & Flag */}
                                                    <td className="py-3 px-4 font-mono font-bold text-white">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-base select-none">{curr.flag}</span>
                                                            <span>{curr.code}</span>
                                                        </div>
                                                    </td>

                                                    {/* Name */}
                                                    <td className="py-3 px-3 text-neutral-300">
                                                        {isRTL ? curr.name_ar : curr.name_en}
                                                    </td>

                                                    {/* Symbol */}
                                                    <td className="py-3 px-3 font-mono text-neutral-400">
                                                        {curr.symbol}
                                                    </td>

                                                    {/* Rate */}
                                                    <td className="py-3 px-3 font-mono font-bold text-white">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                step="0.0001"
                                                                value={editingRate}
                                                                disabled={isUsd}
                                                                onChange={(e) => setEditingRate(e.target.value)}
                                                                className="w-28 px-2 py-1 text-xs font-mono font-bold rounded border border-blue-500 bg-[#121213] text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            />
                                                        ) : (
                                                            <span>{Number(rates[curr.code] || curr.rate_to_usd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                                                        )}
                                                    </td>

                                                    {/* Auto Sync */}
                                                    <td className="py-3 px-3 text-center">
                                                        {isEditing ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={editingAutoSync}
                                                                disabled={isUsd}
                                                                onChange={(e) => setEditingAutoSync(e.target.checked)}
                                                                className="rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-0 cursor-pointer"
                                                            />
                                                        ) : curr.is_auto_sync !== false ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                                آلي
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                                                يدوي
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3 px-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSaveEdit(curr.code)}
                                                                        disabled={isSavingEdit}
                                                                        className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                                                                        title="حفظ التعديل"
                                                                    >
                                                                        <Save className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setEditingCode(null)}
                                                                        className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                                                                        title="إلغاء"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {!isUsd && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => startEditing(curr)}
                                                                            className="p-1.5 text-neutral-400 hover:text-blue-400 rounded-lg hover:bg-neutral-800 transition-colors"
                                                                            title="تعديل السعر"
                                                                        >
                                                                            <Edit3 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                    {!isUsd && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDelete(curr.code)}
                                                                            className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition-colors"
                                                                            title="حذف العملة"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-neutral-800 bg-[#1c1c1e] flex items-center justify-between text-xs shrink-0">
                    <span className="text-neutral-400">
                        العملة المعتمدة الحالية للمنصة: <strong className="text-white font-mono font-bold">{currentCurrency}</strong>
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-neutral-200 text-neutral-900 transition-colors cursor-pointer shadow-sm"
                    >
                        إغلاق
                    </button>
                </div>

            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalMarkup, document.body) : modalMarkup;
}
