import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { 
    X, Ship, Plane, Truck, MapPin, Calendar, DollarSign, 
    Clock, CheckCircle2, ArrowRight, Printer, AlertCircle,
    Building2, User, ChevronRight, FileText, Check, Sparkles
} from 'lucide-react';
import { useTranslation } from '../Context/LanguageContext';

export default function QuotationDrawer({ isOpen, onClose, quotation, onPrint }) {
    const { t, isRTL } = useTranslation();
    if (!isOpen || !quotation) return null;

    const [converting, setConverting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const getModeIcon = (mode) => {
        if (mode === 'air') return <Plane className="w-4 h-4 text-purple-500" />;
        if (mode === 'land') return <Truck className="w-4 h-4 text-amber-500" />;
        return <Ship className="w-4 h-4 text-blue-500" />;
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
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.draft}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {labels[status] || status}
            </span>
        );
    };

    const handleStatusChange = (newStatus) => {
        setUpdatingStatus(true);
        router.patch(`/quotations/${quotation.id}/status`, { status: newStatus }, {
            preserveScroll: true,
            onFinish: () => setUpdatingStatus(false),
        });
    };

    const handleConvert = () => {
        if (!confirm(t('confirm_convert_desc') || 'Convert this quotation into an active booked shipment?')) return;
        setConverting(true);
        router.post(`/quotations/${quotation.id}/convert`, {}, {
            onFinish: () => setConverting(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
            <div 
                className="w-full max-w-2xl h-full bg-white dark:bg-[#141414] border-s border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col animate-slide-left"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                            {getModeIcon(quotation.mode)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                    {quotation.quotation_number}
                                </h2>
                                {getStatusBadge(quotation.status)}
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                {quotation.customer?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onPrint && (
                            <button
                                onClick={() => onPrint(quotation)}
                                className="p-2 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                                title="Print / PDF"
                            >
                                <Printer className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Conversion Callout Banner */}
                {quotation.status !== 'converted' ? (
                    <div className="mx-5 mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    {t('convert_to_shipment') || 'Convert to Active Shipment'}
                                </h4>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                    Auto-creates booking, container records, milestones, and client invoice.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleConvert}
                            disabled={converting}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-2xs transition-all shrink-0 disabled:opacity-50 cursor-pointer"
                        >
                            <span>{converting ? 'Converting...' : (t('convert_to_shipment') || 'Convert Now')}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="mx-5 mt-4 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                                Converted to Shipment: {quotation.converted_shipment?.shipment_number || 'Linked'}
                            </span>
                        </div>
                        {quotation.converted_shipment && (
                            <Link
                                href={`/shipments`}
                                className="text-xs font-bold text-purple-600 hover:text-purple-500 flex items-center gap-1"
                            >
                                <span>View in Shipments</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Status Changer Bar */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-xs">
                        <span className="text-neutral-500 font-medium">Update Status:</span>
                        <div className="flex items-center gap-1">
                            {['draft', 'sent', 'accepted', 'rejected'].map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusChange(st)}
                                    disabled={updatingStatus || quotation.status === 'converted'}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all capitalize ${
                                        quotation.status === st
                                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs'
                                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Routing & Commodity Card */}
                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                            <div>
                                <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                    {t('incoterm')} & Service
                                </span>
                                <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-blue-600 dark:text-blue-400">{quotation.incoterm}</span>
                                    <span>•</span>
                                    <span className="uppercase">{quotation.service_type}</span>
                                </div>
                            </div>

                            <div className="text-end">
                                <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                                    Total Quotation
                                </span>
                                <div className="text-base font-bold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                                    ${Number(quotation.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {quotation.currency}
                                </div>
                            </div>
                        </div>

                        {/* Origin -> Destination Route Display */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60">
                                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-semibold">
                                    <MapPin className="w-3 h-3 text-emerald-500" />
                                    <span>{t('origin_port')}</span>
                                </div>
                                <div className="font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                                    {quotation.origin_port ? `${quotation.origin_port.code} - ${quotation.origin_port.name}` : 'Not Specified'}
                                </div>
                                <div className="text-[11px] text-neutral-500">
                                    {quotation.origin_port?.country}
                                </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60">
                                <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] uppercase font-semibold">
                                    <MapPin className="w-3 h-3 text-red-500" />
                                    <span>{t('destination_port')}</span>
                                </div>
                                <div className="font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                                    {quotation.destination_port ? `${quotation.destination_port.code} - ${quotation.destination_port.name}` : 'Not Specified'}
                                </div>
                                <div className="text-[11px] text-neutral-500">
                                    {quotation.destination_port?.country}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                            <div>
                                <span className="text-[10px] text-neutral-400 uppercase font-semibold">Transit Time</span>
                                <div className="font-medium text-neutral-800 dark:text-neutral-200">
                                    {quotation.estimated_transit_days ? `${quotation.estimated_transit_days} Days` : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-neutral-400 uppercase font-semibold">{t('valid_until')}</span>
                                <div className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                                    {quotation.valid_until || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-neutral-400 uppercase font-semibold">{t('commodity')}</span>
                                <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                    {quotation.commodity || 'General Cargo'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charge Items Table */}
                    <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-2.5">
                            Charge Breakdown ({quotation.items?.length || 0} items)
                        </h4>

                        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-start text-xs">
                                <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase text-neutral-400">
                                    <tr>
                                        <th className="px-3.5 py-2 text-start">Code</th>
                                        <th className="px-3.5 py-2 text-start">Description</th>
                                        <th className="px-3 py-2 text-end">Qty</th>
                                        <th className="px-3.5 py-2 text-end">Rate</th>
                                        <th className="px-3.5 py-2 text-end">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                    {quotation.items?.map((item) => (
                                        <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                                            <td className="px-3.5 py-2.5 font-mono font-bold text-[11px] text-neutral-700 dark:text-neutral-300">
                                                {item.charge_code || 'CHRG'}
                                            </td>
                                            <td className="px-3.5 py-2.5">
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {item.description}
                                                </div>
                                                <div className="text-[10px] text-neutral-400 capitalize">
                                                    {item.category?.replace(/_/g, ' ')} • {item.unit_type?.replace(/_/g, ' ')}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-end font-mono text-neutral-600 dark:text-neutral-400">
                                                {Number(item.quantity).toLocaleString()}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-end font-mono text-neutral-600 dark:text-neutral-400">
                                                ${Number(item.unit_price).toLocaleString()}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-end font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                                ${Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-neutral-50/80 dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-800 text-xs font-mono">
                                    <tr>
                                        <td colSpan="4" className="px-3.5 py-2 text-end text-neutral-500 font-sans">
                                            Grand Total:
                                        </td>
                                        <td className="px-3.5 py-2 text-end font-bold text-blue-600 dark:text-blue-400">
                                            ${Number(quotation.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {quotation.currency}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    {quotation.terms_conditions && (
                        <div>
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
                                Terms & Conditions
                            </h4>
                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                                {quotation.terms_conditions}
                            </div>
                        </div>
                    )}

                    {/* Payment Terms */}
                    {quotation.payment_terms && (
                        <div>
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
                                Payment Terms
                            </h4>
                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                                {quotation.payment_terms}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
