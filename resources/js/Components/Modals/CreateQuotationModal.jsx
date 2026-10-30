import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Ship, Plane, Truck, Plus, Trash2, Calendar, DollarSign, Calculator, FileText, Check } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';
import { useCurrency } from '../../Context/CurrencyContext';

export default function CreateQuotationModal({ 
    isOpen, 
    onClose, 
    clients = [], 
    ports = [], 
    incoterms = [] 
}) {
    if (!isOpen) return null;

    const { t, isRTL } = useTranslation();
    const { currencies, currentCurrency } = useCurrency();
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        customer_id: clients[0]?.id || '',
        contact_id: '',
        mode: 'sea',
        service_type: 'fcl',
        incoterm: 'CIF',
        origin_port_id: ports[0]?.id || '',
        destination_port_id: ports[1]?.id || '',
        commodity: '',
        estimated_transit_days: 20,
        cargo_ready_date: '',
        valid_until: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        currency: currentCurrency || 'USD',
        payment_terms: '50% on Booking, 50% upon OBL Release',
        terms_conditions: "1. Rates are subject to bunker & local surcharges at time of shipping.\n2. Demurrage free time: 14 days at POD.\n3. Quote validity is subject to space & equipment availability.",
        notes: '',
        status: 'draft',
        items: [
            {
                charge_code: 'OFRT',
                description: 'Ocean Freight 40ft High Cube',
                category: 'ocean_freight',
                unit_type: 'per_container',
                quantity: 1,
                unit_price: 2400,
                tax_rate: 0,
            },
            {
                charge_code: 'THC',
                description: 'Terminal Handling Charges (Origin)',
                category: 'origin_charges',
                unit_type: 'per_container',
                quantity: 1,
                unit_price: 200,
                tax_rate: 0,
            },
            {
                charge_code: 'DOC',
                description: 'Bill of Lading Documentation Fee',
                category: 'documentation',
                unit_type: 'per_bl',
                quantity: 1,
                unit_price: 75,
                tax_rate: 0,
            }
        ],
    });

    const handleModeSelect = (selectedMode) => {
        let defaultService = 'fcl';
        let defaultCharge = 'Ocean Freight 40ft HC';
        let defaultCode = 'OFRT';
        let defaultCategory = 'ocean_freight';

        if (selectedMode === 'air') {
            defaultService = 'air_standard';
            defaultCharge = 'Air Freight per Chargeable KG';
            defaultCode = 'AFRT';
            defaultCategory = 'air_freight';
        } else if (selectedMode === 'land') {
            defaultService = 'ftl';
            defaultCharge = 'Inland Trucking Full Trailer';
            defaultCode = 'TRK';
            defaultCategory = 'trucking';
        }

        setForm((prev) => ({ 
            ...prev, 
            mode: selectedMode,
            service_type: defaultService,
            items: [
                {
                    charge_code: defaultCode,
                    description: defaultCharge,
                    category: defaultCategory,
                    unit_type: selectedMode === 'air' ? 'per_kg' : 'per_container',
                    quantity: selectedMode === 'air' ? 500 : 1,
                    unit_price: selectedMode === 'air' ? 4.5 : 2200,
                    tax_rate: 0,
                }
            ]
        }));
    };

    const handleItemChange = (index, field, value) => {
        setForm((prev) => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const handleAddItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    charge_code: 'MISC',
                    description: 'Customs & Handling Surcharge',
                    category: 'customs',
                    unit_type: 'per_shipment',
                    quantity: 1,
                    unit_price: 150,
                    tax_rate: 0,
                }
            ]
        }));
    };

    const handleRemoveItem = (index) => {
        if (form.items.length <= 1) return;
        setForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const subtotal = form.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0);
    const taxTotal = form.items.reduce((sum, item) => {
        const itemTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);
        return sum + (itemTotal * Number(item.tax_rate || 0)) / 100;
    }, 0);
    const grandTotal = subtotal + taxTotal;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post('/quotations', form, {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal-backdrop overflow-y-auto">
            <div 
                className="w-full max-w-4xl glass-drawer rounded-2xl shadow-2xl border border-neutral-200/90 dark:border-neutral-700/70 overflow-hidden animate-fade-in-scale max-h-[92vh] flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/60">
                            {form.mode === 'sea' && <Ship className="w-5 h-5" />}
                            {form.mode === 'air' && <Plane className="w-5 h-5" />}
                            {form.mode === 'land' && <Truck className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                {t('new_quotation')}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Create an official freight quotation with breakdown charges
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Mode Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-2">
                            {t('mode')}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'sea', label: t('sea'), icon: Ship },
                                { id: 'air', label: t('air'), icon: Plane },
                                { id: 'land', label: t('land'), icon: Truck },
                            ].map((m) => {
                                const Icon = m.icon;
                                const isSelected = form.mode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => handleModeSelect(m.id)}
                                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                                            isSelected 
                                                ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700 shadow-2xs' 
                                                : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Customer & Route Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('customer')} *
                            </label>
                            <select
                                required
                                value={form.customer_id}
                                onChange={(e) => setForm((p) => ({ ...p, customer_id: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Customer...</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.city || c.country || 'Client'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('service_type')}
                            </label>
                            <select
                                value={form.service_type}
                                onChange={(e) => setForm((p) => ({ ...p, service_type: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('incoterm')}
                            </label>
                            <select
                                value={form.incoterm}
                                onChange={(e) => setForm((p) => ({ ...p, incoterm: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold"
                            >
                                {incoterms.length > 0 ? (
                                    incoterms.map((inc) => (
                                        <option key={inc.id} value={inc.code}>
                                            {inc.code} - {inc.name}
                                        </option>
                                    ))
                                ) : (
                                    ['CIF', 'FOB', 'CFR', 'EXW', 'DDP', 'DAP', 'FCA'].map((inc) => (
                                        <option key={inc} value={inc}>{inc}</option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Routing Ports */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('origin_port')}
                            </label>
                            <select
                                value={form.origin_port_id}
                                onChange={(e) => setForm((p) => ({ ...p, origin_port_id: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Origin...</option>
                                {ports.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.code} - {p.name} ({p.country})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('destination_port')}
                            </label>
                            <select
                                value={form.destination_port_id}
                                onChange={(e) => setForm((p) => ({ ...p, destination_port_id: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Destination...</option>
                                {ports.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.code} - {p.name} ({p.country})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Commodity, Dates & Validity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('commodity')}
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Solar panels, Auto parts, Pharmaceuticals..."
                                value={form.commodity}
                                onChange={(e) => setForm((p) => ({ ...p, commodity: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('estimated_transit')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 18"
                                value={form.estimated_transit_days}
                                onChange={(e) => setForm((p) => ({ ...p, estimated_transit_days: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('valid_until')}
                            </label>
                            <input
                                type="date"
                                value={form.valid_until}
                                onChange={(e) => setForm((p) => ({ ...p, valid_until: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                {t('currency') || 'Currency'}
                            </label>
                            <select
                                value={form.currency}
                                onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                {currencies.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.flag} {c.code} ({c.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Breakdown Line Items Section */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-2.5">
                            <div>
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    Quotation Charge Items
                                </h4>
                                <p className="text-[11px] text-neutral-400">
                                    Itemize freight rates, origin/destination charges, customs, and trucking
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Charge</span>
                            </button>
                        </div>

                        <div className="space-y-2 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-neutral-50/60 dark:bg-neutral-900/40">
                            {form.items.map((item, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-2xs">
                                    <input
                                        type="text"
                                        placeholder="Charge Code (e.g. OFRT)"
                                        value={item.charge_code}
                                        onChange={(e) => handleItemChange(idx, 'charge_code', e.target.value)}
                                        className="w-full sm:w-24 text-[11px] font-mono font-bold uppercase rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-neutral-900 dark:text-neutral-100"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                        className="w-full sm:flex-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100"
                                    />
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="w-20">
                                            <input
                                                type="number"
                                                min="0.1"
                                                step="any"
                                                placeholder="Qty"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                className="w-full text-xs text-end font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                placeholder="Rate ($)"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                                className="w-full text-xs text-end font-mono font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-2 py-1.5 text-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>
                                        <div className="w-24 text-end font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                            ${((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString()}
                                        </div>
                                        <button
                                            type="button"
                                            disabled={form.items.length <= 1}
                                            onClick={() => handleRemoveItem(idx)}
                                            className="p-1.5 text-neutral-400 hover:text-red-500 rounded-md transition-colors disabled:opacity-30"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Summary Bar */}
                            <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                <div className="text-end space-y-1">
                                    <div className="text-xs text-neutral-500">
                                        Subtotal: <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                                        Grand Total: ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {form.currency}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Terms & Conditions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                Payment Terms
                            </label>
                            <input
                                type="text"
                                value={form.payment_terms}
                                onChange={(e) => setForm((p) => ({ ...p, payment_terms: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
                                Initial Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                                className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="sent">Sent to Customer</option>
                                <option value="accepted">Accepted (Ready to convert)</option>
                            </select>
                        </div>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        {t('cancel') || 'Cancel'}
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <Check className="w-4 h-4" />
                        <span>{submitting ? 'Creating...' : 'Create Quotation'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
