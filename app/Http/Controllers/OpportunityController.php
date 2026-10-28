<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Opportunity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OpportunityController extends Controller
{
    public const STAGES = [
        'new' => 'New',
        'screening' => 'Screening',
        'meeting' => 'Meeting',
        'proposal' => 'Proposal',
        'won' => 'Won',
        'lost' => 'Lost',
    ];

    public function index(Request $request): Response
    {
        $query = Opportunity::with(['company', 'contact', 'tasks', 'notes', 'activities' => function ($q) {
            $q->latest();
        }]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('company', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('contact', fn ($cq) => $cq->where('first_name', 'like', "%{$search}%")->orWhere('last_name', 'like', "%{$search}%"));
            });
        }

        if ($stage = $request->input('stage')) {
            $query->where('stage', $stage);
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSorts = ['name', 'amount', 'stage', 'probability', 'close_date', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest();
        }

        $opportunities = $query->get();
        $companies = Company::orderBy('name')->get(['id', 'name', 'domain']);
        $contacts = Contact::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'company_id']);

        // Group into Kanban columns
        $kanbanColumns = [];
        foreach (self::STAGES as $stageKey => $stageLabel) {
            $stageDeals = $opportunities->where('stage', $stageKey)->values();
            $kanbanColumns[$stageKey] = [
                'id' => $stageKey,
                'label' => $stageLabel,
                'deals' => $stageDeals,
                'totalAmount' => (float) $stageDeals->sum('amount'),
                'count' => $stageDeals->count(),
            ];
        }

        return Inertia::render('Opportunities/Index', [
            'opportunities' => $opportunities,
            'kanbanColumns' => $kanbanColumns,
            'stages' => self::STAGES,
            'companies' => $companies,
            'contacts' => $contacts,
            'currentView' => $request->input('view', 'kanban'), // default to kanban view like Twenty CRM deals
            'filters' => [
                'search' => $request->input('search', ''),
                'stage' => $request->input('stage', ''),
                'view' => $request->input('view', 'kanban'),
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'amount' => ['required', 'numeric', 'min:0'],
            'stage' => ['required', 'string', 'in:new,screening,meeting,proposal,won,lost'],
            'close_date' => ['nullable', 'date'],
            'probability' => ['nullable', 'integer', 'min:0', 'max:100'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'contact_id' => ['nullable', 'exists:contacts,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $opportunity = Opportunity::create($validated);

        ActivityLog::create([
            'type' => 'created',
            'title' => 'Opportunity Created',
            'description' => "Created deal '{$opportunity->name}' valued at $".number_format((float) $opportunity->amount, 2),
            'opportunity_id' => $opportunity->id,
            'company_id' => $opportunity->company_id,
            'contact_id' => $opportunity->contact_id,
        ]);

        return redirect()->back()->with('success', 'Deal created successfully.');
    }

    public function update(Request $request, Opportunity $opportunity): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:180'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stage' => ['sometimes', 'required', 'string', 'in:new,screening,meeting,proposal,won,lost'],
            'close_date' => ['sometimes', 'nullable', 'date'],
            'probability' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'],
            'company_id' => ['sometimes', 'nullable', 'exists:companies,id'],
            'contact_id' => ['sometimes', 'nullable', 'exists:contacts,id'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ]);

        $oldStage = $opportunity->stage;
        $opportunity->update($validated);

        if (isset($validated['stage']) && $validated['stage'] !== $oldStage) {
            $fromLabel = self::STAGES[$oldStage] ?? $oldStage;
            $toLabel = self::STAGES[$validated['stage']] ?? $validated['stage'];

            ActivityLog::create([
                'type' => 'stage_change',
                'title' => "Moved to {$toLabel}",
                'description' => "Stage changed from {$fromLabel} to {$toLabel}",
                'opportunity_id' => $opportunity->id,
                'company_id' => $opportunity->company_id,
                'contact_id' => $opportunity->contact_id,
            ]);
        }

        return redirect()->back()->with('success', 'Deal updated successfully.');
    }

    public function updateStage(Request $request, Opportunity $opportunity): RedirectResponse
    {
        $validated = $request->validate([
            'stage' => ['required', 'string', 'in:new,screening,meeting,proposal,won,lost'],
        ]);

        $oldStage = $opportunity->stage;
        $opportunity->update(['stage' => $validated['stage']]);

        $fromLabel = self::STAGES[$oldStage] ?? $oldStage;
        $toLabel = self::STAGES[$validated['stage']] ?? $validated['stage'];

        ActivityLog::create([
            'type' => 'stage_change',
            'title' => "Stage changed to {$toLabel}",
            'description' => "Moved from {$fromLabel} to {$toLabel}",
            'opportunity_id' => $opportunity->id,
            'company_id' => $opportunity->company_id,
            'contact_id' => $opportunity->contact_id,
        ]);

        return redirect()->back()->with('success', "Deal moved to {$toLabel}.");
    }

    public function destroy(Opportunity $opportunity): RedirectResponse
    {
        $name = $opportunity->name;
        $opportunity->delete();

        return redirect()->back()->with('success', "Deal '{$name}' deleted successfully.");
    }
}
