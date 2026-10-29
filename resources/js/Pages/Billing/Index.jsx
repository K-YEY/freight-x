import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import CreateInvoiceModal from '../../Components/Modals/CreateInvoiceModal';
import InvoiceDrawer from '../../Components/InvoiceDrawer';
import { useTranslation } from '../../Context/LanguageContext';
import { 
    Receipt, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, 
    TrendingUp, AlertCircle, CheckCircle2, Clock, Ban, DollarSign, 
    Download, Printer, Ship, Building2, ChevronRight, Eye, Trash2, CreditCard
} from 'lucide-react';

export default function BillingIndex({ 
    invoices = { data: [], links: [] }, 
    partners = [], 
    shipments = [], 
    filters = {}, 
    metrics = {} 
}) {
    const { t, isRTL } = useTranslation();

    const [activeTab, setActiveTab] = useState(filters.type || 'all');
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [partnerFilter, setPartnerFilter] = useState(filters.partner_id || '');
    const [shipmentFilter, setShipmentFilter] = useState(filters.shipment_id || '');

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createType, setCreateType] = useState('receivable');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Apply Filters via Inertia GET
    const applyFilters = (newFilters = {}) => {
        const query = {
            search: newFilters.search !== undefined ? newFilters.search : search,
            type: newFilters.type !== undefined ? newFilters.type : activeTab,
            status: newFilters.status !== undefined ? newFilters.status : statusFilter,
            partner_id: newFilters.partner_id !== undefined ? newFilters.partner_id : partnerFilter,
            shipment_id: newFilters.shipment_id !== undefined ? newFilters.shipment_id : shipmentFilter,
        };

        // Remove empty or 'all' values
        Object.keys(query).forEach((key) => {
            if (!query[key] || query[key] === 'all') {
                delete query[key];
            }
        });

        router.get('/billing', query, { preserveState: true, replace: true });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        applyFilters({ type: tab });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleOpenCreate = (type = 'receivable') => {
        setCreateType(type);
        setCreateModalOpen(true);
    };

    const handleOpenInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setDrawerOpen(true);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {t('status_paid')}
                    </span>
                );
            case 'partially_paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        {t('status_partially_paid')}
                    </span>
                );
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {t('status_overdue')}
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
                        <Ban className="w-2.5 h-2.5" />
                        {t('status_cancelled')}
                    </span>
                );
            case 'issued':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        {t('status_issued')}
                    </span>
                );
        }
    };

    // CSV Export
    const handleExportCSV = () => {
        const rows = [
            ['Invoice Number', 'Type', 'Partner', 'Category', 'Shipment', 'Issue Date', 'Due Date', 'Total ($)', 'Paid ($)', 'Balance Due ($)', 'Status']
        ];

        (invoices.data || []).forEach((inv) => {
            rows.push([
                inv.invoice_number,
                inv.type,
                inv.partner?.name || '',
                inv.category || '',
                inv.shipment?.shipment_number || '',
                inv.issue_date,
                inv.due_date || '',
                inv.total_amount,
                inv.paid_amount,
                inv.balance_due,
                inv.status
            ]);
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `billing_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const invoiceList = invoices.data || [];

    return (
        <AppLayout title={t('billing')}>
            <Head title={t('billing')} />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Top Bar with Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <Receipt className="w-6 h-6 text-neutral-800 dark:text-neutral-200" />
                            <span>{t('billing')}</span>
                        </h1>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {t('invoices')} • Consolidated Customer Receivables & Vendor Partner Payables
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#1a1a1a] hover:bg-neutral-100 dark:hover:bg-[#222222] border border-neutral-200 dark:border-neutral-800 transition-colors shadow-2xs cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Export CSV</span>
                        </button>

                        <button
                            onClick={() => handleOpenCreate('receivable')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('new_invoice')}</span>
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Total Receivables (Customer Invoices) */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                {t('total_receivables')}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <ArrowDownLeft className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-neutral-900 dark:text-white font-mono">
                                ${(metrics.totalReceivables || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-850">
                            <span>Collected: ${(metrics.totalCollected || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Due: ${(metrics.totalOutstandingReceivable || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    {/* Total Payables (Vendor Costs) */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                {t('total_payables')}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-neutral-900 dark:text-white font-mono">
                                ${(metrics.totalPayables || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-850">
                            <span>Paid Out: ${(metrics.totalPaidOut || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            <span className="text-rose-600 dark:text-rose-400 font-medium">Due: ${(metrics.totalOutstandingPayable || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>

                    {/* Net Realized Profit */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                {t('net_realized_profit')}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-xl font-bold font-mono ${
                                (metrics.netProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}>
                                ${(metrics.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-850">
                            <span>{t('profit_margin')}:</span>
                            <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                                {metrics.profitMargin || 0}%
                            </span>
                        </div>
                    </div>

                    {/* Overdue / Outstanding Alerts */}
                    <div className="p-4 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                {t('overdue_invoices')}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-neutral-900 dark:text-white font-mono">
                                {metrics.overdueCount || 0}
                            </span>
                            <span className="text-xs text-neutral-400">overdue invoices</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-850">
                            <span>AR Outstanding:</span>
                            <span className="font-mono text-neutral-900 dark:text-white">${(metrics.totalOutstandingReceivable || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>

                {/* Filter and Tab Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 bg-neutral-100 dark:bg-[#181818] rounded-xl border border-neutral-200/70 dark:border-neutral-800">
                    
                    {/* Tab Switcher */}
                    <div className="flex items-center gap-1 bg-white dark:bg-[#202020] p-1 rounded-lg border border-neutral-200/70 dark:border-neutral-700/60 shadow-2xs">
                        <button
                            onClick={() => handleTabChange('all')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === 'all'
                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                            }`}
                        >
                            {t('all_transactions')}
                        </button>

                        <button
                            onClick={() => handleTabChange('receivable')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'receivable'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-emerald-600'
                            }`}
                        >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>{t('customer_invoices')}</span>
                        </button>

                        <button
                            onClick={() => handleTabChange('payable')}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'payable'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-rose-600'
                            }`}
                        >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>{t('vendor_bills')}</span>
                        </button>
                    </div>

                    {/* Search & Select Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search invoice #, company..."
                                className="ps-8 pe-3 py-1.5 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-44 sm:w-56"
                            />
                        </form>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                applyFilters({ status: e.target.value });
                            }}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                        >
                            <option value="all">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="issued">Issued</option>
                            <option value="partially_paid">Partially Paid</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Partner Filter */}
                        <select
                            value={partnerFilter}
                            onChange={(e) => {
                                setPartnerFilter(e.target.value);
                                applyFilters({ partner_id: e.target.value });
                            }}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 max-w-[150px] truncate"
                        >
                            <option value="">All Companies</option>
                            {partners.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Spreadsheet Table */}
                <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-[#181818]/75 text-neutral-500 dark:text-neutral-400 font-medium">
                                    <th className="py-3 px-4 text-start">{t('invoice_number')}</th>
                                    <th className="py-3 px-3 text-start">{t('companies')} / {t('vendor')}</th>
                                    <th className="py-3 px-3 text-start">{t('linked_shipment')}</th>
                                    <th className="py-3 px-3 text-start">{t('invoice_category')}</th>
                                    <th className="py-3 px-3 text-start">{t('due_date')}</th>
                                    <th className="py-3 px-3 text-end">{t('total_due')} ($)</th>
                                    <th className="py-3 px-3 text-end">{t('paid_amount')} ($)</th>
                                    <th className="py-3 px-3 text-end">{t('balance_due')} ($)</th>
                                    <th className="py-3 px-3 text-center">{t('status')}</th>
                                    <th className="py-3 px-3 text-center w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                {invoiceList.length > 0 ? (
                                    invoiceList.map((invoice) => {
                                        const isReceivable = invoice.type === 'receivable';

                                        return (
                                            <tr 
                                                key={invoice.id} 
                                                onClick={() => handleOpenInvoice(invoice)}
                                                className="hover:bg-neutral-50/70 dark:hover:bg-[#181818]/70 transition-colors cursor-pointer group"
                                            >
                                                {/* Invoice # & Type Icon */}
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                                                            isReceivable 
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                        }`}>
                                                            {isReceivable ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <span className="font-mono font-bold text-neutral-900 dark:text-white group-hover:underline">
                                                            {invoice.invoice_number}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Partner / Company */}
                                                <td className="py-3 px-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-neutral-900 dark:text-white truncate max-w-[160px]">
                                                            {invoice.partner?.name || 'Unknown'}
                                                        </span>
                                                        <span className="text-[10px] text-neutral-400 uppercase tracking-tight">
                                                            {invoice.partner?.partner_type || 'partner'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Linked Shipment */}
                                                <td className="py-3 px-3">
                                                    {invoice.shipment ? (
                                                        <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                                                            <Ship className="w-3 h-3 text-neutral-400" />
                                                            <span className="font-mono font-medium">{invoice.shipment.shipment_number}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 text-[11px]">-</span>
                                                    )}
                                                </td>

                                                {/* Category */}
                                                <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400">
                                                    <span className="capitalize">{invoice.category?.replace(/_/g, ' ') || 'General'}</span>
                                                </td>

                                                {/* Due Date */}
                                                <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                                                    {invoice.due_date || 'N/A'}
                                                </td>

                                                {/* Total Due */}
                                                <td className="py-3 px-3 text-end font-mono font-semibold text-neutral-900 dark:text-white">
                                                    ${parseFloat(invoice.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>

                                                {/* Paid Amount */}
                                                <td className="py-3 px-3 text-end font-mono text-emerald-600 dark:text-emerald-400">
                                                    ${parseFloat(invoice.paid_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>

                                                {/* Balance Due */}
                                                <td className={`py-3 px-3 text-end font-mono font-semibold ${
                                                    parseFloat(invoice.balance_due) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-400'
                                                }`}>
                                                    ${parseFloat(invoice.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3 px-3 text-center">
                                                    {getStatusBadge(invoice.status)}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleOpenInvoice(invoice)}
                                                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                                        title="View Statement"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="py-12 text-center text-neutral-400">
                                            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-medium">{t('no_records_for', { query: search || 'selected filter' })}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {invoices.links && invoices.links.length > 3 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#181818]/50 text-xs">
                            <span className="text-neutral-500">
                                Showing {invoices.from || 0} to {invoices.to || 0} of {invoices.total || 0} invoices
                            </span>
                            <div className="flex items-center gap-1">
                                {invoices.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                                            link.active
                                                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold'
                                                : link.url
                                                    ? 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                                    : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Invoice / Bill Modal */}
            <CreateInvoiceModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                partners={partners}
                shipments={shipments}
                defaultType={createType}
            />

            {/* Slide-over Statement Drawer */}
            <InvoiceDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                invoice={selectedInvoice}
            />
        </AppLayout>
    );
}
