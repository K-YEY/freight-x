import React from 'react';
import { X, Printer, Ship, Plane, Truck, Building2, MapPin } from 'lucide-react';
import { useTranslation } from '../Context/LanguageContext';

export default function PrintQuotationModal({ isOpen, onClose, quotation }) {
    if (!isOpen || !quotation) return null;
    const { t } = useTranslation();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
            <div 
                className="w-full max-w-4xl bg-white text-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-neutral-200 print:border-none print:shadow-none print:rounded-none print:max-w-none print:m-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Print Controls (Hidden on Print) */}
                <div className="px-6 py-3.5 bg-neutral-900 text-white flex items-center justify-between print:hidden">
                    <div className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold tracking-tight">Printable Freight Quotation Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print / Save as PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Document Body (Printable Paper Sheet) */}
                <div className="p-8 sm:p-12 space-y-6 text-neutral-900 font-sans print:p-6 bg-white min-h-[840px]">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-6">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-black text-lg">
                                    FX
                                </div>
                                <div>
                                    <h1 className="text-lg font-black tracking-tight text-neutral-900 uppercase">
                                        Freight-X Logistics & Forwarding
                                    </h1>
                                    <p className="text-[11px] text-neutral-500">
                                        International Multimodal Transport • Customs Brokerage • Warehousing
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="text-end">
                            <span className="text-2xl font-black uppercase text-blue-600 tracking-tight">
                                FREIGHT QUOTATION
                            </span>
                            <div className="text-xs font-mono font-bold text-neutral-800 mt-1">
                                {quotation.quotation_number}
                            </div>
                            <div className="text-[11px] text-neutral-500 mt-0.5">
                                Date: {quotation.created_at ? new Date(quotation.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
                            </div>
                            <div className="text-[11px] font-semibold text-red-600 mt-0.5">
                                Valid Until: {quotation.valid_until || '14 Days from issuance'}
                            </div>
                        </div>
                    </div>

                    {/* Parties and Routing Grid */}
                    <div className="grid grid-cols-2 gap-8 text-xs border-b border-neutral-200 pb-6">
                        <div>
                            <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">
                                PREPARED FOR CLIENT:
                            </span>
                            <div className="text-sm font-bold text-neutral-900 mt-1">
                                {quotation.customer?.name}
                            </div>
                            <div className="text-neutral-600 mt-0.5 leading-relaxed">
                                {quotation.customer?.address || 'Client Address on File'}<br />
                                {quotation.customer?.city}, {quotation.customer?.country}<br />
                                {quotation.contact && `Attn: ${quotation.contact.first_name} ${quotation.contact.last_name}`}
                            </div>
                        </div>

                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Transport Mode:</span>
                                <span className="font-bold uppercase text-neutral-900">{quotation.mode} Freight ({quotation.service_type})</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Trade Term:</span>
                                <span className="font-bold text-blue-600 font-mono">{quotation.incoterm}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Origin (POL):</span>
                                <span className="font-semibold text-neutral-900">{quotation.origin_port?.code} - {quotation.origin_port?.name || 'POL'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Destination (POD):</span>
                                <span className="font-semibold text-neutral-900">{quotation.destination_port?.code} - {quotation.destination_port?.name || 'POD'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Commodity:</span>
                                <span className="font-medium text-neutral-800">{quotation.commodity || 'General Cargo'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Estimated Transit:</span>
                                <span className="font-medium text-neutral-800">{quotation.estimated_transit_days ? `${quotation.estimated_transit_days} Days` : 'Subject to line schedule'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Charge Items Table */}
                    <div>
                        <table className="w-full text-start text-xs border border-neutral-300">
                            <thead className="bg-neutral-900 text-white font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-3 py-2 text-start">Code</th>
                                    <th className="px-3 py-2 text-start">Description of Service & Charges</th>
                                    <th className="px-3 py-2 text-center">Unit Type</th>
                                    <th className="px-3 py-2 text-end">Quantity</th>
                                    <th className="px-3 py-2 text-end">Rate ({quotation.currency})</th>
                                    <th className="px-3 py-2 text-end">Amount ({quotation.currency})</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {quotation.items?.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                                        <td className="px-3 py-2.5 font-mono font-bold text-neutral-700">
                                            {item.charge_code || 'CHRG'}
                                        </td>
                                        <td className="px-3 py-2.5 font-medium text-neutral-900">
                                            {item.description}
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-neutral-500 capitalize">
                                            {item.unit_type?.replace(/_/g, ' ')}
                                        </td>
                                        <td className="px-3 py-2.5 text-end font-mono">
                                            {Number(item.quantity).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2.5 text-end font-mono">
                                            ${Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-3 py-2.5 text-end font-mono font-bold text-neutral-900">
                                            ${Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-neutral-900 bg-neutral-100 font-mono text-xs">
                                <tr>
                                    <td colSpan="5" className="px-3 py-2 text-end font-sans font-bold uppercase">
                                        Total Quotation Amount:
                                    </td>
                                    <td className="px-3 py-2 text-end font-black text-sm text-neutral-900">
                                        ${Number(quotation.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {quotation.currency}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Standard Terms & Payment */}
                    <div className="grid grid-cols-2 gap-6 pt-2 text-[11px]">
                        <div>
                            <span className="font-bold uppercase text-neutral-900 tracking-wider">Terms & Conditions:</span>
                            <div className="mt-1 text-neutral-600 whitespace-pre-line leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                                {quotation.terms_conditions || "Standard FIATA and Freight Forwarding trading terms apply."}
                            </div>
                        </div>

                        <div>
                            <span className="font-bold uppercase text-neutral-900 tracking-wider">Payment Terms:</span>
                            <div className="mt-1 text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                                {quotation.payment_terms || "Prepaid prior to document release."}
                            </div>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-12 pt-8 border-t border-neutral-300 text-xs">
                        <div>
                            <div className="text-neutral-500">Issued on behalf of Freight-X:</div>
                            <div className="mt-8 border-b border-neutral-400 w-48"></div>
                            <div className="text-[10px] text-neutral-400 mt-1">Authorized Freight Specialist Signature</div>
                        </div>

                        <div>
                            <div className="text-neutral-500">Client Acceptance (Sign & Stamp):</div>
                            <div className="mt-8 border-b border-neutral-400 w-48"></div>
                            <div className="text-[10px] text-neutral-400 mt-1">Name, Title & Date</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
