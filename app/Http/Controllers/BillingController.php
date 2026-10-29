<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Shipment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    /**
     * Display billing & invoice management dashboard
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search', '');
        $type = $request->query('type', 'all'); // 'all', 'receivable', 'payable'
        $status = $request->query('status', 'all');
        $partnerId = $request->query('partner_id', '');
        $shipmentId = $request->query('shipment_id', '');

        $query = Invoice::with([
            'partner:id,name,partner_type,city,country,address,domain',
            'shipment:id,shipment_number,mode,status,origin_port_id,destination_port_id',
            'shipment.originPort:id,code,name',
            'shipment.destinationPort:id,code,name',
            'items',
        ])->latest('id');

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($partnerId) {
            $query->where('partner_id', $partnerId);
        }

        if ($shipmentId) {
            $query->where('shipment_id', $shipmentId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('payment_terms', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('partner', fn ($pq) => $pq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('shipment', fn ($sq) => $sq->where('shipment_number', 'like', "%{$search}%"));
            });
        }

        $invoices = $query->get();

        // High-level Accurate Financial Metrics (Across all invoices or filtered)
        $allInvoices = Invoice::where('status', '!=', 'cancelled')->get();
        $totalReceivables = (float) $allInvoices->where('type', 'receivable')->sum('total_amount');
        $totalPayables = (float) $allInvoices->where('type', 'payable')->sum('total_amount');
        $netProfit = $totalReceivables - $totalPayables;
        $profitMargin = $totalReceivables > 0 ? round(($netProfit / $totalReceivables) * 100, 1) : 0;

        $totalCollected = (float) $allInvoices->where('type', 'receivable')->sum('paid_amount');
        $totalPaidOut = (float) $allInvoices->where('type', 'payable')->sum('paid_amount');
        $totalOutstandingReceivable = (float) $allInvoices->where('type', 'receivable')->sum('balance_due');
        $totalOutstandingPayable = (float) $allInvoices->where('type', 'payable')->sum('balance_due');

        $overdueCount = $allInvoices->filter(fn ($inv) => $inv->status === 'overdue' || ($inv->balance_due > 0 && $inv->due_date && Carbon::parse($inv->due_date)->isPast()))->count();

        // Partners & Shipments for Modals & Filters
        $partners = Company::orderBy('name')->get(['id', 'name', 'partner_type', 'city', 'country']);
        $shipments = Shipment::orderByDesc('id')->get(['id', 'shipment_number', 'mode', 'status', 'customer_id', 'carrier_id']);

        return Inertia::render('Billing/Index', [
            'invoices' => $invoices,
            'partners' => $partners,
            'shipments' => $shipments,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'status' => $status,
                'partner_id' => $partnerId,
                'shipment_id' => $shipmentId,
            ],
            'metrics' => [
                'totalReceivables' => $totalReceivables,
                'totalPayables' => $totalPayables,
                'netProfit' => $netProfit,
                'profitMargin' => $profitMargin,
                'totalCollected' => $totalCollected,
                'totalPaidOut' => $totalPaidOut,
                'totalOutstandingReceivable' => $totalOutstandingReceivable,
                'totalOutstandingPayable' => $totalOutstandingPayable,
                'overdueCount' => $overdueCount,
            ],
        ]);
    }

    /**
     * Store newly created Customer Invoice or Vendor Bill
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:receivable,payable',
            'category' => 'required|string',
            'partner_id' => 'required|exists:companies,id',
            'shipment_id' => 'nullable|exists:shipments,id',
            'issue_date' => 'required|date',
            'due_date' => 'nullable|date',
            'payment_terms' => 'nullable|string|max:100',
            'currency' => 'nullable|string|max:3',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.charge_code' => 'nullable|string|max:40',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
        ]);

        $year = date('Y');
        $prefix = $validated['type'] === 'receivable' ? 'INV' : 'BILL';
        $count = Invoice::where('type', $validated['type'])->count() + 1;
        $invoiceNumber = sprintf('%s-%s-%04d', $prefix, $year, $count);

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'type' => $validated['type'],
            'category' => $validated['category'],
            'partner_id' => $validated['partner_id'],
            'shipment_id' => $validated['shipment_id'] ?? null,
            'issue_date' => $validated['issue_date'],
            'due_date' => $validated['due_date'] ?? Carbon::parse($validated['issue_date'])->addDays(30),
            'payment_terms' => $validated['payment_terms'] ?? 'Net 30',
            'currency' => $validated['currency'] ?? 'USD',
            'discount_amount' => (float) ($validated['discount_amount'] ?? 0),
            'notes' => $validated['notes'] ?? null,
            'status' => 'issued',
            'created_by' => $request->user()?->id,
        ]);

        $subtotal = 0;
        $taxTotal = 0;

        foreach ($validated['items'] as $item) {
            $qty = (float) $item['quantity'];
            $price = (float) $item['unit_price'];
            $taxRate = (float) ($item['tax_rate'] ?? 0);
            $linePrice = $qty * $price;
            $lineTax = ($linePrice * $taxRate) / 100;

            $subtotal += $linePrice;
            $taxTotal += $lineTax;

            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'charge_code' => $item['charge_code'] ?? strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $item['description']), 0, 8)),
                'description' => $item['description'],
                'quantity' => $qty,
                'unit_price' => $price,
                'tax_rate' => $taxRate,
                'tax_amount' => $lineTax,
                'total_price' => $linePrice + $lineTax,
            ]);
        }

        $discount = (float) ($validated['discount_amount'] ?? 0);
        $totalAmount = max(0, ($subtotal + $taxTotal) - $discount);

        $invoice->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxTotal,
            'total_amount' => $totalAmount,
            'balance_due' => $totalAmount,
            'paid_amount' => 0,
        ]);

        if ($invoice->shipment_id && $invoice->shipment) {
            $invoice->shipment->recalculateFinancials();
        }

        return redirect()->back()->with('success', 'Invoice/Bill created successfully');
    }

    /**
     * Record a payment (Full or Partial)
     */
    public function recordPayment(Request $request, Invoice $invoice): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'nullable|date',
            'payment_notes' => 'nullable|string|max:255',
        ]);

        $payAmount = (float) $validated['amount'];
        $newPaid = (float) $invoice->paid_amount + $payAmount;
        $total = (float) $invoice->total_amount;
        $newBalance = max(0, $total - $newPaid);

        $newStatus = $newBalance <= 0 ? 'paid' : 'partially_paid';

        $notes = $invoice->notes;
        if (! empty($validated['payment_notes'])) {
            $date = $validated['payment_date'] ?? Carbon::now()->format('Y-m-d');
            $notes = trim($notes."\n[Payment {$date}: $".number_format($payAmount, 2).' - '.$validated['payment_notes'].']');
        }

        $invoice->update([
            'paid_amount' => $newPaid,
            'balance_due' => $newBalance,
            'status' => $newStatus,
            'notes' => $notes,
        ]);

        if ($invoice->shipment_id && $invoice->shipment) {
            $invoice->shipment->recalculateFinancials();
        }

        return redirect()->back()->with('success', 'Payment recorded successfully');
    }

    /**
     * Update invoice status
     */
    public function updateStatus(Request $request, Invoice $invoice): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,issued,partially_paid,paid,overdue,cancelled',
        ]);

        $status = $validated['status'];
        $paid = $invoice->paid_amount;
        $balance = $invoice->balance_due;

        if ($status === 'paid') {
            $paid = $invoice->total_amount;
            $balance = 0;
        } elseif ($status === 'issued' && $invoice->paid_amount == $invoice->total_amount) {
            $paid = 0;
            $balance = $invoice->total_amount;
        }

        $invoice->update([
            'status' => $status,
            'paid_amount' => $paid,
            'balance_due' => $balance,
        ]);

        if ($invoice->shipment_id && $invoice->shipment) {
            $invoice->shipment->recalculateFinancials();
        }

        return redirect()->back()->with('success', 'Status updated successfully');
    }

    /**
     * Delete an invoice
     */
    public function destroy(Invoice $invoice): RedirectResponse
    {
        $shipment = $invoice->shipment;
        $invoice->delete();

        if ($shipment) {
            $shipment->recalculateFinancials();
        }

        return redirect()->back()->with('success', 'Invoice deleted successfully');
    }
}
