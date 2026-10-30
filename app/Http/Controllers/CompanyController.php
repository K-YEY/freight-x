<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Company::with(['contacts', 'opportunities', 'tasks', 'notes', 'activities' => function ($q) {
            $q->latest();
        }])
            ->withCount('contacts')
            ->withSum('opportunities', 'amount');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('tax_number', 'like', "%{$search}%")
                    ->orWhere('domain', 'like', "%{$search}%")
                    ->orWhere('industry', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($partnerType = $request->input('partner_type')) {
            $query->where('partner_type', $partnerType);
        }

        if ($industry = $request->input('industry')) {
            $query->where('industry', $industry);
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSorts = ['name', 'code', 'partner_type', 'city', 'country', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $companies = $query->get();
        $industries = Company::whereNotNull('industry')->distinct()->pluck('industry');

        $partnerTypeCounts = [
            'all' => Company::count(),
            'shipping_line' => Company::where('partner_type', 'shipping_line')->count(),
            'trucker' => Company::where('partner_type', 'trucker')->count(),
            'customs_broker' => Company::where('partner_type', 'customs_broker')->count(),
            'overseas_agent' => Company::where('partner_type', 'overseas_agent')->count(),
            'warehouse_operator' => Company::where('partner_type', 'warehouse_operator')->count(),
            'airline' => Company::where('partner_type', 'airline')->count(),
        ];

        return Inertia::render('Companies/Index', [
            'companies' => $companies,
            'industries' => $industries,
            'partnerTypeCounts' => $partnerTypeCounts,
            'filters' => [
                'search' => $request->input('search', ''),
                'partner_type' => $request->input('partner_type', ''),
                'industry' => $request->input('industry', ''),
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['nullable', 'string', 'max:20'],
            'partner_type' => ['required', 'string', 'in:shipping_line,trucker,customs_broker,overseas_agent,warehouse_operator,airline,vendor,customer'],
            'contact_person' => ['nullable', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'domain' => ['nullable', 'string', 'max:100'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'industry' => ['nullable', 'string', 'max:100'],
            'employees_count' => ['nullable', 'integer', 'min:0'],
            'annual_revenue' => ['nullable', 'numeric', 'min:0'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $company = Company::create($validated);

        ActivityLog::create([
            'type' => 'created',
            'title' => 'Logistics Partner Created',
            'description' => "Added partner {$company->name} ({$company->partner_type}) to CRM.",
            'company_id' => $company->id,
        ]);

        return redirect()->back()->with('success', 'Partner company created successfully.');
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'code' => ['sometimes', 'nullable', 'string', 'max:20'],
            'partner_type' => ['sometimes', 'required', 'string', 'in:shipping_line,trucker,customs_broker,overseas_agent,warehouse_operator,airline,vendor,customer'],
            'contact_person' => ['sometimes', 'nullable', 'string', 'max:120'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'tax_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'domain' => ['sometimes', 'nullable', 'string', 'max:100'],
            'website_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'industry' => ['sometimes', 'nullable', 'string', 'max:100'],
            'employees_count' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'annual_revenue' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'linkedin_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
        ]);

        $company->update($validated);

        ActivityLog::create([
            'type' => 'system',
            'title' => 'Partner Updated',
            'description' => "Updated partner details for {$company->name}.",
            'company_id' => $company->id,
        ]);

        return redirect()->back()->with('success', 'Partner updated successfully.');
    }

    public function destroy(Company $company): RedirectResponse
    {
        $name = $company->name;
        $company->delete();

        return redirect()->back()->with('success', "Partner {$name} deleted successfully.");
    }
}
