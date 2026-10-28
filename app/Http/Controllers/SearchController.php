<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $query = trim($request->input('q', ''));

        if (strlen($query) < 1) {
            return response()->json([
                'contacts' => [],
                'companies' => [],
                'opportunities' => [],
                'tasks' => [],
            ]);
        }

        $contacts = Contact::with('company')
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")
                    ->orWhere('job_title', 'like', "%{$query}%");
            })
            ->take(5)
            ->get();

        $companies = Company::where('name', 'like', "%{$query}%")
            ->orWhere('domain', 'like', "%{$query}%")
            ->orWhere('industry', 'like', "%{$query}%")
            ->take(5)
            ->get();

        $opportunities = Opportunity::with('company')
            ->where('name', 'like', "%{$query}%")
            ->take(5)
            ->get();

        $tasks = Task::where('title', 'like', "%{$query}%")
            ->take(5)
            ->get();

        return response()->json([
            'contacts' => $contacts,
            'companies' => $companies,
            'opportunities' => $opportunities,
            'tasks' => $tasks,
        ]);
    }
}
