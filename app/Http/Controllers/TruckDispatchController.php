<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\TruckDispatch;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TruckDispatchController extends Controller
{
    /**
     * Create a new inland trucking dispatch trip
     */
    public function store(Request $request, Shipment $shipment): RedirectResponse
    {
        $validated = $request->validate([
            'shipment_container_id' => 'nullable|exists:shipment_containers,id',
            'trucking_company_id' => 'nullable|exists:companies,id',
            'driver_name' => 'required|string|max:100',
            'driver_phone' => 'nullable|string|max:50',
            'driver_national_id' => 'nullable|string|max:50',
            'truck_plate' => 'required|string|max:50',
            'trailer_plate' => 'nullable|string|max:50',
            'origin_address' => 'required|string|max:255',
            'delivery_address' => 'required|string|max:255',
            'empty_return_depot' => 'nullable|string|max:255',
            'empty_return_receipt' => 'nullable|string|max:100',
            'driver_cost' => 'nullable|numeric|min:0',
            'client_charge' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string',
        ]);

        $dispatch = TruckDispatch::create([
            'shipment_id' => $shipment->id,
            'shipment_container_id' => $validated['shipment_container_id'] ?? null,
            'trucking_company_id' => $validated['trucking_company_id'] ?? null,
            'driver_name' => $validated['driver_name'],
            'driver_phone' => $validated['driver_phone'] ?? null,
            'driver_national_id' => $validated['driver_national_id'] ?? null,
            'truck_plate' => $validated['truck_plate'],
            'trailer_plate' => $validated['trailer_plate'] ?? null,
            'origin_address' => $validated['origin_address'],
            'delivery_address' => $validated['delivery_address'],
            'empty_return_depot' => $validated['empty_return_depot'] ?? null,
            'empty_return_receipt' => $validated['empty_return_receipt'] ?? null,
            'driver_cost' => (float) ($validated['driver_cost'] ?? 0),
            'client_charge' => (float) ($validated['client_charge'] ?? 0),
            'currency' => $validated['currency'] ?? 'USD',
            'status' => 'assigned',
            'dispatched_at' => Carbon::now(),
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        // If a container was assigned and gate-out was not set yet, mark container status
        if ($dispatch->shipment_container_id && $dispatch->container) {
            $dispatch->container->update([
                'status' => 'gated_out',
                'gate_out_at' => $dispatch->container->gate_out_at ?? Carbon::now()->toDateString(),
            ]);
            $dispatch->container->calculateDemurrageAndDetention();
        }

        return redirect()->back()->with('success', "Truck dispatch trip {$dispatch->dispatch_number} created successfully.");
    }

    /**
     * Update trip lifecycle status (port loading, in transit, unloaded, empty returned)
     */
    public function updateStatus(Request $request, TruckDispatch $dispatch): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:assigned,loading_port,in_transit,at_destination,unloaded,empty_returned,completed',
            'empty_return_receipt' => 'nullable|string|max:100',
            'empty_return_depot' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $updates = [
            'status' => $validated['status'],
        ];

        if (! empty($validated['empty_return_receipt'])) {
            $updates['empty_return_receipt'] = $validated['empty_return_receipt'];
        }
        if (! empty($validated['empty_return_depot'])) {
            $updates['empty_return_depot'] = $validated['empty_return_depot'];
        }
        if (! empty($validated['notes'])) {
            $updates['notes'] = $validated['notes'];
        }

        $now = Carbon::now();
        if ($validated['status'] === 'loading_port' && ! $dispatch->loaded_at) {
            $updates['loaded_at'] = $now;
        } elseif ($validated['status'] === 'unloaded' && ! $dispatch->delivered_at) {
            $updates['delivered_at'] = $now;
        } elseif (($validated['status'] === 'empty_returned' || $validated['status'] === 'completed') && ! $dispatch->empty_returned_at) {
            $updates['empty_returned_at'] = $now;

            // Also synchronize with the container record to close detention free time
            if ($dispatch->shipment_container_id && $dispatch->container) {
                $dispatch->container->update([
                    'empty_returned_at' => $now->toDateString(),
                    'status' => 'returned',
                ]);
                $dispatch->container->calculateDemurrageAndDetention();
            }
        }

        $dispatch->update($updates);

        return redirect()->back()->with('success', "Trip {$dispatch->dispatch_number} status updated to {$validated['status']}.");
    }

    /**
     * Remove a dispatch trip record
     */
    public function destroy(TruckDispatch $dispatch): RedirectResponse
    {
        $number = $dispatch->dispatch_number;
        $dispatch->delete();

        return redirect()->back()->with('success', "Dispatch trip {$number} removed.");
    }

    /**
     * Render printable Dispatch Slip / Empty Container Return Order
     */
    public function printSlip(TruckDispatch $dispatch): Response
    {
        $dispatch->load([
            'shipment.customer',
            'shipment.carrier',
            'shipment.vessel',
            'shipment.originPort',
            'shipment.destinationPort',
            'container',
            'truckingCompany',
        ]);

        return Inertia::render('Shipments/TruckDispatchSlip', [
            'dispatch' => $dispatch,
            'shipment' => $dispatch->shipment,
        ]);
    }
}
