import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Printer, ArrowLeft, Globe, Building2, Anchor, 
    FileText, CheckCircle2, ShieldCheck, DollarSign 
} from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function AgentDebitNote({ shipment }) {
    const { t, isRTL } = useTranslation();

    const isDebit = shipment.agent_debit_credit_type === 'debit';
    const noteTypeTitle = isDebit ? 'DEBIT NOTE' : 'CREDIT NOTE';
    const noteTypeTitleAr = isDebit ? 'إشعار مدين (مطالبة حصة أرباح)' : 'إشعار دائن (استحقاق أرباح)';
    const agent = shipment.overseas_agent || {
        name: 'Overseas Partner Agent',
        code: 'AGENT-INTL',
        city: 'Global Port',
        country: 'International',
    };

    const currency = shipment.currency || 'USD';
    const grossProfit = parseFloat(shipment.gross_profit || 0);
    const sharePercent = parseFloat(shipment.agent_share_percentage || 50);
    const shareAmount = parseFloat(shipment.agent_profit_share_amount || (grossProfit * (sharePercent / 100)));

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-[#0c0c0c] text-neutral-900 font-sans p-4 sm:p-8 print:p-0 print:bg-white print:text-black">
            <Head title={`${noteTypeTitle} - ${shipment.agent_settlement_reference || shipment.shipment_number}`} />

            {/* Top Toolbar (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <Link
                    href="/shipments"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('back_to_shipments') || 'Back to Shipments'}</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs"
                    >
                        <Printer className="w-4 h-4" />
                        <span>{t('print_document') || 'Print Document'}</span>
                    </button>
                </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="max-w-4xl mx-auto bg-white border border-neutral-300 shadow-xl rounded-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0 text-neutral-900">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-neutral-900 pb-6 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded bg-blue-900 text-white flex items-center justify-center font-black text-xl">
                                FX
                            </div>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-wider text-neutral-900">
                                    FREIGHT-X LOGISTICS
                                </h1>
                                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                                    International Freight Forwarders & Multimodal Transport Operator
                                </p>
                            </div>
                        </div>
                        <div className="text-[11px] text-neutral-600 mt-2 space-y-0.5 font-mono">
                            <p>Head Office: 44 Port Said Blvd, Alexandria, Egypt</p>
                            <p>Tel: +20 (3) 489-1000 | Email: accounts.overseas@freight-x.com</p>
                            <p>Tax Reg: EG-TR-990812-334 | FIATA Reg: INT-8812</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className={`inline-block px-3 py-1 text-sm font-black tracking-widest uppercase rounded border ${
                            isDebit ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        }`}>
                            {noteTypeTitle}
                        </span>
                        <p className="text-xs font-semibold text-neutral-600 mt-1">{noteTypeTitleAr}</p>
                        <div className="mt-3 text-xs space-y-1 font-mono">
                            <p><span className="text-neutral-500">Ref No:</span> <strong className="text-neutral-900 font-bold">{shipment.agent_settlement_reference || `ST-${shipment.shipment_number}`}</strong></p>
                            <p><span className="text-neutral-500">Date:</span> <strong>{new Date().toISOString().split('T')[0]}</strong></p>
                            <p><span className="text-neutral-500">Payment Terms:</span> <strong>Net 30 Days</strong></p>
                        </div>
                    </div>
                </div>

                {/* Partner Details & Shipment Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="border border-neutral-300 rounded p-4 bg-neutral-50/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Billed Overseas Partner / Agent (الوكيل بالخارج)</span>
                        </p>
                        <h2 className="text-sm font-black text-neutral-900">{agent.name}</h2>
                        <div className="text-xs text-neutral-700 mt-1 space-y-0.5">
                            {agent.code && <p className="font-mono text-[11px] text-neutral-500">Agent Code: {agent.code}</p>}
                            <p>{agent.address || 'International Agency Network'}</p>
                            <p>{agent.city}, {agent.country}</p>
                            {agent.tax_number && <p className="font-mono text-[11px]">Tax/VAT ID: {agent.tax_number}</p>}
                        </div>
                    </div>

                    <div className="border border-neutral-300 rounded p-4 bg-neutral-50/50 font-mono text-xs space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 font-sans flex items-center gap-1.5">
                            <Anchor className="w-3.5 h-3.5 text-blue-600" />
                            <span>Shipment & B/L References (بيانات الشحنة والبوليصة)</span>
                        </p>
                        <div className="flex justify-between">
                            <span className="text-neutral-500 font-sans">Shipment No:</span>
                            <strong className="text-neutral-900">{shipment.shipment_number}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500 font-sans">House B/L:</span>
                            <strong className="text-blue-900">{shipment.hbl_number || 'N/A'}</strong>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500 font-sans">Master B/L:</span>
                            <span className="text-neutral-800">{shipment.mbl_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500 font-sans">Vessel / Voyage:</span>
                            <span>{shipment.vessel?.name || 'TBA'} {shipment.voyage_flight_number ? `v.${shipment.voyage_flight_number}` : ''}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500 font-sans">Port of Loading:</span>
                            <span>{shipment.origin_port?.name || shipment.origin_port}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500 font-sans">Port of Discharge:</span>
                            <span>{shipment.destination_port?.name || shipment.destination_port}</span>
                        </div>
                    </div>
                </div>

                {/* Job Costing & Profit Sharing Breakdown Table */}
                <div className="border border-neutral-300 rounded overflow-hidden mb-6">
                    <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-300 flex justify-between items-center">
                        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                            Shipment Account & Profit Sharing Calculation (حساب الأرباح والنوالين)
                        </h3>
                        <span className="text-[11px] font-mono font-bold text-neutral-600">
                            Base Currency: {currency}
                        </span>
                    </div>

                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold uppercase text-[10px]">
                                <th className="py-2.5 px-4 text-left">Description (البند)</th>
                                <th className="py-2.5 px-4 text-left">Basis / Note</th>
                                <th className="py-2.5 px-4 text-right">Invoiced (Revenue)</th>
                                <th className="py-2.5 px-4 text-right">Disbursed (Cost)</th>
                                <th className="py-2.5 px-4 text-right">Net Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-neutral-800 font-mono">
                            <tr>
                                <td className="py-3 px-4 font-sans font-semibold">
                                    Ocean Freight & Client Local Handling
                                    <span className="block text-[10px] text-neutral-500 font-normal">Total Client Billing on B/L</span>
                                </td>
                                <td className="py-3 px-4 text-neutral-500 font-sans">Shipper Invoiced</td>
                                <td className="py-3 px-4 text-right font-bold text-emerald-800">{currency} {parseFloat(shipment.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="py-3 px-4 text-right text-neutral-400">-</td>
                                <td className="py-3 px-4 text-right">-</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 font-sans font-semibold">
                                    Carrier Ocean Freight & Vessel Costs
                                    <span className="block text-[10px] text-neutral-500 font-normal">{shipment.carrier?.name || 'Shipping Line'} Net Cost</span>
                                </td>
                                <td className="py-3 px-4 text-neutral-500 font-sans">Line Disbursed</td>
                                <td className="py-3 px-4 text-right text-neutral-400">-</td>
                                <td className="py-3 px-4 text-right text-red-700">{currency} {parseFloat(shipment.total_cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="py-3 px-4 text-right">-</td>
                            </tr>
                            <tr className="bg-neutral-50 font-bold">
                                <td className="py-2.5 px-4 font-sans uppercase text-[11px]" colSpan="2">
                                    Total Gross Profit on File (إجمالي أرباح البوليصة)
                                </td>
                                <td className="py-2.5 px-4 text-right">{currency} {parseFloat(shipment.total_revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="py-2.5 px-4 text-right">{currency} {parseFloat(shipment.total_cost || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                <td className="py-2.5 px-4 text-right text-blue-900">{currency} {grossProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Settlement Summary Card */}
                <div className="flex justify-end mb-8">
                    <div className="w-80 border-2 border-neutral-900 rounded p-4 bg-neutral-50 text-xs font-mono space-y-2">
                        <div className="flex justify-between font-sans">
                            <span className="text-neutral-600">Agreed Profit Split:</span>
                            <span className="font-bold text-neutral-900">{sharePercent}% ({shipment.agent_share_type || '50/50'})</span>
                        </div>
                        <div className="flex justify-between font-sans">
                            <span className="text-neutral-600">Settlement Direction:</span>
                            <span className="font-bold text-blue-800">{isDebit ? 'We Debit Agent (Collect)' : 'We Credit Agent (Prepaid)'}</span>
                        </div>
                        <div className="border-t-2 border-neutral-900 pt-2 flex justify-between items-baseline font-sans">
                            <span className="text-sm font-black uppercase text-neutral-900">Total Net Due:</span>
                            <div className="text-right">
                                <span className="text-lg font-black font-mono text-neutral-950">
                                    {currency} {shareAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bank / Remittance Details */}
                <div className="border border-neutral-300 rounded p-4 mb-8 bg-neutral-50/50 text-[11px] text-neutral-700">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-800 mb-1.5 flex items-center gap-1.5 font-sans">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Remittance & Wire Transfer Instructions (بيانات التحويل البنكي)</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                        <div>
                            <p><strong className="font-sans">Beneficiary Bank:</strong> National Bank of Egypt (Alexandria Branch)</p>
                            <p><strong className="font-sans">Beneficiary Name:</strong> Freight-X Logistics SAE</p>
                            <p><strong className="font-sans">Account No:</strong> 0109988234001</p>
                        </div>
                        <div>
                            <p><strong className="font-sans">SWIFT / BIC:</strong> NBEGEGCXXXX</p>
                            <p><strong className="font-sans">IBAN:</strong> EG8800030109988234001000000</p>
                            <p><strong className="font-sans">Payment Reference:</strong> {shipment.agent_settlement_reference || shipment.shipment_number}</p>
                        </div>
                    </div>
                </div>

                {/* Signatures & Stamp */}
                <div className="grid grid-cols-2 gap-12 pt-6 border-t border-neutral-300 text-xs text-neutral-700">
                    <div>
                        <p className="font-bold uppercase tracking-wider text-neutral-800 mb-12">
                            Authorized By / Freight-X Accounts:
                        </p>
                        <div className="border-t border-dashed border-neutral-400 pt-2 flex justify-between items-center text-[10px]">
                            <span>Accounting Manager Signature</span>
                            <span>Official Stamp</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold uppercase tracking-wider text-neutral-800 mb-12">
                            Overseas Agent Acceptance:
                        </p>
                        <div className="border-t border-dashed border-neutral-400 pt-2 flex justify-between items-center text-[10px]">
                            <span>Partner Representative</span>
                            <span>Date & Stamp</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
