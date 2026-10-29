<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Company;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\Shipment;
use App\Models\Task;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalPipeline = Opportunity::whereNotIn('stage', ['won', 'lost'])->sum('amount');
        $wonRevenue = Opportunity::where('stage', 'won')->sum('amount');
        $contactsCount = Contact::count();
        $companiesCount = Company::count();
        $openTasksCount = Task::where('status', '!=', 'completed')->count();

        // Stage breakdown
        $stages = [
            'new' => ['label' => 'New', 'count' => 0, 'amount' => 0],
            'screening' => ['label' => 'Screening', 'count' => 0, 'amount' => 0],
            'meeting' => ['label' => 'Meeting', 'count' => 0, 'amount' => 0],
            'proposal' => ['label' => 'Proposal', 'count' => 0, 'amount' => 0],
            'won' => ['label' => 'Won', 'count' => 0, 'amount' => 0],
            'lost' => ['label' => 'Lost', 'count' => 0, 'amount' => 0],
        ];

        $stageGroups = Opportunity::selectRaw('stage, count(*) as count, sum(amount) as total')
            ->groupBy('stage')
            ->get();

        foreach ($stageGroups as $group) {
            if (isset($stages[$group->stage])) {
                $stages[$group->stage]['count'] = (int) $group->count;
                $stages[$group->stage]['amount'] = (float) $group->total;
            }
        }

        $recentActivities = ActivityLog::with(['contact', 'company', 'opportunity'])
            ->latest()
            ->take(8)
            ->get();

        $upcomingTasks = Task::with(['contact', 'company', 'opportunity'])
            ->where('status', '!=', 'completed')
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get();

        $topOpportunities = Opportunity::with(['company', 'contact'])
            ->whereNotIn('stage', ['lost'])
            ->orderByDesc('amount')
            ->take(5)
            ->get();

        // Freight Operations Stats
        $activeShipmentsCount = Shipment::whereNotIn('status', ['delivered', 'cancelled'])->count();
        $freightRevenue = (float) Shipment::sum('total_revenue');
        $freightProfit = (float) Shipment::sum('gross_profit');
        $recentShipments = Shipment::with([
            'customer:id,name',
            'carrier:id,name',
            'originPort:id,code,name',
            'destinationPort:id,code,name',
        ])->latest('id')->take(5)->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalPipeline' => (float) $totalPipeline,
                'wonRevenue' => (float) $wonRevenue,
                'contactsCount' => $contactsCount,
                'companiesCount' => $companiesCount,
                'openTasksCount' => $openTasksCount,
                'activeShipmentsCount' => $activeShipmentsCount,
                'freightRevenue' => $freightRevenue,
                'freightProfit' => $freightProfit,
            ],
            'stages' => array_values($stages),
            'recentActivities' => $recentActivities,
            'upcomingTasks' => $upcomingTasks,
            'topOpportunities' => $topOpportunities,
            'recentShipments' => $recentShipments,
        ]);
    }
}
