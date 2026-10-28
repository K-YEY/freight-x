<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Task::with(['company', 'contact', 'opportunity']);

        if ($search = $request->input('search')) {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($priority = $request->input('priority')) {
            $query->where('priority', $priority);
        }

        $sortField = $request->input('sort', 'due_date');
        $sortDirection = $request->input('direction', 'asc');
        $allowedSorts = ['title', 'due_date', 'priority', 'status', 'created_at'];

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('due_date', 'asc');
        }

        $tasks = $query->get();
        $companies = Company::orderBy('name')->get(['id', 'name']);
        $contacts = Contact::orderBy('first_name')->get(['id', 'first_name', 'last_name']);
        $opportunities = Opportunity::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'companies' => $companies,
            'contacts' => $contacts,
            'opportunities' => $opportunities,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'priority' => $request->input('priority', ''),
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'status' => ['required', 'string', 'in:todo,in_progress,completed'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'contact_id' => ['nullable', 'exists:contacts,id'],
            'opportunity_id' => ['nullable', 'exists:opportunities,id'],
        ]);

        $task = Task::create($validated);

        ActivityLog::create([
            'type' => 'task',
            'title' => 'Task Created',
            'description' => "Task '{$task->title}' was scheduled.",
            'contact_id' => $task->contact_id,
            'company_id' => $task->company_id,
            'opportunity_id' => $task->opportunity_id,
        ]);

        return redirect()->back()->with('success', 'Task created successfully.');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'priority' => ['sometimes', 'required', 'string', 'in:low,medium,high,urgent'],
            'status' => ['sometimes', 'required', 'string', 'in:todo,in_progress,completed'],
            'company_id' => ['sometimes', 'nullable', 'exists:companies,id'],
            'contact_id' => ['sometimes', 'nullable', 'exists:contacts,id'],
            'opportunity_id' => ['sometimes', 'nullable', 'exists:opportunities,id'],
        ]);

        $wasCompleted = $task->status === 'completed';
        $task->update($validated);

        if (isset($validated['status']) && $validated['status'] === 'completed' && ! $wasCompleted) {
            ActivityLog::create([
                'type' => 'task',
                'title' => 'Task Completed ✓',
                'description' => "Completed: '{$task->title}'",
                'contact_id' => $task->contact_id,
                'company_id' => $task->company_id,
                'opportunity_id' => $task->opportunity_id,
            ]);
        }

        return redirect()->back()->with('success', 'Task updated successfully.');
    }

    public function toggle(Task $task): RedirectResponse
    {
        $newStatus = $task->status === 'completed' ? 'todo' : 'completed';
        $task->update(['status' => $newStatus]);

        if ($newStatus === 'completed') {
            ActivityLog::create([
                'type' => 'task',
                'title' => 'Task Completed ✓',
                'description' => "Finished task '{$task->title}'",
                'contact_id' => $task->contact_id,
                'company_id' => $task->company_id,
                'opportunity_id' => $task->opportunity_id,
            ]);
        }

        return redirect()->back()->with('success', 'Task status changed.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $task->delete();

        return redirect()->back()->with('success', 'Task deleted.');
    }
}
