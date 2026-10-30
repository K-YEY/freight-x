<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Contact::with(['company', 'opportunities', 'tasks', 'notes', 'activities' => function ($q) {
            $q->latest();
        }]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('tax_id', 'like', "%{$search}%")
                    ->orWhere('commercial_registry', 'like', "%{$search}%")
                    ->orWhere('customs_card_number', 'like', "%{$search}%")
                    ->orWhere('nafeza_id', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($customerType = $request->input('customer_type')) {
            $query->where('customer_type', $customerType);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($companyId = $request->input('company_id')) {
            $query->where('company_id', $companyId);
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSorts = ['first_name', 'last_name', 'company_name', 'customer_type', 'email', 'phone', 'tax_id', 'status', 'city', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $contacts = $query->get();
        $companies = Company::orderBy('name')->get(['id', 'name', 'domain', 'partner_type']);

        $customerTypeCounts = [
            'all' => Contact::count(),
            'importer' => Contact::where('customer_type', 'importer')->count(),
            'exporter' => Contact::where('customer_type', 'exporter')->count(),
            'trader' => Contact::where('customer_type', 'trader')->count(),
            'broker_client' => Contact::where('customer_type', 'broker_client')->count(),
        ];

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
            'companies' => $companies,
            'customerTypeCounts' => $customerTypeCounts,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'customer_type' => $request->input('customer_type', ''),
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['nullable', 'string', 'max:120'],
            'company_name' => ['nullable', 'string', 'max:150'],
            'customer_type' => ['nullable', 'string', 'in:importer,exporter,trader,broker_client,individual'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'commercial_registry' => ['nullable', 'string', 'max:50'],
            'customs_card_number' => ['nullable', 'string', 'max:50'],
            'nafeza_id' => ['nullable', 'string', 'max:50'],
            'job_title' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'billing_address' => ['nullable', 'string', 'max:500'],
            'country' => ['nullable', 'string', 'max:100'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'status' => ['nullable', 'string', 'in:lead,customer,active,inactive'],
            'payment_terms' => ['nullable', 'string', 'in:cash,credit_15,credit_30,credit_60'],
            'credit_limit' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'tags' => ['nullable', 'array'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
        ]);

        $validated['status'] = $validated['status'] ?? 'active';
        $validated['customer_type'] = $validated['customer_type'] ?? 'importer';

        $contact = Contact::create($validated);

        ActivityLog::create([
            'type' => 'created',
            'title' => 'Customer Added',
            'description' => "Added freight customer {$contact->name} ({$contact->company_name}) to CRM.",
            'contact_id' => $contact->id,
            'company_id' => $contact->company_id,
        ]);

        return redirect()->back()->with('success', 'Customer created successfully.');
    }

    public function update(Request $request, Contact $contact): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:120'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'company_name' => ['sometimes', 'nullable', 'string', 'max:150'],
            'customer_type' => ['sometimes', 'nullable', 'string', 'in:importer,exporter,trader,broker_client,individual'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'tax_id' => ['sometimes', 'nullable', 'string', 'max:50'],
            'commercial_registry' => ['sometimes', 'nullable', 'string', 'max:50'],
            'customs_card_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'nafeza_id' => ['sometimes', 'nullable', 'string', 'max:50'],
            'job_title' => ['sometimes', 'nullable', 'string', 'max:120'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'billing_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'company_id' => ['sometimes', 'nullable', 'exists:companies,id'],
            'status' => ['sometimes', 'nullable', 'string', 'in:lead,customer,active,inactive'],
            'payment_terms' => ['sometimes', 'nullable', 'string', 'in:cash,credit_15,credit_30,credit_60'],
            'credit_limit' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'tags' => ['sometimes', 'nullable', 'array'],
            'linkedin_url' => ['sometimes', 'nullable', 'url', 'max:255'],
        ]);

        $contact->update($validated);

        ActivityLog::create([
            'type' => 'system',
            'title' => 'Customer Updated',
            'description' => "Updated details for {$contact->name}.",
            'contact_id' => $contact->id,
            'company_id' => $contact->company_id,
        ]);

        return redirect()->back()->with('success', 'Customer updated successfully.');
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $name = $contact->name;
        $contact->delete();

        return redirect()->back()->with('success', "Customer {$name} deleted successfully.");
    }
}
