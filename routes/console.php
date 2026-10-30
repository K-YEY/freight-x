<?php

use App\Services\ExchangeRateService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('exchange-rates:sync {--force : Force sync all currencies}', function (ExchangeRateService $service) {
    $force = (bool) $this->option('force');
    $this->info('Fetching real-time exchange rates from free open market APIs...');
    $result = $service->syncLiveRates($force);

    if ($result['success']) {
        $this->info($result['message']);
        $currencies = $result['data']['currencies'] ?? [];
        $rows = array_map(fn ($c) => [
            $c['code'],
            $c['name_ar'],
            $c['rate_to_usd'],
            $c['is_auto_sync'] ? 'Yes' : 'No',
            $c['last_synced_at'] ?? 'N/A',
        ], $currencies);

        $this->table(['Code', 'Name (AR)', 'Rate to 1 USD', 'Auto Sync', 'Last Synced'], $rows);
    } else {
        $this->error($result['message']);
    }
})->purpose('Fetch and update live exchange rates from free international APIs');
