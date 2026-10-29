import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '../../Components/AppLayout';
import { useTranslation } from '../../Context/LanguageContext';
import { 
    Anchor, Building2, Ship, FileText, Box, ArrowRightLeft, 
    Plus, Search, Edit2, Trash2, Check, X, MapPin, 
    ChevronRight, ExternalLink, Filter, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function MasterDataIndex({
    currentTab = 'ports',
    search = '',
    ports = [],
    warehouses = [],
    vessels = [],
    incoterms = [],
    packageTypes = [],
    moveTypes = [],
    carriers = [],
    counts = {},
}) {
    const { t, isRTL } = useTranslation();
    const [activeTab, setActiveTab] = useState(currentTab);
    const [searchQuery, setSearchQuery] = useState(search);
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Form data states
    const [portForm, setPortForm] = useState({
        name: '', code: '', country: '', city: '', type: 'sea', terminal_name: '', status: 'active'
    });
    const [warehouseForm, setWarehouseForm] = useState({
        name: '', code: '', type: 'cfs', address: '', city: '', country: '', capacity_cbm: '', manager_name: '', phone: '', email: '', status: 'active'
    });
    const [vesselForm, setVesselForm] = useState({
        name: '', imo_number: '', mmsi: '', call_sign: '', flag_country: '', vessel_type: 'container', carrier_id: '', status: 'active'
    });
    const [incotermForm, setIncotermForm] = useState({
        code: '', name: '', name_ar: '', description: '', applicable_modes: 'all', status: 'active'
    });
    const [packageForm, setPackageForm] = useState({
        code: '', name: '', name_ar: '', description: '', status: 'active'
    });
    const [moveTypeForm, setMoveTypeForm] = useState({
        code: '', name: '', name_ar: '', description: '', status: 'active'
    });

    const handleSwitchTab = (tab) => {
        setActiveTab(tab);
        setEditItem(null);
        setIsCreateOpen(false);
        router.get('/master-data', { tab, search: searchQuery }, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get('/master-data', { tab: activeTab, search: searchQuery }, { preserveState: true, replace: true });
    };

    // Open Create Modal
    const handleOpenCreate = () => {
        setEditItem(null);
        if (activeTab === 'ports') {
            setPortForm({ name: '', code: '', country: '', city: '', type: 'sea', terminal_name: '', status: 'active' });
        } else if (activeTab === 'warehouses') {
            setWarehouseForm({ name: '', code: '', type: 'cfs', address: '', city: '', country: '', capacity_cbm: '', manager_name: '', phone: '', email: '', status: 'active' });
        } else if (activeTab === 'vessels') {
            setVesselForm({ name: '', imo_number: '', mmsi: '', call_sign: '', flag_country: '', vessel_type: 'container', carrier_id: '', status: 'active' });
        } else if (activeTab === 'incoterms') {
            setIncotermForm({ code: '', name: '', name_ar: '', description: '', applicable_modes: 'all', status: 'active' });
        } else if (activeTab === 'packages') {
            setPackageForm({ code: '', name: '', name_ar: '', description: '', status: 'active' });
        } else if (activeTab === 'move_types') {
            setMoveTypeForm({ code: '', name: '', name_ar: '', description: '', status: 'active' });
        }
        setIsCreateOpen(true);
    };

    // Open Edit Modal
    const handleOpenEdit = (item) => {
        setEditItem(item);
        if (activeTab === 'ports') {
            setPortForm({ ...item, terminal_name: item.terminal_name || '' });
        } else if (activeTab === 'warehouses') {
            setWarehouseForm({ ...item, address: item.address || '', city: item.city || '', capacity_cbm: item.capacity_cbm || '', manager_name: item.manager_name || '', phone: item.phone || '', email: item.email || '' });
        } else if (activeTab === 'vessels') {
            setVesselForm({ ...item, imo_number: item.imo_number || '', mmsi: item.mmsi || '', call_sign: item.call_sign || '', flag_country: item.flag_country || '', vessel_type: item.vessel_type || 'container', carrier_id: item.carrier_id || '' });
        } else if (activeTab === 'incoterms') {
            setIncotermForm({ ...item, name_ar: item.name_ar || '', description: item.description || '' });
        } else if (activeTab === 'packages') {
            setPackageForm({ ...item, name_ar: item.name_ar || '', description: item.description || '' });
        } else if (activeTab === 'move_types') {
            setMoveTypeForm({ ...item, name_ar: item.name_ar || '', description: item.description || '' });
        }
        setIsCreateOpen(true);
    };

    // Submit Create or Update
    const handleSubmitForm = (e) => {
        e.preventDefault();

        const endpoint = editItem 
            ? `/master-data/${activeTab.replace('_', '-')}/${editItem.id}` 
            : `/master-data/${activeTab.replace('_', '-')}`;

        let payload = {};
        if (activeTab === 'ports') payload = portForm;
        if (activeTab === 'warehouses') payload = warehouseForm;
        if (activeTab === 'vessels') payload = vesselForm;
        if (activeTab === 'incoterms') payload = incotermForm;
        if (activeTab === 'packages') payload = packageForm;
        if (activeTab === 'move_types') payload = moveTypeForm;

        if (editItem) {
            router.patch(endpoint, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateOpen(false);
                    setEditItem(null);
                },
            });
        } else {
            router.post(endpoint, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateOpen(false);
                },
            });
        }
    };

    // Delete item
    const handleDeleteItem = (id) => {
        if (!confirm(t('delete_confirm') || 'Are you sure you want to delete this record?')) return;
        const endpoint = `/master-data/${activeTab.replace('_', '-')}/${id}`;
        router.delete(endpoint, { preserveScroll: true });
    };

    const tabsList = [
        { key: 'ports', label: t('ports_terminals'), icon: Anchor, count: counts.ports || 0 },
        { key: 'warehouses', label: t('warehouses_cfs'), icon: Building2, count: counts.warehouses || 0 },
        { key: 'vessels', label: t('vessels_fleet'), icon: Ship, count: counts.vessels || 0 },
        { key: 'incoterms', label: t('incoterms'), icon: FileText, count: counts.incoterms || 0 },
        { key: 'packages', label: t('package_types'), icon: Box, count: counts.packages || 0 },
        { key: 'move_types', label: t('move_types'), icon: ArrowRightLeft, count: counts.move_types || 0 },
    ];

    return (
        <AppLayout title={t('master_data')}>
            <Head title={`${t('master_data')} - Freight-X`} />

            <div className="flex flex-col h-full bg-white dark:bg-[#111111]">
                
                {/* Header & Tabs bar */}
                <div className="px-6 py-4 border-b border-neutral-200/70 dark:border-white/[0.08] glass-header flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
                            <Layers className="w-5 h-5 text-blue-500" />
                            <span>{t('master_data')}</span>
                        </h1>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {t('master_data_subtitle') || 'Manage and configure your core logistics assets, partners, trade rules, and packaging.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <Search className="w-3.5 h-3.5 absolute start-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`${t('search')}...`}
                                className="ps-8 pe-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 md:w-56"
                            />
                        </form>

                        {/* Add Button */}
                        <button
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-2xs cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                                {activeTab === 'ports' && t('new_port')}
                                {activeTab === 'warehouses' && t('new_warehouse')}
                                {activeTab === 'vessels' && t('new_vessel')}
                                {activeTab === 'incoterms' && t('new_incoterm')}
                                {activeTab === 'packages' && t('new_package_type')}
                                {activeTab === 'move_types' && t('new_move_type')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Sub-Tabs Nav */}
                <div className="px-6 border-b border-neutral-200/70 dark:border-neutral-800/80 flex items-center gap-2 overflow-x-auto text-xs font-medium bg-neutral-50/50 dark:bg-[#141414]/50">
                    {tabsList.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleSwitchTab(tab.key)}
                                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                                    isActive
                                        ? 'border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    isActive
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                        : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Tables Area */}
                <div className="flex-1 overflow-auto">
                    
                    {/* 1. PORTS TABLE */}
                    {activeTab === 'ports' && (
                        <table className="w-full text-start border-collapse text-xs">
                            <thead className="sticky top-0 z-10 glass-header border-b border-neutral-200/80 dark:border-neutral-800/80 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-2.5 px-4 text-start">{t('port_code')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('name')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('location')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('type')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('terminal_name')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('status')}</th>
                                    <th className="py-2.5 px-4 text-end">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                {ports.map((p) => (
                                    <tr key={p.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#181818] transition-colors">
                                        <td className="py-2.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                                            {p.code}
                                        </td>
                                        <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                            {p.name}
                                        </td>
                                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">
                                            {p.city ? `${p.city}, ` : ''}{p.country}
                                        </td>
                                        <td className="py-2.5 px-4 uppercase text-[10px] font-bold">
                                            <span className={`px-2 py-0.5 rounded ${
                                                p.type === 'sea' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' :
                                                p.type === 'air' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' :
                                                'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                            }`}>
                                                {p.type}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-neutral-500">
                                            {p.terminal_name || '—'}
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                p.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500'
                                            }`}>
                                                {t(p.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-end space-x-1 rtl:space-x-reverse">
                                            <button onClick={() => handleOpenEdit(p)} className="p-1 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(p.id)} className="p-1 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 2. WAREHOUSES TABLE */}
                    {activeTab === 'warehouses' && (
                        <table className="w-full text-start border-collapse text-xs">
                            <thead className="sticky top-0 z-10 glass-header border-b border-neutral-200/80 dark:border-neutral-800/80 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-2.5 px-4 text-start">{t('code')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('name')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('type')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('location')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('capacity_cbm')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('manager_name')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('status')}</th>
                                    <th className="py-2.5 px-4 text-end">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                {warehouses.map((w) => (
                                    <tr key={w.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#181818] transition-colors">
                                        <td className="py-2.5 px-4 font-mono font-bold text-neutral-900 dark:text-neutral-100">{w.code}</td>
                                        <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">{w.name}</td>
                                        <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-purple-600 dark:text-purple-400">{w.type}</td>
                                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">{w.city || w.country || '—'}</td>
                                        <td className="py-2.5 px-4 font-mono">{w.capacity_cbm ? `${Number(w.capacity_cbm).toLocaleString()} CBM` : '—'}</td>
                                        <td className="py-2.5 px-4 text-neutral-500">{w.manager_name || '—'}</td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                w.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500'
                                            }`}>
                                                {t(w.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-end space-x-1 rtl:space-x-reverse">
                                            <button onClick={() => handleOpenEdit(w)} className="p-1 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(w.id)} className="p-1 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 3. VESSELS TABLE */}
                    {activeTab === 'vessels' && (
                        <table className="w-full text-start border-collapse text-xs">
                            <thead className="sticky top-0 z-10 glass-header border-b border-neutral-200/80 dark:border-neutral-800/80 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-2.5 px-4 text-start">{t('name')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('imo_number')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('carrier_shipping_line')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('vessel_type')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('flag_country')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('status')}</th>
                                    <th className="py-2.5 px-4 text-end">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                {vessels.map((v) => (
                                    <tr key={v.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#181818] transition-colors">
                                        <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                            <Ship className="w-3.5 h-3.5 text-blue-500" />
                                            <span>{v.name}</span>
                                        </td>
                                        <td className="py-2.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">{v.imo_number || '—'}</td>
                                        <td className="py-2.5 px-4 font-medium text-neutral-800 dark:text-neutral-200">{v.carrier?.name || '—'}</td>
                                        <td className="py-2.5 px-4 capitalize text-neutral-500">{v.vessel_type || 'Container'}</td>
                                        <td className="py-2.5 px-4 text-neutral-500">{v.flag_country || '—'}</td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                v.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500'
                                            }`}>
                                                {t(v.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-end space-x-1 rtl:space-x-reverse">
                                            <button onClick={() => handleOpenEdit(v)} className="p-1 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(v.id)} className="p-1 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 4. INCOTERMS TABLE */}
                    {activeTab === 'incoterms' && (
                        <table className="w-full text-start border-collapse text-xs">
                            <thead className="sticky top-0 z-10 glass-header border-b border-neutral-200/80 dark:border-neutral-800/80 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-2.5 px-4 text-start">{t('code')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('name')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('name_ar')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('applicable_modes')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('description')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('status')}</th>
                                    <th className="py-2.5 px-4 text-end">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                {incoterms.map((inc) => (
                                    <tr key={inc.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#181818] transition-colors">
                                        <td className="py-2.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{inc.code}</td>
                                        <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">{inc.name}</td>
                                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 font-medium">{inc.name_ar || '—'}</td>
                                        <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-neutral-500">{inc.applicable_modes}</td>
                                        <td className="py-2.5 px-4 text-neutral-500 max-w-xs truncate">{inc.description || '—'}</td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                inc.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500'
                                            }`}>
                                                {t(inc.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-end space-x-1 rtl:space-x-reverse">
                                            <button onClick={() => handleOpenEdit(inc)} className="p-1 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(inc.id)} className="p-1 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 5. PACKAGES TABLE */}
                    {activeTab === 'packages' && (
                        <table className="w-full text-start border-collapse text-xs">
                            <thead className="sticky top-0 z-10 glass-header border-b border-neutral-200/80 dark:border-neutral-800/80 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-2.5 px-4 text-start">{t('code')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('name')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('name_ar')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('description')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('status')}</th>
                                    <th className="py-2.5 px-4 text-end">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                {packageTypes.map((pkg) => (
                                    <tr key={pkg.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#181818] transition-colors">
                                        <td className="py-2.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">{pkg.code}</td>
                                        <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                            <Box className="w-3.5 h-3.5 text-neutral-400" />
                                            <span>{pkg.name}</span>
                                        </td>
                                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">{pkg.name_ar || '—'}</td>
                                        <td className="py-2.5 px-4 text-neutral-500 max-w-sm truncate">{pkg.description || '—'}</td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                pkg.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500'
                                            }`}>
                                                {t(pkg.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-end space-x-1 rtl:space-x-reverse">
                                            <button onClick={() => handleOpenEdit(pkg)} className="p-1 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(pkg.id)} className="p-1 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* 6. MOVE TYPES TABLE */}
                    {activeTab === 'move_types' && (
                        <table className="w-full text-start border-collapse text-xs">
                            <thead className="sticky top-0 z-10 glass-header border-b border-neutral-200/80 dark:border-neutral-800/80 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-2.5 px-4 text-start">{t('code')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('name')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('name_ar')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('description')}</th>
                                    <th className="py-2.5 px-4 text-start">{t('status')}</th>
                                    <th className="py-2.5 px-4 text-end">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                                {moveTypes.map((mt) => (
                                    <tr key={mt.id} className="hover:bg-neutral-50/80 dark:hover:bg-[#181818] transition-colors">
                                        <td className="py-2.5 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">{mt.code}</td>
                                        <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                                            <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-400" />
                                            <span>{mt.name}</span>
                                        </td>
                                        <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400">{mt.name_ar || '—'}</td>
                                        <td className="py-2.5 px-4 text-neutral-500 max-w-sm truncate">{mt.description || '—'}</td>
                                        <td className="py-2.5 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                mt.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500'
                                            }`}>
                                                {t(mt.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-4 text-end space-x-1 rtl:space-x-reverse">
                                            <button onClick={() => handleOpenEdit(mt)} className="p-1 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteItem(mt.id)} className="p-1 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                </div>

            </div>

            {/* UNIFIED MASTER DATA MODAL (FOR ADD / EDIT) */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-backdrop animate-fade-in">
                    <div 
                        className="w-full max-w-lg glass-modal rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-neutral-200/90 dark:border-neutral-700/70 overflow-hidden animate-fade-in-scale"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-neutral-200/70 dark:border-neutral-800/80 glass-header flex items-center justify-between">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                {editItem ? t(`edit_${activeTab.replace(/s$/, '')}`) : t(`new_${activeTab.replace(/s$/, '')}`)}
                            </h3>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                            
                            {/* PORT FIELDS */}
                            {activeTab === 'ports' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Port of Alexandria"
                                                value={portForm.name}
                                                onChange={(e) => setPortForm({ ...portForm, name: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('port_code')} (UN/LOCODE) *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. EGALY"
                                                value={portForm.code}
                                                onChange={(e) => setPortForm({ ...portForm, code: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('country')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Egypt"
                                                value={portForm.country}
                                                onChange={(e) => setPortForm({ ...portForm, country: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('city')}</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Alexandria"
                                                value={portForm.city}
                                                onChange={(e) => setPortForm({ ...portForm, city: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('type')} *</label>
                                            <select
                                                value={portForm.type}
                                                onChange={(e) => setPortForm({ ...portForm, type: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            >
                                                <option value="sea">Sea Port (بحري)</option>
                                                <option value="air">Airport (مطار جوي)</option>
                                                <option value="dry_port">Dry Port / Inland (ميناء جاف)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('terminal_name')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Alexandria Container Terminal (ACCHCO)"
                                            value={portForm.terminal_name}
                                            onChange={(e) => setPortForm({ ...portForm, terminal_name: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                </>
                            )}

                            {/* WAREHOUSE FIELDS */}
                            {activeTab === 'warehouses' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Cairo Bonded Logistics Hub"
                                                value={warehouseForm.name}
                                                onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('code')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. WH-CAI-01"
                                                value={warehouseForm.code}
                                                onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('type')} *</label>
                                            <select
                                                value={warehouseForm.type}
                                                onChange={(e) => setWarehouseForm({ ...warehouseForm, type: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            >
                                                <option value="cfs">CFS (محطة فرز وتجميع)</option>
                                                <option value="bonded">Bonded (مستودع إيداع جمركي)</option>
                                                <option value="general">General (مستودع عام)</option>
                                                <option value="cold_storage">Cold Storage (مخزن تبريد)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('capacity_cbm')}</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 5000"
                                                value={warehouseForm.capacity_cbm}
                                                onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity_cbm: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('city')}</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 10th of Ramadan"
                                                value={warehouseForm.city}
                                                onChange={(e) => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('manager_name')}</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Ahmed Mansour"
                                                value={warehouseForm.manager_name}
                                                onChange={(e) => setWarehouseForm({ ...warehouseForm, manager_name: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* VESSEL FIELDS */}
                            {activeTab === 'vessels' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. MSC OSCAR"
                                                value={vesselForm.name}
                                                onChange={(e) => setVesselForm({ ...vesselForm, name: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('imo_number')}</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 9703291"
                                                value={vesselForm.imo_number}
                                                onChange={(e) => setVesselForm({ ...vesselForm, imo_number: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('carrier_shipping_line')}</label>
                                            <select
                                                value={vesselForm.carrier_id}
                                                onChange={(e) => setVesselForm({ ...vesselForm, carrier_id: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            >
                                                <option value="">{t('select_partner')}</option>
                                                {carriers.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} ({c.partner_type})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('flag_country')}</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Panama"
                                                value={vesselForm.flag_country}
                                                onChange={(e) => setVesselForm({ ...vesselForm, flag_country: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* INCOTERM FIELDS */}
                            {activeTab === 'incoterms' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('code')} (e.g. FOB, CIF) *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. DDP"
                                                value={incotermForm.code}
                                                onChange={(e) => setIncotermForm({ ...incotermForm, code: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('applicable_modes')}</label>
                                            <select
                                                value={incotermForm.applicable_modes}
                                                onChange={(e) => setIncotermForm({ ...incotermForm, applicable_modes: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            >
                                                <option value="all">All Modes (جميع الوسائط)</option>
                                                <option value="sea">Sea Freight Only (بحري فقط)</option>
                                                <option value="air">Air Freight Only (جوي فقط)</option>
                                                <option value="land">Land Freight Only (بري فقط)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name')} (English) *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Delivered Duty Paid"
                                                value={incotermForm.name}
                                                onChange={(e) => setIncotermForm({ ...incotermForm, name: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name_ar')}</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. تسليم شامل الجمارك والرسوم"
                                                value={incotermForm.name_ar}
                                                onChange={(e) => setIncotermForm({ ...incotermForm, name_ar: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('description')}</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Explain responsibility and risk transfer point..."
                                            value={incotermForm.description}
                                            onChange={(e) => setIncotermForm({ ...incotermForm, description: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                </>
                            )}

                            {/* PACKAGE FIELDS */}
                            {activeTab === 'packages' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('code')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. FLEXITANK"
                                                value={packageForm.code}
                                                onChange={(e) => setPackageForm({ ...packageForm, code: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Flexitank Liquid Bag"
                                                value={packageForm.name}
                                                onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name_ar')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. خزان فليكسي تانك سوائل"
                                            value={packageForm.name_ar}
                                            onChange={(e) => setPackageForm({ ...packageForm, name_ar: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('description')}</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Packaging specifications or handling instructions..."
                                            value={packageForm.description}
                                            onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                </>
                            )}

                            {/* MOVE TYPE FIELDS */}
                            {activeTab === 'move_types' && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('code')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. RAMP_TO_RAMP"
                                                value={moveTypeForm.code}
                                                onChange={(e) => setMoveTypeForm({ ...moveTypeForm, code: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name')} *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Ramp to Ramp"
                                                value={moveTypeForm.name}
                                                onChange={(e) => setMoveTypeForm({ ...moveTypeForm, name: e.target.value })}
                                                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('name_ar')}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. من رصيف الشحن إلى رصيف الوصول"
                                            value={moveTypeForm.name_ar}
                                            onChange={(e) => setMoveTypeForm({ ...moveTypeForm, name_ar: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('description')}</label>
                                        <textarea
                                            rows={2}
                                            placeholder="Routing scope or carrier handover..."
                                            value={moveTypeForm.description}
                                            onChange={(e) => setMoveTypeForm({ ...moveTypeForm, description: e.target.value })}
                                            className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Status Selector */}
                            <div>
                                <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{t('status')}</label>
                                <select
                                    value={
                                        activeTab === 'ports' ? portForm.status :
                                        activeTab === 'warehouses' ? warehouseForm.status :
                                        activeTab === 'vessels' ? vesselForm.status :
                                        activeTab === 'incoterms' ? incotermForm.status :
                                        activeTab === 'packages' ? packageForm.status :
                                        moveTypeForm.status
                                    }
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (activeTab === 'ports') setPortForm({ ...portForm, status: val });
                                        if (activeTab === 'warehouses') setWarehouseForm({ ...warehouseForm, status: val });
                                        if (activeTab === 'vessels') setVesselForm({ ...vesselForm, status: val });
                                        if (activeTab === 'incoterms') setIncotermForm({ ...incotermForm, status: val });
                                        if (activeTab === 'packages') setPackageForm({ ...packageForm, status: val });
                                        if (activeTab === 'move_types') setMoveTypeForm({ ...moveTypeForm, status: val });
                                    }}
                                    className="w-full mt-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                >
                                    <option value="active">{t('active')}</option>
                                    <option value="inactive">{t('inactive')}</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors shadow-2xs"
                                >
                                    {editItem ? t('save') : t('create')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </AppLayout>
    );
}
