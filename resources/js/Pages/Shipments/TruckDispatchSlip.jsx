import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Printer, ArrowLeft, Truck, MapPin, Building2, 
    Calendar, CheckSquare, ShieldCheck, User 
} from 'lucide-react';
import { useTranslation } from '../../Context/LanguageContext';

export default function TruckDispatchSlip({ dispatch, shipment }) {
    const { t, isRTL } = useTranslation();

    const container = dispatch.container || {};
    const trucker = dispatch.trucking_company || {};

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-[#0c0c0c] text-neutral-900 font-sans p-4 sm:p-8 print:p-0 print:bg-white print:text-black">
            <Head title={`Dispatch Slip - ${dispatch.dispatch_number}`} />

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
                                    Inland Drayage & Transport Dispatch Operations
                                </p>
                            </div>
                        </div>
                        <div className="text-[11px] text-neutral-600 mt-2 space-y-0.5 font-mono">
                            <p>Alexandria Office: Dekheila Port Gate 3 Drayage Hub</p>
                            <p>Operations Dispatch 24/7: +20 (10) 9988-1122 | dispatch@freight-x.com</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="inline-block px-3 py-1 text-sm font-black tracking-widest uppercase rounded border bg-blue-50 text-blue-950 border-blue-300">
                            TRUCK DISPATCH ORDER
                        </span>
                        <p className="text-xs font-semibold text-neutral-600 mt-1">أمر حركة شاحنة وتعتيق حاوية</p>
                        <div className="mt-3 text-xs space-y-1 font-mono">
                            <p><span className="text-neutral-500">Dispatch No:</span> <strong className="text-neutral-900 font-bold">{dispatch.dispatch_number}</strong></p>
                            <p><span className="text-neutral-500">Date:</span> <strong>{dispatch.dispatched_at ? new Date(dispatch.dispatched_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</strong></p>
                            <p><span className="text-neutral-500">Trip Status:</span> <strong className="uppercase text-blue-700">{dispatch.status}</strong></p>
                        </div>
                    </div>
                </div>

                {/* Driver & Truck Details Card */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="border border-neutral-300 rounded p-4 bg-neutral-50/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5 font-sans">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Driver & Vehicle Information (بيانات السائق والشاحنة)</span>
                        </p>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Driver Name:</span>
                                <strong className="text-neutral-900">{dispatch.driver_name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Phone:</span>
                                <span className="font-mono">{dispatch.driver_phone || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">National ID:</span>
                                <span className="font-mono">{dispatch.driver_national_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-t border-neutral-200 pt-1.5">
                                <span className="text-neutral-500">Truck Plate:</span>
                                <strong className="font-mono bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-900">{dispatch.truck_plate}</strong>
                            </div>
                            {dispatch.trailer_plate && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Trailer Plate:</span>
                                    <span className="font-mono bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-900">{dispatch.trailer_plate}</span>
                                </div>
                            )}
                            {trucker.name && (
                                <div className="flex justify-between pt-1">
                                    <span className="text-neutral-500">Hauler Co:</span>
                                    <span className="font-semibold text-neutral-800">{trucker.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border border-neutral-300 rounded p-4 bg-neutral-50/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-1.5 font-sans">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Container & Cargo (بيانات الحاوية والشحنة)</span>
                        </p>
                        <div className="space-y-1.5 text-xs font-mono">
                            <div className="flex justify-between">
                                <span className="text-neutral-500 font-sans">Container No:</span>
                                <strong className="text-sm font-bold text-blue-900">{container.container_number || 'TBA'}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500 font-sans">Type & Size:</span>
                                <strong>{container.container_type || '40HC'}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500 font-sans">Seal No:</span>
                                <span>{container.seal_number || 'TBA'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500 font-sans">B/L No:</span>
                                <span className="font-sans">{shipment?.hbl_number || shipment?.shipment_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500 font-sans">Consignee:</span>
                                <span className="font-sans text-neutral-900 truncate max-w-[180px]">{shipment?.customer?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500 font-sans">Commodity:</span>
                                <span className="font-sans text-neutral-700 truncate max-w-[180px]">{shipment?.commodity || 'General Merchandise'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Routing & Trip Itinerary */}
                <div className="border border-neutral-300 rounded overflow-hidden mb-6">
                    <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-300">
                        <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
                            Trip Routing & Empty Container Return Destination (خط السير وإرجاع الحاوية الفارغة)
                        </h3>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                1
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] uppercase font-bold text-neutral-500">Loading Origin Point (نقطة التحميل بالميناء)</p>
                                <p className="font-semibold text-neutral-900">{dispatch.origin_address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                2
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] uppercase font-bold text-neutral-500">Consignee Delivery / Offloading Destination (موقع التعتيق وتفريغ البضاعة)</p>
                                <p className="font-semibold text-neutral-900">{dispatch.delivery_address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                3
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] uppercase font-bold text-neutral-500">Empty Return Depot & Yard (ساحة إرجاع الحاوية الفارغة للخط الملاحي)</p>
                                <p className="font-semibold text-neutral-900">{dispatch.empty_return_depot || 'Official Shipping Line Empty Yard'}</p>
                                {dispatch.empty_return_receipt && (
                                    <p className="text-xs font-mono font-bold text-emerald-800 mt-0.5">
                                        EIR Receipt No: {dispatch.empty_return_receipt}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspection Checklist */}
                <div className="border border-neutral-300 rounded p-4 mb-8 bg-neutral-50/50 text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-neutral-800 mb-2">
                        Safety & Gate Inspection Check (فحص السلامة وخلو الحاوية)
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-[11px] text-neutral-700">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded border-neutral-400" />
                            <span>Seal Intact Upon Departure</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" defaultChecked className="rounded border-neutral-400" />
                            <span>No Exterior Container Damage</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-neutral-400" />
                            <span>Empty Clean & Odor Free</span>
                        </label>
                    </div>
                </div>

                {/* Signatures & Approvals */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-neutral-300 text-xs text-neutral-700">
                    <div>
                        <p className="font-bold uppercase tracking-wider text-neutral-800 mb-12">
                            Dispatcher Signature:
                        </p>
                        <div className="border-t border-dashed border-neutral-400 pt-2 text-[10px]">
                            <span>Port Gate Out Officer</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold uppercase tracking-wider text-neutral-800 mb-12">
                            Consignee Received & Unloaded:
                        </p>
                        <div className="border-t border-dashed border-neutral-400 pt-2 text-[10px]">
                            <span>Warehouse Manager Stamp & Date</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-bold uppercase tracking-wider text-neutral-800 mb-12">
                            Empty Yard EIR Validation:
                        </p>
                        <div className="border-t border-dashed border-neutral-400 pt-2 text-[10px]">
                            <span>Depot Gate In Receipt / Signature</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
