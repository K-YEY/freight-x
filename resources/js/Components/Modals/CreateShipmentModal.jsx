import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Ship, Plane, Truck, Anchor, Calendar, FileText, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function CreateShipmentModal({ 
    isOpen, 
    onClose, 
    clients = [], 
    carriers = [], 
    ports = [], 
    warehouses = [], 
    vessels = [], 
    incoterms = [],
    packageTypes = [],
    moveTypes = [],
    customsBrokers = [], 
    truckers = [] 
}) {
    if (!isOpen) return null;

    const { t, isRTL } = useTranslation();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        mode: 'sea',
        service_type: 'fcl',
        direction: 'import',
        customer_id: clients[0]?.id || '',
        carrier_id: carriers[0]?.id || '',
        customs_broker_id: customsBrokers[0]?.id || '',
        trucker_id: truckers[0]?.id || '',
        origin_port_id: ports[0]?.id || '',
        destination_port_id: ports[1]?.id || '',
        vessel_id: vessels[0]?.id || '',
        incoterm: 'FOB',
        move_type: 'Port-to-Port',
        commodity: '',
        container_numbers: '',
        total_packages: '100',
        package_type: 'carton',
        total_gross_weight_kg: '15000',
        total_volume_cbm: '68',
        etd: '',
        eta: '',
        notes: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleModeSelect = (selectedMode) => {
        let defaultService = 'fcl';
        if (selectedMode === 'air') defaultService = 'air_standard';
        if (selectedMode === 'land') defaultService = 'ftl';

        setForm((prev) => ({ 
            ...prev, 
            mode: selectedMode,
            service_type: defaultService
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/shipments', form, {
            onSuccess: () => {
                setSubmitting(false);
                onClose();
            },
            onError: (err) => {
                console.error(err);
                setSubmitting(false);
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-backdrop">
            <div 
                className="w-full max-w-2xl glass-drawer rounded-2xl shadow-2xl border border-neutral-200/90 dark:border-neutral-700/70 overflow-hidden animate-fade-in-scale max-h-[92vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                            {form.mode === 'sea' && <Ship className="w-5 h-5" />}
                            {form.mode === 'air' && <Plane className="w-5 h-5" />}
                            {form.mode === 'land' && <Truck className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                {t('new_shipment')}
                            </h3>
                            <p className="text-xs text-neutral-400">
                                {isRTL ? 'إضافة شحنة بحرية، جوية، أو برية مع التتبع والفواتير' : 'Create a sea, air, or road shipment with multi-modal tracking'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
                    
                    {/* Mode Selector Tabs */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                            {t('mode')}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleModeSelect('sea')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                    form.mode === 'sea'
                                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-2xs'
                                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                                }`}
                            >
                                <Ship className="w-4 h-4" />
                                <span>{t('sea')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleModeSelect('air')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                    form.mode === 'air'
                                        ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 shadow-2xs'
                                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                                }`}
                            >
                                <Plane className="w-4 h-4" />
                                <span>{t('air')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleModeSelect('land')}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                    form.mode === 'land'
                                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-2xs'
                                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                                }`}
                            >
                                <Truck className="w-4 h-4" />
                                <span>{t('land')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Section 1: Customer & Carrier */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {isRTL ? 'العميل المستورد/المصدر *' : 'Customer Account *'}
                            </label>
                            <select
                                name="customer_id"
                                value={form.customer_id}
                                onChange={handleChange}
                                required
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('carrier_line')}
                            </label>
                            <select
                                name="carrier_id"
                                value={form.carrier_id}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                <option value="">— {isRTL ? 'اختر الخط الملاحي / شركة الطيران' : 'Select Carrier'} —</option>
                                {carriers.map((car) => (
                                    <option key={car.id} value={car.id}>{car.name} ({car.code || car.partner_type})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section 2: Origin & Destination Ports */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    {t('origin_port')}
                                </label>
                                <a href="/master-data?tab=ports" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                                    + {t('new_port') || 'Add Port'}
                                </a>
                            </div>
                            <select
                                name="origin_port_id"
                                value={form.origin_port_id}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                <option value="">— {isRTL ? 'اختر ميناء / مطار الشحن' : 'Select Origin'} —</option>
                                {ports.map((p) => (
                                    <option key={p.id} value={p.id}>[{p.code}] {p.name} ({p.country})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    {t('destination_port')}
                                </label>
                                <a href="/master-data?tab=ports" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                                    + {t('new_port') || 'Add Port'}
                                </a>
                            </div>
                            <select
                                name="destination_port_id"
                                value={form.destination_port_id}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                <option value="">— {isRTL ? 'اختر ميناء / مطار الوصول' : 'Select Destination'} —</option>
                                {ports.map((p) => (
                                    <option key={p.id} value={p.id}>[{p.code}] {p.name} ({p.country})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section 2.5: Vessel Selection (for Sea Freight) */}
                    {form.mode === 'sea' && (
                        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                    <Ship className="w-3.5 h-3.5 text-blue-500" />
                                    <span>{t('vessel')} ({t('vessels_fleet')})</span>
                                </label>
                                <a href="/master-data?tab=vessels" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline">
                                    + {t('new_vessel') || 'Add Vessel'}
                                </a>
                            </div>
                            <select
                                name="vessel_id"
                                value={form.vessel_id}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400 font-semibold"
                            >
                                <option value="">— {isRTL ? 'اختر السفينة الناقلة' : 'Select Vessel'} —</option>
                                {vessels.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name} {v.imo_number ? `(IMO: ${v.imo_number})` : ''} {v.carrier ? `• ${v.carrier.name}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Section 3: Incoterm, Move Type & Service */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('service_type')}
                            </label>
                            <select
                                name="service_type"
                                value={form.service_type}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                {form.mode === 'sea' && (
                                    <>
                                        <option value="fcl">{t('fcl')}</option>
                                        <option value="lcl">{t('lcl')}</option>
                                    </>
                                )}
                                {form.mode === 'air' && (
                                    <>
                                        <option value="air_standard">{t('air_standard')}</option>
                                        <option value="air_express">{t('air_express')}</option>
                                    </>
                                )}
                                {form.mode === 'land' && (
                                    <>
                                        <option value="ftl">{t('ftl')}</option>
                                        <option value="ltl">{t('ltl')}</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    {t('incoterm')}
                                </label>
                                <a href="/master-data?tab=incoterms" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                                    + {t('new_incoterm') || 'Add'}
                                </a>
                            </div>
                            <select
                                name="incoterm"
                                value={form.incoterm}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400 font-semibold"
                            >
                                {incoterms.length > 0 ? (
                                    incoterms.map((inc) => (
                                        <option key={inc.id || inc.code} value={inc.code}>
                                            {inc.code} - {isRTL ? (inc.name_ar || inc.name) : inc.name}
                                        </option>
                                    ))
                                ) : (
                                    ['FOB', 'CIF', 'EXW', 'CFR', 'DDP', 'DAP', 'FCA', 'CPT', 'CIP', 'DPU'].map((inc) => (
                                        <option key={inc} value={inc}>{inc}</option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    {t('move_type')}
                                </label>
                                <a href="/master-data?tab=move_types" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                                    + {t('new_move_type') || 'Add'}
                                </a>
                            </div>
                            <select
                                name="move_type"
                                value={form.move_type}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                {moveTypes.length > 0 ? (
                                    moveTypes.map((mt) => (
                                        <option key={mt.id || mt.code} value={mt.code}>
                                            {isRTL ? (mt.name_ar || mt.name) : mt.name}
                                        </option>
                                    ))
                                ) : (
                                    ['Port-to-Port', 'Door-to-Door', 'Door-to-Port', 'Port-to-Door', 'Airport-to-Airport', 'CFS-to-CFS', 'CFS-to-Door'].map((mt) => (
                                        <option key={mt} value={mt}>{mt}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Section 4: Commodity & Container Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('commodity')}
                            </label>
                            <input
                                type="text"
                                name="commodity"
                                value={form.commodity}
                                onChange={handleChange}
                                placeholder="e.g. Smart Solar Inverters / Garments"
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {isRTL ? 'أرقام الحاويات (مفصولة بفاصلة)' : 'Container Numbers (comma-separated)'}
                            </label>
                            <input
                                type="text"
                                name="container_numbers"
                                value={form.container_numbers}
                                onChange={handleChange}
                                placeholder="MSCU9876543, MSCU9876544"
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400 uppercase font-mono"
                            />
                        </div>
                    </div>

                    {/* Section 4.5: Packages & Packaging */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('packages_count')}
                            </label>
                            <input
                                type="number"
                                name="total_packages"
                                value={form.total_packages}
                                onChange={handleChange}
                                placeholder="100"
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                    {t('package_types')}
                                </label>
                                <a href="/master-data?tab=packages" target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                                    + {t('new_package_type') || 'Add'}
                                </a>
                            </div>
                            <select
                                name="package_type"
                                value={form.package_type}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                {packageTypes.length > 0 ? (
                                    packageTypes.map((pkg) => (
                                        <option key={pkg.id || pkg.code} value={pkg.code}>
                                            {isRTL ? (pkg.name_ar || pkg.name) : pkg.name} ({pkg.code})
                                        </option>
                                    ))
                                ) : (
                                    ['carton', 'pallet', 'crate', 'drum', 'bag', 'ibc_tote', 'roll'].map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Section 5: Weights & Dates */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('gross_weight')}
                            </label>
                            <input
                                type="number"
                                name="total_gross_weight_kg"
                                value={form.total_gross_weight_kg}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('volume_cbm')}
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                name="total_volume_cbm"
                                value={form.total_volume_cbm}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('etd_label')} (المغادرة)
                            </label>
                            <input
                                type="date"
                                name="etd"
                                value={form.etd}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('eta_label')} (الوصول)
                            </label>
                            <input
                                type="date"
                                name="eta"
                                value={form.eta}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            />
                        </div>
                    </div>

                    {/* Section 6: Partners */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('customs_broker')}
                            </label>
                            <select
                                name="customs_broker_id"
                                value={form.customs_broker_id}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                <option value="">— {isRTL ? 'اختر المخلص الجمركي (اختياري)' : 'Optional Customs Broker'} —</option>
                                {customsBrokers.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {t('trucker')}
                            </label>
                            <select
                                name="trucker_id"
                                value={form.trucker_id}
                                onChange={handleChange}
                                className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                            >
                                <option value="">— {isRTL ? 'اختر شركة النقل البري (اختياري)' : 'Optional Trucking Partner'} —</option>
                                {truckers.map((tr) => (
                                    <option key={tr.id} value={tr.id}>{tr.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            {t('notes')}
                        </label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Special shipping instructions, customs exemptions, or B/L release remarks..."
                            className="w-full text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] text-neutral-900 dark:text-neutral-100 px-3 py-2 focus:outline-none focus:border-neutral-400"
                        />
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 transition-colors shadow-2xs disabled:opacity-50"
                    >
                        {submitting ? t('creating') : t('create')}
                    </button>
                </div>
            </div>
        </div>
    );
}
