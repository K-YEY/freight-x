<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Note;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'contact_id' => ['nullable', 'exists:contacts,id'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'opportunity_id' => ['nullable', 'exists:opportunities,id'],
        ]);

        $note = Note::create($validated);

        ActivityLog::create([
            'type' => 'note',
            'title' => 'Note Added',
            'description' => $note->title ? "Added note: {$note->title}" : 'Added a new note',
            'contact_id' => $note->contact_id,
            'company_id' => $note->company_id,
            'opportunity_id' => $note->opportunity_id,
        ]);

        return redirect()->back()->with('success', 'Note added successfully.');
    }

    public function update(Request $request, Note $note): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $note->update($validated);

        return redirect()->back()->with('success', 'Note updated successfully.');
    }

    public function destroy(Note $note): RedirectResponse
    {
        $note->delete();

        return redirect()->back()->with('success', 'Note deleted.');
    }
}
