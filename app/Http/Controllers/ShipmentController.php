<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Incoterm;
use App\Models\Invoice;
use App\Models\MoveType;
use App\Models\PackageType;
use App\Models\Port;
use App\Models\Shipment;
use App\Models\ShipmentContainer;
use App\Models\ShipmentMilestone;
use App\Models\Vessel;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShipmentController extends Controller
{
    /**
     * Display a listing of shipments (Kanban & Table views)
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $mode = $request->query('mode');
        $serviceType = $request->query('service_type');
        $status = $request->query('status');
        $incoterm = $request->query('incoterm');
        $carrierId = $request->query('carrier_id');
        $currentView = $request->query('view', 'kanban'); // 'kanban' or 'table'

        $query = Shipment::with([
            'customer:id,name,partner_type,city,country',
            'carrier:id,name,code,partner_type',
            'originPort:id,name,code,city,country,type',
            'destinationPort:id,name,code,city,country,type',
            'vessel:id,name,imo_number',
            'customsBroker:id,name',
            'trucker:id,name',
            'containers',
            'milestones' => fn ($mq) => $mq->orderBy('planned_date'),
            'invoices.partner:id,name,partner_type',
            'invoices.items',
        ])->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('shipment_number', 'like', "%{$search}%")
                    ->orWhere('booking_number', 'like', "%{$search}%")
                    ->orWhere('mbl_number', 'like', "%{$search}%")
                    ->orWhere('hbl_number', 'like', "%{$search}%")
                    ->orWhere('commodity', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('carrier', function ($lq) use ($search) {
                        $lq->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    });
            });
        }

        if ($mode) {
            $query->where('mode', $mode);
        }

        if ($serviceType) {
            $query->where('service_type', $serviceType);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($incoterm) {
            $query->where('incoterm', $incoterm);
        }

        if ($carrierId) {
            $query->where('carrier_id', $carrierId);
        }

        $shipments = $query->get();

        // 6 Primary Kanban Pipeline Columns
        $kanbanStages = [
            'booked' => [
                'label' => 'Booked',
                'label_ar' => 'حجز مؤكد',
                'statuses' => ['draft', 'booked'],
            ],
            'cargo_received' => [
                'label' => 'Cargo Received',
                'label_ar' => 'استلام البضاعة',
                'statuses' => ['cargo_received'],
            ],
            'customs_export' => [
                'label' => 'Customs Clearance',
                'label_ar' => 'التخليص الجمركي',
                'statuses' => ['customs_export', 'loaded'],
            ],
            'in_transit' => [
                'label' => 'In Transit',
                'label_ar' => 'قيد النقل والإبحار',
                'statuses' => ['departed', 'in_transit'],
            ],
            'arrived' => [
                'label' => 'Arrived Port',
                'label_ar' => 'وصلت الميناء',
                'statuses' => ['arrived', 'customs_import', 'out_for_delivery'],
            ],
            'delivered' => [
                'label' => 'Delivered & Closed',
                'label_ar' => 'تم التسليم والإغلاق',
                'statuses' => ['delivered', 'completed'],
            ],
        ];

        $kanbanColumns = [];
        foreach ($kanbanStages as $stageKey => $meta) {
            $colShipments = $shipments->filter(fn ($s) => in_array($s->status, $meta['statuses']))->values();
            $kanbanColumns[$stageKey] = [
                'key' => $stageKey,
                'label' => $meta['label'],
                'label_ar' => $meta['label_ar'],
                'count' => $colShipments->count(),
                'totalRevenue' => $colShipments->sum('total_revenue'),
                'totalProfit' => $colShipments->sum('gross_profit'),
                'shipments' => $colShipments,
            ];
        }

        // Master Data Lookups for Modals & Filters
        $ports = Port::where('status', 'active')->orderBy('name')->get();
        $warehouses = Warehouse::where('status', 'active')->orderBy('name')->get();
        $vessels = Vessel::where('status', 'active')->orderBy('name')->get();
        $incoterms = Incoterm::where('status', 'active')->orderBy('code')->get();
        $packageTypes = PackageType::where('status', 'active')->orderBy('name')->get();
        $moveTypes = MoveType::where('status', 'active')->orderBy('name')->get();
        $companies = Company::orderBy('name')->get();

        $carriers = $companies->filter(fn ($c) => in_array($c->partner_type, ['shipping_line', 'airline', 'trucker']))->values();
        $clients = $companies->filter(fn ($c) => in_array($c->partner_type, ['customer', 'supplier', null]))->values();
        $customsBrokers = $companies->filter(fn ($c) => $c->partner_type === 'customs_broker')->values();
        $truckers = $companies->filter(fn ($c) => $c->partner_type === 'trucker')->values();

        return Inertia::render('Shipments/Index', [
            'shipments' => $shipments,
            'kanbanColumns' => $kanbanColumns,
            'ports' => $ports,
            'warehouses' => $warehouses,
            'vessels' => $vessels,
            'incoterms' => $incoterms,
            'packageTypes' => $packageTypes,
            'moveTypes' => $moveTypes,
            'carriers' => $carriers,
            'clients' => $clients,
            'customsBrokers' => $customsBrokers,
            'truckers' => $truckers,
            'currentView' => $currentView,
            'filters' => [
                'search' => $search ?? '',
                'mode' => $mode ?? '',
                'service_type' => $serviceType ?? '',
                'status' => $status ?? '',
                'incoterm' => $incoterm ?? '',
                'carrier_id' => $carrierId ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created shipment
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'mode' => 'required|in:sea,air,land',
            'service_type' => 'required|string',
            'customer_id' => 'required|exists:companies,id',
            'carrier_id' => 'nullable|exists:companies,id',
            'customs_broker_id' => 'nullable|exists:companies,id',
            'trucker_id' => 'nullable|exists:companies,id',
            'origin_port_id' => 'nullable|exists:ports,id',
            'destination_port_id' => 'nullable|exists:ports,id',
            'vessel_id' => 'nullable|exists:vessels,id',
            'incoterm' => 'required|string',
            'move_type' => 'required|string',
            'commodity' => 'nullable|string|max:255',
            'total_packages' => 'nullable|integer',
            'package_type' => 'nullable|string',
            'total_gross_weight_kg' => 'nullable|numeric',
            'total_volume_cbm' => 'nullable|numeric',
            'etd' => 'nullable|date',
            'eta' => 'nullable|date',
            'notes' => 'nullable|string',
            'container_numbers' => 'nullable|string', // Comma-separated or single
        ]);

        // Generate next shipment number: SHP-2026-XXXX
        $year = date('Y');
        $lastShipment = Shipment::where('shipment_number', 'like', "SHP-{$year}-%")->latest('id')->first();
        $nextNumber = 1;
        if ($lastShipment) {
            $parts = explode('-', $lastShipment->shipment_number);
            $nextNumber = (int) end($parts) + 1;
        }
        $validated['shipment_number'] = sprintf('SHP-%s-%04d', $year, $nextNumber);
        $validated['booking_number'] = 'BKG-'.strtoupper(substr(uniqid(), -6));
        $validated['status'] = 'booked';
        $validated['booking_date'] = Carbon::now()->format('Y-m-d');
        $validated['created_by'] = $request->user()?->id;

        $shipment = Shipment::create($validated);

        // Auto-create containers if provided
        if (! empty($request->input('container_numbers'))) {
            $cNumbers = array_filter(array_map('trim', explode(',', $request->input('container_numbers'))));
            foreach ($cNumbers as $cNum) {
                ShipmentContainer::create([
                    'shipment_id' => $shipment->id,
                    'container_number' => strtoupper($cNum),
                    'type' => $validated['service_type'] === 'fcl' ? '40HC' : 'LCL_CARGO',
                    'status' => 'booked',
                ]);
            }
        }

        // Standard Milestones creation
        $originPortName = $shipment->originPort?->name ?? 'Origin Port';
        $destPortName = $shipment->destinationPort?->name ?? 'Destination Port';

        $standardMilestones = [
            [
                'stage' => 'booking',
                'title_en' => 'Booking Confirmed',
                'title_ar' => 'تأكيد الحجز اللوجستي',
                'location' => $originPortName,
                'planned_date' => Carbon::now(),
                'actual_date' => Carbon::now(),
                'status' => 'completed',
            ],
            [
                'stage' => 'cargo_received',
                'title_en' => 'Cargo Received at Terminal',
                'title_ar' => 'دخول البضاعة للمحطة/الميناء',
                'location' => $originPortName,
                'planned_date' => $validated['etd'] ? Carbon::parse($validated['etd'])->subDays(2) : Carbon::now()->addDays(2),
                'actual_date' => null,
                'status' => 'pending',
            ],
            [
                'stage' => 'departed',
                'title_en' => 'Departure from '.$originPortName,
                'title_ar' => 'المغادرة من '.$originPortName,
                'location' => $originPortName,
                'planned_date' => $validated['etd'] ? Carbon::parse($validated['etd']) : Carbon::now()->addDays(4),
                'actual_date' => null,
                'status' => 'pending',
            ],
            [
                'stage' => 'arrived',
                'title_en' => 'Arrival at '.$destPortName,
                'title_ar' => 'الوصول إلى '.$destPortName,
                'location' => $destPortName,
                'planned_date' => $validated['eta'] ? Carbon::parse($validated['eta']) : Carbon::now()->addDays(14),
                'actual_date' => null,
                'status' => 'pending',
            ],
            [
                'stage' => 'delivered',
                'title_en' => 'Final Delivery to Consignee',
                'title_ar' => 'التسليم النهائي للمستلم',
                'location' => $destPortName,
                'planned_date' => $validated['eta'] ? Carbon::parse($validated['eta'])->addDays(2) : Carbon::now()->addDays(16),
                'actual_date' => null,
                'status' => 'pending',
            ],
        ];

        foreach ($standardMilestones as $m) {
            ShipmentMilestone::create([
                'shipment_id' => $shipment->id,
                'stage' => $m['stage'],
                'title_en' => $m['title_en'],
                'title_ar' => $m['title_ar'],
                'location' => $m['location'],
                'planned_date' => $m['planned_date'],
                'actual_date' => $m['actual_date'],
                'status' => $m['status'],
                'created_by' => $request->user()?->id,
            ]);
        }

        return redirect()->back()->with('success', 'Shipment created successfully');
    }

    /**
     * Update an existing shipment (inline spreadsheet cell edits or full update)
     */
    public function update(Request $request, Shipment $shipment): RedirectResponse
    {
        $validated = $request->validate([
            'shipment_number' => 'sometimes|string|max:30|unique:shipments,shipment_number,'.$shipment->id,
            'booking_number' => 'sometimes|nullable|string|max:50',
            'mbl_number' => 'sometimes|nullable|string|max:50',
            'hbl_number' => 'sometimes|nullable|string|max:50',
            'mode' => 'sometimes|in:sea,air,land',
            'service_type' => 'sometimes|string',
            'status' => 'sometimes|string',
            'incoterm' => 'sometimes|string',
            'move_type' => 'sometimes|string',
            'commodity' => 'sometimes|nullable|string|max:255',
            'total_packages' => 'sometimes|nullable|integer',
            'total_gross_weight_kg' => 'sometimes|nullable|numeric',
            'total_volume_cbm' => 'sometimes|nullable|numeric',
            'etd' => 'sometimes|nullable|date',
            'atd' => 'sometimes|nullable|date',
            'eta' => 'sometimes|nullable|date',
            'ata' => 'sometimes|nullable|date',
            'notes' => 'sometimes|nullable|string',
            'customer_id' => 'sometimes|nullable|exists:companies,id',
            'carrier_id' => 'sometimes|nullable|exists:companies,id',
            'origin_port_id' => 'sometimes|nullable|exists:ports,id',
            'destination_port_id' => 'sometimes|nullable|exists:ports,id',
            'vessel_id' => 'sometimes|nullable|exists:vessels,id',
        ]);

        $shipment->update($validated);

        return redirect()->back()->with('success', 'Shipment updated successfully');
    }

    /**
     * Update status (e.g. moving stage in Kanban board)
     */
    public function updateStatus(Request $request, Shipment $shipment): RedirectResponse
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $newStatus = $request->input('status');
        $shipment->update(['status' => $newStatus]);

        // Auto mark milestone complete if status matches
        $milestone = $shipment->milestones()->where('stage', $newStatus)->first();
        if ($milestone && $milestone->status !== 'completed') {
            $milestone->update([
                'status' => 'completed',
                'actual_date' => Carbon::now(),
            ]);
        }

        return redirect()->back()->with('success', 'Shipment status updated');
    }

    /**
     * Delete a shipment
     */
    public function destroy(Shipment $shipment): RedirectResponse
    {
        $shipment->delete();

        return redirect()->back()->with('success', 'Shipment deleted successfully');
    }

    /**
     * Update milestone status / date
     */
    public function updateMilestone(Request $request, ShipmentMilestone $milestone): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,completed,delayed',
            'actual_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validated['status'] === 'completed' && empty($validated['actual_date'])) {
            $validated['actual_date'] = Carbon::now();
        }

        $milestone->update($validated);

        return redirect()->back()->with('success', 'Milestone updated');
    }

    /**
     * Add container to shipment
     */
    public function storeContainer(Request $request, Shipment $shipment): RedirectResponse
    {
        $validated = $request->validate([
            'container_number' => 'required|string|max:20',
            'type' => 'required|string|max:30',
            'seal_number' => 'nullable|string|max:50',
            'tare_weight_kg' => 'nullable|numeric',
            'cargo_weight_kg' => 'nullable|numeric',
            'verified_gross_mass_kg' => 'nullable|numeric',
            'volume_cbm' => 'nullable|numeric',
            'status' => 'nullable|string',
        ]);

        $validated['container_number'] = strtoupper(trim($validated['container_number']));
        $validated['status'] = $validated['status'] ?? 'loaded';

        $shipment->containers()->create($validated);

        return redirect()->back()->with('success', 'Container added');
    }

    /**
     * Delete container
     */
    public function destroyContainer(ShipmentContainer $container): RedirectResponse
    {
        $container->delete();

        return redirect()->back()->with('success', 'Container removed');
    }

    /**
     * Add Invoice / Vendor Bill to shipment
     */
    public function storeInvoice(Request $request, Shipment $shipment): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:receivable,payable',
            'category' => 'required|string',
            'partner_id' => 'required|exists:companies,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'tax_amount' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:draft,sent,paid,overdue,cancelled',
        ]);

        $count = $shipment->invoices()->count() + 1;
        $prefix = $validated['type'] === 'receivable' ? 'INV' : 'BILL';
        $invoiceNumber = sprintf('%s-%s-%03d', $prefix, $shipment->shipment_number, $count);

        $subtotal = (float) $validated['amount'];
        $tax = (float) ($validated['tax_amount'] ?? 0);
        $total = $subtotal + $tax;

        $invoice = $shipment->invoices()->create([
            'invoice_number' => $invoiceNumber,
            'type' => $validated['type'],
            'category' => $validated['category'],
            'partner_id' => $validated['partner_id'],
            'currency' => 'USD',
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total_amount' => $total,
            'paid_amount' => ($validated['status'] ?? 'sent') === 'paid' ? $total : 0,
            'balance_due' => ($validated['status'] ?? 'sent') === 'paid' ? 0 : $total,
            'status' => $validated['status'] ?? 'sent',
            'issue_date' => Carbon::now()->format('Y-m-d'),
            'due_date' => $validated['due_date'] ?? Carbon::now()->addDays(30)->format('Y-m-d'),
            'created_by' => $request->user()?->id,
        ]);

        // Create line item
        $invoice->items()->create([
            'charge_code' => strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $validated['category']), 0, 6)),
            'description' => $validated['description'],
            'quantity' => 1,
            'unit_price' => $subtotal,
            'tax_amount' => $tax,
            'total_amount' => $total,
        ]);

        // Recalculate profitability
        $shipment->recalculateFinancials();

        return redirect()->back()->with('success', 'Invoice/Bill added');
    }

    /**
     * Update invoice payment status
     */
    public function updateInvoiceStatus(Request $request, Invoice $invoice): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,paid,overdue,cancelled',
        ]);

        $newStatus = $validated['status'];
        $paid = $newStatus === 'paid' ? $invoice->total_amount : 0;
        $balance = $newStatus === 'paid' ? 0 : $invoice->total_amount;

        $invoice->update([
            'status' => $newStatus,
            'paid_amount' => $paid,
            'balance_due' => $balance,
        ]);

        $invoice->shipment?->recalculateFinancials();

        return redirect()->back()->with('success', 'Invoice status updated');
    }
}
