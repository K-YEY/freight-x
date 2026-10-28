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
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('job_title', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($companyId = $request->input('company_id')) {
            $query->where('company_id', $companyId);
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSorts = ['first_name', 'last_name', 'email', 'status', 'city', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $contacts = $query->get();
        $companies = Company::orderBy('name')->get(['id', 'name', 'domain']);

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
            'companies' => $companies,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
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
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'job_title' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'status' => ['nullable', 'string', 'in:lead,customer,inactive'],
            'tags' => ['nullable', 'array'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
        ]);

        $validated['status'] = $validated['status'] ?? 'lead';

        $contact = Contact::create($validated);

        ActivityLog::create([
            'type' => 'created',
            'title' => 'Contact Created',
            'description' => "Added {$contact->name} to CRM.",
            'contact_id' => $contact->id,
            'company_id' => $contact->company_id,
        ]);

        return redirect()->back()->with('success', 'Contact created successfully.');
    }

    public function update(Request $request, Contact $contact): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:120'],
            'last_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'job_title' => ['sometimes', 'nullable', 'string', 'max:120'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'company_id' => ['sometimes', 'nullable', 'exists:companies,id'],
            'status' => ['sometimes', 'nullable', 'string', 'in:lead,customer,inactive'],
            'tags' => ['sometimes', 'nullable', 'array'],
            'linkedin_url' => ['sometimes', 'nullable', 'url', 'max:255'],
        ]);

        $contact->update($validated);

        ActivityLog::create([
            'type' => 'system',
            'title' => 'Contact Updated',
            'description' => "Updated details for {$contact->name}.",
            'contact_id' => $contact->id,
            'company_id' => $contact->company_id,
        ]);

        return redirect()->back()->with('success', 'Contact updated successfully.');
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $name = $contact->name;
        $contact->delete();

        return redirect()->back()->with('success', "Contact {$name} deleted successfully.");
    }
}
