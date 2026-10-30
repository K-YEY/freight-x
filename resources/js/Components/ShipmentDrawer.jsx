import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, Ship, Plane, Truck, MapPin, Calendar, DollarSign, 
    Clock, Plus, CheckCircle2, Circle, AlertCircle, 
    FileText, Box, ArrowRight, Trash2, Check, ExternalLink,
    Anchor, Building2, User, ChevronRight, Scale, ShieldCheck, Tag, Printer,
    Upload, Download, FileCheck, AlertTriangle, Hourglass, Lock, Unlock,
    Globe, Navigation, Receipt, CheckSquare, Award
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useTranslation } from '../Context/LanguageContext';

export default function ShipmentDrawer({ 
    isOpen, 
    onClose, 
    shipment, 
    ports = [], 
    carriers = [], 
    clients = [],
    customsBrokers = [],
    truckers = [],
    agents = []
}) {
    const { t, isRTL } = useTranslation();
    if (!isOpen || !shipment) return null;

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'customs' | 'containers' | 'demurrage' | 'trucking' | 'documents' | 'financials'
    
    // Free Time settings state
    const [isEditingFreeTime, setIsEditingFreeTime] = useState(false);
    const [freeTimeForm, setFreeTimeForm] = useState({
        demurrage_free_days: shipment.demurrage_free_days ?? 14,
        detention_free_days: shipment.detention_free_days ?? 7,
        demurrage_daily_rate: shipment.demurrage_daily_rate ?? 50,
        detention_daily_rate: shipment.detention_daily_rate ?? 75,
    });

    // Tracking Dates Modal state
    const [selectedTrackingContainer, setSelectedTrackingContainer] = useState(null);
    const [trackingForm, setTrackingForm] = useState({
        discharged_at: '',
        gate_out_at: '',
        empty_returned_at: '',
    });

    // Customs Clearance state
    const [isEditingCustoms, setIsEditingCustoms] = useState(false);
    const [customsForm, setCustomsForm] = useState({
        acid_number: shipment.acid_number || '',
        bayan_number: shipment.bayan_number || '',
        customs_office: shipment.customs_office || '',
        customs_stage: shipment.customs_stage || 'not_started',
        customs_duty_amount: shipment.customs_duty_amount || '0',
        customs_vat_amount: shipment.customs_vat_amount || '0',
        customs_fees_amount: shipment.customs_fees_amount || '0',
        delivery_order_number: shipment.delivery_order_number || '',
        delivery_order_date: shipment.delivery_order_date || '',
        delivery_order_status: shipment.delivery_order_status || 'pending',
        customs_broker_id: shipment.customs_broker_id || '',
    });

    // Truck Dispatch state
    const [isAddingDispatch, setIsAddingDispatch] = useState(false);
    const [newDispatch, setNewDispatch] = useState({
        shipment_container_id: shipment.containers?.[0]?.id || '',
        trucking_company_id: shipment.trucker_id || '',
        driver_name: '',
        driver_phone: '',
        driver_national_id: '',
        truck_plate: '',
        trailer_plate: '',
        origin_address: shipment.destination_port?.name ? `${shipment.destination_port?.name} Container Yard` : 'Alexandria Dekheila Port Berth 4',
        delivery_address: shipment.consignee_address || shipment.customer?.address || 'Consignee Central Warehouse',
        empty_return_depot: `${shipment.carrier?.name || 'Carrier'} Empty Yard`,
        empty_return_receipt: '',
        driver_cost: '400',
        client_charge: '600',
        currency: shipment.currency || 'USD',
        notes: '',
    });

    // Overseas Agent Settlement state
    const [isEditingAgent, setIsEditingAgent] = useState(false);
    const [agentForm, setAgentForm] = useState({
        overseas_agent_id: shipment.overseas_agent_id || '',
        agent_share_type: shipment.agent_share_type || 'fifty_fifty',
        agent_share_percentage: shipment.agent_share_percentage || '50',
        agent_profit_share_amount: shipment.agent_profit_share_amount || (parseFloat(shipment.gross_profit || 0) * 0.5),
        agent_debit_credit_type: shipment.agent_debit_credit_type || 'debit',
        agent_settlement_status: shipment.agent_settlement_status || 'pending',
        generate_invoice: false,
    });

    // Add Document state
    const [isAddingDoc, setIsAddingDoc] = useState(false);
    const [newDoc, setNewDoc] = useState({
        document_type: 'commercial_invoice',
        title: '',
        document_number: '',
        notes: '',
        file: null,
    });
    
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

    const handleSaveCustoms = (e) => {
        e.preventDefault();
        router.patch(`/shipments/${shipment.id}/customs`, customsForm, {
            preserveScroll: true,
            onSuccess: () => setIsEditingCustoms(false),
        });
    };

    const handleAdvanceCustomsStage = (newStage) => {
        router.patch(`/shipments/${shipment.id}/customs`, {
            ...customsForm,
            customs_stage: newStage,
        }, {
            preserveScroll: true,
            onSuccess: () => setCustomsForm(prev => ({ ...prev, customs_stage: newStage })),
        });
    };

    const handleCreateDispatch = (e) => {
        e.preventDefault();
        if (!newDispatch.driver_name || !newDispatch.truck_plate) return;

        router.post(`/shipments/${shipment.id}/dispatches`, newDispatch, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddingDispatch(false);
                setNewDispatch(prev => ({
                    ...prev,
                    driver_name: '',
                    driver_phone: '',
                    driver_national_id: '',
                    truck_plate: '',
                    trailer_plate: '',
                }));
            },
        });
    };

    const handleUpdateDispatchStatus = (dispatchId, status, receipt = null) => {
        router.patch(`/dispatches/${dispatchId}/status`, {
            status,
            empty_return_receipt: receipt,
        }, { preserveScroll: true });
    };

    const handleDeleteDispatch = (dispatchId) => {
        if (!confirm(t('delete_confirm') || 'Are you sure?')) return;
        router.delete(`/dispatches/${dispatchId}`, { preserveScroll: true });
    };

    const handleSaveAgentSettlement = (e) => {
        e.preventDefault();
        router.patch(`/shipments/${shipment.id}/agent-settlement`, agentForm, {
            preserveScroll: true,
            onSuccess: () => setIsEditingAgent(false),
        });
    };

    const handleToggleFinancialLock = () => {
        router.patch(`/shipments/${shipment.id}/financial-lock`, {}, { preserveScroll: true });
    };

    const customsStages = [
        { key: 'not_started', label: 'Not Started', label_ar: 'لم يبدأ' },
        { key: 'acid_filed', label: 'ACID / Nafeza', label_ar: 'نافذة / ACID' },
        { key: 'bayan_issued', label: 'Bayan Issued', label_ar: 'البيان الجمركي' },
        { key: 'duties_assessed', label: 'Duties Assessed', label_ar: 'تقدير الرسوم' },
        { key: 'duties_paid', label: 'Duties Paid', label_ar: 'سداد الرسوم' },
        { key: 'inspection_scheduled', label: 'Inspection', label_ar: 'الكشف والتثمين' },
        { key: 'sample_tested', label: 'Regulatory', label_ar: 'العرض والفحص' },
        { key: 'customs_cleared', label: 'Customs Cleared', label_ar: 'تم الإفراج' },
        { key: 'released', label: 'Gate Pass', label_ar: 'إذن الخروج' },
    ];

    const milestones = shipment.milestones || [];
    const containers = shipment.containers || [];
    const invoices = shipment.invoices || [];
    const dispatches = shipment.truck_dispatches || [];
    const overseasAgent = shipment.overseas_agent;
    const isFinancialLocked = shipment.financial_status === 'closed_locked';

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
                        <a
                            href={`/shipments/${shipment.id}/hbl`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs cursor-pointer"
                            title={t('print_bl') || 'Print Bill of Lading'}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t('house_bl') || 'House B/L'}</span>
                        </a>

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
                <div className="px-6 border-b border-neutral-200/70 dark:border-neutral-800/80 flex items-center gap-5 text-xs font-medium overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors shrink-0 ${
                            activeTab === 'overview'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        {t('overview')}
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
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
                        onClick={() => setActiveTab('customs')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                            activeTab === 'customs'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span>{t('customs') || 'Customs Clearance'}</span>
                        {shipment.customs_stage && shipment.customs_stage !== 'not_started' && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
                                {shipment.customs_stage === 'customs_cleared' ? 'Cleared' : 'In Process'}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('containers')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
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
                        onClick={() => setActiveTab('demurrage')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                            activeTab === 'demurrage'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <Hourglass className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('free_time') || 'Free Time'}</span>
                        {containers.some(c => c.demurrage_status === 'overdue' || c.detention_status === 'overdue') && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('trucking')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                            activeTab === 'trucking'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <Truck className="w-3.5 h-3.5 text-amber-500" />
                        <span>{t('inland_trucking') || 'Inland Trucking'}</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200/60 dark:bg-neutral-800">
                            {dispatches.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                            activeTab === 'documents'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('documents') || 'e-Docs'}</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {shipment.documents?.length || 0}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('financials')}
                        className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 ${
                            activeTab === 'financials'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                    >
                        {isFinancialLocked ? (
                            <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <DollarSign className="w-3.5 h-3.5" />
                        )}
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

                            {/* House Bill of Lading Card */}
                            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>House Bill of Lading (HBL)</span>
                                    </div>
                                    <div className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                                        {shipment.hbl_number || `HBL-${shipment.shipment_number}`}
                                    </div>
                                    <div className="text-[11px] text-neutral-500">
                                        MBL: <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">{shipment.mbl_number || 'On File'}</span> • Term: <span className="font-semibold text-blue-600 dark:text-blue-400">{shipment.freight_term || 'Prepaid'}</span>
                                    </div>
                                </div>

                                <a
                                    href={`/shipments/${shipment.id}/hbl`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print / View</span>
                                </a>
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

                    {/* TAB: CUSTOMS CLEARANCE & SINGLE WINDOW */}
                    {activeTab === 'customs' && (
                        <div className="space-y-6">
                            {/* Customs Stage Progress Stepper */}
                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                                        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            {t('customs_stage') || 'Customs Clearance Process'}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                        Stage: {shipment.customs_stage || 'not_started'}
                                    </span>
                                </div>

                                {/* Interactive Stages Stepper */}
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1 text-xs">
                                    {customsStages.map((stg, i) => {
                                        const currentIdx = customsStages.findIndex(s => s.key === (shipment.customs_stage || 'not_started'));
                                        const isPastOrCurrent = i <= currentIdx && currentIdx > 0;
                                        const isCurrent = stg.key === (shipment.customs_stage || 'not_started');

                                        return (
                                            <button
                                                key={stg.key}
                                                type="button"
                                                onClick={() => handleAdvanceCustomsStage(stg.key)}
                                                className={`p-2 rounded-lg border text-start transition-all cursor-pointer ${
                                                    isCurrent
                                                        ? 'bg-blue-500 text-white border-blue-600 shadow-xs'
                                                        : isPastOrCurrent
                                                        ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                                                        : 'bg-neutral-50 dark:bg-neutral-900/40 text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                                                }`}
                                            >
                                                <div className="text-[9px] uppercase opacity-75 font-mono">Stage 0{i + 1}</div>
                                                <div className="font-semibold text-[11px] truncate mt-0.5">
                                                    {isRTL ? stg.label_ar : stg.label}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Single-Window / Declaration & Broker Card */}
                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <FileCheck className="w-4 h-4 text-emerald-500" />
                                        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            Single-Window & Declaration Details (نافذة والبيان)
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingCustoms(!isEditingCustoms)}
                                        className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                    >
                                        {isEditingCustoms ? t('close') : t('edit')}
                                    </button>
                                </div>

                                {isEditingCustoms ? (
                                    <form onSubmit={handleSaveCustoms} className="space-y-3 text-xs pt-1">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    {t('acid_number') || 'ACID Number (Nafeza)'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customsForm.acid_number}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, acid_number: e.target.value })}
                                                    placeholder="e.g. ACID-2026-EG-998812"
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    {t('bayan_number') || 'Customs Declaration # (Bayan)'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customsForm.bayan_number}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, bayan_number: e.target.value })}
                                                    placeholder="e.g. BYN-ALX-44210"
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    {t('customs_office') || 'Port of Entry / Customs Hub'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customsForm.customs_office}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, customs_office: e.target.value })}
                                                    placeholder="e.g. Alexandria Port Customs (Dekheila)"
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    Customs Broker
                                                </label>
                                                <select
                                                    value={customsForm.customs_broker_id}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, customs_broker_id: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                                >
                                                    <option value="">Select broker...</option>
                                                    {customsBrokers.map(cb => (
                                                        <option key={cb.id} value={cb.id}>{cb.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    Customs Duty ($ / EGP)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={customsForm.customs_duty_amount}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, customs_duty_amount: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    VAT (14%)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={customsForm.customs_vat_amount}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, customs_vat_amount: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    Inspection & Port Dues
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={customsForm.customs_fees_amount}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, customs_fees_amount: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    Delivery Order (D/O #)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={customsForm.delivery_order_number}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, delivery_order_number: e.target.value })}
                                                    placeholder="e.g. DO-MSC-9091"
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    D/O Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={customsForm.delivery_order_date}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, delivery_order_date: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                    D/O Status
                                                </label>
                                                <select
                                                    value={customsForm.delivery_order_status}
                                                    onChange={(e) => setCustomsForm({ ...customsForm, delivery_order_status: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                                >
                                                    <option value="pending">Pending Carrier Exchange</option>
                                                    <option value="paid">Terminal Fees Paid</option>
                                                    <option value="exchanged">Exchanged & Received</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingCustoms(false)}
                                                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs"
                                            >
                                                {t('cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                                            >
                                                {t('save')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 block uppercase font-mono">ACID (Nafeza)</span>
                                            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 block mt-0.5">
                                                {shipment.acid_number || 'Not Lodged'}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 block uppercase font-mono">Bayan / Declaration</span>
                                            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 block mt-0.5">
                                                {shipment.bayan_number || 'Awaiting Issue'}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 block uppercase">Customs Office</span>
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate block mt-0.5">
                                                {shipment.customs_office || 'Dekheila Hub'}
                                            </span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 block uppercase">Customs Broker</span>
                                            <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate block mt-0.5">
                                                {shipment.customs_broker?.name || 'In-House Clearance'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Delivery Order & Taxes Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Delivery Order Card */}
                                <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Receipt className="w-4 h-4 text-amber-500" />
                                            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                Delivery Order (D/O - إذن التسليم)
                                            </h4>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            shipment.delivery_order_status === 'exchanged' 
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        }`}>
                                            {shipment.delivery_order_status || 'pending'}
                                        </span>
                                    </div>
                                    <div className="text-xs space-y-1 font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">D/O Number:</span>
                                            <strong className="text-neutral-900 dark:text-neutral-100">{shipment.delivery_order_number || 'TBA'}</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">Issuing Line:</span>
                                            <span className="font-sans text-neutral-800 dark:text-neutral-200">{shipment.carrier?.name || 'Line'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">D/O Date:</span>
                                            <span>{shipment.delivery_order_date || 'Awaiting Arrival'}</span>
                                        </div>
                                    </div>
                                    {shipment.delivery_order_status !== 'exchanged' && (
                                        <button
                                            type="button"
                                            onClick={() => router.patch(`/shipments/${shipment.id}/customs`, {
                                                ...customsForm,
                                                delivery_order_status: 'exchanged',
                                                delivery_order_date: new Date().toISOString().split('T')[0],
                                            }, { preserveScroll: true })}
                                            className="w-full mt-2 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                                        >
                                            Mark D/O Exchanged with Shipping Line
                                        </button>
                                    )}
                                </div>

                                {/* Government Taxes Breakdown */}
                                <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xs space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-blue-500" />
                                            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                Duties & Taxes Assessment
                                            </h4>
                                        </div>
                                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                            Total: ${(parseFloat(shipment.customs_duty_amount || 0) + parseFloat(shipment.customs_vat_amount || 0) + parseFloat(shipment.customs_fees_amount || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs space-y-1 font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">Customs Duty:</span>
                                            <span>${parseFloat(shipment.customs_duty_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">VAT (14%):</span>
                                            <span>${parseFloat(shipment.customs_vat_amount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-500 font-sans">Port & Inspection Fees:</span>
                                            <span>${parseFloat(shipment.customs_fees_amount || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
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
                            
                            {/* Financial Lock & Job Costing Audit Status */}
                            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                                isFinancialLocked 
                                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100' 
                                    : 'bg-neutral-50/70 dark:bg-[#181818] border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200'
                            }`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                        isFinancialLocked ? 'bg-emerald-500 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                                    }`}>
                                        {isFinancialLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                    </div>
                                    <div className="truncate">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs uppercase tracking-wider">
                                                {isFinancialLocked ? (t('financial_locked') || 'Financial Status: Audit Locked') : (t('financial_open') || 'Financial Status: Open (Active Job Costing)')}
                                            </span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                isFinancialLocked ? 'bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                            }`}>
                                                {isFinancialLocked ? 'Closed & Audited' : 'Editable'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                                            {isFinancialLocked 
                                                ? `Locked by ${shipment.financial_closed_by?.name || 'Finance Auditor'} on ${shipment.financial_closed_at?.substring(0, 10) || 'Audit Date'}. Ledger changes frozen.`
                                                : 'All invoices, bills, and profit shares remain editable until job costing is finalized.'
                                            }
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleToggleFinancialLock}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                        isFinancialLocked 
                                            ? 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-900' 
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    }`}
                                >
                                    {isFinancialLocked ? (
                                        <>
                                            <Unlock className="w-3.5 h-3.5" />
                                            <span>{t('unlock_financials') || 'Unlock File'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-3.5 h-3.5" />
                                            <span>{t('lock_financials') || 'Finalize & Lock'}</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Profitability Summary Card */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-[#181818] dark:to-[#141414] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                                        {t('shipment_profitability')} ({shipment.currency || 'USD'})
                                    </div>
                                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                                        Job #{shipment.shipment_number}
                                    </span>
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
                                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                                                {marginPct}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Overseas Partner Agent Settlement & Profit Sharing */}
                            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-purple-500" />
                                        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            {t('overseas_agent_settlement') || 'Overseas Partner Agent Settlement & Profit Sharing'}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {shipment.overseas_agent_id && (
                                            <a
                                                href={`/shipments/${shipment.id}/agent-note`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800/80 transition-colors"
                                                title="Print Partner Debit/Credit Note"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                                <span>Print Note</span>
                                            </a>
                                        )}
                                        {!isFinancialLocked && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingAgent(!isEditingAgent)}
                                                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                                            >
                                                {isEditingAgent ? t('cancel') : (t('edit_terms') || 'Edit Settlement')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {isEditingAgent ? (
                                    <form onSubmit={handleSaveAgentSettlement} className="space-y-3 text-xs pt-1">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                                                    {t('overseas_agent') || 'Overseas Partner Agent'}
                                                </label>
                                                <select
                                                    value={agentForm.overseas_agent_id}
                                                    onChange={(e) => setAgentForm({ ...agentForm, overseas_agent_id: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                                >
                                                    <option value="">{t('select_partner') || 'Select Overseas Agent'}</option>
                                                    {agents.map(a => (
                                                        <option key={a.id} value={a.id}>{a.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                                                    {t('profit_share_type') || 'Profit Share Split'}
                                                </label>
                                                <select
                                                    value={agentForm.agent_share_type}
                                                    onChange={(e) => {
                                                        const type = e.target.value;
                                                        let amount = agentForm.agent_profit_share_amount;
                                                        if (type === 'fifty_fifty') amount = Math.max(0, grossProfit * 0.5).toFixed(2);
                                                        setAgentForm({ ...agentForm, agent_share_type: type, agent_profit_share_amount: amount });
                                                    }}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                                >
                                                    <option value="fifty_fifty">50 / 50 Standard Split (المناصفة)</option>
                                                    <option value="percentage">Custom Percentage % (نسبة مئوية)</option>
                                                    <option value="fixed_amount">Fixed Amount (مبلغ مقطوع)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                                                    {agentForm.agent_share_type === 'percentage' ? 'Split %' : 'Calculated Share ($)'}
                                                </label>
                                                {agentForm.agent_share_type === 'percentage' ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={agentForm.agent_share_percentage}
                                                        onChange={(e) => {
                                                            const pct = parseFloat(e.target.value) || 0;
                                                            const amt = ((grossProfit * pct) / 100).toFixed(2);
                                                            setAgentForm({ ...agentForm, agent_share_percentage: e.target.value, agent_profit_share_amount: amt });
                                                        }}
                                                        className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                                    />
                                                ) : (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={agentForm.agent_profit_share_amount}
                                                        onChange={(e) => setAgentForm({ ...agentForm, agent_profit_share_amount: e.target.value })}
                                                        className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                                    />
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                                                    Settlement Document Type
                                                </label>
                                                <select
                                                    value={agentForm.agent_debit_credit_type}
                                                    onChange={(e) => setAgentForm({ ...agentForm, agent_debit_credit_type: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                                >
                                                    <option value="debit">Debit Note (Agent Owes Us)</option>
                                                    <option value="credit">Credit Note (We Owe Agent)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                                                    Settlement Status
                                                </label>
                                                <select
                                                    value={agentForm.agent_settlement_status}
                                                    onChange={(e) => setAgentForm({ ...agentForm, agent_settlement_status: e.target.value })}
                                                    className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                                >
                                                    <option value="pending">Pending Settlement</option>
                                                    <option value="invoiced">Invoiced / Billed</option>
                                                    <option value="settled">Settled / Closed</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1">
                                            <input
                                                type="checkbox"
                                                id="gen_inv"
                                                checked={agentForm.generate_invoice}
                                                onChange={(e) => setAgentForm({ ...agentForm, generate_invoice: e.target.checked })}
                                                className="rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <label htmlFor="gen_inv" className="text-xs text-neutral-600 dark:text-neutral-300 cursor-pointer">
                                                Automatically generate Debit/Credit Note entry in the shipment invoices ledger
                                            </label>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingAgent(false)}
                                                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                                            >
                                                {t('cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500"
                                            >
                                                Save Settlement Terms
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Partner Agent</span>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block truncate">
                                                {overseasAgent?.name || shipment.overseas_agent?.name || 'Not Assigned'}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Split Model</span>
                                            <span className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5 block capitalize">
                                                {shipment.agent_share_type === 'fifty_fifty' ? '50 / 50 Standard' : (shipment.agent_share_type || '50 / 50')}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/60">
                                            <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-semibold block">
                                                {shipment.agent_debit_credit_type === 'credit' ? 'Credit Note (Payable)' : 'Debit Note (Receivable)'}
                                            </span>
                                            <span className="font-bold font-mono text-purple-900 dark:text-purple-200 mt-0.5 block">
                                                ${Number(shipment.agent_profit_share_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>

                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Settlement Status</span>
                                            <span className={`text-[10px] font-bold uppercase mt-1 inline-block px-2 py-0.5 rounded-full ${
                                                shipment.agent_settlement_status === 'settled'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                    : shipment.agent_settlement_status === 'invoiced'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                            }`}>
                                                {shipment.agent_settlement_status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Invoices Header & Add button */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    {t('invoices_and_bills')} ({invoices.length})
                                </h3>
                                {!isFinancialLocked ? (
                                    <button
                                        onClick={() => setIsAddingInvoice(!isAddingInvoice)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>{t('new_invoice_or_bill') || 'Add Charge / Bill'}</span>
                                    </button>
                                ) : (
                                    <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-medium">
                                        <Lock className="w-3 h-3 text-emerald-500" />
                                        <span>Locked for audit</span>
                                    </span>
                                )}
                            </div>

                            {/* Add Invoice Form */}
                            {isAddingInvoice && !isFinancialLocked && (
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
                                    const isDebitNote = inv.type === 'debit_note';
                                    const isCreditNote = inv.type === 'credit_note';
                                    const isPaid = inv.status === 'paid';

                                    return (
                                        <div key={inv.id} className="p-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#1a1a1a] shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                        isDebitNote 
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60' 
                                                            : isCreditNote 
                                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60' 
                                                            : isReceivable 
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' 
                                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                    }`}>
                                                        {isDebitNote 
                                                            ? 'Agent Debit Note' 
                                                            : isCreditNote 
                                                            ? 'Agent Credit Note' 
                                                            : isReceivable 
                                                            ? (t('receivable') || 'Customer Invoice') 
                                                            : (t('payable') || 'Vendor Bill')}
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
                                                    {!isFinancialLocked ? (
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
                                                    ) : (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                                            isPaid 
                                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                                                                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                                        }`}>
                                                            {inv.status}
                                                        </span>
                                                    )}
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

                    {/* TAB: DEMURRAGE & DETENTION FREE TIME */}
                    {activeTab === 'demurrage' && (
                        <div className="space-y-6">
                            {/* Terms Card */}
                            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xs space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <Hourglass className="w-4 h-4 text-amber-500" />
                                        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            Carrier Free Time & Daily Penalties
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingFreeTime(!isEditingFreeTime)}
                                        className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                    >
                                        {isEditingFreeTime ? 'Cancel' : 'Edit Terms'}
                                    </button>
                                </div>

                                {isEditingFreeTime ? (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            router.patch(`/shipments/${shipment.id}/freetime`, freeTimeForm, {
                                                preserveScroll: true,
                                                onSuccess: () => setIsEditingFreeTime(false),
                                            });
                                        }}
                                        className="grid grid-cols-2 gap-3 pt-1 text-xs"
                                    >
                                        <div>
                                            <label className="block text-neutral-500 text-[10px] font-semibold uppercase mb-1">
                                                Demurrage Free Days (Port)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={freeTimeForm.demurrage_free_days}
                                                onChange={(e) => setFreeTimeForm({ ...freeTimeForm, demurrage_free_days: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-neutral-500 text-[10px] font-semibold uppercase mb-1">
                                                Detention Free Days (Equipment)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={freeTimeForm.detention_free_days}
                                                onChange={(e) => setFreeTimeForm({ ...freeTimeForm, detention_free_days: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-neutral-500 text-[10px] font-semibold uppercase mb-1">
                                                Daily Demurrage Rate ($)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={freeTimeForm.demurrage_daily_rate}
                                                onChange={(e) => setFreeTimeForm({ ...freeTimeForm, demurrage_daily_rate: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-neutral-500 text-[10px] font-semibold uppercase mb-1">
                                                Daily Detention Rate ($)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={freeTimeForm.detention_daily_rate}
                                                onChange={(e) => setFreeTimeForm({ ...freeTimeForm, detention_daily_rate: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                            />
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2 pt-1">
                                            <button
                                                type="submit"
                                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                                            >
                                                Save Terms
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Demurrage Free</span>
                                            <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{shipment.demurrage_free_days ?? 14} Days</span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Detention Free</span>
                                            <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{shipment.detention_free_days ?? 7} Days</span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Port Penalty Rate</span>
                                            <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">${shipment.demurrage_daily_rate ?? 50}/day</span>
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Truck Penalty Rate</span>
                                            <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">${shipment.detention_daily_rate ?? 75}/day</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Container Demurrage Status Breakdown */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    Container Risk Monitor ({containers.length} containers)
                                </h4>

                                {containers.map((c) => {
                                    const isDemOverdue = c.demurrage_status === 'overdue' || c.demurrage_days_incurred > 0;
                                    const isDemWarning = c.demurrage_status === 'warning';
                                    const isDetOverdue = c.detention_status === 'overdue' || c.detention_days_incurred > 0;

                                    return (
                                        <div key={c.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-2xs space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100">
                                                        {c.container_number}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                                                        {c.type}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedTrackingContainer(c);
                                                        setTrackingForm({
                                                            discharged_at: c.discharged_at || '',
                                                            gate_out_at: c.gate_out_at || '',
                                                            empty_returned_at: c.empty_returned_at || '',
                                                        });
                                                    }}
                                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                                >
                                                    Update Dates
                                                </button>
                                            </div>

                                            {/* Key Milestones Dates */}
                                            <div className="grid grid-cols-3 gap-2 text-xs bg-neutral-50/80 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80">
                                                <div>
                                                    <span className="text-[10px] text-neutral-400 block uppercase">Discharged at Port</span>
                                                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{c.discharged_at || 'Pending arrival'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-neutral-400 block uppercase">Gated Out (Loaded)</span>
                                                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{c.gate_out_at || 'Inside port'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-neutral-400 block uppercase">Empty Returned</span>
                                                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{c.empty_returned_at || 'With consignee'}</span>
                                                </div>
                                            </div>

                                            {/* Demurrage & Detention Status Badges */}
                                            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                                                <div className={`p-2.5 rounded-lg border ${
                                                    isDemOverdue 
                                                        ? 'bg-red-50/70 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900' 
                                                        : isDemWarning 
                                                        ? 'bg-amber-50/70 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                                                        : 'bg-emerald-50/50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/60'
                                                }`}>
                                                    <div className="font-bold text-[11px] flex items-center justify-between">
                                                        <span>Port Demurrage</span>
                                                        {isDemOverdue && <span className="font-mono font-bold">${c.demurrage_amount || 0}</span>}
                                                    </div>
                                                    <div className="text-[10px] mt-0.5">
                                                        {isDemOverdue 
                                                            ? `Overdue by ${c.demurrage_days_incurred} days!`
                                                            : c.discharged_at 
                                                            ? `${c.demurrage_days_remaining} free days left` 
                                                            : 'Awaiting vessel discharge'}
                                                    </div>
                                                </div>

                                                <div className={`p-2.5 rounded-lg border ${
                                                    isDetOverdue 
                                                        ? 'bg-red-50/70 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900' 
                                                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800'
                                                }`}>
                                                    <div className="font-bold text-[11px] flex items-center justify-between">
                                                        <span>Equipment Detention</span>
                                                        {isDetOverdue && <span className="font-mono font-bold">${c.detention_amount || 0}</span>}
                                                    </div>
                                                    <div className="text-[10px] mt-0.5">
                                                        {isDetOverdue 
                                                            ? `Overdue by ${c.detention_days_incurred} days!`
                                                            : c.gate_out_at 
                                                            ? `${c.detention_days_remaining} free days left` 
                                                            : 'Awaiting terminal gate-out'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {containers.length === 0 && (
                                    <div className="py-8 text-center text-xs text-neutral-400">
                                        No containers added to calculate free time.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: INLAND TRUCKING & DRAYAGE DISPATCH */}
                    {activeTab === 'trucking' && (
                        <div className="space-y-6">
                            {/* Trucking Header Card */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-amber-500" />
                                        <span>{t('truck_dispatches') || 'Inland Drayage & Dispatch Orders'}</span>
                                    </h3>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">
                                        Assign container trips to trucking companies, drivers, and record EIR empty return slips.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsAddingDispatch(!isAddingDispatch)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 shadow-2xs cursor-pointer transition-opacity"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{t('new_dispatch') || 'Dispatch Trip'}</span>
                                </button>
                            </div>

                            {/* Add Dispatch Form Drawer / Modal */}
                            {isAddingDispatch && (
                                <form onSubmit={handleCreateDispatch} className="p-4 rounded-xl bg-neutral-50 dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 space-y-3 animate-fade-in-scale text-xs">
                                    <div className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-blue-500" />
                                        <span>Create New Inland Truck Dispatch Trip</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Select Container
                                            </label>
                                            <select
                                                value={newDispatch.shipment_container_id}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, shipment_container_id: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-mono"
                                            >
                                                <option value="">Select container for this trip...</option>
                                                {containers.map(c => (
                                                    <option key={c.id} value={c.id}>{c.container_number} ({c.type})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Hauler / Trucking Company
                                            </label>
                                            <select
                                                value={newDispatch.trucking_company_id}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, trucking_company_id: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                            >
                                                <option value="">Select trucking company...</option>
                                                {truckers.map(trk => (
                                                    <option key={trk.id} value={trk.id}>{trk.name}</option>
                                                ))}
                                                {carriers.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Driver Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Ibrahim Hassan"
                                                value={newDispatch.driver_name}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, driver_name: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Driver Phone
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="+20 10 000 0000"
                                                value={newDispatch.driver_phone}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, driver_phone: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Driver National ID
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="2880415..."
                                                value={newDispatch.driver_national_id}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, driver_national_id: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Truck Plate # *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. ط ر أ 4519"
                                                value={newDispatch.truck_plate}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, truck_plate: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Trailer / Semi-Trailer Plate
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. س ق د 8812"
                                                value={newDispatch.trailer_plate}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, trailer_plate: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Loading Origin Yard
                                            </label>
                                            <input
                                                type="text"
                                                value={newDispatch.origin_address}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, origin_address: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Delivery / Consignee Address
                                            </label>
                                            <input
                                                type="text"
                                                value={newDispatch.delivery_address}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, delivery_address: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Empty Return Depot / Yard
                                            </label>
                                            <input
                                                type="text"
                                                value={newDispatch.empty_return_depot}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, empty_return_depot: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Driver Drayage Cost ($ / EGP)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newDispatch.driver_cost}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, driver_cost: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                                                Client Trucking Charge ($ / EGP)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={newDispatch.client_charge}
                                                onChange={(e) => setNewDispatch({ ...newDispatch, client_charge: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingDispatch(false)}
                                            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                                        >
                                            {t('cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                                        >
                                            Dispatch Truck Trip
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Dispatches List */}
                            <div className="space-y-3">
                                {dispatches.map((trip) => (
                                    <div key={trip.id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-2xs space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100">
                                                    {trip.dispatch_number}
                                                </span>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                    trip.status === 'completed' || trip.status === 'empty_returned'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                        : trip.status === 'in_transit'
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                }`}>
                                                    {trip.status?.replace('_', ' ')}
                                                </span>
                                                {trip.container && (
                                                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                                        {trip.container.container_number}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/dispatches/${trip.id}/slip`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                    <span>{t('print_dispatch_slip') || 'Print Slip'}</span>
                                                </a>

                                                <button
                                                    onClick={() => handleDeleteDispatch(trip.id)}
                                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                    title={t('delete')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                                                <span className="text-[10px] text-neutral-400 block uppercase">Driver</span>
                                                <span className="font-bold text-neutral-900 dark:text-neutral-100 block mt-0.5">
                                                    {trip.driver_name}
                                                </span>
                                                <span className="font-mono text-[10px] text-neutral-500">{trip.driver_phone || 'No phone'}</span>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                                                <span className="text-[10px] text-neutral-400 block uppercase">Truck & Trailer</span>
                                                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 block mt-0.5">
                                                    {trip.truck_plate}
                                                </span>
                                                {trip.trailer_plate && <span className="font-mono text-[10px] text-neutral-500">Trl: {trip.trailer_plate}</span>}
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                                                <span className="text-[10px] text-neutral-400 block uppercase">Trip Financials</span>
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                                                    +${parseFloat(trip.client_charge || 0).toLocaleString()} (Rev)
                                                </span>
                                                <span className="font-mono text-[10px] text-neutral-500">Cost: ${parseFloat(trip.driver_cost || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800">
                                                <span className="text-[10px] text-neutral-400 block uppercase">EIR Return Receipt</span>
                                                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 block mt-0.5">
                                                    {trip.empty_return_receipt || 'Awaiting Return'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Advance Action Buttons */}
                                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                                            <span className="text-[11px] text-neutral-400">Advance Trip Status:</span>
                                            <div className="flex items-center gap-1.5">
                                                {trip.status === 'assigned' && (
                                                    <button
                                                        onClick={() => handleUpdateDispatchStatus(trip.id, 'loading_port')}
                                                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold"
                                                    >
                                                        Mark Loading in Port
                                                    </button>
                                                )}
                                                {(trip.status === 'assigned' || trip.status === 'loading_port') && (
                                                    <button
                                                        onClick={() => handleUpdateDispatchStatus(trip.id, 'in_transit')}
                                                        className="px-2.5 py-1 rounded bg-blue-600 text-white hover:bg-blue-500 text-[11px] font-semibold"
                                                    >
                                                        Gated Out / In Transit
                                                    </button>
                                                )}
                                                {trip.status === 'in_transit' && (
                                                    <button
                                                        onClick={() => handleUpdateDispatchStatus(trip.id, 'unloaded')}
                                                        className="px-2.5 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 text-[11px] font-semibold"
                                                    >
                                                        Offloaded at Customer
                                                    </button>
                                                )}
                                                {(trip.status === 'unloaded' || trip.status === 'at_destination') && (
                                                    <button
                                                        onClick={() => {
                                                            const eir = prompt('Enter Empty Container Return (EIR) Receipt Number:', trip.empty_return_receipt || 'EIR-');
                                                            if (eir) {
                                                                handleUpdateDispatchStatus(trip.id, 'empty_returned', eir);
                                                            }
                                                        }}
                                                        className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 text-[11px] font-bold"
                                                    >
                                                        Record Empty Return (EIR)
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {dispatches.length === 0 && (
                                    <div className="py-8 text-center text-xs text-neutral-400">
                                        No truck dispatch trips assigned yet. Click "Dispatch Trip" to assign containers to drivers.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB: E-DOCS & COMPLIANCE CHECKLIST */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            {/* Checklist Compliance Card */}
                            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            Customs & Shipping Compliance Checklist
                                        </h3>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                        {shipment.documents_checklist?.uploaded_count || 0} / {shipment.documents_checklist?.total_required || 5} Required
                                    </span>
                                </div>

                                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${shipment.documents_checklist?.percent_complete || 0}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                                    {[
                                        { key: 'commercial_invoice', label: 'Commercial Invoice' },
                                        { key: 'packing_list', label: 'Packing List' },
                                        { key: 'bill_of_lading', label: 'Bill of Lading / HBL' },
                                        { key: 'certificate_of_origin', label: 'Certificate of Origin' },
                                        { key: 'delivery_order', label: 'Delivery Order (D/O)' },
                                    ].map((item) => {
                                        const doc = shipment.documents?.find(d => d.document_type === item.key);
                                        const isDone = !!doc;
                                        const isVerified = doc && doc.status === 'verified';

                                        return (
                                            <div 
                                                key={item.key} 
                                                className={`p-2 rounded-lg border flex items-center justify-between text-xs ${
                                                    isVerified 
                                                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200' 
                                                        : isDone 
                                                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80 text-blue-900 dark:text-blue-200'
                                                        : 'bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200/80 dark:border-neutral-800 text-neutral-500'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isVerified ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                    ) : isDone ? (
                                                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <Circle className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
                                                    )}
                                                    <span className="font-medium text-[11px]">{item.label}</span>
                                                </div>

                                                <span className="text-[10px] uppercase font-bold tracking-tight">
                                                    {isVerified ? 'Verified' : isDone ? 'Uploaded' : 'Missing'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Add Document Section */}
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    Uploaded Documents ({shipment.documents?.length || 0})
                                </h4>

                                <button
                                    onClick={() => setIsAddingDoc(!isAddingDoc)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-2xs cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Upload Document</span>
                                </button>
                            </div>

                            {isAddingDoc && (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData();
                                        formData.append('document_type', newDoc.document_type);
                                        formData.append('title', newDoc.title);
                                        formData.append('document_number', newDoc.document_number);
                                        formData.append('notes', newDoc.notes);
                                        if (newDoc.file) {
                                            formData.append('file', newDoc.file);
                                        }

                                        router.post(`/shipments/${shipment.id}/documents`, formData, {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                setIsAddingDoc(false);
                                                setNewDoc({
                                                    document_type: 'commercial_invoice',
                                                    title: '',
                                                    document_number: '',
                                                    notes: '',
                                                    file: null,
                                                });
                                            },
                                        });
                                    }}
                                    className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-3 text-xs"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                                                Document Type *
                                            </label>
                                            <select
                                                required
                                                value={newDoc.document_type}
                                                onChange={(e) => setNewDoc({ ...newDoc, document_type: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                            >
                                                <option value="commercial_invoice">Commercial Invoice</option>
                                                <option value="packing_list">Packing List</option>
                                                <option value="bill_of_lading">Bill of Lading / B/L</option>
                                                <option value="certificate_of_origin">Certificate of Origin</option>
                                                <option value="delivery_order">Delivery Order (D/O)</option>
                                                <option value="customs_declaration">Customs Declaration (Bayan/ACID)</option>
                                                <option value="insurance">Cargo Insurance</option>
                                                <option value="other">Other Supporting Document</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                                                Document Title / Reference # *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. CI-2026-8809 or Packing List"
                                                value={newDoc.title}
                                                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                                                className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-semibold uppercase text-neutral-500 mb-1">
                                            Attach File (PDF, Image, Word)
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files[0] })}
                                            className="w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingDoc(false)}
                                            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                                        >
                                            Save Document
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Documents List */}
                            <div className="space-y-2.5">
                                {shipment.documents?.map((doc) => (
                                    <div key={doc.id} className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-2xs flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div className="truncate">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                                                        {doc.title}
                                                    </span>
                                                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                        doc.status === 'verified' 
                                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200' 
                                                            : doc.status === 'rejected'
                                                            ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200'
                                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                                                    }`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-neutral-400 capitalize mt-0.5">
                                                    {doc.document_type?.replace(/_/g, ' ')} • {doc.file_name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {doc.status !== 'verified' && (
                                                <button
                                                    onClick={() => router.patch(`/documents/${doc.id}/verify`, { status: 'verified' }, { preserveScroll: true })}
                                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                                                    title="Approve / Verify"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => router.delete(`/documents/${doc.id}`, { preserveScroll: true })}
                                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {(!shipment.documents || shipment.documents.length === 0) && (
                                    <div className="py-8 text-center text-xs text-neutral-400">
                                        No documents attached yet. Click "Upload Document" to add invoices, packing lists or BLs.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Tracking Dates Edit Modal */}
                {selectedTrackingContainer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                                <div>
                                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                        Update Tracking Dates
                                    </h3>
                                    <p className="text-[11px] font-mono text-neutral-400">
                                        {selectedTrackingContainer.container_number} ({selectedTrackingContainer.type})
                                    </p>
                                </div>
                                <button onClick={() => setSelectedTrackingContainer(null)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    router.patch(`/containers/${selectedTrackingContainer.id}/tracking`, trackingForm, {
                                        preserveScroll: true,
                                        onSuccess: () => setSelectedTrackingContainer(null),
                                    });
                                }}
                                className="space-y-3 text-xs"
                            >
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
                                        Discharged at Port Date
                                    </label>
                                    <input
                                        type="date"
                                        value={trackingForm.discharged_at}
                                        onChange={(e) => setTrackingForm({ ...trackingForm, discharged_at: e.target.value })}
                                        className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
                                        Terminal Gate-Out Date
                                    </label>
                                    <input
                                        type="date"
                                        value={trackingForm.gate_out_at}
                                        onChange={(e) => setTrackingForm({ ...trackingForm, gate_out_at: e.target.value })}
                                        className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 font-semibold mb-1">
                                        Empty Container Returned to Depot
                                    </label>
                                    <input
                                        type="date"
                                        value={trackingForm.empty_returned_at}
                                        onChange={(e) => setTrackingForm({ ...trackingForm, empty_returned_at: e.target.value })}
                                        className="w-full p-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedTrackingContainer(null)}
                                        className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
                                    >
                                        Recalculate & Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
