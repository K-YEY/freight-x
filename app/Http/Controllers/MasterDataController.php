<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Incoterm;
use App\Models\MoveType;
use App\Models\PackageType;
use App\Models\Port;
use App\Models\Vessel;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataController extends Controller
{
    /**
     * Display Master Data management page with 6 tabs
     */
    public function index(Request $request): Response
    {
        $currentTab = $request->query('tab', 'ports');
        $search = $request->query('search', '');

        $portsQuery = Port::orderBy('name');
        $warehousesQuery = Warehouse::orderBy('name');
        $vesselsQuery = Vessel::with('carrier:id,name,partner_type')->orderBy('name');
        $incotermsQuery = Incoterm::orderBy('code');
        $packagesQuery = PackageType::orderBy('name');
        $moveTypesQuery = MoveType::orderBy('name');

        if ($search) {
            if ($currentTab === 'ports') {
                $portsQuery->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%")->orWhere('city', 'like', "%{$search}%")->orWhere('country', 'like', "%{$search}%"));
            } elseif ($currentTab === 'warehouses') {
                $warehousesQuery->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%")->orWhere('city', 'like', "%{$search}%"));
            } elseif ($currentTab === 'vessels') {
                $vesselsQuery->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('imo_number', 'like', "%{$search}%")->orWhere('flag_country', 'like', "%{$search}%"));
            } elseif ($currentTab === 'incoterms') {
                $incotermsQuery->where(fn ($q) => $q->where('code', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%")->orWhere('name_ar', 'like', "%{$search}%"));
            } elseif ($currentTab === 'packages') {
                $packagesQuery->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%")->orWhere('name_ar', 'like', "%{$search}%"));
            } elseif ($currentTab === 'move_types') {
                $moveTypesQuery->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('code', 'like', "%{$search}%")->orWhere('name_ar', 'like', "%{$search}%"));
            }
        }

        $carriers = Company::whereIn('partner_type', ['shipping_line', 'airline', 'trucker'])->orderBy('name')->get(['id', 'name', 'partner_type']);

        return Inertia::render('MasterData/Index', [
            'currentTab' => $currentTab,
            'search' => $search,
            'ports' => $portsQuery->get(),
            'warehouses' => $warehousesQuery->get(),
            'vessels' => $vesselsQuery->get(),
            'incoterms' => $incotermsQuery->get(),
            'packageTypes' => $packagesQuery->get(),
            'moveTypes' => $moveTypesQuery->get(),
            'carriers' => $carriers,
            'counts' => [
                'ports' => Port::count(),
                'warehouses' => Warehouse::count(),
                'vessels' => Vessel::count(),
                'incoterms' => Incoterm::count(),
                'packages' => PackageType::count(),
                'move_types' => MoveType::count(),
            ],
        ]);
    }

    // --- PORTS ---
    public function storePort(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:10|unique:ports,code',
            'country' => 'required|string|max:100',
            'city' => 'nullable|string|max:100',
            'type' => 'required|in:sea,air,dry_port',
            'terminal_name' => 'nullable|string|max:150',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'nullable|in:active,inactive',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['status'] = $validated['status'] ?? 'active';

        Port::create($validated);

        return redirect()->back()->with('success', 'Port/Airport added successfully');
    }

    public function updatePort(Request $request, Port $port): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:10|unique:ports,code,'.$port->id,
            'country' => 'required|string|max:100',
            'city' => 'nullable|string|max:100',
            'type' => 'required|in:sea,air,dry_port',
            'terminal_name' => 'nullable|string|max:150',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'status' => 'required|in:active,inactive',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));

        $port->update($validated);

        return redirect()->back()->with('success', 'Port updated successfully');
    }

    public function destroyPort(Port $port): RedirectResponse
    {
        $port->delete();

        return redirect()->back()->with('success', 'Port deleted successfully');
    }

    // --- WAREHOUSES ---
    public function storeWarehouse(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:20|unique:warehouses,code',
            'type' => 'required|in:cfs,bonded,general,cold_storage',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'capacity_cbm' => 'nullable|numeric|min:0',
            'manager_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'status' => 'nullable|in:active,inactive',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['status'] = $validated['status'] ?? 'active';

        Warehouse::create($validated);

        return redirect()->back()->with('success', 'Warehouse/CFS added successfully');
    }

    public function updateWarehouse(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'required|string|max:20|unique:warehouses,code,'.$warehouse->id,
            'type' => 'required|in:cfs,bonded,general,cold_storage',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'capacity_cbm' => 'nullable|numeric|min:0',
            'manager_name' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'status' => 'required|in:active,inactive',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));

        $warehouse->update($validated);

        return redirect()->back()->with('success', 'Warehouse updated successfully');
    }

    public function destroyWarehouse(Warehouse $warehouse): RedirectResponse
    {
        $warehouse->delete();

        return redirect()->back()->with('success', 'Warehouse deleted successfully');
    }

    // --- VESSELS ---
    public function storeVessel(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'imo_number' => 'nullable|string|max:20|unique:vessels,imo_number',
            'mmsi' => 'nullable|string|max:20',
            'call_sign' => 'nullable|string|max:20',
            'flag_country' => 'nullable|string|max:50',
            'vessel_type' => 'nullable|string|max:50',
            'carrier_id' => 'nullable|exists:companies,id',
            'status' => 'nullable|in:active,inactive',
        ]);
        $validated['status'] = $validated['status'] ?? 'active';

        Vessel::create($validated);

        return redirect()->back()->with('success', 'Vessel added successfully');
    }

    public function updateVessel(Request $request, Vessel $vessel): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'imo_number' => 'nullable|string|max:20|unique:vessels,imo_number,'.$vessel->id,
            'mmsi' => 'nullable|string|max:20',
            'call_sign' => 'nullable|string|max:20',
            'flag_country' => 'nullable|string|max:50',
            'vessel_type' => 'nullable|string|max:50',
            'carrier_id' => 'nullable|exists:companies,id',
            'status' => 'required|in:active,inactive',
        ]);

        $vessel->update($validated);

        return redirect()->back()->with('success', 'Vessel updated successfully');
    }

    public function destroyVessel(Vessel $vessel): RedirectResponse
    {
        $vessel->delete();

        return redirect()->back()->with('success', 'Vessel deleted successfully');
    }

    // --- INCOTERMS ---
    public function storeIncoterm(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:incoterms,code',
            'name' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'applicable_modes' => 'required|in:all,sea,air,land',
            'status' => 'nullable|in:active,inactive',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['status'] = $validated['status'] ?? 'active';

        Incoterm::create($validated);

        return redirect()->back()->with('success', 'Incoterm added successfully');
    }

    public function updateIncoterm(Request $request, Incoterm $incoterm): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:incoterms,code,'.$incoterm->id,
            'name' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'applicable_modes' => 'required|in:all,sea,air,land',
            'status' => 'required|in:active,inactive',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));

        $incoterm->update($validated);

        return redirect()->back()->with('success', 'Incoterm updated successfully');
    }

    public function destroyIncoterm(Incoterm $incoterm): RedirectResponse
    {
        $incoterm->delete();

        return redirect()->back()->with('success', 'Incoterm deleted successfully');
    }

    // --- PACKAGES ---
    public function storePackageType(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:30|unique:package_types,code',
            'name' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'status' => 'nullable|in:active,inactive',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));
        $validated['status'] = $validated['status'] ?? 'active';

        PackageType::create($validated);

        return redirect()->back()->with('success', 'Package type added successfully');
    }

    public function updatePackageType(Request $request, PackageType $packageType): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:30|unique:package_types,code,'.$packageType->id,
            'name' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
        ]);
        $validated['code'] = strtoupper(trim($validated['code']));

        $packageType->update($validated);

        return redirect()->back()->with('success', 'Package type updated successfully');
    }

    public function destroyPackageType(PackageType $packageType): RedirectResponse
    {
        $packageType->delete();

        return redirect()->back()->with('success', 'Package type deleted successfully');
    }

    // --- MOVE TYPES ---
    public function storeMoveType(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:move_types,code',
            'name' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'status' => 'nullable|in:active,inactive',
        ]);
        $validated['status'] = $validated['status'] ?? 'active';

        MoveType::create($validated);

        return redirect()->back()->with('success', 'Move type added successfully');
    }

    public function updateMoveType(Request $request, MoveType $moveType): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:move_types,code,'.$moveType->id,
            'name' => 'required|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
        ]);

        $moveType->update($validated);

        return redirect()->back()->with('success', 'Move type updated successfully');
    }

    public function destroyMoveType(MoveType $moveType): RedirectResponse
    {
        $moveType->delete();

        return redirect()->back()->with('success', 'Move type deleted successfully');
    }
}
