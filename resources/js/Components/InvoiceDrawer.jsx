import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, Receipt, Printer, CheckCircle2, Clock, AlertCircle, Ban, 
    DollarSign, Calendar, Building2, Ship, ArrowUpRight, ArrowDownLeft, 
    CreditCard, Trash2, ChevronDown, FileText
} from 'lucide-react';
import { useTranslation } from '../Context/LanguageContext';

export default function InvoiceDrawer({ isOpen, onClose, invoice }) {
    if (!isOpen || !invoice) return null;

    const { t, isRTL } = useTranslation();
    const [recordingPayment, setRecordingPayment] = useState(false);
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(invoice.balance_due > 0 ? invoice.balance_due : invoice.total_amount);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentNotes, setPaymentNotes] = useState('');
    const [changingStatus, setChangingStatus] = useState(false);

    const isReceivable = invoice.type === 'receivable';

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('status_paid')}
                    </span>
                );
            case 'partially_paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <Clock className="w-3 h-3" />
                        {t('status_partially_paid')}
                    </span>
                );
            case 'overdue':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-3 h-3" />
                        {t('status_overdue')}
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
                        <Ban className="w-3 h-3" />
                        {t('status_cancelled')}
                    </span>
                );
            case 'issued':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Clock className="w-3 h-3" />
                        {t('status_issued')}
                    </span>
                );
        }
    };

    const handleRecordPayment = (e) => {
        e.preventDefault();
        setSubmittingPayment(true);

        router.post(`/billing/${invoice.id}/payment`, {
            amount: parseFloat(paymentAmount) || 0,
            payment_date: paymentDate,
            notes: paymentNotes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmittingPayment(false);
                setRecordingPayment(false);
                setPaymentNotes('');
            },
            onError: (err) => {
                setSubmittingPayment(false);
                console.error(err);
            }
        });
    };

    const handleUpdateStatus = (newStatus) => {
        setChangingStatus(true);
        router.patch(`/billing/${invoice.id}/status`, {
            status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => setChangingStatus(false),
            onError: () => setChangingStatus(false),
        });
    };

    const handleDelete = () => {
        if (!confirm(t('confirm_delete') || 'Are you sure you want to delete this invoice?')) return;
        router.delete(`/billing/${invoice.id}`, {
            onSuccess: () => onClose(),
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const paidPercent = invoice.total_amount > 0 
        ? Math.min(100, Math.round((invoice.paid_amount / invoice.total_amount) * 100))
        : 0;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in print:p-0">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity print:hidden"
                onClick={onClose}
            />

            <div className={`fixed inset-y-0 ${isRTL ? 'left-0' : 'right-0'} max-w-2xl w-full flex pl-0 z-10 print:static print:max-w-none print:w-full`}>
                <div className="w-full bg-white dark:bg-[#141414] border-s border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col h-full overflow-hidden print:border-none print:shadow-none">
                    
                    {/* Header Bar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#181818]/70 shrink-0 print:hidden">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isReceivable
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                                {isReceivable ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                                        {invoice.invoice_number}
                                    </span>
                                    {getStatusBadge(invoice.status)}
                                </div>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {isReceivable ? t('customer_invoices') : t('vendor_bills')} • {invoice.category?.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={handlePrint}
                                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                title={t('print_invoice')}
                            >
                                <Printer className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title={t('delete')}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Statement Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        
                        {/* Status Quick Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 print:hidden">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-neutral-500">Status:</span>
                                <select
                                    value={invoice.status}
                                    onChange={(e) => handleUpdateStatus(e.target.value)}
                                    disabled={changingStatus}
                                    className="text-xs font-semibold py-1 px-2.5 rounded-md bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 cursor-pointer"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="issued">Issued</option>
                                    <option value="partially_paid">Partially Paid</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {invoice.balance_due > 0 && !recordingPayment && (
                                <button
                                    onClick={() => setRecordingPayment(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
                                >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>{t('record_payment')}</span>
                                </button>
                            )}
                        </div>

                        {/* Inline Record Payment Form */}
                        {recordingPayment && (
                            <form onSubmit={handleRecordPayment} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-3 animate-fade-in print:hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                        <DollarSign className="w-4 h-4" />
                                        {t('record_payment')}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setRecordingPayment(false)}
                                        className="text-neutral-400 hover:text-neutral-600 text-xs"
                                    >
                                        {t('cancel')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                            {t('payment_amount')} ($)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={invoice.balance_due}
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            required
                                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                            {t('payment_date')}
                                        </label>
                                        <input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            required
                                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                        {t('payment_notes')}
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        placeholder="Check #, Wire Transfer Ref, Bank Auth..."
                                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-1">
                                    <button
                                        type="submit"
                                        disabled={submittingPayment}
                                        className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {submittingPayment ? t('saving') : t('record_payment')}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Statement Layout (Twenty CRM Printable Format) */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm print:p-0 print:border-none print:shadow-none">
                            
                            {/* Document Header */}
                            <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-5">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-xs">
                                            FX
                                        </div>
                                        <span className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                                            Freight-X Global Logistics
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        Multimodal Freight & Customs Brokerage
                                    </p>
                                </div>

                                <div className="text-end">
                                    <h1 className="text-xl font-extrabold uppercase tracking-tight text-neutral-900 dark:text-white font-mono">
                                        {isReceivable ? 'INVOICE' : 'VENDOR BILL'}
                                    </h1>
                                    <p className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 mt-0.5">
                                        #{invoice.invoice_number}
                                    </p>
                                </div>
                            </div>

                            {/* Addresses & Meta */}
                            <div className="grid grid-cols-2 gap-6 text-xs">
                                <div>
                                    <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">
                                        {isReceivable ? t('bill_to') : t('vendor')}
                                    </span>
                                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm mt-1">
                                        {invoice.partner?.name || 'Unknown Partner'}
                                    </h3>
                                    <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                                        {invoice.partner?.partner_type?.toUpperCase()}
                                    </p>
                                    <p className="text-neutral-500 dark:text-neutral-400">
                                        {[invoice.partner?.city, invoice.partner?.country].filter(Boolean).join(', ')}
                                    </p>
                                    {invoice.partner?.email && (
                                        <p className="text-neutral-400 font-mono mt-0.5">
                                            {invoice.partner?.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5 text-end">
                                    <div>
                                        <span className="text-neutral-400">{t('issue_date')}: </span>
                                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                                            {invoice.issue_date}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-neutral-400">{t('due_date')}: </span>
                                        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
                                            {invoice.due_date || 'N/A'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-neutral-400">{t('payment_terms')}: </span>
                                        <span className="font-semibold text-neutral-900 dark:text-white">
                                            {invoice.payment_terms || 'Due Upon Receipt'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Linked Shipment Details Card */}
                            {invoice.shipment && (
                                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#121212] border border-neutral-200/80 dark:border-neutral-800 text-xs flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                                            <Ship className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                                {t('linked_shipment')}
                                            </span>
                                            <div className="font-bold text-neutral-900 dark:text-white font-mono flex items-center gap-2">
                                                <span>{invoice.shipment.shipment_number}</span>
                                                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 uppercase">
                                                    {invoice.shipment.mode}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-end text-neutral-500 dark:text-neutral-400">
                                        <span>
                                            {invoice.shipment.origin_port?.code || 'ORIG'} → {invoice.shipment.destination_port?.code || 'DEST'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Itemized Charges Table */}
                            <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#202020] text-neutral-500 font-medium">
                                            <th className="py-2.5 px-3 text-start">{t('charge_description')}</th>
                                            <th className="py-2.5 px-2 text-start">Code</th>
                                            <th className="py-2.5 px-2 text-end">Qty</th>
                                            <th className="py-2.5 px-2 text-end">Rate ($)</th>
                                            <th className="py-2.5 px-3 text-end">{t('total_due')} ($)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                        {invoice.items && invoice.items.length > 0 ? (
                                            invoice.items.map((item) => (
                                                <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1a1a1a]/50">
                                                    <td className="py-2.5 px-3 font-medium text-neutral-900 dark:text-white">
                                                        {item.description}
                                                    </td>
                                                    <td className="py-2.5 px-2 font-mono text-neutral-500 text-[11px]">
                                                        {item.charge_code || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-2 text-end font-mono text-neutral-600 dark:text-neutral-400">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-2.5 px-2 text-end font-mono text-neutral-600 dark:text-neutral-400">
                                                        ${parseFloat(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-end font-semibold text-neutral-900 dark:text-white font-mono">
                                                        ${parseFloat(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-4 text-center text-neutral-400">
                                                    No line items recorded.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary Totals & Balance Due */}
                            <div className="flex justify-end pt-2">
                                <div className="w-64 space-y-2 text-xs">
                                    <div className="flex justify-between text-neutral-500">
                                        <span>{t('subtotal')}</span>
                                        <span className="font-mono text-neutral-900 dark:text-white">
                                            ${parseFloat(invoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {parseFloat(invoice.tax_amount) > 0 && (
                                        <div className="flex justify-between text-neutral-500">
                                            <span>{t('tax_amount')}</span>
                                            <span className="font-mono text-neutral-900 dark:text-white">
                                                +${parseFloat(invoice.tax_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                    {parseFloat(invoice.discount_amount) > 0 && (
                                        <div className="flex justify-between text-neutral-500">
                                            <span>{t('discount')}</span>
                                            <span className="font-mono text-rose-500">
                                                -${parseFloat(invoice.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-neutral-800 pt-2 text-sm">
                                        <span>{t('total_due')}</span>
                                        <span className="font-mono">
                                            ${parseFloat(invoice.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Paid vs Balance */}
                                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5">
                                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <span>{t('paid_amount')}</span>
                                            <span className="font-mono">
                                                ${parseFloat(invoice.paid_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    paidPercent === 100 ? 'bg-emerald-500' : 'bg-cyan-500'
                                                }`}
                                                style={{ width: `${paidPercent}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between font-bold text-neutral-900 dark:text-white pt-1">
                                            <span>{t('balance_due')}</span>
                                            <span className={`font-mono ${invoice.balance_due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-500'}`}>
                                                ${parseFloat(invoice.balance_due).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Notes */}
                            {invoice.notes && (
                                <div className="p-3 bg-neutral-50 dark:bg-[#121212] rounded-xl border border-neutral-200/60 dark:border-neutral-800 text-xs">
                                    <span className="font-semibold text-neutral-400 uppercase text-[10px] tracking-wider block mb-1">
                                        {t('payment_notes')}
                                    </span>
                                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                                        {invoice.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
