import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import EditableCell from '../../Components/EditableCell';
import InlineStatusBadge from '../../Components/InlineStatusBadge';
import FilterBar from '../../Components/FilterBar';
import BulkActionBar from '../../Components/BulkActionBar';
import RecordDrawer from '../../Components/RecordDrawer';
import CreatePersonModal from '../../Components/Modals/CreatePersonModal';
import { useTranslation } from '../../Context/LanguageContext';
import { 
    Plus, Building2, Trash2, ArrowUpDown, Check, ShieldCheck, 
    FileText, Phone, Mail, DollarSign, Users, Briefcase, User
} from 'lucide-react';

export default function ContactsIndex({ contacts, companies, customerTypeCounts = {}, filters }) {
    const { t, isRTL } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [activeCustomerType, setActiveCustomerType] = useState(filters.customer_type || '');
    const [activeFilters, setActiveFilters] = useState({
        status: filters.status || '',
        customer_type: filters.customer_type || '',
        company_id: '',
    });
    const [density, setDensity] = useState('normal');
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Apply filters
    const handleFilterChange = (key, value) => {
        const nextFilters = { ...activeFilters, [key]: value };
        setActiveFilters(nextFilters);
        router.get('/contacts', { 
            search, 
            status: nextFilters.status, 
            customer_type: nextFilters.customer_type,
            company_id: nextFilters.company_id 
        }, { preserveState: true, replace: true });
    };

    const handleSelectTypeTab = (type) => {
        setActiveCustomerType(type);
        const nextFilters = { ...activeFilters, customer_type: type };
        setActiveFilters(nextFilters);
        router.get('/contacts', { 
            search, 
            status: nextFilters.status, 
            customer_type: type,
            company_id: nextFilters.company_id 
        }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setActiveCustomerType('');
        setActiveFilters({ status: '', customer_type: '', company_id: '' });
        router.get('/contacts', { search }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        router.get('/contacts', { 
            search: val, 
            status: activeFilters.status, 
            customer_type: activeCustomerType,
            company_id: activeFilters.company_id 
        }, { preserveState: true, replace: true });
    };

    // Inline cell edit handlers
    const handleSaveCell = (contactId, field, newValue) => {
        return new Promise((resolve, reject) => {
            router.patch(`/contacts/${contactId}`, { [field]: newValue }, {
                preserveScroll: true,
                onSuccess: () => resolve(),
                onError: (errors) => reject(errors),
            });
        });
    };

    const handleStatusChange = (contactId, newStatus) => {
        router.patch(`/contacts/${contactId}`, { status: newStatus }, { preserveScroll: true });
    };

    // Selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(contacts.map((c) => c.id));
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
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} customers?`)) return;

        selectedIds.forEach((id) => {
            router.delete(`/contacts/${id}`, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    const handleBulkChangeStatus = (newStatus) => {
        selectedIds.forEach((id) => {
            router.patch(`/contacts/${id}`, { status: newStatus }, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    // Export to CSV
    const handleExportCsv = () => {
        const headers = ['Customer Name', 'Trade Name', 'Role', 'Tax ID', 'Customs Card', 'Nafeza ID', 'Phone', 'Email', 'City', 'Terms', 'Credit Limit', 'Status'];
        const rows = contacts.map((c) => [
            c.name || `${c.first_name} ${c.last_name}`,
            c.company_name || c.company?.name || '',
            c.customer_type || 'importer',
            c.tax_id || '',
            c.customs_card_number || '',
            c.nafeza_id || '',
            c.phone || '',
            c.email || '',
            c.city || '',
            c.payment_terms || 'cash',
            c.credit_limit || '0',
            c.status || '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + 
            [headers.join(','), ...rows.map((e) => e.map(item => `"${item}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `freight_customers_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterOptions = [
        {
            key: 'customer_type',
            label: t('customer_type') || 'Activity Role',
            options: [
                { value: 'importer', label: t('importer') || 'Importer' },
                { value: 'exporter', label: t('exporter') || 'Exporter' },
                { value: 'trader', label: t('trader') || 'Trader' },
                { value: 'broker_client', label: t('broker_client') || 'Clearance Client' },
                { value: 'individual', label: t('individual') || 'Personal Cargo' },
            ],
        },
        {
            key: 'status',
            label: t('status'),
            options: [
                { value: 'active', label: t('active') || 'Active' },
                { value: 'lead', label: t('lead') || 'Lead' },
                { value: 'inactive', label: t('inactive') || 'Inactive' },
            ],
        },
    ];

    const cellPadding = density === 'compact' ? 'py-1.5 px-3' : 'py-2.5 px-4';

    const getRoleBadge = (role) => {
        switch (role) {
            case 'importer':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60">مستورد (وارد)</span>;
            case 'exporter':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">مُصدّر (صادر)</span>;
            case 'trader':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60">تاجر / وسيط</span>;
            case 'broker_client':
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60">عميل تخليص</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">أفراد</span>;
        }
    };

    return (
        <AppLayout title={t('customers') || 'العملاء والشاحنون'} companies={companies}>
            <Head title={`${t('customers') || 'العملاء'} - Freight CRM`} />

            <div className="flex flex-col h-full">
                
                {/* Customer Segment Tabs Header */}
                <div className="px-6 pt-3 bg-neutral-50/70 dark:bg-[#161616]/70 border-b border-neutral-200/70 dark:border-neutral-800/80 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
                    <div className="flex items-center gap-2 pb-2">
                        {[
                            { key: '', label: 'كافة العملاء (All)', count: customerTypeCounts?.all || contacts.length },
                            { key: 'importer', label: 'المستوردين (Importers)', count: customerTypeCounts?.importer || 0 },
                            { key: 'exporter', label: 'المصدرين (Exporters)', count: customerTypeCounts?.exporter || 0 },
                            { key: 'trader', label: 'التجار والوسطاء (Traders)', count: customerTypeCounts?.trader || 0 },
                            { key: 'broker_client', label: 'عملاء التخليص (Clearance)', count: customerTypeCounts?.broker_client || 0 },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => handleSelectTypeTab(tab.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                    activeCustomerType === tab.key
                                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                                        : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 border border-neutral-200/70 dark:border-neutral-800'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    activeCustomerType === tab.key
                                        ? 'bg-neutral-800 text-neutral-300 dark:bg-neutral-200 dark:text-neutral-800'
                                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm shrink-0 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('new_customer') || 'إضافة عميل جديد'}</span>
                    </button>
                </div>

                {/* FilterBar & Search */}
                <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-white/[0.08] glass-header pe-6 sticky top-0 z-20">
                    <div className="flex-1">
                        <FilterBar
                            search={search}
                            onSearchChange={handleSearchChange}
                            filterOptions={filterOptions}
                            activeFilters={activeFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            totalCount={contacts.length}
                            unit={t('customers') || 'عميل'}
                            density={density}
                            onToggleDensity={setDensity}
                            onExportCsv={handleExportCsv}
                        />
                    </div>
                </div>

                {/* Customers Spreadsheet Table */}
                <div className="flex-1 overflow-auto bg-white dark:bg-[#111111]">
                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200/80 dark:border-white/[0.08] glass-table-header text-[11px] font-semibold text-neutral-500 uppercase tracking-wider sticky top-0 z-10 select-none">
                                <th className="py-2 px-3 w-10 text-center border-e border-neutral-200/50 dark:border-neutral-800/50">
                                    <input
                                        type="checkbox"
                                        checked={contacts.length > 0 && selectedIds.length === contacts.length}
                                        onChange={handleSelectAll}
                                        className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">العميل والمنشأة (Customer / Trade Name)</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('customer_type') || 'الصفة / النشاط'}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">الهوية الجمركية والضريبية (Tax & Customs ID)</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">بيانات الاتصال (Phone / Email)</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">المقر (City / Country)</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">شروط الائتمان (Payment & Credit)</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('status')}</th>
                                <th className="py-2 px-2 w-8 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-xs text-neutral-800 dark:text-neutral-200">
                            {contacts.map((contact) => {
                                const isSelected = selectedIds.includes(contact.id);
                                return (
                                    <tr
                                        key={contact.id}
                                        onClick={() => {
                                            setSelectedContact(contact);
                                            setDrawerOpen(true);
                                        }}
                                        className={`transition-colors cursor-pointer group ${
                                            isSelected 
                                                ? 'bg-blue-50/60 dark:bg-[#14233a]' 
                                                : 'hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]'
                                        }`}
                                    >
                                        {/* Selection Checkbox */}
                                        <td 
                                            className={`${cellPadding} text-center border-e border-neutral-100 dark:border-neutral-800/50`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => handleToggleSelect(e, contact.id)}
                                                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                                            />
                                        </td>

                                        {/* Name & Trade Name */}
                                        <td className={`${cellPadding} font-medium border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {contact.first_name?.[0] || 'C'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                                        {contact.company_name || contact.name}
                                                    </div>
                                                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                                                        <User className="w-3 h-3 text-neutral-400" />
                                                        <span className="truncate">{contact.name}</span>
                                                        {contact.job_title && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate">{contact.job_title}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Activity / Role Badge */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            {getRoleBadge(contact.customer_type)}
                                        </td>

                                        {/* Customs & Tax Identity */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50 font-mono`}>
                                            {contact.tax_id || contact.customs_card_number || contact.nafeza_id ? (
                                                <div className="space-y-0.5 text-[11px]">
                                                    {contact.tax_id && (
                                                        <div className="text-neutral-800 dark:text-neutral-200">
                                                            <span className="text-neutral-400 font-sans text-[10px]">ضريبي: </span>
                                                            <span>{contact.tax_id}</span>
                                                        </div>
                                                    )}
                                                    {contact.customs_card_number && (
                                                        <div className="text-neutral-600 dark:text-neutral-400">
                                                            <span className="text-neutral-400 font-sans text-[10px]">بطاقة جمارك: </span>
                                                            <span>{contact.customs_card_number}</span>
                                                        </div>
                                                    )}
                                                    {contact.nafeza_id && (
                                                        <div className="text-blue-600 dark:text-blue-400">
                                                            <span className="text-neutral-400 font-sans text-[10px]">نافذة: </span>
                                                            <span>{contact.nafeza_id}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-neutral-400 italic text-[11px]">غير مسجل</span>
                                            )}
                                        </td>

                                        {/* Phone & Email */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <div className="space-y-0.5 text-xs">
                                                {contact.phone && (
                                                    <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-mono">
                                                        <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                                                        <span>{contact.phone}</span>
                                                    </div>
                                                )}
                                                {contact.email && (
                                                    <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px]">
                                                        <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                                                        <span className="truncate">{contact.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* City & Country */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <div className="text-xs text-neutral-800 dark:text-neutral-200">
                                                {contact.city || 'Cairo'}
                                            </div>
                                            <div className="text-[10px] text-neutral-400">
                                                {contact.country || 'Egypt'}
                                            </div>
                                        </td>

                                        {/* Payment Terms & Credit Limit */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                    contact.payment_terms === 'cash' 
                                                        ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300' 
                                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/50'
                                                }`}>
                                                    {contact.payment_terms || 'cash'}
                                                </span>
                                                {Number(contact.credit_limit) > 0 && (
                                                    <span className="font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                                                        ${Number(contact.credit_limit).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <InlineStatusBadge
                                                value={contact.status || 'active'}
                                                options={['active', 'lead', 'inactive']}
                                                onSelect={(newVal) => handleStatusChange(contact.id, newVal)}
                                                type="status"
                                            />
                                        </td>

                                        {/* Row Quick Action */}
                                        <td className="py-2 px-2 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(t('delete_confirm') || 'هل تريد حذف هذا العميل؟')) {
                                                        router.delete(`/contacts/${contact.id}`);
                                                    }
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

                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-xs text-neutral-400">
                                        لا يوجد عملاء يطابقون شروط البحث أو التصنيف المحدد.
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
                statusOptions={[
                    { value: 'active', label: t('active') || 'Active' },
                    { value: 'lead', label: t('lead') || 'Lead' },
                    { value: 'inactive', label: t('inactive') || 'Inactive' },
                ]}
                onBulkChangeStatus={handleBulkChangeStatus}
            />

            {/* Side-Peek Record Drawer */}
            <RecordDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                type="contact"
                record={selectedContact}
            />

            {/* Dedicated Customer Creation Modal */}
            <CreatePersonModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                companies={companies}
            />
        </AppLayout>
    );
}

