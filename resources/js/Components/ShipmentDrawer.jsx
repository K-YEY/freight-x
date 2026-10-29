import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, Ship, Plane, Truck, MapPin, Calendar, DollarSign, 
    Clock, Plus, CheckCircle2, Circle, AlertCircle, 
    FileText, Box, ArrowRight, Trash2, Check, ExternalLink,
    Anchor, Building2, User, ChevronRight, Scale, ShieldCheck, Tag
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useTranslation } from '../Context/LanguageContext';

export default function ShipmentDrawer({ isOpen, onClose, shipment, ports = [], carriers = [], clients = [] }) {
    const { t, isRTL } = useTranslation();
    if (!isOpen || !shipment) return null;

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'containers' | 'financials'
    
    // Add Container state
    const [isAddingContainer, setIsAddingContainer] = useState(false);
    const [newContainer, setNewContainer] = useState({
        container_number: '',
        type: '40HC',
        seal_number: '',
        verified_gross_mass_kg: '',
        tare_weight_kg: '3800',
        cargo_weight_kg: '',
        volume_cbm: '67.5',
    });

    // Add Invoice/Bill state
    const [isAddingInvoice, setIsAddingInvoice] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        type: 'payable',
        category: 'ocean_freight',
        partner_id: shipment.carrier_id || '',
        description: '',
        amount: '',
        tax_amount: '0',
        status: 'sent',
    });

    const getModeIcon = (mode) => {
        if (mode === 'air') return <Plane className="w-5 h-5 text-purple-500" />;
        if (mode === 'land') return <Truck className="w-5 h-5 text-amber-500" />;
        return <Ship className="w-5 h-5 text-blue-500" />;
    };

    const handleUpdateMilestone = (milestoneId, newStatus) => {
        router.patch(`/milestones/${milestoneId}`, {
            status: newStatus,
            actual_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null,
        }, { preserveScroll: true });
    };

    const handleAddContainer = (e) => {
        e.preventDefault();
        if (!newContainer.container_number.trim()) return;

        router.post(`/shipments/${shipment.id}/containers`, newContainer, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddingContainer(false);
                setNewContainer({
                    container_number: '',
                    type: '40HC',
                    seal_number: '',
                    verified_gross_mass_kg: '',
                    tare_weight_kg: '3800',
                    cargo_weight_kg: '',
                    volume_cbm: '67.5',
                });
            },
        });
    };

    const handleDeleteContainer = (containerId) => {
        if (!confirm(t('delete_confirm') || 'Are you sure?')) return;
        router.delete(`/containers/${containerId}`, { preserveScroll: true });
    };

    const handleAddInvoice = (e) => {
        e.preventDefault();
        if (!newInvoice.amount || !newInvoice.description) return;

        router.post(`/shipments/${shipment.id}/invoices`, newInvoice, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddingInvoice(false);
                setNewInvoice({
                    type: 'payable',
                    category: 'ocean_freight',
                    partner_id: shipment.carrier_id || '',
                    description: '',
                    amount: '',
                    tax_amount: '0',
                    status: 'sent',
                });
            },
        });
    };

    const handleToggleInvoicePaid = (invoiceId, currentStatus) => {
        const nextStatus = currentStatus === 'paid' ? 'sent' : 'paid';
        router.patch(`/invoices/${invoiceId}/status`, { status: nextStatus }, { preserveScroll: true });
    };

    const handleDeleteShipment = () => {
        if (!confirm(t('delete_confirm') || 'Are you sure you want to delete this shipment?')) return;
        router.delete(`/shipments/${shipment.id}`, {
            onSuccess: () => onClose(),
        });
    };

    const handleStatusChange = (status) => {
        router.patch(`/shipments/${shipment.id}/status`, { status }, { preserveScroll: true });
    };

    const milestones = shipment.milestones || [];
    const containers = shipment.containers || [];
    const invoices = shipment.invoices || [];

    // Financial summaries
    const totalRev = Number(shipment.total_revenue || 0);
    const totalCost = Number(shipment.total_cost || 0);
    const grossProfit = Number(shipment.gross_profit || 0);
    const marginPct = Number(shipment.margin_percentage || 0);

    // Completed milestones count
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const progressPercent = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden glass-modal-backdrop flex justify-end">
            <div className="w-full max-w-2xl glass-drawer h-full shadow-[0_0_60px_rgba(0,0,0,0.3)] dark:shadow-[0_0_80px_rgba(0,0,0,0.85)] border-s border-neutral-200/80 dark:border-neutral-800/80 flex flex-col animate-slide-left">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200/70 dark:border-neutral-800/80 glass-header flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-center shrink-0">
                            {getModeIcon(shipment.mode)}
                        </div>
                        <div className="truncate">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight">
                                    {shipment.shipment_number}
                                </h2>
                                <StatusBadge type="status" value={shipment.status} />
                                <span className="text-[11px] uppercase font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                    {shipment.service_type}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                                {shipment.customer?.name || t('unassigned')} • {shipment.booking_number || 'BKG-PENDING'}
                                {shipment.mbl_number && ` • B/L: ${shipment.mbl_number}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDeleteShipment}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                            title={t('delete')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Progress / Milestones Stepper Header */}
                <div className="px-6 py-3 bg-neutral-50/80 dark:bg-[#161616]/80 border-b border-neutral-200/60 dark:border-neutral-800/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">
                            {t('progress')}: {completedMilestones} / {milestones.length} {t('stages_completed')}
                        </span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                            {progressPercent}%
                        </span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-neutral-200/70 dark:border-neutral-800/80 flex items-center gap-6 text-xs font-medium">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors ${
                            activeTab === 'overview'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        {t('overview')}
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                            activeTab === 'timeline'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('timeline')}</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200/60 dark:bg-neutral-800">
                            {milestones.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('containers')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                            activeTab === 'containers'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <Box className="w-3.5 h-3.5" />
                        <span>{t('containers')}</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200/60 dark:bg-neutral-800">
                            {containers.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('financials')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                            activeTab === 'financials'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{t('financials')}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                            grossProfit >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-100 text-red-800'
                        }`}>
                            ${grossProfit.toLocaleString()}
                        </span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* TAB: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            
                            {/* Route Card */}
                            <div className="p-4 rounded-xl bg-neutral-50/70 dark:bg-[#161616]/70 border border-neutral-200/70 dark:border-neutral-800/80">
                                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                                    {t('routing')} & {t('port_of_loading')} / {t('port_of_discharge')}
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="text-xs text-neutral-400">{t('origin')}</div>
                                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                            {shipment.origin_port?.name || t('not_specified')}
                                        </div>
                                        <div className="text-[11px] text-neutral-500 font-mono">
                                            {shipment.origin_port?.code} • {shipment.origin_port?.city}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center px-2">
                                        <ArrowRight className="w-4 h-4 text-neutral-400 rtl:rotate-180" />
                                        <span className="text-[10px] text-neutral-400 mt-1 uppercase font-semibold">
                                            {shipment.move_type}
                                        </span>
                                    </div>

                                    <div className="flex-1 text-end">
                                        <div className="text-xs text-neutral-400">{t('destination')}</div>
                                        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                            {shipment.destination_port?.name || t('not_specified')}
                                        </div>
                                        <div className="text-[11px] text-neutral-500 font-mono">
                                            {shipment.destination_port?.code} • {shipment.destination_port?.city}
                                        </div>
                                    </div>
                                </div>

                                {shipment.vessel && (
                                    <div className="mt-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
                                        <span className="flex items-center gap-1.5">
                                            <Anchor className="w-3.5 h-3.5 text-blue-500" />
                                            <span>{t('vessel')}: <strong>{shipment.vessel.name}</strong></span>
                                        </span>
                                        <span className="font-mono text-[11px] text-neutral-400">
                                            IMO: {shipment.vessel.imo_number}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Partners & Entities */}
                            <div>
                                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                                    {t('partners')} & {t('contractors')}
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a]">
                                        <div className="text-[10px] text-neutral-400 uppercase">{t('customer')}</div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                                            {shipment.customer?.name || t('not_specified')}
                                        </div>
                                        <div className="text-[10px] text-neutral-400">{shipment.customer?.country || ''}</div>
                                    </div>

                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a]">
                                        <div className="text-[10px] text-neutral-400 uppercase">{t('carrier_shipping_line')}</div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                                            {shipment.carrier?.name || t('not_specified')}
                                        </div>
                                        <div className="text-[10px] text-neutral-400 font-mono">{shipment.carrier?.code || ''}</div>
                                    </div>

                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a]">
                                        <div className="text-[10px] text-neutral-400 uppercase">{t('customs_broker')}</div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                                            {shipment.customs_broker?.name || t('unassigned')}
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a]">
                                        <div className="text-[10px] text-neutral-400 uppercase">{t('trucker')}</div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 truncate">
                                            {shipment.trucker?.name || t('unassigned')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cargo Details */}
                            <div>
                                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                                    {t('cargo_specs')}
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a]">
                                        <div className="text-[10px] text-neutral-400 uppercase">{t('incoterm')}</div>
                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                            {shipment.incoterm}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a]">
                                        <div className="text-[10px] text-neutral-400 uppercase">{t('weight')}</div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                                            {shipment.total_gross_weight_kg ? `${Number(shipment.total_gross_weight_kg).toLocaleString()} kg` : '—'}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a]">
                                        <div className="text-[10px] text-neutral-400 uppercase">{t('volume')}</div>
                                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                                            {shipment.total_volume_cbm ? `${shipment.total_volume_cbm} CBM` : '—'}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] flex items-center justify-between text-xs">
                                    <span className="text-neutral-500">{t('commodity')}:</span>
                                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                        {shipment.commodity || t('general_cargo')}
                                    </span>
                                </div>
                            </div>

                            {/* Schedule & Dates */}
                            <div>
                                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                                    {t('schedule')} & {t('dates')}
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] flex items-center justify-between">
                                        <span className="text-neutral-400">{t('etd')}:</span>
                                        <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{shipment.etd || '—'}</span>
                                    </div>
                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] flex items-center justify-between">
                                        <span className="text-neutral-400">{t('eta')}:</span>
                                        <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{shipment.eta || '—'}</span>
                                    </div>
                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] flex items-center justify-between">
                                        <span className="text-neutral-400">{t('atd')}:</span>
                                        <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{shipment.atd || '—'}</span>
                                    </div>
                                    <div className="p-3 rounded-lg border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] flex items-center justify-between">
                                        <span className="text-neutral-400">{t('ata')}:</span>
                                        <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">{shipment.ata || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Change Stage Quick Actions */}
                            <div className="pt-4 border-t border-neutral-200/70 dark:border-neutral-800/80">
                                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2.5">
                                    {t('quick_stage_transition')}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {['booked', 'cargo_received', 'customs_export', 'in_transit', 'arrived', 'delivered'].map((stg) => (
                                        <button
                                            key={stg}
                                            onClick={() => handleStatusChange(stg)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                                shipment.status === stg
                                                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                            }`}
                                        >
                                            {t(stg) || stg.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: TIMELINE & MILESTONES */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                                <span>{t('interactive_timeline_desc') || 'Click on any milestone status to advance it.'}</span>
                            </div>

                            <div className="relative ps-6 space-y-6 before:absolute before:start-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 dark:before:bg-neutral-800">
                                {milestones.map((m, idx) => {
                                    const isDone = m.status === 'completed';
                                    const isCurrent = m.status === 'in_progress';
                                    
                                    return (
                                        <div key={m.id || idx} className="relative group">
                                            {/* Step dot */}
                                            <button
                                                onClick={() => handleUpdateMilestone(m.id, isDone ? 'pending' : 'completed')}
                                                className={`absolute -start-6 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                                                    isDone
                                                        ? 'bg-emerald-500 text-white shadow-sm'
                                                        : isCurrent
                                                        ? 'bg-blue-500 text-white animate-pulse'
                                                        : 'bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-700 text-transparent'
                                                }`}
                                                title={isDone ? 'Click to mark pending' : 'Click to mark complete'}
                                            >
                                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                                            </button>

                                            <div className="p-3 rounded-xl border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {isRTL ? (m.title_ar || m.title_en) : (m.title_en || m.title_ar)}
                                                    </h4>
                                                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                                        isDone
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                            : isCurrent
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                                    }`}>
                                                        {t(m.status) || m.status}
                                                    </span>
                                                </div>

                                                <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
                                                    <span>{m.location || 'Terminal'}</span>
                                                    <span className="font-mono">
                                                        {m.actual_date ? `Actual: ${m.actual_date}` : `Planned: ${m.planned_date || '—'}`}
                                                    </span>
                                                </div>

                                                {m.notes && (
                                                    <div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded">
                                                        {m.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB: CONTAINERS */}
                    {activeTab === 'containers' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    {t('container_manifest')} ({containers.length})
                                </h3>
                                <button
                                    onClick={() => setIsAddingContainer(!isAddingContainer)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{t('add_container')}</span>
                                </button>
                            </div>

                            {/* Add Container Form Drawer */}
                            {isAddingContainer && (
                                <form onSubmit={handleAddContainer} className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 space-y-3 animate-fade-in-scale">
                                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                        {t('new_container')}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] text-neutral-400">{t('container_number')}</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. MSKU9876543"
                                                value={newContainer.container_number}
                                                onChange={(e) => setNewContainer({ ...newContainer, container_number: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-neutral-400">{t('type')}</label>
                                            <select
                                                value={newContainer.type}
                                                onChange={(e) => setNewContainer({ ...newContainer, type: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            >
                                                <option value="20GP">20' Standard Dry (20GP)</option>
                                                <option value="40GP">40' Standard Dry (40GP)</option>
                                                <option value="40HC">40' High Cube (40HC)</option>
                                                <option value="45HC">45' High Cube (45HC)</option>
                                                <option value="20RF">20' Reefer (Refrigerated)</option>
                                                <option value="40RF">40' Reefer High Cube</option>
                                                <option value="20OT">20' Open Top</option>
                                                <option value="40OT">40' Open Top</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-neutral-400">{t('seal_number')}</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. SL-908231"
                                                value={newContainer.seal_number}
                                                onChange={(e) => setNewContainer({ ...newContainer, seal_number: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-neutral-400">VGM {t('weight')} (kg)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 26500"
                                                value={newContainer.verified_gross_mass_kg}
                                                onChange={(e) => setNewContainer({ ...newContainer, verified_gross_mass_kg: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingContainer(false)}
                                            className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                                        >
                                            {t('save')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Containers List */}
                            <div className="space-y-3">
                                {containers.map((cont) => (
                                    <div key={cont.id} className="p-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] shadow-2xs flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                                                {cont.type}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                                        {cont.container_number}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                                        {cont.status || 'Active'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3 font-mono">
                                                    <span>Seal: <strong>{cont.seal_number || 'N/A'}</strong></span>
                                                    <span>•</span>
                                                    <span>VGM: <strong>{cont.verified_gross_mass_kg ? `${Number(cont.verified_gross_mass_kg).toLocaleString()} kg` : 'N/A'}</strong></span>
                                                    <span>•</span>
                                                    <span>Vol: <strong>{cont.volume_cbm ? `${cont.volume_cbm} CBM` : 'N/A'}</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteContainer(cont.id)}
                                            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                                            title={t('delete')}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {containers.length === 0 && (
                                    <div className="py-8 text-center text-xs text-neutral-400">
                                        {t('no_containers_yet') || 'No containers assigned to this shipment.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: FINANCIALS & PROFITABILITY */}
                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            
                            {/* Profitability Summary Card */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-[#181818] dark:to-[#141414] border border-neutral-200/80 dark:border-neutral-800">
                                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                                    {t('shipment_profitability')}
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-[11px] text-neutral-500">{t('total_revenue')} (Receivable)</div>
                                        <div className="text-base font-bold text-neutral-900 dark:text-neutral-100 font-mono mt-0.5">
                                            ${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[11px] text-neutral-500">{t('total_costs')} (Payables)</div>
                                        <div className="text-base font-bold text-neutral-700 dark:text-neutral-300 font-mono mt-0.5">
                                            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[11px] text-neutral-500">{t('gross_profit')} (Margin)</div>
                                        <div className={`text-base font-bold font-mono mt-0.5 flex items-center gap-1.5 ${
                                            grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                                        }`}>
                                            <span>${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                {marginPct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Invoices Header & Add button */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    {t('invoices_and_bills')} ({invoices.length})
                                </h3>
                                <button
                                    onClick={() => setIsAddingInvoice(!isAddingInvoice)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{t('new_invoice_or_bill') || 'Add Charge / Bill'}</span>
                                </button>
                            </div>

                            {/* Add Invoice Form */}
                            {isAddingInvoice && (
                                <form onSubmit={handleAddInvoice} className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 space-y-3 animate-fade-in-scale">
                                    <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                        {t('add_charge')}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] text-neutral-400">{t('type')}</label>
                                            <select
                                                value={newInvoice.type}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, type: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            >
                                                <option value="receivable">Customer Invoice (Receivable / إيراد)</option>
                                                <option value="payable">Vendor Cost Bill (Payable / مصروف)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-neutral-400">{t('category')}</label>
                                            <select
                                                value={newInvoice.category}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, category: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            >
                                                <option value="ocean_freight">Ocean Freight (نولون بحري)</option>
                                                <option value="air_freight">Air Freight (نولون جوي)</option>
                                                <option value="customs_clearance">Customs Clearance (تخليص جمركي)</option>
                                                <option value="inland_trucking">Inland Trucking (نقل بري)</option>
                                                <option value="thc">THC / Terminal Handling (خدمات تفريغ)</option>
                                                <option value="documentation">Documentation / BL Fee (أوراق وبوالص)</option>
                                                <option value="storage_demurrage">Demurrage / Storage (غرامات وأرضيات)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-neutral-400">{t('partner')}</label>
                                            <select
                                                value={newInvoice.partner_id}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, partner_id: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            >
                                                <option value="">{t('select_partner')}</option>
                                                {carriers.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} ({c.partner_type})</option>
                                                ))}
                                                {clients.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} (Customer)</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] text-neutral-400">{t('amount')} ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="e.g. 1500.00"
                                                value={newInvoice.amount}
                                                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                                className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-neutral-400">{t('description')}</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 2x40HC Ocean Freight Shanghai to Alexandria"
                                            value={newInvoice.description}
                                            onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                                            className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingInvoice(false)}
                                            className="px-3 py-1 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                                        >
                                            {t('save')}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Invoices List */}
                            <div className="space-y-3">
                                {invoices.map((inv) => {
                                    const isReceivable = inv.type === 'receivable';
                                    const isPaid = inv.status === 'paid';

                                    return (
                                        <div key={inv.id} className="p-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                        isReceivable 
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' 
                                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                    }`}>
                                                        {isReceivable ? t('receivable') || 'Customer Invoice' : t('payable') || 'Vendor Bill'}
                                                    </span>
                                                    <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                                        {inv.invoice_number}
                                                    </span>
                                                    <span className="text-xs text-neutral-400">•</span>
                                                    <span className="text-xs text-neutral-600 dark:text-neutral-300">
                                                        {inv.partner?.name || 'Partner'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                                        ${Number(inv.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <button
                                                        onClick={() => handleToggleInvoicePaid(inv.id, inv.status)}
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase transition-colors cursor-pointer ${
                                                            isPaid 
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                                                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200'
                                                        }`}
                                                        title="Click to toggle Paid/Unpaid"
                                                    >
                                                        {t(inv.status) || inv.status}
                                                    </button>
                                                </div>
                                            </div>

                                            {inv.items && inv.items.length > 0 && (
                                                <div className="mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60 space-y-1">
                                                    {inv.items.map((it) => (
                                                        <div key={it.id} className="flex items-center justify-between text-xs text-neutral-500">
                                                            <span>{it.description}</span>
                                                            <span className="font-mono">${Number(it.total_amount).toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {invoices.length === 0 && (
                                    <div className="py-8 text-center text-xs text-neutral-400">
                                        {t('no_invoices_yet') || 'No invoices or bills attached to this shipment.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
