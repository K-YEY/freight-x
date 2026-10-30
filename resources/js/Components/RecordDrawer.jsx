import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    X, User, Building2, Briefcase, Mail, Phone, MapPin, 
    Calendar, DollarSign, Clock, Plus, CheckCircle2, Circle, 
    FileText, Activity, Trash2, ExternalLink, Ship, Truck,
    ShieldCheck, Plane, CreditCard, Receipt, FileSpreadsheet,
    Building, Hash, Shield, Globe
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useTranslation } from '../Context/LanguageContext';

export default function RecordDrawer({ isOpen, onClose, type, record, onEdit }) {
    const { t, isRTL } = useTranslation();
    if (!isOpen || !record) return null;

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'activities' | 'notes' | 'tasks'
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [submittingNote, setSubmittingNote] = useState(false);
    const [submittingTask, setSubmittingTask] = useState(false);

    const handleAddNote = (e) => {
        e.preventDefault();
        if (!newNoteContent.trim()) return;

        setSubmittingNote(true);
        router.post('/notes', {
            content: newNoteContent,
            contact_id: type === 'contact' ? record.id : null,
            company_id: type === 'company' ? record.id : null,
            opportunity_id: type === 'opportunity' ? record.id : null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewNoteContent('');
                setSubmittingNote(false);
            },
            onError: () => setSubmittingNote(false),
        });
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        setSubmittingTask(true);
        router.post('/tasks', {
            title: newTaskTitle,
            status: 'todo',
            priority: 'medium',
            contact_id: type === 'contact' ? record.id : null,
            company_id: type === 'company' ? record.id : null,
            opportunity_id: type === 'opportunity' ? record.id : null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewTaskTitle('');
                setSubmittingTask(false);
            },
            onError: () => setSubmittingTask(false),
        });
    };

    const handleToggleTask = (taskId) => {
        router.patch(`/tasks/${taskId}/toggle`, {}, { preserveScroll: true });
    };

    const handleDeleteRecord = () => {
        if (!confirm(t('delete_confirm'))) return;

        if (type === 'contact') router.delete(`/contacts/${record.id}`, { onSuccess: () => onClose() });
        if (type === 'company') router.delete(`/companies/${record.id}`, { onSuccess: () => onClose() });
        if (type === 'opportunity') router.delete(`/opportunities/${record.id}`, { onSuccess: () => onClose() });
    };

    const getTitle = () => {
        if (type === 'contact') {
            if (record.company_name) return `${record.company_name} (${record.name || `${record.first_name} ${record.last_name}`})`;
            return record.name || `${record.first_name} ${record.last_name}`;
        }
        if (type === 'company') {
            if (record.code) return `${record.name} [${record.code}]`;
            return record.name;
        }
        if (type === 'opportunity') return record.name;
        return t('details');
    };

    const getIcon = () => {
        if (type === 'contact') return <User className="w-5 h-5 text-blue-500" />;
        if (type === 'company') {
            if (record.partner_type === 'shipping_line') return <Ship className="w-5 h-5 text-blue-500" />;
            if (record.partner_type === 'trucker') return <Truck className="w-5 h-5 text-amber-500" />;
            if (record.partner_type === 'customs_broker') return <ShieldCheck className="w-5 h-5 text-purple-500" />;
            if (record.partner_type === 'airline') return <Plane className="w-5 h-5 text-sky-500" />;
            return <Building2 className="w-5 h-5 text-neutral-500" />;
        }
        if (type === 'opportunity') return <Briefcase className="w-5 h-5 text-neutral-500" />;
        return null;
    };

    const getCustomerTypeBadge = (role) => {
        switch (role) {
            case 'importer':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60">مستورد (Importer)</span>;
            case 'exporter':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">مُصدّر (Exporter)</span>;
            case 'trader':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60">تاجر / وسيط (Trader)</span>;
            case 'broker_client':
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60">عميل تخليص (Clearance)</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">أفراد (Personal)</span>;
        }
    };

    const getPartnerTypeBadge = (partnerType) => {
        switch (partnerType) {
            case 'shipping_line':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60">
                        <Ship className="w-3 h-3 text-blue-500" />
                        <span>خط ملاحي (Shipping Line)</span>
                    </span>
                );
            case 'trucker':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60">
                        <Truck className="w-3 h-3 text-amber-500" />
                        <span>نقل بري (Trucker)</span>
                    </span>
                );
            case 'customs_broker':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60">
                        <ShieldCheck className="w-3 h-3 text-purple-500" />
                        <span>مخلص جمركي (Broker)</span>
                    </span>
                );
            case 'overseas_agent':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                        <Globe className="w-3 h-3 text-emerald-500" />
                        <span>وكيل دولي (Overseas Agent)</span>
                    </span>
                );
            case 'warehouse_operator':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>مستودع / محطة (CFS)</span>
                    </span>
                );
            case 'airline':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60">
                        <Plane className="w-3 h-3 text-sky-500" />
                        <span>طيران شحن (Airline)</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <Building2 className="w-3 h-3 text-neutral-400" />
                        <span>شريك لوجستي</span>
                    </span>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden glass-modal-backdrop flex justify-end">
            <div className="w-full max-w-xl glass-drawer h-full shadow-[0_0_60px_rgba(0,0,0,0.3)] dark:shadow-[0_0_80px_rgba(0,0,0,0.85)] border-s border-neutral-200/80 dark:border-neutral-800/80 flex flex-col">
                
                {/* Header with Glassmorphism */}
                <div className="px-6 py-4 border-b border-neutral-200/70 dark:border-neutral-800/80 glass-header flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            {getIcon()}
                        </div>
                        <div className="truncate">
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                {getTitle()}
                            </h2>
                            <span className="text-xs text-neutral-400 capitalize">
                                {type === 'contact' 
                                    ? (record.customer_type ? `عميل شحن • ${record.customer_type}` : 'عميل شحن')
                                    : type === 'company' 
                                        ? (record.partner_type ? `شريك لوجستي • ${record.partner_type}` : 'شريك لوجستي') 
                                        : `${t(type) || type} ${t('details')}`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(record)}
                                className="px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer"
                            >
                                {t('edit')}
                            </button>
                        )}
                        <button
                            onClick={handleDeleteRecord}
                            className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                            title={t('delete')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Tabs with Glassmorphism */}
                <div className="flex items-center px-6 border-b border-neutral-200/70 dark:border-neutral-800/80 glass-header gap-6 text-xs font-medium sticky top-[69px] z-10">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'overview'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('overview')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'activities'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        <span>{t('activities')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'notes'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{t('notes')} ({record.notes?.length || 0})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                            activeTab === 'tasks'
                                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('tasks')} ({record.tasks?.length || 0})</span>
                    </button>
                </div>

                {/* Content body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Tab 1: Overview */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Contact / Customer Fields */}
                            {type === 'contact' && (
                                <div className="space-y-5">
                                    {/* Primary Info */}
                                    <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">حالة العميل وتصنيفه</span>
                                            <div className="flex items-center gap-2">
                                                {getCustomerTypeBadge(record.customer_type)}
                                                <StatusBadge type="status" value={record.status} />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-xs text-neutral-400">الاسم التجاري / الشركة</span>
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                                                {record.company_name || record.company?.name || '—'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">الممثل / مسؤول التواصل</span>
                                            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                                {record.name || `${record.first_name || ''} ${record.last_name || ''}`.trim() || '—'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">{t('email')}</span>
                                            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                                {record.email || '—'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">{t('phone')}</span>
                                            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 font-mono flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                                {record.phone || '—'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">المدينة / الدولة</span>
                                            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                                                {[record.city, record.country].filter(Boolean).join(', ') || '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customs & Tax Identity Card */}
                                    <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                                            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span>الهوية الجمركية والضريبية (Customs & Tax ID)</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                                            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#151515] border border-blue-100 dark:border-neutral-800">
                                                <span className="text-[10px] text-neutral-400 block mb-0.5">الرقم الضريبي (Tax ID)</span>
                                                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{record.tax_id || '—'}</span>
                                            </div>

                                            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#151515] border border-blue-100 dark:border-neutral-800">
                                                <span className="text-[10px] text-neutral-400 block mb-0.5">السجل التجاري (Commercial Reg)</span>
                                                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{record.commercial_registry || '—'}</span>
                                            </div>

                                            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#151515] border border-blue-100 dark:border-neutral-800">
                                                <span className="text-[10px] text-neutral-400 block mb-0.5">البطاقة الاستيرادية / الجمركية</span>
                                                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{record.customs_card_number || '—'}</span>
                                            </div>

                                            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#151515] border border-blue-100 dark:border-neutral-800">
                                                <span className="text-[10px] text-neutral-400 block mb-0.5">رقم نافذة (Nafeza ID / ACID)</span>
                                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{record.nafeza_id || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial & Billing Terms Card */}
                                    <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            <CreditCard className="w-4 h-4 text-emerald-500" />
                                            <span>الشروط المالية والحد الائتماني (Credit Terms)</span>
                                        </div>

                                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-xs text-neutral-400">شروط السداد</span>
                                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                                {record.payment_terms === 'credit_15' && 'آجل 15 يوم (Credit 15)'}
                                                {record.payment_terms === 'credit_30' && 'آجل 30 يوم (Credit 30)'}
                                                {record.payment_terms === 'credit_60' && 'آجل 60 يوم (Credit 60)'}
                                                {(!record.payment_terms || record.payment_terms === 'cash') && 'نقدي عند الإصدار (Cash on BL)'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-xs text-neutral-400">الحد الائتماني (Credit Limit)</span>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                                ${Number(record.credit_limit || 0).toLocaleString()}
                                            </span>
                                        </div>

                                        {record.billing_address && (
                                            <div>
                                                <span className="text-[11px] text-neutral-400 block mb-1">عنوان الفوترة المعتمد</span>
                                                <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-white dark:bg-[#141414] p-2.5 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                                                    {record.billing_address}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Operational Notes */}
                                    {record.notes && (
                                        <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800">
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block mb-2">تعليمات وملاحظات الشحن للعميل</span>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                                {record.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Company / Logistics Partner Fields */}
                            {type === 'company' && (
                                <div className="space-y-5">
                                    {/* Partner Classification */}
                                    <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">تصنيف الشريك / الخط</span>
                                            {getPartnerTypeBadge(record.partner_type)}
                                        </div>

                                        {record.code && (
                                            <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                                                <span className="text-xs text-neutral-400">رمز الشريك الملاحي (SCAC / Code)</span>
                                                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-900">
                                                    {record.code}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">مسؤول الاتصال (Key Account)</span>
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                {record.contact_person || '—'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">الهاتف المباشر</span>
                                            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 font-mono flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                                {record.phone || '—'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">البريد الإلكتروني للعمليات</span>
                                            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                                {record.email || '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Official & Port Data */}
                                    <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                            <Building className="w-4 h-4 text-blue-500" />
                                            <span>البيانات الرسمية والميناء (Corporate & Port)</span>
                                        </div>

                                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-xs text-neutral-400">السجل / الملف الضريبي</span>
                                            <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                                {record.tax_number || '—'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800">
                                            <span className="text-xs text-neutral-400">{t('location')}</span>
                                            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                                {[record.address, record.city, record.country].filter(Boolean).join(', ') || '—'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-neutral-400">{t('domain')}</span>
                                            <a href={record.website_url || `https://${record.domain}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                                {record.domain || record.website_url || '—'}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>

                                    {record.description && (
                                        <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-[#1a1a1a] border border-neutral-200/80 dark:border-neutral-800">
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block mb-1">الخدمات والموانئ المغطاة (About & Services)</span>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                                {record.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Opportunity Fields */}
                            {type === 'opportunity' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('amount')}</span>
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center font-mono">
                                            ${Number(record.amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('stage')}</span>
                                        <StatusBadge type="stage" value={record.stage} />
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('close_date')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.close_date || t('set_date')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('company_name')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.company?.name || '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                                        <span className="text-xs text-neutral-400">{t('people')}</span>
                                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-neutral-400" />
                                            {record.contact?.name || '—'}
                                        </span>
                                    </div>
                                    {record.notes && (
                                        <div className="pt-2">
                                            <span className="text-xs text-neutral-400 block mb-1">{t('notes')}</span>
                                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-[#1a1a1a] p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                                {record.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Activities / Timeline */}
                    {activeTab === 'activities' && (
                        <div className="space-y-4">
                            {(!record.activities || record.activities.length === 0) ? (
                                <div className="py-8 text-center text-xs text-neutral-400">
                                    {t('no_records_match')}
                                </div>
                            ) : (
                                <div className="relative ps-6 space-y-6 before:content-[''] before:absolute before:start-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-200 dark:before:bg-neutral-800">
                                    {record.activities.map((act) => (
                                        <div key={act.id} className="relative">
                                            <div className="absolute -start-6 top-1 w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-600 ring-4 ring-white dark:ring-[#161616]"></div>
                                            <div className="flex items-baseline justify-between mb-0.5">
                                                <h4 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                                                    {act.title}
                                                </h4>
                                                <span className="text-[10px] text-neutral-400">
                                                    {new Date(act.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {act.description && (
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                    {act.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Notes */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            {/* Add Note Form */}
                            <form onSubmit={handleAddNote} className="space-y-2">
                                <textarea
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    placeholder={t('write_note_placeholder')}
                                    rows={3}
                                    className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={submittingNote || !newNoteContent.trim()}
                                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors disabled:opacity-50 cursor-pointer"
                                    >
                                        {t('add_note')}
                                    </button>
                                </div>
                            </form>

                            {/* Existing Notes */}
                            <div className="space-y-3 pt-2">
                                {record.notes && record.notes.length > 0 ? (
                                    record.notes.map((note) => (
                                        <div key={note.id} className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1.5">
                                            {note.title && (
                                                <h5 className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                                                    {note.title}
                                                </h5>
                                            )}
                                            <p className="text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                                                {note.content}
                                            </p>
                                            <span className="text-[10px] text-neutral-400 block pt-1">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-xs text-neutral-400">
                                        {t('no_records_match')}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 4: Tasks */}
                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            {/* Add Task Form */}
                            <form onSubmit={handleAddTask} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder={t('add_task_placeholder')}
                                    className="flex-1 text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                                />
                                <button
                                    type="submit"
                                    disabled={submittingTask || !newTaskTitle.trim()}
                                    className="px-3 py-2 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{t('create')}</span>
                                </button>
                            </form>

                            {/* Task List */}
                            <div className="space-y-1.5 pt-2">
                                {record.tasks && record.tasks.length > 0 ? (
                                    record.tasks.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-[#1f1f1f] group"
                                        >
                                            <button
                                                onClick={() => handleToggleTask(t.id)}
                                                className="flex items-center gap-2.5 text-start flex-1 cursor-pointer"
                                            >
                                                {t.status === 'completed' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-600 dark:group-hover:text-neutral-300" />
                                                )}
                                                <span className={`text-xs ${t.status === 'completed' ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200 font-medium'}`}>
                                                    {t.title}
                                                </span>
                                            </button>
                                            {t.due_date && (
                                                <span className="text-[11px] text-neutral-400 shrink-0">
                                                    {t.due_date}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-xs text-neutral-400">
                                        {t('no_records_match')}
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
