import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import QuotationDrawer from '../../Components/QuotationDrawer';
import CreateQuotationModal from '../../Components/Modals/CreateQuotationModal';
import PrintQuotationModal from '../../Components/PrintQuotationModal';
import { useTranslation } from '../../Context/LanguageContext';
import { useCurrency } from '../../Context/CurrencyContext';
import { 
    Plus, Search, Ship, Plane, Truck, FileText, 
    Calendar, ArrowRight, DollarSign, CheckCircle2, 
    Printer, Sparkles, Filter, Clock, TrendingUp
} from 'lucide-react';

export default function QuotationsIndex({ 
    quotations = [], 
    stats = {}, 
    clients = [], 
    ports = [], 
    incoterms = [], 
    filters = {} 
}) {
    const { t, isRTL } = useTranslation();
    const { formatMoney, currentCurrency } = useCurrency();

    const [search, setSearch] = useState(filters.search || '');
    const [activeMode, setActiveMode] = useState(filters.mode || 'all');
    const [activeStatus, setActiveStatus] = useState(filters.status || 'all');

    const [selectedQuote, setSelectedQuote] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [printModalQuote, setPrintModalQuote] = useState(null);

    const handleSearch = (val) => {
        setSearch(val);
        router.get('/quotations', {
            search: val,
            mode: activeMode === 'all' ? '' : activeMode,
            status: activeStatus === 'all' ? '' : activeStatus,
        }, { preserveState: true, replace: true });
    };

    const handleModeSwitch = (mode) => {
        setActiveMode(mode);
        router.get('/quotations', {
            search,
            mode: mode === 'all' ? '' : mode,
            status: activeStatus === 'all' ? '' : activeStatus,
        }, { preserveState: true, replace: true });
    };

    const handleStatusSwitch = (st) => {
        setActiveStatus(st);
        router.get('/quotations', {
            search,
            mode: activeMode === 'all' ? '' : activeMode,
            status: st === 'all' ? '' : st,
        }, { preserveState: true, replace: true });
    };

    const getModeIcon = (mode) => {
        if (mode === 'air') return <Plane className="w-3.5 h-3.5 text-purple-500" />;
        if (mode === 'land') return <Truck className="w-3.5 h-3.5 text-amber-500" />;
        return <Ship className="w-3.5 h-3.5 text-blue-500" />;
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
            sent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            accepted: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            rejected: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
            expired: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            converted: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };

        const labels = {
            draft: t('quote_status_draft') || 'Draft',
            sent: t('quote_status_sent') || 'Sent',
            accepted: t('quote_status_accepted') || 'Accepted',
            rejected: t('quote_status_rejected') || 'Rejected',
            expired: t('quote_status_expired') || 'Expired',
            converted: t('quote_status_converted') || 'Converted',
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[status] || styles.draft}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <AppLayout title={t('quotations')}>
            <Head title={`${t('quotations')} - ${t('app_name')}`} />

            <div className="p-8 max-w-7xl mx-auto space-y-6">
                
                {/* Header & New Quote Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <span>{t('quotations')}</span>
                            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {quotations.length} quotes
                            </span>
                        </h1>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Freight rate quotes, margin calculations, and one-click shipment conversion
                        </p>
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('new_quotation')}</span>
                    </button>
                </div>

                {/* 4 Financial & Conversion Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] shadow-2xs">
                        <div className="flex items-center justify-between text-neutral-400 text-xs">
                            <span>Total Quotations</span>
                            <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-2">
                            {stats.totalQuotes || 0}
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
                            <span>{stats.draftCount || 0} Draft</span>
                            <span>•</span>
                            <span className="text-blue-600 font-medium">{stats.sentCount || 0} Sent</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] shadow-2xs">
                        <div className="flex items-center justify-between text-neutral-400 text-xs">
                            <span>Quoted Pipeline</span>
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-2">
                            {formatMoney(stats.totalValue || 0, 'USD', currentCurrency)}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            Active pricing proposals
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] shadow-2xs">
                        <div className="flex items-center justify-between text-neutral-400 text-xs">
                            <span>Accepted Quotes</span>
                            <CheckCircle2 className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-2">
                            {stats.acceptedCount || 0}
                        </div>
                        <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
                            Confirmed bookings
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] shadow-2xs">
                        <div className="flex items-center justify-between text-neutral-400 text-xs">
                            <span>Win Rate</span>
                            <TrendingUp className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-2">
                            {stats.conversionRate || 0}%
                        </div>
                        <div className="text-[11px] text-neutral-500 mt-1">
                            Quote-to-Shipment ratio
                        </div>
                    </div>
                </div>

                {/* Filters Bar & Mode Tabs */}
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search quote #, customer, commodity..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 ps-8 pe-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex items-center gap-1 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 bg-neutral-50 dark:bg-neutral-900 text-xs">
                        {[
                            { id: 'all', label: 'All Modes' },
                            { id: 'sea', label: 'Sea', icon: Ship },
                            { id: 'air', label: 'Air', icon: Plane },
                            { id: 'land', label: 'Land', icon: Truck },
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => handleModeSwitch(m.id)}
                                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all ${
                                    activeMode === m.id
                                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                                }`}
                            >
                                {m.icon && <m.icon className="w-3 h-3" />}
                                <span>{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 text-[11px] overflow-x-auto">
                        {[
                            { id: 'all', label: 'All Status' },
                            { id: 'draft', label: 'Draft' },
                            { id: 'sent', label: 'Sent' },
                            { id: 'accepted', label: 'Accepted' },
                            { id: 'converted', label: 'Converted' },
                        ].map((st) => (
                            <button
                                key={st.id}
                                onClick={() => handleStatusSwitch(st.id)}
                                className={`px-2 py-1 rounded-lg font-medium transition-all ${
                                    activeStatus === st.id
                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                        : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table View */}
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
                    <table className="w-full text-start text-xs">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-bold text-neutral-400">
                            <tr>
                                <th className="px-4 py-3 text-start">Quote #</th>
                                <th className="px-4 py-3 text-start">Customer</th>
                                <th className="px-4 py-3 text-start">Routing (POL → POD)</th>
                                <th className="px-3 py-3 text-start">Terms</th>
                                <th className="px-4 py-3 text-start">Valid Until</th>
                                <th className="px-4 py-3 text-end">Amount</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                            {quotations.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-12 text-center text-neutral-400">
                                        <FileText className="w-8 h-8 mx-auto mb-2 text-neutral-300 dark:text-neutral-700" />
                                        <p className="font-semibold text-xs text-neutral-600 dark:text-neutral-400">No quotations found</p>
                                        <p className="text-[11px] text-neutral-400 mt-0.5">Click "New Quotation" above to create your first rate proposal.</p>
                                    </td>
                                </tr>
                            ) : (
                                quotations.map((q) => (
                                    <tr 
                                        key={q.id}
                                        onClick={() => {
                                            setSelectedQuote(q);
                                            setDrawerOpen(true);
                                        }}
                                        className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800">
                                                    {getModeIcon(q.mode)}
                                                </div>
                                                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {q.quotation_number}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                {q.customer?.name}
                                            </div>
                                            <div className="text-[10px] text-neutral-400">
                                                {q.commodity || 'General Cargo'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
                                                <span>{q.origin_port?.code || 'POL'}</span>
                                                <ArrowRight className="w-3 h-3 text-neutral-400" />
                                                <span>{q.destination_port?.code || 'POD'}</span>
                                            </div>
                                            <div className="text-[10px] text-neutral-400">
                                                {q.estimated_transit_days ? `~${q.estimated_transit_days} days` : 'Schedule on request'}
                                            </div>
                                        </td>

                                        <td className="px-3 py-3">
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                                                {q.incoterm}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 block uppercase">
                                                {q.service_type}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                                            {q.valid_until || '—'}
                                        </td>

                                        <td className="px-4 py-3 text-end font-mono font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                                            {formatMoney(q.total_amount, q.currency || 'USD', currentCurrency)}
                                            {q.currency && q.currency !== currentCurrency && (
                                                <div className="text-[10px] font-normal text-neutral-400">
                                                    Orig: {Number(q.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {q.currency}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(q.status)}
                                        </td>

                                        <td className="px-4 py-3 text-end" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                {q.status !== 'converted' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedQuote(q);
                                                            router.post(`/quotations/${q.id}/convert`);
                                                        }}
                                                        className="px-2 py-1 text-[10px] font-bold rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1"
                                                        title="Convert directly to Shipment"
                                                    >
                                                        <Sparkles className="w-3 h-3" />
                                                        <span>Convert</span>
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => setPrintModalQuote(q)}
                                                    className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                                    title="Print Quotation"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Slide Peek Drawer */}
            <QuotationDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                quotation={selectedQuote}
                onPrint={(q) => setPrintModalQuote(q)}
            />

            {/* Create Quotation Modal */}
            <CreateQuotationModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                clients={clients}
                ports={ports}
                incoterms={incoterms}
            />

            {/* Print Modal */}
            <PrintQuotationModal
                isOpen={!!printModalQuote}
                onClose={() => setPrintModalQuote(null)}
                quotation={printModalQuote}
            />

        </AppLayout>
    );
}
