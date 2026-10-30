<?php

namespace App\Http\Middleware;

use App\Services\ExchangeRateService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'job_title' => $request->user()->job_title,
                    'phone' => $request->user()->phone,
                    'status' => $request->user()->status,
                    'roles' => $request->user()->roles->map(fn ($r) => [
                        'id' => $r->id,
                        'name' => $r->name,
                        'display_name_en' => $r->display_name_en,
                        'display_name_ar' => $r->display_name_ar,
                    ])->values()->all(),
                    'permissions' => $request->user()->roles->flatMap->permissions->pluck('name')->unique()->values()->all(),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'exchangeRates' => fn () => app(ExchangeRateService::class)->getRatesPayload(),
        ];
    }
}
