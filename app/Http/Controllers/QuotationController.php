<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Incoterm;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Port;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Shipment;
use App\Models\ShipmentContainer;
use App\Models\ShipmentMilestone;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    /**
     * Display a listing of freight quotations
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $mode = $request->query('mode');
        $customerId = $request->query('customer_id');

        $query = Quotation::with([
            'customer:id,name,partner_type,city,country',
            'contact:id,first_name,last_name,email,phone',
            'originPort:id,name,code,city,country,type',
            'destinationPort:id,name,code,city,country,type',
            'convertedShipment:id,shipment_number,status',
            'items',
        ])->latest('id');

        if ($search) {
            $query->where(function ($q) use ($search): void {
                $q->where('quotation_number', 'like', "%{$search}%")
                    ->orWhere('commodity', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($cq) use ($search): void {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($mode) {
            $query->where('mode', $mode);
        }

        if ($customerId) {
            $query->where('customer_id', $customerId);
        }

        $quotations = $query->get();

        // Calculate Overview Metrics
        $totalQuotes = $quotations->count();
        $totalValue = (float) $quotations->sum('total_amount');
        $acceptedCount = $quotations->whereIn('status', ['accepted', 'converted'])->count();
        $conversionRate = $totalQuotes > 0 ? round(($acceptedCount / $totalQuotes) * 100, 1) : 0;
        $draftCount = $quotations->where('status', 'draft')->count();
        $sentCount = $quotations->where('status', 'sent')->count();

        // Lookups
        $companies = Company::orderBy('name')->get();
        $clients = $companies->filter(fn (Company $c): bool => in_array($c->partner_type, ['customer', 'supplier', null]))->values();
        $ports = Port::where('status', 'active')->orderBy('name')->get();
        $incoterms = Incoterm::where('status', 'active')->orderBy('code')->get();

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'stats' => [
                'totalQuotes' => $totalQuotes,
                'totalValue' => $totalValue,
                'acceptedCount' => $acceptedCount,
                'conversionRate' => $conversionRate,
                'draftCount' => $draftCount,
                'sentCount' => $sentCount,
            ],
            'clients' => $clients,
            'ports' => $ports,
            'incoterms' => $incoterms,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
                'mode' => $mode ?? '',
                'customer_id' => $customerId ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created quotation
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'mode' => 'required|in:sea,air,land',
            'service_type' => 'required|string',
            'incoterm' => 'required|string',
            'origin_port_id' => 'nullable|exists:ports,id',
            'destination_port_id' => 'nullable|exists:ports,id',
            'commodity' => 'nullable|string|max:255',
            'estimated_transit_days' => 'nullable|integer|min:1',
            'cargo_ready_date' => 'nullable|date',
            'valid_until' => 'nullable|date',
            'currency' => 'required|string|size:3',
            'payment_terms' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:draft,sent,accepted',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.charge_code' => 'nullable|string|max:30',
            'items.*.category' => 'required|string',
            'items.*.unit_type' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        $year = date('Y');
        $count = Quotation::whereYear('created_at', $year)->count() + 1;
        $quotationNumber = sprintf('QT-%s-%04d', $year, $count);

        $quotation = Quotation::create([
            'quotation_number' => $quotationNumber,
            'customer_id' => $validated['customer_id'],
            'contact_id' => $validated['contact_id'] ?? null,
            'mode' => $validated['mode'],
            'service_type' => $validated['service_type'],
            'incoterm' => $validated['incoterm'],
            'origin_port_id' => $validated['origin_port_id'] ?? null,
            'destination_port_id' => $validated['destination_port_id'] ?? null,
            'commodity' => $validated['commodity'] ?? null,
            'estimated_transit_days' => $validated['estimated_transit_days'] ?? null,
            'cargo_ready_date' => $validated['cargo_ready_date'] ?? null,
            'valid_until' => $validated['valid_until'] ?? Carbon::now()->addDays(14)->toDateString(),
            'currency' => strtoupper($validated['currency']),
            'payment_terms' => $validated['payment_terms'] ?? 'Prepaid on departure',
            'terms_conditions' => $validated['terms_conditions'] ?? "1. Rates are subject to bunker & local surcharges at time of shipping.\n2. Standard demurrage free time: 14 days at POD.\n3. Quote validity is subject to space & equipment availability.",
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'created_by' => $request->user()?->id,
        ]);

        foreach ($validated['items'] as $itemData) {
            QuotationItem::create([
                'quotation_id' => $quotation->id,
                'charge_code' => $itemData['charge_code'] ?? null,
                'description' => $itemData['description'],
                'category' => $itemData['category'] ?? 'ocean_freight',
                'unit_type' => $itemData['unit_type'] ?? 'per_container',
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'tax_rate' => $itemData['tax_rate'] ?? 0,
                'total_price' => (float) $itemData['quantity'] * (float) $itemData['unit_price'],
                'currency' => strtoupper($validated['currency']),
                'notes' => $itemData['notes'] ?? null,
            ]);
        }

        $quotation->recalculateTotals();

        return redirect()->route('quotations.index')->with('success', "Quotation {$quotation->quotation_number} created successfully.");
    }

    /**
     * Update quotation
     */
    public function update(Request $request, Quotation $quotation): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:companies,id',
            'contact_id' => 'nullable|exists:contacts,id',
            'mode' => 'required|in:sea,air,land',
            'service_type' => 'required|string',
            'incoterm' => 'required|string',
            'origin_port_id' => 'nullable|exists:ports,id',
            'destination_port_id' => 'nullable|exists:ports,id',
            'commodity' => 'nullable|string|max:255',
            'estimated_transit_days' => 'nullable|integer|min:1',
            'cargo_ready_date' => 'nullable|date',
            'valid_until' => 'nullable|date',
            'currency' => 'required|string|size:3',
            'payment_terms' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:draft,sent,accepted,rejected,expired',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|integer',
            'items.*.description' => 'required|string|max:255',
            'items.*.charge_code' => 'nullable|string|max:30',
            'items.*.category' => 'required|string',
            'items.*.unit_type' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'items.*.notes' => 'nullable|string',
        ]);

        $quotation->update([
            'customer_id' => $validated['customer_id'],
            'contact_id' => $validated['contact_id'] ?? null,
            'mode' => $validated['mode'],
            'service_type' => $validated['service_type'],
            'incoterm' => $validated['incoterm'],
            'origin_port_id' => $validated['origin_port_id'] ?? null,
            'destination_port_id' => $validated['destination_port_id'] ?? null,
            'commodity' => $validated['commodity'] ?? null,
            'estimated_transit_days' => $validated['estimated_transit_days'] ?? null,
            'cargo_ready_date' => $validated['cargo_ready_date'] ?? null,
            'valid_until' => $validated['valid_until'] ?? null,
            'currency' => strtoupper($validated['currency']),
            'payment_terms' => $validated['payment_terms'] ?? null,
            'terms_conditions' => $validated['terms_conditions'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? $quotation->status,
        ]);

        // Sync items
        $quotation->items()->delete();
        foreach ($validated['items'] as $itemData) {
            QuotationItem::create([
                'quotation_id' => $quotation->id,
                'charge_code' => $itemData['charge_code'] ?? null,
                'description' => $itemData['description'],
                'category' => $itemData['category'] ?? 'ocean_freight',
                'unit_type' => $itemData['unit_type'] ?? 'per_container',
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'tax_rate' => $itemData['tax_rate'] ?? 0,
                'total_price' => (float) $itemData['quantity'] * (float) $itemData['unit_price'],
                'currency' => strtoupper($validated['currency']),
                'notes' => $itemData['notes'] ?? null,
            ]);
        }

        $quotation->recalculateTotals();

        return redirect()->back()->with('success', "Quotation {$quotation->quotation_number} updated.");
    }

    /**
     * Update quotation status
     */
    public function updateStatus(Request $request, Quotation $quotation): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,accepted,rejected,expired',
        ]);

        $quotation->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', "Status updated to {$validated['status']}.");
    }

    /**
     * Convert an accepted quotation directly into an active operational Shipment!
     */
    public function convert(Request $request, Quotation $quotation): RedirectResponse
    {
        if ($quotation->converted_shipment_id) {
            return redirect()->back()->with('error', 'This quotation has already been converted into a shipment.');
        }

        $year = date('Y');
        $lastShipment = Shipment::where('shipment_number', 'like', "SHP-{$year}-%")->latest('id')->first();
        $nextNumber = 1;
        if ($lastShipment) {
            $parts = explode('-', $lastShipment->shipment_number);
            $nextNumber = (int) end($parts) + 1;
        }
        $shipmentNumber = sprintf('SHP-%s-%04d', $year, $nextNumber);
        $bookingNumber = 'BKG-'.strtoupper(substr(uniqid(), -6));

        // Create Shipment
        $shipment = Shipment::create([
            'shipment_number' => $shipmentNumber,
            'booking_number' => $bookingNumber,
            'quotation_id' => $quotation->id,
            'customer_id' => $quotation->customer_id,
            'mode' => $quotation->mode,
            'service_type' => $quotation->service_type,
            'incoterm' => $quotation->incoterm,
            'move_type' => 'Port-to-Port',
            'origin_port_id' => $quotation->origin_port_id,
            'destination_port_id' => $quotation->destination_port_id,
            'commodity' => $quotation->commodity,
            'cargo_ready_date' => $quotation->cargo_ready_date,
            'status' => 'booked',
            'booking_date' => Carbon::now()->toDateString(),
            'currency' => $quotation->currency,
            'total_revenue' => $quotation->total_amount,
            'total_cost' => 0,
            'gross_profit' => $quotation->total_amount,
            'margin_percentage' => 100,
            'created_by' => $request->user()?->id,
            'notes' => "Converted from Quotation {$quotation->quotation_number}.\n".($quotation->notes ?? ''),
            'bl_type' => 'house',
            'freight_term' => 'Prepaid',
            'cargo_description' => $quotation->commodity,
        ]);

        // Default Container for FCL
        if ($quotation->service_type === 'fcl') {
            ShipmentContainer::create([
                'shipment_id' => $shipment->id,
                'container_number' => 'TBDU'.rand(1000000, 9999999),
                'type' => '40HC',
                'status' => 'booked',
            ]);
        }

        // Standard Milestones
        $originPortName = $shipment->originPort?->name ?? 'Origin Port';
        $destPortName = $shipment->destinationPort?->name ?? 'Destination Port';

        $standardMilestones = [
            [
                'stage' => 'booking',
                'title_en' => 'Booking Confirmed (Quote Converted)',
                'title_ar' => 'تأكيد الحجز اللوجستي (تم تحويل عرض السعر)',
                'location' => $originPortName,
                'planned_date' => Carbon::now(),
                'actual_date' => Carbon::now(),
                'status' => 'completed',
            ],
            [
                'stage' => 'cargo_received',
                'title_en' => 'Cargo Received at Terminal',
                'title_ar' => 'استلام البضاعة بالمحطة',
                'location' => $originPortName,
                'planned_date' => Carbon::now()->addDays(2),
                'actual_date' => null,
                'status' => 'pending',
            ],
            [
                'stage' => 'departed',
                'title_en' => 'Departure from '.$originPortName,
                'title_ar' => 'المغادرة من '.$originPortName,
                'location' => $originPortName,
                'planned_date' => Carbon::now()->addDays(4),
                'actual_date' => null,
                'status' => 'pending',
            ],
            [
                'stage' => 'arrived',
                'title_en' => 'Arrival at '.$destPortName,
                'title_ar' => 'الوصول إلى '.$destPortName,
                'location' => $destPortName,
                'planned_date' => Carbon::now()->addDays($quotation->estimated_transit_days ?: 18),
                'actual_date' => null,
                'status' => 'pending',
            ],
            [
                'stage' => 'delivered',
                'title_en' => 'Delivery to Consignee',
                'title_ar' => 'التسليم للمستلم',
                'location' => $destPortName,
                'planned_date' => Carbon::now()->addDays(($quotation->estimated_transit_days ?: 18) + 2),
                'actual_date' => null,
                'status' => 'pending',
            ],
        ];

        foreach ($standardMilestones as $m) {
            ShipmentMilestone::create([
                'shipment_id' => $shipment->id,
                ...$m,
            ]);
        }

        $invCount = Invoice::where('type', 'receivable')->count() + 1;
        do {
            $invoiceNumber = sprintf('INV-%s-%04d', $year, $invCount++);
        } while (Invoice::where('invoice_number', $invoiceNumber)->exists());

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'type' => 'receivable',
            'category' => 'customer_billing',
            'shipment_id' => $shipment->id,
            'partner_id' => $quotation->customer_id,
            'currency' => $quotation->currency,
            'exchange_rate' => 1.0,
            'subtotal' => $quotation->subtotal,
            'tax_amount' => $quotation->tax_amount,
            'total_amount' => $quotation->total_amount,
            'balance_due' => $quotation->total_amount,
            'status' => 'issued',
            'issue_date' => Carbon::now()->toDateString(),
            'due_date' => Carbon::now()->addDays(30)->toDateString(),
            'payment_terms' => $quotation->payment_terms,
            'notes' => "Generated from Quotation {$quotation->quotation_number}",
            'created_by' => $request->user()?->id,
        ]);

        foreach ($quotation->items as $qItem) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $qItem->description,
                'charge_code' => $qItem->charge_code,
                'quantity' => $qItem->quantity,
                'unit_price' => $qItem->unit_price,
                'tax_rate' => $qItem->tax_rate,
                'total_amount' => $qItem->total_price,
            ]);
        }

        $shipment->recalculateFinancials();

        // Mark quotation as converted
        $quotation->update([
            'status' => 'converted',
            'converted_shipment_id' => $shipment->id,
            'converted_at' => Carbon::now(),
        ]);

        return redirect()->route('shipments.index')->with('success', "Quotation {$quotation->quotation_number} successfully converted to Shipment {$shipment->shipment_number}!");
    }

    /**
     * Delete quotation
     */
    public function destroy(Quotation $quotation): RedirectResponse
    {
        $quotation->delete();

        return redirect()->route('quotations.index')->with('success', 'Quotation deleted successfully.');
    }
}
