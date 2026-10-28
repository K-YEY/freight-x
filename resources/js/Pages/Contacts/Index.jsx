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
    Plus, Building2, Trash2, ArrowUpDown, Check
} from 'lucide-react';

export default function ContactsIndex({ contacts, companies, filters }) {
    const { t, isRTL } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        status: filters.status || '',
        company_id: '',
    });
    const [density, setDensity] = useState('normal'); // 'compact' | 'normal'
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
            company_id: nextFilters.company_id 
        }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setActiveFilters({ status: '', company_id: '' });
        router.get('/contacts', { search }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        router.get('/contacts', { 
            search: val, 
            status: activeFilters.status, 
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
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} people?`)) return;

        // Delete iteratively or first batch
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
        const headers = ['Name', 'Email', 'Phone', 'Company', 'Job Title', 'City', 'Status'];
        const rows = contacts.map((c) => [
            c.name || `${c.first_name} ${c.last_name}`,
            c.email || '',
            c.phone || '',
            c.company?.name || '',
            c.job_title || '',
            c.city || '',
            c.status || '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + 
            [headers.join(','), ...rows.map((e) => e.map(item => `"${item}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `twenty_crm_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterOptions = [
        {
            key: 'status',
            label: t('status'),
            options: [
                { value: 'lead', label: t('lead') },
                { value: 'customer', label: t('customer') },
                { value: 'inactive', label: t('inactive') },
            ],
        },
        {
            key: 'company_id',
            label: t('company_name'),
            options: companies.map((c) => ({ value: c.id, label: c.name })),
        },
    ];

    const cellPadding = density === 'compact' ? 'py-1.5 px-3' : 'py-2.5 px-4';

    return (
        <AppLayout title={t('people')} companies={companies}>
            <Head title={`${t('people')} - Twenty CRM`} />

            <div className="flex flex-col h-full">
                
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
                            totalCount={contacts.length}
                            unit={t('people')}
                            density={density}
                            onToggleDensity={setDensity}
                            onExportCsv={handleExportCsv}
                        />
                    </div>

                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-2xs shrink-0 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('new_person')}</span>
                    </button>
                </div>

                {/* Twenty Spreadsheet Table with Inline Cell Editing */}
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
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('name')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('company_name')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('email')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('phone')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('job_title')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('city')}</th>
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

                                        {/* Name with Avatar */}
                                        <td className={`${cellPadding} font-medium border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                    {contact.first_name[0]}{contact.last_name ? contact.last_name[0] : ''}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <EditableCell
                                                        value={contact.name || `${contact.first_name} ${contact.last_name}`}
                                                        onSave={(val) => {
                                                            const parts = val.split(' ');
                                                            return handleSaveCell(contact.id, 'first_name', parts[0]).then(() => {
                                                                if (parts.length > 1) {
                                                                    handleSaveCell(contact.id, 'last_name', parts.slice(1).join(' '));
                                                                }
                                                            });
                                                        }}
                                                        className="font-semibold text-neutral-900 dark:text-neutral-100"
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Company */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            {contact.company ? (
                                                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                                                    <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                                    <span className="truncate">{contact.company.name}</span>
                                                </span>
                                            ) : (
                                                <span className="text-neutral-400 italic text-[11px]">{t('no_company')}</span>
                                            )}
                                        </td>

                                        {/* Email (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={contact.email}
                                                onSave={(val) => handleSaveCell(contact.id, 'email', val)}
                                                placeholder={t('email')}
                                            />
                                        </td>

                                        {/* Phone (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={contact.phone}
                                                onSave={(val) => handleSaveCell(contact.id, 'phone', val)}
                                                placeholder={t('phone')}
                                            />
                                        </td>

                                        {/* Job Title (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={contact.job_title}
                                                onSave={(val) => handleSaveCell(contact.id, 'job_title', val)}
                                                placeholder={t('job_title')}
                                            />
                                        </td>

                                        {/* City (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={contact.city}
                                                onSave={(val) => handleSaveCell(contact.id, 'city', val)}
                                                placeholder={t('city')}
                                            />
                                        </td>

                                        {/* Status (Inline Switcher) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <InlineStatusBadge
                                                value={contact.status}
                                                options={['lead', 'customer', 'inactive']}
                                                onSelect={(newVal) => handleStatusChange(contact.id, newVal)}
                                                type="status"
                                            />
                                        </td>

                                        {/* Row Quick Action */}
                                        <td className="py-2 px-2 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(t('delete_confirm'))) router.delete(`/contacts/${contact.id}`);
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
                                        {t('no_records_match')}
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
                    { value: 'lead', label: t('lead') },
                    { value: 'customer', label: t('customer') },
                    { value: 'inactive', label: t('inactive') },
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

            {/* Dedicated Person Creation Modal */}
            <CreatePersonModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                companies={companies}
            />
        </AppLayout>
    );
}
