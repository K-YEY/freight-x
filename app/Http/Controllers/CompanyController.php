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
                    ->orWhere('domain', 'like', "%{$search}%")
                    ->orWhere('industry', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($industry = $request->input('industry')) {
            $query->where('industry', $industry);
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSorts = ['name', 'domain', 'industry', 'employees_count', 'annual_revenue', 'city', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $companies = $query->get();
        $industries = Company::whereNotNull('industry')->distinct()->pluck('industry');

        return Inertia::render('Companies/Index', [
            'companies' => $companies,
            'industries' => $industries,
            'filters' => [
                'search' => $request->input('search', ''),
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
            'title' => 'Company Created',
            'description' => "Added company {$company->name} to CRM.",
            'company_id' => $company->id,
        ]);

        return redirect()->back()->with('success', 'Company created successfully.');
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
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
            'title' => 'Company Updated',
            'description' => "Updated company details for {$company->name}.",
            'company_id' => $company->id,
        ]);

        return redirect()->back()->with('success', 'Company updated successfully.');
    }

    public function destroy(Company $company): RedirectResponse
    {
        $name = $company->name;
        $company->delete();

        return redirect()->back()->with('success', "Company {$name} deleted successfully.");
    }
}
