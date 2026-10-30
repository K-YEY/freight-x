import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Printer, ArrowLeft, Edit3, Check, X, 
    Ship, Anchor, ShieldCheck, MapPin, Building2 
} from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function BillOfLading({ shipment }) {
    const { t, isRTL } = useTranslation();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        hbl_number: shipment.hbl_number || `HBL-${shipment.shipment_number}`,
        mbl_number: shipment.mbl_number || '',
        bl_type: shipment.bl_type || 'house',
        freight_term: shipment.freight_term || 'Prepaid',
        shipper_name: shipment.shipper_name || shipment.shipper?.name || 'Shipper / Supplier Name',
        shipper_address: shipment.shipper_address || shipment.shipper?.address || `${shipment.origin_port?.city || ''}, ${shipment.origin_port?.country || ''}`,
        consignee_name: shipment.consignee_name || shipment.consignee?.name || shipment.customer?.name || 'Consignee / Importer Name',
        consignee_address: shipment.consignee_address || shipment.consignee?.address || shipment.customer?.address || `${shipment.destination_port?.city || ''}, ${shipment.destination_port?.country || ''}`,
        notify_party_name: shipment.notify_party_name || shipment.notify_party?.name || 'SAME AS CONSIGNEE',
        notify_party_address: shipment.notify_party_address || shipment.notify_party?.address || '',
        place_of_receipt: shipment.place_of_receipt || shipment.origin_port?.name || '',
        place_of_delivery: shipment.place_of_delivery || shipment.destination_port?.name || '',
        bl_issue_place: shipment.bl_issue_place || shipment.origin_port?.city || 'Alexandria',
        bl_issue_date: shipment.bl_issue_date || shipment.atd || shipment.etd || new Date().toISOString().split('T')[0],
        marks_and_numbers: shipment.marks_and_numbers || shipment.containers?.map(c => `${c.container_number} / SEAL: ${c.seal_number || 'TBA'}`).join('\n') || 'N/M (NO MARKS)',
        cargo_description: shipment.cargo_description || shipment.commodity || 'GENERAL CARGO STC',
    });

    const handleSave = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.patch(`/shipments/${shipment.id}/bl`, form, {
            onSuccess: () => {
                setSubmitting(false);
                setEditModalOpen(false);
            },
            onError: () => setSubmitting(false),
        });
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-[#0c0c0c] text-neutral-900 font-sans p-4 sm:p-8 print:p-0 print:bg-white print:text-black">
            <Head title={`Bill of Lading - ${form.hbl_number}`} />

            {/* Top Toolbar (Hidden on Print) */}
            <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href="/shipments"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('back_to_shipments') || 'Back to Shipments'}</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs cursor-pointer"
                    >
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        <span>{t('edit_bl_details') || 'Edit B/L Details'}</span>
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm cursor-pointer"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{t('print_bl') || 'Print Bill of Lading (PDF)'}</span>
                    </button>
                </div>
            </div>

            {/* Printable Standard B/L Sheet (A4 Dimensions) */}
            <div className="max-w-5xl mx-auto bg-white text-neutral-900 shadow-xl border border-neutral-300 print:border-none print:shadow-none print:max-w-none print:m-0 print:p-0">
                <div className="p-8 print:p-6 space-y-0 text-xs">
                    
                    {/* B/L Header Box */}
                    <div className="grid grid-cols-2 border-2 border-neutral-900">
                        {/* Company Brand */}
                        <div className="p-4 border-e-2 border-neutral-900 flex items-start gap-3">
                            <div className="w-12 h-12 bg-neutral-900 text-white rounded flex items-center justify-center font-black text-xl shrink-0">
                                FX
                            </div>
                            <div>
                                <h1 className="text-base font-black tracking-tight uppercase">
                                    Freight-X Forwarding & Logistics
                                </h1>
                                <p className="text-[10px] text-neutral-600 leading-tight">
                                    Multimodal Transport Operator • FIATA Registered Agent<br />
                                    Head Office: Logistics City Tower, Floor 8<br />
                                    Email: operations@freightx.com • Web: www.freightx.com
                                </p>
                            </div>
                        </div>

                        {/* Document Title & Reference Numbers */}
                        <div className="p-4 flex flex-col justify-between bg-neutral-50/70">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-sm font-black tracking-tight uppercase text-neutral-900">
                                        HOUSE BILL OF LADING
                                    </h2>
                                    <p className="text-[9px] uppercase tracking-wider text-neutral-500">
                                        Multimodal Transport or Port-to-Port
                                    </p>
                                </div>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-400 font-bold uppercase">
                                    ORIGINAL 1 OF 3
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-300 text-[11px] font-mono">
                                <div>
                                    <span className="text-[9px] text-neutral-500 block uppercase font-sans">B/L Number:</span>
                                    <span className="font-bold text-neutral-900">{form.hbl_number}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-neutral-500 block uppercase font-sans">Booking Ref #:</span>
                                    <span className="font-bold text-neutral-900">{shipment.booking_number || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-neutral-500 block uppercase font-sans">Master B/L #:</span>
                                    <span className="text-neutral-700">{form.mbl_number || 'ON FILE'}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-neutral-500 block uppercase font-sans">Carrier / Line:</span>
                                    <span className="text-neutral-700">{shipment.carrier?.name || 'Ocean Carrier'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parties Section (Shipper, Consignee, Notify) */}
                    <div className="grid grid-cols-2 border-x-2 border-b-2 border-neutral-900">
                        {/* Shipper */}
                        <div className="p-3 border-e-2 border-neutral-900 min-h-[95px]">
                            <span className="text-[9px] font-bold uppercase text-neutral-500 block">
                                1. SHIPPER / EXPORTER (Full Name and Address)
                            </span>
                            <div className="font-bold text-neutral-900 text-xs mt-1">
                                {form.shipper_name}
                            </div>
                            <div className="text-[11px] text-neutral-700 whitespace-pre-line mt-0.5">
                                {form.shipper_address}
                            </div>
                        </div>

                        {/* Consignee */}
                        <div className="p-3 min-h-[95px]">
                            <span className="text-[9px] font-bold uppercase text-neutral-500 block">
                                2. CONSIGNEE (Full Name and Address or "To Order")
                            </span>
                            <div className="font-bold text-neutral-900 text-xs mt-1">
                                {form.consignee_name}
                            </div>
                            <div className="text-[11px] text-neutral-700 whitespace-pre-line mt-0.5">
                                {form.consignee_address}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 border-x-2 border-b-2 border-neutral-900">
                        {/* Notify Party */}
                        <div className="p-3 border-e-2 border-neutral-900 min-h-[85px]">
                            <span className="text-[9px] font-bold uppercase text-neutral-500 block">
                                3. NOTIFY PARTY / INTERMEDIARY (Carrier has no liability for failure to notify)
                            </span>
                            <div className="font-bold text-neutral-900 text-xs mt-1">
                                {form.notify_party_name}
                            </div>
                            <div className="text-[11px] text-neutral-700 whitespace-pre-line mt-0.5">
                                {form.notify_party_address}
                            </div>
                        </div>

                        {/* Routing & Instructions */}
                        <div className="p-3 bg-neutral-50/50">
                            <span className="text-[9px] font-bold uppercase text-neutral-500 block">
                                4. FOR DELIVERY OF GOODS APPLY TO / DESTINATION AGENT:
                            </span>
                            <div className="font-bold text-neutral-900 text-xs mt-1">
                                Freight-X Overseas Discharge Agency
                            </div>
                            <div className="text-[11px] text-neutral-600 mt-0.5">
                                Port Terminal Agent • Dekheila/Sokhna Liaison Office<br />
                                Tel: +20 3 488 9900 • Email: release@freightx.com
                            </div>
                        </div>
                    </div>

                    {/* Vessel, Ports, Receipt & Delivery Grid */}
                    <div className="grid grid-cols-4 border-x-2 border-b-2 border-neutral-900 text-[11px]">
                        <div className="p-2.5 border-e border-neutral-900">
                            <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Pre-Carriage by</span>
                            <span className="font-semibold text-neutral-800">Inland Feed / Truck</span>
                        </div>
                        <div className="p-2.5 border-e-2 border-neutral-900">
                            <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Place of Receipt</span>
                            <span className="font-semibold text-neutral-800">{form.place_of_receipt || shipment.origin_port?.name}</span>
                        </div>
                        <div className="p-2.5 border-e border-neutral-900">
                            <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Ocean Vessel & Voyage #</span>
                            <span className="font-bold text-neutral-900">
                                {shipment.vessel?.name || 'Vessel TBA'} {shipment.voyage_flight_number ? `• ${shipment.voyage_flight_number}` : ''}
                            </span>
                        </div>
                        <div className="p-2.5">
                            <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Port of Loading (POL)</span>
                            <span className="font-bold text-neutral-900">{shipment.origin_port?.code} - {shipment.origin_port?.name}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 border-x-2 border-b-2 border-neutral-900 text-[11px]">
                        <div className="p-2.5 border-e-2 border-neutral-900">
                            <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Port of Discharge (POD)</span>
                            <span className="font-bold text-neutral-900">{shipment.destination_port?.code} - {shipment.destination_port?.name}</span>
                        </div>
                        <div className="p-2.5">
                            <span className="text-[9px] text-neutral-500 uppercase block font-semibold">Place of Delivery</span>
                            <span className="font-bold text-neutral-900">{form.place_of_delivery || shipment.destination_port?.name}</span>
                        </div>
                    </div>

                    {/* Central Cargo Grid (Marks, Containers, Packages, Description, Weight, Volume) */}
                    <div className="border-x-2 border-b-2 border-neutral-900">
                        <table className="w-full text-start text-[11px]">
                            <thead className="bg-neutral-100 border-b-2 border-neutral-900 text-[9px] uppercase font-black tracking-wider">
                                <tr>
                                    <th className="p-2.5 text-start w-1/4 border-e border-neutral-900">
                                        Container Nos / Seal Nos<br />Marks & Numbers
                                    </th>
                                    <th className="p-2.5 text-start w-1/6 border-e border-neutral-900">
                                        No. & Kind of<br />Packages
                                    </th>
                                    <th className="p-2.5 text-start w-5/12 border-e border-neutral-900">
                                        Description of Goods & Merchandise<br />(Said to Contain - STC)
                                    </th>
                                    <th className="p-2.5 text-end w-1/12 border-e border-neutral-900">
                                        Gross Wt<br />(KGS)
                                    </th>
                                    <th className="p-2.5 text-end w-1/12">
                                        Measurement<br />(CBM)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 min-h-[220px]">
                                <tr className="align-top">
                                    {/* Containers & Marks */}
                                    <td className="p-3 border-e border-neutral-900 font-mono text-[11px] leading-relaxed">
                                        {shipment.containers?.length > 0 ? (
                                            shipment.containers.map((c, i) => (
                                                <div key={i} className="mb-2">
                                                    <span className="font-bold text-neutral-900">{c.container_number}</span>
                                                    <div className="text-[10px] text-neutral-500">
                                                        SEAL: {c.seal_number || 'TBA'} ({c.type})
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="whitespace-pre-line">{form.marks_and_numbers}</div>
                                        )}
                                    </td>

                                    {/* Packages */}
                                    <td className="p-3 border-e border-neutral-900">
                                        <span className="font-bold text-neutral-900">
                                            {shipment.total_packages ? `${shipment.total_packages} ${shipment.package_type || 'PKGS'}` : '1 FCL Container'}
                                        </span>
                                    </td>

                                    {/* Cargo Description */}
                                    <td className="p-3 border-e border-neutral-900 space-y-2">
                                        <div className="font-bold text-neutral-900 uppercase">
                                            {form.cargo_description}
                                        </div>
                                        {shipment.hs_code && (
                                            <div className="text-[10px] text-neutral-500 font-mono">
                                                HS CODE: {shipment.hs_code}
                                            </div>
                                        )}
                                        <div className="text-[10px] text-neutral-500 italic mt-3">
                                            "Shipper's load, stow, and count. Said to contain."<br />
                                            CLEAN ON BOARD • FREIGHT AS PER AGREEMENT
                                        </div>
                                    </td>

                                    {/* Gross Weight */}
                                    <td className="p-3 text-end border-e border-neutral-900 font-mono font-bold">
                                        {Number(shipment.total_gross_weight_kg || 24000).toLocaleString()} KG
                                    </td>

                                    {/* Measurement */}
                                    <td className="p-3 text-end font-mono font-bold">
                                        {Number(shipment.total_volume_cbm || 68).toFixed(2)} CBM
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Clauses, Freight Term, Signatures */}
                    <div className="grid grid-cols-3 border-x-2 border-b-2 border-neutral-900 text-[11px]">
                        <div className="p-3 border-e-2 border-neutral-900">
                            <span className="text-[9px] font-bold uppercase text-neutral-500 block">
                                FREIGHT & CHARGES:
                            </span>
                            <div className="text-sm font-black uppercase text-blue-600 font-mono mt-1">
                                {form.freight_term === 'Prepaid' ? 'FREIGHT PREPAID' : 'FREIGHT COLLECT'}
                            </div>
                            <div className="text-[10px] text-neutral-500 mt-1">
                                Payable at: {form.freight_term === 'Prepaid' ? 'ORIGIN' : 'DESTINATION'}
                            </div>
                        </div>

                        <div className="p-3 border-e-2 border-neutral-900">
                            <span className="text-[9px] font-bold uppercase text-neutral-500 block">
                                PLACE & DATE OF ISSUE:
                            </span>
                            <div className="font-bold text-neutral-900 mt-1">
                                {form.bl_issue_place}, {form.bl_issue_date}
                            </div>
                            <div className="text-[10px] text-neutral-500 mt-1">
                                Number of Originals: 3 (THREE)
                            </div>
                        </div>

                        <div className="p-3 bg-neutral-50/50 flex flex-col justify-between">
                            <span className="text-[9px] font-bold uppercase text-neutral-500 block">
                                SIGNED AS AGENT FOR THE CARRIER:
                            </span>
                            <div className="mt-8 border-b-2 border-neutral-900"></div>
                            <div className="text-[9px] text-center text-neutral-500 uppercase mt-1">
                                FREIGHT-X LOGISTICS (AS AGENT)
                            </div>
                        </div>
                    </div>

                    {/* Legal Footer Note */}
                    <div className="pt-2 text-[8px] text-neutral-400 text-center uppercase tracking-tight">
                        Subject to the Standard Conditions of Multimodal Transport and Bill of Lading clauses printed on reverse.
                    </div>
                </div>
            </div>

            {/* Edit Modal (Hidden on Print) */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 my-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                Edit Bill of Lading (HBL) Information
                            </h3>
                            <button onClick={() => setEditModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">House B/L #</label>
                                    <input
                                        type="text"
                                        value={form.hbl_number}
                                        onChange={(e) => setForm({ ...form, hbl_number: e.target.value })}
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">Freight Term</label>
                                    <select
                                        value={form.freight_term}
                                        onChange={(e) => setForm({ ...form, freight_term: e.target.value })}
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100"
                                    >
                                        <option value="Prepaid">Prepaid</option>
                                        <option value="Collect">Collect</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">Shipper Name</label>
                                    <input
                                        type="text"
                                        value={form.shipper_name}
                                        onChange={(e) => setForm({ ...form, shipper_name: e.target.value })}
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">Consignee Name</label>
                                    <input
                                        type="text"
                                        value={form.consignee_name}
                                        onChange={(e) => setForm({ ...form, consignee_name: e.target.value })}
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">Shipper Address</label>
                                    <textarea
                                        rows="2"
                                        value={form.shipper_address}
                                        onChange={(e) => setForm({ ...form, shipper_address: e.target.value })}
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">Consignee Address</label>
                                    <textarea
                                        rows="2"
                                        value={form.consignee_address}
                                        onChange={(e) => setForm({ ...form, consignee_address: e.target.value })}
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">Issue Place</label>
                                    <input
                                        type="text"
                                        value={form.bl_issue_place}
                                        onChange={(e) => setForm({ ...form, bl_issue_place: e.target.value })}
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">Issue Date</label>
                                    <input
                                        type="date"
                                        value={form.bl_issue_date}
                                        onChange={(e) => setForm({ ...form, bl_issue_date: e.target.value })}
                                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-600 dark:text-neutral-300 mb-1 font-semibold">Description of Goods</label>
                                <textarea
                                    rows="2"
                                    value={form.cargo_description}
                                    onChange={(e) => setForm({ ...form, cargo_description: e.target.value })}
                                    className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-neutral-900 dark:text-neutral-100"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
                                >
                                    {submitting ? 'Saving...' : 'Save B/L Details'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
