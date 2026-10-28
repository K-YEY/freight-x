import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import EditableCell from '../../Components/EditableCell';
import InlineStatusBadge from '../../Components/InlineStatusBadge';
import FilterBar from '../../Components/FilterBar';
import BulkActionBar from '../../Components/BulkActionBar';
import RecordDrawer from '../../Components/RecordDrawer';
import CreateDealModal from '../../Components/Modals/CreateDealModal';
import { useTranslation } from '../../Context/LanguageContext';
import { 
    Plus, LayoutGrid, Table as TableIcon, 
    Building2, User, Calendar, Trash2
} from 'lucide-react';

export default function OpportunitiesIndex({ opportunities, kanbanColumns, stages, companies, contacts, currentView, filters }) {
    const { t, isRTL } = useTranslation();
    const [viewMode, setViewMode] = useState(currentView || 'kanban'); // 'kanban' | 'table'
    const [search, setSearch] = useState(filters.search || '');
    const [activeFilters, setActiveFilters] = useState({
        stage: filters.stage || '',
    });
    const [density, setDensity] = useState('normal');
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const handleFilterChange = (key, value) => {
        const nextFilters = { ...activeFilters, [key]: value };
        setActiveFilters(nextFilters);
        router.get('/opportunities', { 
            search, 
            stage: nextFilters.stage, 
            view: viewMode 
        }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setActiveFilters({ stage: '' });
        router.get('/opportunities', { search, view: viewMode }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        router.get('/opportunities', { 
            search: val, 
            stage: activeFilters.stage, 
            view: viewMode 
        }, { preserveState: true, replace: true });
    };

    const handleSwitchView = (newView) => {
        setViewMode(newView);
        router.get('/opportunities', { 
            search, 
            stage: activeFilters.stage, 
            view: newView 
        }, { preserveState: true, replace: true });
    };

    // Inline edit handlers
    const handleSaveCell = (dealId, field, newValue) => {
        return new Promise((resolve, reject) => {
            router.patch(`/opportunities/${dealId}`, { [field]: newValue }, {
                preserveScroll: true,
                onSuccess: () => resolve(),
                onError: (errors) => reject(errors),
            });
        });
    };

    const handleMoveStage = (dealId, newStage) => {
        router.patch(`/opportunities/${dealId}/stage`, { stage: newStage }, { preserveScroll: true });
    };

    // Selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(opportunities.map((o) => o.id));
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
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} deals?`)) return;

        selectedIds.forEach((id) => {
            router.delete(`/opportunities/${id}`, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    const handleBulkChangeStage = (newStage) => {
        selectedIds.forEach((id) => {
            router.patch(`/opportunities/${id}/stage`, { stage: newStage }, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    // Export to CSV
    const handleExportCsv = () => {
        const headers = [t('deal_name'), t('amount'), t('stage'), t('company_name'), t('name'), t('close_date')];
        const rows = opportunities.map((o) => [
            o.name,
            o.amount,
            t(o.stage),
            o.company?.name || '',
            o.contact?.name || '',
            o.close_date || '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + 
            [headers.join(','), ...rows.map((e) => e.map(item => `"${item}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `twenty_crm_deals_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filterOptions = [
        {
            key: 'stage',
            label: t('stage'),
            options: Object.entries(stages).map(([k, v]) => ({ value: k, label: t(k) || v })),
        },
    ];

    const cellPadding = density === 'compact' ? 'py-1.5 px-3' : 'py-2.5 px-4';

    return (
        <AppLayout title={t('opportunities')} companies={companies} contacts={contacts}>
            <Head title={`${t('opportunities')} - ${t('app_name')}`} />

            <div className="flex flex-col h-full">
                
                {/* Advanced FilterBar & View Switcher */}
                <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-white/[0.08] glass-header pe-6 sticky top-0 z-20">
                    <div className="flex-1">
                        <FilterBar
                            search={search}
                            onSearchChange={handleSearchChange}
                            filterOptions={filterOptions}
                            activeFilters={activeFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            totalCount={opportunities.length}
                            unit={t('deals')}
                            density={density}
                            onToggleDensity={setDensity}
                            onExportCsv={handleExportCsv}
                        />
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* View Switcher */}
                        <div className="flex items-center p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                            <button
                                onClick={() => handleSwitchView('kanban')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                    viewMode === 'kanban'
                                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                                }`}
                                title={t('board')}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>{t('board')}</span>
                            </button>
                            <button
                                onClick={() => handleSwitchView('table')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                                }`}
                                title={t('table')}
                            >
                                <TableIcon className="w-3.5 h-3.5" />
                                <span>{t('table')}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-2xs gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('new_deal')}</span>
                        </button>
                    </div>
                </div>

                {/* VIEW 1: KANBAN BOARD */}
                {viewMode === 'kanban' && (
                    <div className="flex-1 overflow-x-auto p-6 bg-neutral-50/50 dark:bg-[#0c0c0c]">
                        <div className="flex gap-4 min-w-max h-full pb-4 items-start">
                            {Object.entries(kanbanColumns).map(([stageKey, col]) => (
                                <div
                                    key={stageKey}
                                    className="w-76 shrink-0 flex flex-col max-h-full rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/60 dark:bg-[#141414] overflow-hidden"
                                >
                                    {/* Column Header */}
                                    <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 capitalize">
                                                {t(stageKey) || col.label}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                                {col.count}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                            ${col.totalAmount.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Deal Cards Container */}
                                    <div className="p-2.5 overflow-y-auto space-y-2.5 flex-1 max-h-[calc(100vh-210px)]">
                                        {col.deals.map((deal) => (
                                             <div
                                                key={deal.id}
                                                onClick={() => {
                                                    setSelectedDeal(deal);
                                                    setDrawerOpen(true);
                                                }}
                                                className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] hover:border-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-[#202020] shadow-2xs hover:shadow-xs cursor-pointer transition-all space-y-2.5 group"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug pe-2">
                                                        {deal.name}
                                                    </h4>
                                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                                        ${Number(deal.amount).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                                    {deal.company && (
                                                        <div className="flex items-center truncate gap-1.5">
                                                            <Building2 className="w-3 h-3 text-neutral-400 shrink-0" />
                                                            <span className="truncate">{deal.company.name}</span>
                                                        </div>
                                                    )}
                                                    {deal.contact && (
                                                        <div className="flex items-center truncate gap-1.5">
                                                            <User className="w-3 h-3 text-neutral-400 shrink-0" />
                                                            <span className="truncate">{deal.contact.name || `${deal.contact.first_name} ${deal.contact.last_name}`}</span>
                                                        </div>
                                                    )}
                                                    {deal.close_date && (
                                                        <div className="flex items-center text-neutral-400 text-[10px] pt-0.5 gap-1.5">
                                                            <Calendar className="w-3 h-3 shrink-0" />
                                                            <span>{t('close_date')}: {deal.close_date}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Inline Move Stage Dropdown */}
                                                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                                                    <select
                                                        value={deal.stage}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => handleMoveStage(deal.id, e.target.value)}
                                                        className="text-[10px] py-0.5 px-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 focus:outline-none"
                                                    >
                                                        {Object.entries(stages).map(([sKey, sLabel]) => (
                                                            <option key={sKey} value={sKey}>
                                                                {t('move_to')} {t(sKey) || sLabel}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Delete deal?')) router.delete(`/opportunities/${deal.id}`);
                                                        }}
                                                        className="p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title={t('delete')}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {col.deals.length === 0 && (
                                            <div className="py-8 text-center text-[11px] text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                                                {t('no_deals_in_stage', { stage: t(stageKey) || col.label })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW 2: SPREADSHEET TABLE WITH INLINE EDITS */}
                {viewMode === 'table' && (
                    <div className="flex-1 overflow-auto bg-white dark:bg-[#111111]">
                        <table className="w-full text-start border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-200/80 dark:border-white/[0.08] glass-table-header text-[11px] font-semibold text-neutral-500 uppercase tracking-wider sticky top-0 z-10 select-none">
                                    <th className="py-2 px-3 w-10 text-center border-e border-neutral-200/50 dark:border-neutral-800/50">
                                        <input
                                            type="checkbox"
                                            checked={opportunities.length > 0 && selectedIds.length === opportunities.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0"
                                        />
                                    </th>
                                    <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('deal_name')}</th>
                                    <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('amount')}</th>
                                    <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('stage')}</th>
                                    <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('company_name')}</th>
                                    <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('people')}</th>
                                    <th className="py-2.5 px-4 border-e border-neutral-200/50 dark:border-neutral-800/50">{t('close_date')}</th>
                                    <th className="py-2 px-2 w-8 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 text-xs text-neutral-800 dark:text-neutral-200">
                                {opportunities.map((opp) => {
                                    const isSelected = selectedIds.includes(opp.id);
                                    return (
                                        <tr
                                            key={opp.id}
                                            onClick={() => {
                                                setSelectedDeal(opp);
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
                                                    onChange={(e) => handleToggleSelect(e, opp.id)}
                                                    className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0"
                                                />
                                            </td>

                                            {/* Deal Name (Inline Editable) */}
                                            <td className={`${cellPadding} font-semibold text-neutral-900 dark:text-neutral-100 border-e border-neutral-100 dark:border-neutral-800/50`}>
                                                <EditableCell
                                                    value={opp.name}
                                                    onSave={(val) => handleSaveCell(opp.id, 'name', val)}
                                                    className="font-semibold text-neutral-900 dark:text-neutral-100"
                                                />
                                            </td>

                                            {/* Amount (Inline Editable) */}
                                            <td className={`${cellPadding} font-bold text-emerald-600 dark:text-emerald-400 border-e border-neutral-100 dark:border-neutral-800/50`}>
                                                <EditableCell
                                                    type="number"
                                                    prefix="$"
                                                    value={opp.amount}
                                                    onSave={(val) => handleSaveCell(opp.id, 'amount', val)}
                                                    className="font-bold text-emerald-600 dark:text-emerald-400"
                                                />
                                            </td>

                                            {/* Stage (Inline Switcher) */}
                                            <td className={`${cellPadding} border-e border-neutral-100 dark:border-neutral-800/50`}>
                                                <InlineStatusBadge
                                                    value={opp.stage}
                                                    options={Object.keys(stages)}
                                                    onSelect={(newStage) => handleMoveStage(opp.id, newStage)}
                                                    type="stage"
                                                />
                                            </td>

                                            {/* Company */}
                                            <td className={`${cellPadding} text-neutral-700 dark:text-neutral-300 border-e border-neutral-100 dark:border-neutral-800/50`}>
                                                {opp.company?.name || <span className="text-neutral-400 italic text-[11px]">{t('no_company')}</span>}
                                            </td>

                                            {/* Contact */}
                                            <td className={`${cellPadding} text-neutral-700 dark:text-neutral-300 border-e border-neutral-100 dark:border-neutral-800/50`}>
                                                {opp.contact?.name || <span className="text-neutral-400 italic text-[11px]">{t('no_contact')}</span>}
                                            </td>

                                            {/* Close Date (Inline Editable) */}
                                            <td className={`${cellPadding} text-neutral-600 dark:text-neutral-400 border-e border-neutral-100 dark:border-neutral-800/50`}>
                                                <EditableCell
                                                    type="date"
                                                    value={opp.close_date}
                                                    onSave={(val) => handleSaveCell(opp.id, 'close_date', val)}
                                                    placeholder={t('set_date')}
                                                />
                                            </td>

                                            {/* Delete */}
                                            <td className="py-2 px-2 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Delete deal?')) router.delete(`/opportunities/${opp.id}`);
                                                    }}
                                                    className="p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title={t('delete')}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {opportunities.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-xs text-neutral-400">
                                            {t('no_records_match')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {/* Floating Bulk Actions Bar */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onBulkDelete={handleBulkDelete}
                statusOptions={Object.entries(stages).map(([k, v]) => ({ value: k, label: t(k) || v }))}
                onBulkChangeStatus={handleBulkChangeStage}
            />

            {/* Side-Peek Record Drawer */}
            <RecordDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                type="opportunity"
                record={selectedDeal}
            />

            {/* Dedicated Deal Creation Modal */}
            <CreateDealModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                companies={companies}
                contacts={contacts}
            />
        </AppLayout>
    );
}

