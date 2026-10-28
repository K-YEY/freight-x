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
    Trash2, ExternalLink
} from 'lucide-react';

export default function CompaniesIndex({ companies, industries, filters }) {
    const { t, isRTL } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        industry: filters.industry || '',
    });
    const [density, setDensity] = useState('normal');
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const handleFilterChange = (key, value) => {
        const nextFilters = { ...activeFilters, [key]: value };
        setActiveFilters(nextFilters);
        router.get('/companies', { search, industry: nextFilters.industry }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setActiveFilters({ industry: '' });
        router.get('/companies', { search }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        router.get('/companies', { search: val, industry: activeFilters.industry }, { preserveState: true, replace: true });
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
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} companies?`)) return;

        selectedIds.forEach((id) => {
            router.delete(`/companies/${id}`, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    // Export to CSV
    const handleExportCsv = () => {
        const headers = ['Company Name', 'Domain', 'Industry', 'Employees', 'Annual Revenue', 'City', 'Country'];
        const rows = companies.map((c) => [
            c.name,
            c.domain || '',
            c.industry || '',
            c.employees_count || '',
            c.annual_revenue || '',
            c.city || '',
            c.country || '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + 
            [headers.join(','), ...rows.map((e) => e.map(item => `"${item}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `twenty_crm_companies_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterOptions = [
        {
            key: 'industry',
            label: t('industry'),
            options: industries.map((ind) => ({ value: ind, label: ind })),
        },
    ];

    const cellPadding = density === 'compact' ? 'py-1.5 px-3' : 'py-2.5 px-4';

    return (
        <AppLayout title={t('companies')}>
            <Head title={`${t('companies')} - Twenty CRM`} />

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
                            totalCount={companies.length}
                            unit={t('companies')}
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
                        <span>{t('new_company')}</span>
                    </button>
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
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('company_name')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('domain')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('industry')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('employees')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('annual_revenue')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('city')}</th>
                                <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50 text-start">{t('country')}</th>
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

                                        {/* Company Name */}
                                        <td className={`${cellPadding} font-medium border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                    {company.name[0]}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <EditableCell
                                                        value={company.name}
                                                        onSave={(val) => handleSaveCell(company.id, 'name', val)}
                                                        className="font-semibold text-neutral-900 dark:text-neutral-100"
                                                    />
                                                </div>
                                            </div>
                                        </td>

                                        {/* Domain (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={company.domain}
                                                onSave={(val) => handleSaveCell(company.id, 'domain', val)}
                                                placeholder={t('domain')}
                                            />
                                        </td>

                                        {/* Industry (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={company.industry}
                                                onSave={(val) => handleSaveCell(company.id, 'industry', val)}
                                                placeholder={t('industry')}
                                            />
                                        </td>

                                        {/* Employees Count (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                type="number"
                                                value={company.employees_count}
                                                onSave={(val) => handleSaveCell(company.id, 'employees_count', val)}
                                                placeholder={t('employees')}
                                            />
                                        </td>

                                        {/* Annual Revenue (Inline Editable) */}
                                        <td className={`${cellPadding} font-medium text-emerald-600 dark:text-emerald-400 border-e border-neutral-100 dark:border-neutral-800/50 font-mono`}>
                                            <EditableCell
                                                type="number"
                                                prefix="$"
                                                value={company.annual_revenue}
                                                onSave={(val) => handleSaveCell(company.id, 'annual_revenue', val)}
                                                placeholder={t('annual_revenue')}
                                            />
                                        </td>

                                        {/* City (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={company.city}
                                                onSave={(val) => handleSaveCell(company.id, 'city', val)}
                                                placeholder={t('city')}
                                            />
                                        </td>

                                        {/* Country (Inline Editable) */}
                                        <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                            <EditableCell
                                                value={company.country}
                                                onSave={(val) => handleSaveCell(company.id, 'country', val)}
                                                placeholder={t('country')}
                                            />
                                        </td>

                                        {/* Delete */}
                                        <td className="py-2 px-2 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm(t('delete_confirm'))) router.delete(`/companies/${company.id}`);
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
            />

            {/* Side-Peek Record Drawer */}
            <RecordDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                type="company"
                record={selectedCompany}
            />

            {/* Dedicated Company Creation Modal */}
            <CreateCompanyModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />
        </AppLayout>
    );
}

