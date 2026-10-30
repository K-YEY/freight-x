import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Receipt, Plus, Trash2, ArrowUpRight, ArrowDownLeft, Building2, Ship, Calendar, Percent, DollarSign } from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';
import { useCurrency } from '../../Context/CurrencyContext';

export default function CreateInvoiceModal({ 
    isOpen, 
    onClose, 
    partners = [], 
    shipments = [], 
    defaultType = 'receivable',
    defaultShipmentId = null,
    defaultPartnerId = null 
}) {
    if (!isOpen) return null;

    const { t, isRTL } = useTranslation();
    const { currencies, currentCurrency } = useCurrency();
    const [submitting, setSubmitting] = useState(false);

    const [type, setType] = useState(defaultType); // 'receivable' | 'payable'
    const [partnerId, setPartnerId] = useState(defaultPartnerId || partners[0]?.id || '');
    const [shipmentId, setShipmentId] = useState(defaultShipmentId || '');
    const [category, setCategory] = useState(type === 'receivable' ? 'customer_billing' : 'ocean_freight');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
    const [currency, setCurrency] = useState(currentCurrency || 'USD');
    const [discountAmount, setDiscountAmount] = useState('0');
    const [notes, setNotes] = useState('');

    const [items, setItems] = useState([
        {
            description: type === 'receivable' ? 'Freight & Logistics Services' : 'Ocean Freight Charges',
            charge_code: type === 'receivable' ? 'FRT-SVC' : 'OFRT',
            quantity: 1,
            unit_price: 1500,
            tax_rate: 0,
        }
    ]);

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                description: '',
                charge_code: '',
                quantity: 1,
                unit_price: 0,
                tax_rate: 0,
            }
        ]);
    };

    const handleRemoveItem = (index) => {
        if (items.length <= 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    // Computations
    const subtotal = items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        return sum + (qty * price);
    }, 0);

    const taxAmount = items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        const taxRate = parseFloat(item.tax_rate) || 0;
        return sum + ((qty * price * taxRate) / 100);
    }, 0);

    const discount = parseFloat(discountAmount) || 0;
    const totalAmount = Math.max(0, subtotal + taxAmount - discount);

    const handleTypeChange = (newType) => {
        setType(newType);
        if (newType === 'receivable') {
            setCategory('customer_billing');
            // Suggest first client if available
            const client = partners.find(p => p.partner_type === 'customer');
            if (client) setPartnerId(client.id);
        } else {
            setCategory('ocean_freight');
            // Suggest first carrier or broker
            const vendor = partners.find(p => p.partner_type !== 'customer');
            if (vendor) setPartnerId(vendor.id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            type,
            category,
            partner_id: partnerId,
            shipment_id: shipmentId || null,
            issue_date: issueDate,
            due_date: dueDate || null,
            payment_terms: paymentTerms,
            currency,
            discount_amount: discount,
            notes,
            items: items.map(item => ({
                description: item.description || 'Logistics Charge',
                charge_code: item.charge_code || null,
                quantity: parseFloat(item.quantity) || 1,
                unit_price: parseFloat(item.unit_price) || 0,
                tax_rate: parseFloat(item.tax_rate) || 0,
            })),
        };

        router.post('/billing', payload, {
            onSuccess: () => {
                setSubmitting(false);
                onClose();
            },
            onError: (errors) => {
                setSubmitting(false);
                console.error('Invoice creation error:', errors);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
            {/* Backdrop with Blur */}
            <div 
                className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#181818]/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                            type === 'receivable' 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                {t('create_invoice_title')}
                            </h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {type === 'receivable' ? t('customer_invoice_desc') : t('vendor_bill_desc')}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Invoice Type Radio Buttons */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-100 dark:bg-[#1c1c1c] rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('receivable')}
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                type === 'receivable'
                                    ? 'bg-white dark:bg-[#252525] text-emerald-600 dark:text-emerald-400 shadow-xs border border-neutral-200/80 dark:border-neutral-700'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                            }`}
                        >
                            <ArrowDownLeft className="w-4 h-4" />
                            <span>{t('customer_invoices')}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTypeChange('payable')}
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                type === 'payable'
                                    ? 'bg-white dark:bg-[#252525] text-rose-600 dark:text-rose-400 shadow-xs border border-neutral-200/80 dark:border-neutral-700'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                            }`}
                        >
                            <ArrowUpRight className="w-4 h-4" />
                            <span>{t('vendor_bills')}</span>
                        </button>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Partner Selection */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{type === 'receivable' ? t('bill_to') : t('vendor')}</span>
                                <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={partnerId}
                                onChange={(e) => setPartnerId(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                            >
                                <option value="" disabled>-- Select Company / Partner --</option>
                                {partners.map((partner) => (
                                    <option key={partner.id} value={partner.id}>
                                        {partner.name} ({partner.partner_type || 'partner'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Linked Shipment */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                <Ship className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{t('linked_shipment')}</span>
                            </label>
                            <select
                                value={shipmentId}
                                onChange={(e) => setShipmentId(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                            >
                                <option value="">-- No Linked Shipment --</option>
                                {shipments.map((shipment) => (
                                    <option key={shipment.id} value={shipment.id}>
                                        {shipment.shipment_number} ({shipment.mode?.toUpperCase()} - {shipment.status})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                {t('invoice_category')}
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                            >
                                <option value="customer_billing">{t('customer_billing')}</option>
                                <option value="ocean_freight">{t('ocean_freight_charge')}</option>
                                <option value="air_freight">{t('air_freight_charge')}</option>
                                <option value="customs_brokerage">{t('customs_clearance_charge')}</option>
                                <option value="trucking_drayage">{t('trucking_charge')}</option>
                                <option value="port_storage">{t('port_storage_charge')}</option>
                                <option value="warehousing">{t('warehousing_charge')}</option>
                                <option value="insurance">{t('insurance_charge')}</option>
                                <option value="misc">{t('misc_charge')}</option>
                            </select>
                        </div>

                        {/* Issue Date */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{t('issue_date')}</span>
                                <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                            />
                        </div>

                        {/* Due Date */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                                <span>{t('due_date')}</span>
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                            />
                        </div>

                        {/* Payment Terms */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                {t('payment_terms')}
                            </label>
                            <input
                                type="text"
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                                placeholder="Net 30, COD, Due Upon Receipt..."
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                            />
                        </div>

                        {/* Invoice Currency */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                                <span>{t('currency') || 'Currency'}</span>
                                <span className="text-[10px] text-neutral-400 font-mono">({currency})</span>
                            </label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 font-medium"
                            >
                                {currencies.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.flag} {c.code} - {isRTL ? c.name_ar : c.name_en} ({c.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Line Items Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                                {t('line_items')}
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t('add_item')}</span>
                            </button>
                        </div>

                        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                            <table className="w-full text-start border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-[#181818]/75 text-neutral-500 dark:text-neutral-400 font-medium">
                                        <th className="py-2.5 px-3 text-start w-5/12">{t('charge_description')}</th>
                                        <th className="py-2.5 px-2 text-start w-2/12">Code</th>
                                        <th className="py-2.5 px-2 text-end w-1/12">{t('packages_count')}</th>
                                        <th className="py-2.5 px-2 text-end w-2/12">{t('unit_price')} ($)</th>
                                        <th className="py-2.5 px-2 text-end w-1/12">{t('tax_rate')}</th>
                                        <th className="py-2.5 px-3 text-end w-2/12">{t('total_due')} ($)</th>
                                        <th className="py-2.5 px-2 text-center w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70 bg-white dark:bg-[#141414]">
                                    {items.map((item, idx) => {
                                        const qty = parseFloat(item.quantity) || 0;
                                        const price = parseFloat(item.unit_price) || 0;
                                        const tax = parseFloat(item.tax_rate) || 0;
                                        const lineTotal = (qty * price) * (1 + (tax / 100));

                                        return (
                                            <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-[#181818]/50">
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                        placeholder="e.g. Ocean Freight 40ft HC, THC..."
                                                        required
                                                        className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-[#1b1b1b] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.charge_code}
                                                        onChange={(e) => handleItemChange(idx, 'charge_code', e.target.value)}
                                                        placeholder="OFRT"
                                                        className="w-full px-2 py-1.5 text-xs bg-neutral-50 dark:bg-[#1b1b1b] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 font-mono"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                                        required
                                                        className="w-full px-2 py-1.5 text-xs text-end bg-neutral-50 dark:bg-[#1b1b1b] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 font-mono"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={item.unit_price}
                                                        onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                                        required
                                                        className="w-full px-2 py-1.5 text-xs text-end bg-neutral-50 dark:bg-[#1b1b1b] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 font-mono"
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        max="100"
                                                        value={item.tax_rate}
                                                        onChange={(e) => handleItemChange(idx, 'tax_rate', e.target.value)}
                                                        className="w-full px-2 py-1.5 text-xs text-end bg-neutral-50 dark:bg-[#1b1b1b] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 font-mono"
                                                    />
                                                </td>
                                                <td className="p-2 text-end font-semibold text-neutral-900 dark:text-white font-mono">
                                                    ${lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(idx)}
                                                        disabled={items.length <= 1}
                                                        className="p-1 text-neutral-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Totals & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                {t('payment_notes')}
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                placeholder="Bank transfer instructions, BL references, customs clearance declaration notes..."
                                className="w-full p-3 text-xs bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-none"
                            />
                        </div>

                        {/* Totals Breakdown */}
                        <div className="bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2.5">
                            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                <span>{t('subtotal')}</span>
                                <span className="font-mono font-medium text-neutral-900 dark:text-white">
                                    ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                <span>{t('tax_amount')}</span>
                                <span className="font-mono font-medium text-neutral-900 dark:text-white">
                                    ${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                <span>{t('discount')} ($)</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={discountAmount}
                                    onChange={(e) => setDiscountAmount(e.target.value)}
                                    className="w-24 px-2 py-1 text-xs text-end bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-900 dark:text-neutral-100 font-mono"
                                />
                            </div>

                            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                                <span className="text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
                                    {t('total_due')}
                                </span>
                                <span className={`text-base font-bold font-mono ${
                                    type === 'receivable' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                    ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                                type === 'receivable'
                                    ? 'bg-emerald-600 hover:bg-emerald-500'
                                    : 'bg-rose-600 hover:bg-rose-500'
                            }`}
                        >
                            {submitting ? t('saving') : t('new_invoice')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
