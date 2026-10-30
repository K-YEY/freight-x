import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import EditableCell from '../../Components/EditableCell';
import InlineStatusBadge from '../../Components/InlineStatusBadge';
import FilterBar from '../../Components/FilterBar';
import BulkActionBar from '../../Components/BulkActionBar';
import ShipmentDrawer from '../../Components/ShipmentDrawer';
import CreateShipmentModal from '../../Components/Modals/CreateShipmentModal';
import { useTranslation } from '../../Context/LanguageContext';
import { useCurrency } from '../../Context/CurrencyContext';
import { 
    Plus, LayoutGrid, Table as TableIcon, 
    Ship, Plane, Truck, Anchor, Building2, 
    Calendar, ArrowRight, DollarSign, Box,
    Layers, CheckCircle2, TrendingUp, Clock, Scale
} from 'lucide-react';

export default function ShipmentsIndex({ 
    shipments = [], 
    kanbanColumns = {}, 
    ports = [], 
    warehouses = [], 
    vessels = [], 
    incoterms = [], 
    packageTypes = [], 
    moveTypes = [], 
    carriers = [], 
    clients = [], 
    customsBrokers = [], 
    truckers = [], 
    agents = [], 
    currentView = 'kanban', 
    filters = {} 
}) {
    const { t, isRTL } = useTranslation();
    const { formatMoney, currentCurrency } = useCurrency();
    const [viewMode, setViewMode] = useState(currentView || 'kanban');
    const [search, setSearch] = useState(filters.search || '');
    const [activeMode, setActiveMode] = useState(filters.mode || 'all');
    const [activeFilters, setActiveFilters] = useState({
        mode: filters.mode || '',
        service_type: filters.service_type || '',
        status: filters.status || '',
        incoterm: filters.incoterm || '',
        carrier_id: filters.carrier_id || '',
    });
    const [density, setDensity] = useState('normal');
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Calculate High-level Dashboard Financial Metrics
    const totalShipments = shipments.length;
    const totalRevenue = shipments.reduce((sum, s) => sum + Number(s.total_revenue || 0), 0);
    const totalCost = shipments.reduce((sum, s) => sum + Number(s.total_cost || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';

    const handleFilterChange = (key, value) => {
        const nextFilters = { ...activeFilters, [key]: value };
        setActiveFilters(nextFilters);
        router.get('/shipments', { 
            search, 
            ...nextFilters,
            view: viewMode 
        }, { preserveState: true, replace: true });
    };

    const handleModeSwitch = (mode) => {
        const nextMode = mode === 'all' ? '' : mode;
        setActiveMode(mode);
        const nextFilters = { ...activeFilters, mode: nextMode };
        setActiveFilters(nextFilters);
        router.get('/shipments', { 
            search, 
            ...nextFilters,
            view: viewMode 
        }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setActiveMode('all');
        const resetFilters = {
            mode: '',
            service_type: '',
            status: '',
            incoterm: '',
            carrier_id: '',
        };
        setActiveFilters(resetFilters);
        router.get('/shipments', { search, view: viewMode }, { preserveState: true, replace: true });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        router.get('/shipments', { 
            search: val, 
            ...activeFilters,
            view: viewMode 
        }, { preserveState: true, replace: true });
    };

    const handleSwitchView = (newView) => {
        setViewMode(newView);
        router.get('/shipments', { 
            search, 
            ...activeFilters,
            view: newView 
        }, { preserveState: true, replace: true });
    };

    // Inline edit cell for Table view
    const handleSaveCell = (shipmentId, field, newValue) => {
        return new Promise((resolve, reject) => {
            router.patch(`/shipments/${shipmentId}`, { [field]: newValue }, {
                preserveScroll: true,
                onSuccess: () => resolve(),
                onError: (errors) => reject(errors),
            });
        });
    };

    const handleStatusSelect = (shipmentId, newStatus) => {
        router.patch(`/shipments/${shipmentId}/status`, { status: newStatus }, { preserveScroll: true });
    };

    // Row selection for bulk actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(shipments.map((s) => s.id));
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
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} shipments?`)) return;

        selectedIds.forEach((id) => {
            router.delete(`/shipments/${id}`, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    const handleBulkChangeStatus = (newStatus) => {
        selectedIds.forEach((id) => {
            router.patch(`/shipments/${id}/status`, { status: newStatus }, { preserveScroll: true });
        });
        setSelectedIds([]);
    };

    // Export CSV
    const handleExportCsv = () => {
        const headers = ['Shipment #', 'Mode', 'Service', 'Status', 'Customer', 'Carrier', 'Origin', 'Destination', 'Revenue', 'Cost', 'Profit', 'Incoterm'];
        const rows = shipments.map((s) => [
            s.shipment_number,
            s.mode,
            s.service_type,
            s.status,
            s.customer?.name || '',
            s.carrier?.name || '',
            s.origin_port?.code || '',
            s.destination_port?.code || '',
            s.total_revenue || 0,
            s.total_cost || 0,
            s.gross_profit || 0,
            s.incoterm || '',
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + 
            [headers.join(','), ...rows.map((e) => e.map(item => `"${item}"`).join(','))].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `freight_shipments_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getModeIcon = (mode) => {
        if (mode === 'air') return <Plane className="w-3.5 h-3.5 text-purple-500" />;
        if (mode === 'land') return <Truck className="w-3.5 h-3.5 text-amber-500" />;
        return <Ship className="w-3.5 h-3.5 text-blue-500" />;
    };

    const filterOptions = [
        {
            key: 'status',
            label: t('status'),
            options: [
                { value: 'booked', label: t('booked') || 'Booked' },
                { value: 'cargo_received', label: t('cargo_received') || 'Cargo Received' },
                { value: 'customs_export', label: t('customs_export') || 'Customs Clearance' },
                { value: 'in_transit', label: t('in_transit') || 'In Transit' },
                { value: 'arrived', label: t('arrived') || 'Arrived' },
                { value: 'delivered', label: t('delivered') || 'Delivered' },
            ],
        },
        {
            key: 'service_type',
            label: t('service_type'),
            options: [
                { value: 'fcl', label: 'FCL (Full Container)' },
                { value: 'lcl', label: 'LCL (Less Container)' },
                { value: 'air_cargo', label: 'Air Cargo' },
                { value: 'ftl', label: 'FTL (Full Truckload)' },
                { value: 'ltl', label: 'LTL (Less Truckload)' },
            ],
        },
        {
            key: 'incoterm',
            label: t('incoterm'),
            options: [
                { value: 'FOB', label: 'FOB - Free on Board' },
                { value: 'CIF', label: 'CIF - Cost, Insurance, Freight' },
                { value: 'CFR', label: 'CFR - Cost & Freight' },
                { value: 'EXW', label: 'EXW - Ex Works' },
                { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
                { value: 'DAP', label: 'DAP - Delivered at Place' },
            ],
        },
    ];

    const cellPadding = density === 'compact' ? 'py-1.5 px-3' : 'py-2.5 px-4';

    return (
        <AppLayout 
            title={t('shipments')} 
            ports={ports} 
            carriers={carriers} 
            clients={clients}
        >
            <Head title={`${t('shipments')} - Freight-X`} />

            <div className="flex flex-col h-full">
                
                {/* Freight Topbar: Mode Switcher & Financial Cards */}
                <div className="px-6 py-3.5 border-b border-neutral-200/70 dark:border-white/[0.08] glass-header flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    
                    {/* Multimodal Filter Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-200/50 dark:bg-[#181818] border border-neutral-200/80 dark:border-neutral-800 self-start">
                        <button
                            onClick={() => handleModeSwitch('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeMode === 'all'
                                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                            }`}
                        >
                            {t('all')}
                        </button>
                        <button
                            onClick={() => handleModeSwitch('sea')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeMode === 'sea'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                        >
                            <Ship className="w-3.5 h-3.5" />
                            <span>{t('sea_freight')}</span>
                        </button>
                        <button
                            onClick={() => handleModeSwitch('air')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeMode === 'air'
                                    ? 'bg-purple-600 text-white shadow-2xs'
                                    : 'text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400'
                            }`}
                        >
                            <Plane className="w-3.5 h-3.5" />
                            <span>{t('air_freight')}</span>
                        </button>
                        <button
                            onClick={() => handleModeSwitch('land')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                activeMode === 'land'
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : 'text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400'
                            }`}
                        >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{t('land_freight')}</span>
                        </button>
                    </div>

                    {/* Financial Metrics Strip */}
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100/80 dark:bg-[#181818] border border-neutral-200/60 dark:border-neutral-800">
                            <span className="text-neutral-400 font-sans text-[11px]">{t('revenue')}:</span>
                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                {formatMoney(totalRevenue, 'USD', currentCurrency)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100/80 dark:bg-[#181818] border border-neutral-200/60 dark:border-neutral-800">
                            <span className="text-neutral-400 font-sans text-[11px]">{t('cost')}:</span>
                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                {formatMoney(totalCost, 'USD', currentCurrency)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400">
                            <span className="font-sans text-[11px]">{t('gross_profit')}:</span>
                            <span className="font-bold">
                                {formatMoney(totalProfit, 'USD', currentCurrency)} ({avgMargin}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* FilterBar & View Switcher */}
                <div className="flex items-center justify-between border-b border-neutral-200/70 dark:border-white/[0.08] glass-header pe-6 sticky top-0 z-20">
                    <div className="flex-1">
                        <FilterBar
                            search={search}
                            onSearchChange={handleSearchChange}
                            filterOptions={filterOptions}
                            activeFilters={activeFilters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            totalCount={shipments.length}
                            unit={t('shipments')}
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
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
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
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
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
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-2xs gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>{t('new_shipment')}</span>
                        </button>
                    </div>
                </div>

                {/* VIEW 1: KANBAN PIPELINE */}
                {viewMode === 'kanban' && (
                    <div className="flex-1 overflow-x-auto p-6 bg-neutral-50/50 dark:bg-[#0c0c0c]">
                        <div className="flex gap-4 min-w-max h-full pb-4 items-start">
                            {Object.entries(kanbanColumns).map(([stageKey, col]) => (
                                <div
                                    key={stageKey}
                                    className="w-80 shrink-0 flex flex-col max-h-full rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-[#141414] overflow-hidden"
                                >
                                    {/* Column Header */}
                                    <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-white/40 dark:bg-neutral-900/40">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                {isRTL ? col.label_ar : col.label}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                                {col.count}
                                            </span>
                                        </div>
                                        <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatMoney(col.totalProfit || 0, 'USD', currentCurrency, { showCode: false })}
                                        </div>
                                    </div>

                                    {/* Column Cards List */}
                                    <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                                        {col.shipments.map((shp) => {
                                            const profit = Number(shp.gross_profit || 0);
                                            const revenue = Number(shp.total_revenue || 0);

                                            return (
                                                <div
                                                    key={shp.id}
                                                    onClick={() => {
                                                        setSelectedShipment(shp);
                                                        setDrawerOpen(true);
                                                    }}
                                                    className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-2xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer group space-y-2.5"
                                                >
                                                    {/* Card Top: Mode, Shipment #, Incoterm */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="p-1 rounded bg-neutral-100 dark:bg-neutral-800">
                                                                {getModeIcon(shp.mode)}
                                                            </div>
                                                            <span className="font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {shp.shipment_number}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40">
                                                            {shp.incoterm}
                                                        </span>
                                                    </div>

                                                    {/* Routing: Origin -> Dest */}
                                                    <div className="text-xs text-neutral-600 dark:text-neutral-300 flex items-center justify-between">
                                                        <div className="truncate max-w-[45%]">
                                                            <div className="text-[10px] text-neutral-400">{t('origin')}</div>
                                                            <div className="font-semibold truncate">{shp.origin_port?.code || shp.origin_port?.name || '—'}</div>
                                                        </div>
                                                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 rtl:rotate-180" />
                                                        <div className="truncate max-w-[45%] text-end">
                                                            <div className="text-[10px] text-neutral-400">{t('destination')}</div>
                                                            <div className="font-semibold truncate">{shp.destination_port?.code || shp.destination_port?.name || '—'}</div>
                                                        </div>
                                                    </div>

                                                    {/* Partner info */}
                                                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                                                        <span className="truncate max-w-[60%]">
                                                            {shp.customer?.name || t('unassigned')}
                                                        </span>
                                                        <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[38%] text-end">
                                                            {shp.carrier?.name || 'Carrier'}
                                                        </span>
                                                    </div>

                                                    {/* Bottom: Financial Profit Pill & ETA */}
                                                    <div className="flex items-center justify-between pt-1">
                                                        <span className="text-[10px] font-mono text-neutral-400">
                                                            ETA: {shp.eta || '—'}
                                                        </span>
                                                        <div className="flex items-center gap-1 font-mono text-xs">
                                                            <span className="text-neutral-400 text-[10px]">Rev: {formatMoney(revenue, 'USD', currentCurrency, { showCode: false })}</span>
                                                            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                                                +{formatMoney(profit, 'USD', currentCurrency, { showCode: false })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {col.shipments.length === 0 && (
                                            <div className="py-8 text-center text-xs text-neutral-400">
                                                {t('no_shipments')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW 2: HIGH-DENSITY SPREADSHEET TABLE */}
                {viewMode === 'table' && (
                    <div className="flex-1 overflow-auto bg-white dark:bg-[#111111]">
                        <table className="w-full text-start border-collapse text-xs">
                            <thead className="sticky top-0 z-10 glass-header border-b border-neutral-200/80 dark:border-neutral-800/80 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                                <tr>
                                    <th className="py-2.5 px-4 w-10 text-center">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedIds.length === shipments.length && shipments.length > 0}
                                            className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                                        />
                                    </th>
                                    <th className="py-2.5 px-4 text-start">{t('shipment_number')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('status')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('mode')} & {t('service_type')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('customer')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('carrier_shipping_line')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('origin')} ➡️ {t('destination')}</th>
                                    <th className="py-2.5 px-4 text-start">Incoterm</th>
                                    <th className="py-2.5 px-4 text-start">ETD</th>
                                    <th className="py-2.5 px-4 text-start">ETA</th>
                                    <th className="py-2.5 px-4 text-end">{t('revenue')} ({currentCurrency})</th>
                                    <th className="py-2.5 px-4 text-end">{t('cost')} ({currentCurrency})</th>
                                    <th className="py-2.5 px-4 text-end">{t('gross_profit')} ({currentCurrency})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                {shipments.map((shp) => {
                                    const isSelected = selectedIds.includes(shp.id);
                                    const rev = Number(shp.total_revenue || 0);
                                    const cost = Number(shp.total_cost || 0);
                                    const profit = Number(shp.gross_profit || 0);

                                    return (
                                        <tr
                                            key={shp.id}
                                            onClick={() => {
                                                setSelectedShipment(shp);
                                                setDrawerOpen(true);
                                            }}
                                            className={`hover:bg-neutral-50/80 dark:hover:bg-[#181818] transition-colors cursor-pointer group ${
                                                isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                                            }`}
                                        >
                                            <td className="py-2.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleToggleSelect(e, shp.id)}
                                                    className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0 cursor-pointer"
                                                />
                                            </td>

                                            <td className={`${cellPadding} font-mono font-bold text-neutral-900 dark:text-neutral-100 whitespace-nowrap`}>
                                                <div className="flex items-center gap-2">
                                                    {getModeIcon(shp.mode)}
                                                    <span>{shp.shipment_number}</span>
                                                </div>
                                            </td>

                                            <td className={cellPadding} onClick={(e) => e.stopPropagation()}>
                                                <InlineStatusBadge
                                                    value={shp.status}
                                                    type="status"
                                                    options={[
                                                        { value: 'booked', label: 'Booked' },
                                                        { value: 'cargo_received', label: 'Cargo Received' },
                                                        { value: 'customs_export', label: 'Customs Clearance' },
                                                        { value: 'in_transit', label: 'In Transit' },
                                                        { value: 'arrived', label: 'Arrived' },
                                                        { value: 'delivered', label: 'Delivered' },
                                                    ]}
                                                    onSelect={(val) => handleStatusSelect(shp.id, val)}
                                                />
                                            </td>

                                            <td className={`${cellPadding} text-neutral-600 dark:text-neutral-400 capitalize whitespace-nowrap`}>
                                                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{shp.mode}</span>
                                                <span className="text-neutral-400"> • {shp.service_type}</span>
                                            </td>

                                            <td className={`${cellPadding} text-neutral-900 dark:text-neutral-100 font-medium whitespace-nowrap max-w-[160px] truncate`}>
                                                {shp.customer?.name || '—'}
                                            </td>

                                            <td className={`${cellPadding} text-neutral-600 dark:text-neutral-400 whitespace-nowrap max-w-[140px] truncate`}>
                                                {shp.carrier?.name || '—'}
                                            </td>

                                            <td className={`${cellPadding} font-mono text-neutral-700 dark:text-neutral-300 whitespace-nowrap`}>
                                                <span>{shp.origin_port?.code || '—'}</span>
                                                <span className="text-neutral-400 mx-1.5">➔</span>
                                                <span>{shp.destination_port?.code || '—'}</span>
                                            </td>

                                            <td className={`${cellPadding} font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap`}>
                                                {shp.incoterm}
                                            </td>

                                            <td className={cellPadding} onClick={(e) => e.stopPropagation()}>
                                                <EditableCell
                                                    value={shp.etd || ''}
                                                    type="date"
                                                    onSave={(val) => handleSaveCell(shp.id, 'etd', val)}
                                                />
                                            </td>

                                            <td className={cellPadding} onClick={(e) => e.stopPropagation()}>
                                                <EditableCell
                                                    value={shp.eta || ''}
                                                    type="date"
                                                    onSave={(val) => handleSaveCell(shp.id, 'eta', val)}
                                                />
                                            </td>

                                            <td className={`${cellPadding} text-end font-mono text-neutral-900 dark:text-neutral-100`}>
                                                {formatMoney(rev, 'USD', currentCurrency, { showCode: false })}
                                            </td>

                                            <td className={`${cellPadding} text-end font-mono text-neutral-600 dark:text-neutral-400`}>
                                                {formatMoney(cost, 'USD', currentCurrency, { showCode: false })}
                                            </td>

                                            <td className={`${cellPadding} text-end font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap`}>
                                                +{formatMoney(profit, 'USD', currentCurrency, { showCode: false })}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {shipments.length === 0 && (
                                    <tr>
                                        <td colSpan={13} className="py-12 text-center text-xs text-neutral-400">
                                            {t('no_shipments')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bulk Action Bar */}
                <BulkActionBar
                    selectedCount={selectedIds.length}
                    onClearSelection={() => setSelectedIds([])}
                    onDelete={handleBulkDelete}
                    customActions={[
                        {
                            label: t('mark_as_delivered') || 'Delivered',
                            onClick: () => handleBulkChangeStatus('delivered'),
                        },
                        {
                            label: t('in_transit') || 'In Transit',
                            onClick: () => handleBulkChangeStatus('in_transit'),
                        },
                    ]}
                />

                {/* Side-Peek Record Drawer for Shipment */}
                <ShipmentDrawer
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    shipment={selectedShipment}
                    ports={ports}
                    carriers={carriers}
                    clients={clients}
                    customsBrokers={customsBrokers}
                    truckers={truckers}
                    agents={agents}
                />

                {/* Create Shipment Modal */}
                <CreateShipmentModal
                    isOpen={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    clients={clients}
                    carriers={carriers}
                    ports={ports}
                    warehouses={warehouses}
                    vessels={vessels}
                    incoterms={incoterms}
                    packageTypes={packageTypes}
                    moveTypes={moveTypes}
                />
            </div>
        </AppLayout>
    );
}
