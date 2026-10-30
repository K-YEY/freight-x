import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import EditableCell from '../../Components/EditableCell';
import FilterBar from '../../Components/FilterBar';
import BulkActionBar from '../../Components/BulkActionBar';
import RecordDrawer from '../../Components/RecordDrawer';
import CreateCompanyModal from '../../Components/Modals/CreateCompanyModal';
import { useTranslation } from '../../Context/LanguageContext';
import { 
    Plus, Building2, Globe, Users, DollarSign, 
    Trash2, ExternalLink, Ship, Truck, ShieldCheck, 
    Plane, Phone, Mail, Hash, MapPin
} from 'lucide-react';

export default function CompaniesIndex({ companies = [], industries = [], partnerTypeCounts = {}, filters = {} }) {
    const { t, isRTL } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [activePartnerType, setActivePartnerType] = useState(filters.partner_type || '');
    const [activeFilters, setActiveFilters] = useState({
        industry: filters.industry || '',
        partner_type: filters.partner_type || '',
    });
    const [density, setDensity] = useState('normal');
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const handleSelectTypeTab = (partnerTypeKey) => {
        setActivePartnerType(partnerTypeKey);
        const nextFilters = { ...activeFilters, partner_type: partnerTypeKey };
        setActiveFilters(nextFilters);
        router.get('/companies', { 
            search, 
            partner_type: partnerTypeKey || undefined,
            industry: activeFilters.industry || undefined 
        }, { preserveState: true, replace: true });
    };

    const handleFilterChange = (key, value) => {
        const nextFilters = { ...activeFilters, [key]: value };
        setActiveFilters(nextFilters);
        if (key === 'partner_type') setActivePartnerType(value);
        router.get('/companies', { 
            search, 
            partner_type: nextFilters.partner_type || undefined,
            industry: nextFilters.industry || undefined 
        }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setActiveFilters({ industry: '', partner_type: '' });
        setActivePartnerType('');
        router.get('/companies', { search }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        router.get('/companies', { 
            search: val, 
            partner_type: activePartnerType || undefined,
            industry: activeFilters.industry || undefined 
        }, { preserveState: true, replace: true });
    };

    // Inline edit handler
    const handleSaveCell = (companyId, field, newValue) => {
        return new Promise((resolve, reject) => {
            router.patch(`/companies/${companyId}`, { [field]: newValue }, {
                preserveScroll: true,
                onSuccess: () => resolve(),
                onError: (errors) => reject(errors),
            });
        });
    };

    // Selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(companies.map((c) => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleSelect = (e, id) => {
        e.stopPropagation();
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} من الشركاء / الخطوط؟`)) return;

        selectedIds.forEach((id) => {
            router.delete(`/companies/${id}`, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    // Export to CSV
    const handleExportCsv = () => {
        const headers = ['Partner Name', 'SCAC / Code', 'Partner Category', 'Contact Person', 'Phone', 'Email', 'Tax / Reg Number', 'City', 'Country'];
        const rows = companies.map((c) => [
            c.name,
            c.code || '',
            c.partner_type || 'shipping_line',
            c.contact_person || '',
            c.phone || '',
            c.email || '',
            c.tax_number || '',
            c.city || '',
            c.country || '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + 
            [headers.join(','), ...rows.map((e) => e.map(item => `"${item}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `freight_partners_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getPartnerBadge = (partnerType) => {
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

    const filterOptions = [
        {
            key: 'partner_type',
            label: t('partner_category') || 'Partner Category',
            options: [
                { value: 'shipping_line', label: 'الخطوط الملاحية (Shipping Lines)' },
                { value: 'trucker', label: 'شركات النقل البري (Truckers)' },
                { value: 'customs_broker', label: 'المخلصين الجمركيين (Brokers)' },
                { value: 'overseas_agent', label: 'الوكلاء الدوليين (Overseas Agents)' },
                { value: 'warehouse_operator', label: 'المستودعات والمحطات (CFS / Yards)' },
                { value: 'airline', label: 'شركات الشحن الجوي (Airlines)' },
            ],
        },
        {
            key: 'industry',
            label: t('industry'),
            options: industries.map((ind) => ({ value: ind, label: ind })),
        },
    ];

    const cellPadding = density === 'compact' ? 'py-1.5 px-3' : 'py-2.5 px-4';

    return (
        <AppLayout title={t('companies') || 'الشركاء والخطوط الملاحية'}>
            <Head title={`${t('companies') || 'الشركاء والخطوط الملاحية'} - Freight CRM`} />

            <div className="flex flex-col h-full">
                
                {/* Partner Segment Tabs Header */}
                <div className="px-6 pt-3 bg-neutral-50/70 dark:bg-[#161616]/70 border-b border-neutral-200/70 dark:border-neutral-800/80 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
                    <div className="flex items-center gap-2 pb-2">
                        {[
                            { key: '', label: 'كافة الشركاء (All)', icon: Building2, count: partnerTypeCounts?.all || companies.length },
                            { key: 'shipping_line', label: 'الخطوط الملاحية (Shipping Lines)', icon: Ship, count: partnerTypeCounts?.shipping_line || 0 },
                            { key: 'trucker', label: 'شركات النقل البري (Truckers)', icon: Truck, count: partnerTypeCounts?.trucker || 0 },
                            { key: 'customs_broker', label: 'المخلصين الجمركيين (Brokers)', icon: ShieldCheck, count: partnerTypeCounts?.customs_broker || 0 },
                            { key: 'overseas_agent', label: 'الوكلاء الدوليين (Agents)', icon: Globe, count: partnerTypeCounts?.overseas_agent || 0 },
                            { key: 'warehouse_operator', label: 'المستودعات والموانئ الجافة (CFS)', icon: Building2, count: partnerTypeCounts?.warehouse_operator || 0 },
                            { key: 'airline', label: 'الشحن الجوي (Airlines)', icon: Plane, count: partnerTypeCounts?.airline || 0 },
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleSelectTypeTab(tab.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                        activePartnerType === tab.key
                                            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                                            : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 border border-neutral-200/70 dark:border-neutral-800'
                                    }`}
                                >
                                    <TabIcon className="w-3.5 h-3.5 opacity-70" />
                                    <span>{tab.label}</span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                        activePartnerType === tab.key
                                            ? 'bg-neutral-800 text-neutral-300 dark:bg-neutral-200 dark:text-neutral-800'
                                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('new_company') || 'إضافة خط ملاحي / شريك'}</span>
                    </button>
                </div>

                {/* Advanced FilterBar */}
                <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-white/[0.08] glass-header pe-6 sticky top-0 z-20">
                    <div className="flex-1">
                        <FilterBar
                            search={search}
                            onSearchChange={handleSearchChange}
                            filterOptions={filterOptions}
                            activeFilters={activeFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            totalCount={companies.length}
                            unit={t('companies') || 'شريك'}
                            density={density}
                            onToggleDensity={setDensity}
                            onExportCsv={handleExportCsv}
                        />
                    </div>
                </div>

                {/* Spreadsheet Table */}
                <div className="flex-1 overflow-auto bg-white dark:bg-[#111111]">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200/80 dark:border-white/[0.08] glass-table-header text-[11px] font-semibold text-neutral-500 uppercase tracking-wider sticky top-0 z-10 select-none">
                                <th className="py-2 px-3 w-10 text-center border-e border-neutral-200/50 dark:border-neutral-800/50">
                                    <input
                                        type="checkbox"
                                        checked={companies.length > 0 && selectedIds.length === companies.length}
                                        onChange={handleSelectAll}
                                        className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start min-w-[200px]">
                                    الخط الملاحي / الشريك (Partner)
                                </th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start min-w-[150px]">
                                    تصنيف النشاط (Category)
                                </th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start min-w-[140px]">
                                    مسؤول الاتصال (Contact)
                                </th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start min-w-[160px]">
                                    الهاتف والبريد (Phone & Email)
                                </th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start min-w-[130px]">
                                    السجل / الضريبي (Tax ID)
                                </th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start min-w-[120px]">
                                    المقر / الميناء (Location)
                                </th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">
                                    الموقع (Website)
                                </th>
                                <th className="py-2 px-2 w-8 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-xs text-neutral-800 dark:text-neutral-200">
                            {companies.map((company) => {
                                const isSelected = selectedIds.includes(company.id);
                                return (
                                    <tr
                                        key={company.id}
                                        onClick={() => {
                                            setSelectedCompany(company);
                                            setDrawerOpen(true);
                                        }}
                                        className={`transition-colors cursor-pointer group ${
                                            isSelected 
                                                ? 'bg-blue-50/60 dark:bg-[#14233a]' 
                                                : 'hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]'
                                        }`}
                                    >
                                        <td 
                                            className={`${cellPadding} text-center border-e border-neutral-100 dark:border-neutral-800/50`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => handleToggleSelect(e, company.id)}
                                                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                                            />
                                        </td>

                                        {/* Company Name & SCAC Code */}
                                        <td className={`${cellPadding} font-medium border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center text-[11px] font-bold shrink-0">
                                                    {company.name?.[0] || 'P'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <EditableCell
                                                            value={company.name}
                                                            onSave={(val) => handleSaveCell(company.id, 'name', val)}
                                                            className="font-bold text-neutral-900 dark:text-neutral-100"
                                                        />
                                                        {company.code && (
                                                            <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 border border-blue-200 dark:border-blue-900">
                                                                {company.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Partner Type Badge */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            {getPartnerBadge(company.partner_type)}
                                        </td>

                                        {/* Contact Person */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={company.contact_person}
                                                onSave={(val) => handleSaveCell(company.id, 'contact_person', val)}
                                                placeholder="مسؤول الاتصال..."
                                            />
                                        </td>

                                        {/* Phone & Email */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <div className="space-y-0.5">
                                                {company.phone ? (
                                                    <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 text-[11px] font-mono">
                                                        <Phone className="w-3 h-3 text-neutral-400" />
                                                        <EditableCell
                                                            value={company.phone}
                                                            onSave={(val) => handleSaveCell(company.id, 'phone', val)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-neutral-400 text-[11px] italic">
                                                        <EditableCell
                                                            value={company.phone}
                                                            onSave={(val) => handleSaveCell(company.id, 'phone', val)}
                                                            placeholder="الهاتف..."
                                                        />
                                                    </div>
                                                )}

                                                {company.email && (
                                                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
                                                        <Mail className="w-3 h-3 text-neutral-400" />
                                                        <EditableCell
                                                            value={company.email}
                                                            onSave={(val) => handleSaveCell(company.id, 'email', val)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Tax / Commercial Reg Number */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50 font-mono text-[11px]`}>
                                            <EditableCell
                                                value={company.tax_number}
                                                onSave={(val) => handleSaveCell(company.id, 'tax_number', val)}
                                                placeholder="السجل / الرقم الضريبي..."
                                            />
                                        </td>

                                        {/* Location */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50 text-neutral-600 dark:text-neutral-400`}>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                                                <span>{[company.city, company.country].filter(Boolean).join(', ') || '—'}</span>
                                            </div>
                                        </td>

                                        {/* Website / Domain */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            {company.domain || company.website_url ? (
                                                <a 
                                                    href={company.website_url || `https://${company.domain}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                                                >
                                                    <span>{company.domain || 'موقع الويب'}</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <EditableCell
                                                    value={company.domain}
                                                    onSave={(val) => handleSaveCell(company.id, 'domain', val)}
                                                    placeholder="النطاق / الموقع..."
                                                />
                                            )}
                                        </td>

                                        {/* Delete */}
                                        <td className="py-2 px-2 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(t('delete_confirm') || 'هل أنت متأكد من الحذف؟')) router.delete(`/companies/${company.id}`);
                                                }}
                                                className="p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {companies.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-xs text-neutral-400">
                                        لا توجد خطوط ملاحية أو شركاء مطابقين للبحث
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Floating Bulk Actions Bar */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onBulkDelete={handleBulkDelete}
            />

            {/* Side-Peek Record Drawer */}
            <RecordDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                type="company"
                record={selectedCompany}
            />

            {/* Dedicated Company / Carrier Creation Modal */}
            <CreateCompanyModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />
        </AppLayout>
    );
}
