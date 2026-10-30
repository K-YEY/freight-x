<?php

namespace App\Services;

use App\Models\ExchangeRate;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateService
{
    protected const CACHE_KEY = 'freight_exchange_rates_payload';

    protected const CACHE_TTL_MINUTES = 60;

    /**
     * Default supported freight currencies with realistic baseline rates.
     */
    protected array $defaultCurrencies = [
        [
            'code' => 'USD',
            'name_en' => 'US Dollar',
            'name_ar' => 'دولار أمريكي',
            'symbol' => '$',
            'flag' => '🇺🇸',
            'rate_to_usd' => 1.000000,
            'is_auto_sync' => true,
            'sort_order' => 1,
        ],
        [
            'code' => 'EGP',
            'name_en' => 'Egyptian Pound',
            'name_ar' => 'جنيه مصري',
            'symbol' => 'E£',
            'flag' => '🇪🇬',
            'rate_to_usd' => 56.040000,
            'is_auto_sync' => true,
            'sort_order' => 2,
        ],
        [
            'code' => 'EUR',
            'name_en' => 'Euro',
            'name_ar' => 'يورو أوروبي',
            'symbol' => '€',
            'flag' => '🇪🇺',
            'rate_to_usd' => 0.896000,
            'is_auto_sync' => true,
            'sort_order' => 3,
        ],
        [
            'code' => 'SAR',
            'name_en' => 'Saudi Riyal',
            'name_ar' => 'ريال سعودي',
            'symbol' => 'SR',
            'flag' => '🇸🇦',
            'rate_to_usd' => 3.750000,
            'is_auto_sync' => true,
            'sort_order' => 4,
        ],
        [
            'code' => 'AED',
            'name_en' => 'UAE Dirham',
            'name_ar' => 'درهم إماراتي',
            'symbol' => 'AED',
            'flag' => '🇦🇪',
            'rate_to_usd' => 3.672500,
            'is_auto_sync' => true,
            'sort_order' => 5,
        ],
        [
            'code' => 'CNY',
            'name_en' => 'Chinese Yuan',
            'name_ar' => 'يوان صيني',
            'symbol' => '¥',
            'flag' => '🇨🇳',
            'rate_to_usd' => 6.680000,
            'is_auto_sync' => true,
            'sort_order' => 6,
        ],
        [
            'code' => 'GBP',
            'name_en' => 'British Pound',
            'name_ar' => 'جنيه إسترليني',
            'symbol' => '£',
            'flag' => '🇬🇧',
            'rate_to_usd' => 0.749000,
            'is_auto_sync' => true,
            'sort_order' => 7,
        ],
    ];

    /**
     * Ensure default currencies exist in the database.
     */
    public function ensureDefaults(): void
    {
        foreach ($this->defaultCurrencies as $item) {
            ExchangeRate::firstOrCreate(
                ['code' => $item['code']],
                $item
            );
        }
    }

    /**
     * Fetch live exchange rates against USD from free open market APIs.
     * Uses a resilient multi-provider fallback chain with local SSL bypass.
     *
     * @return array<string, float>
     */
    public function fetchLiveRatesFromApi(): array
    {
        $providers = [
            [
                'name' => 'open.er-api.com',
                'url' => 'https://open.er-api.com/v6/latest/USD',
                'parser' => fn (array $data): array => $data['rates'] ?? [],
            ],
            [
                'name' => 'api.exchangerate-api.com',
                'url' => 'https://api.exchangerate-api.com/v4/latest/USD',
                'parser' => fn (array $data): array => $data['rates'] ?? [],
            ],
            [
                'name' => 'fawazahmed0 currency-api',
                'url' => 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
                'parser' => function (array $data): array {
                    $raw = $data['usd'] ?? [];
                    $rates = [];
                    foreach ($raw as $code => $rate) {
                        $rates[strtoupper((string) $code)] = (float) $rate;
                    }

                    return $rates;
                },
            ],
        ];

        foreach ($providers as $provider) {
            try {
                $response = Http::withoutVerifying()
                    ->timeout(8)
                    ->get($provider['url']);

                if ($response->successful()) {
                    $json = $response->json();
                    if (is_array($json)) {
                        $rates = ($provider['parser'])($json);
                        if (! empty($rates) && (isset($rates['EUR']) || isset($rates['EGP']))) {
                            return $rates;
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("Exchange rate provider [{$provider['name']}] failed: {$e->getMessage()}");
            }
        }

        return [];
    }

    /**
     * Get the full exchange rate payload for frontend & controllers.
     */
    public function getRatesPayload(bool $fresh = false): array
    {
        if ($fresh) {
            Cache::forget(self::CACHE_KEY);
        }

        return Cache::remember(self::CACHE_KEY, now()->addMinutes(self::CACHE_TTL_MINUTES), function () {
            $this->ensureDefaults();

            $records = ExchangeRate::orderBy('sort_order')->get();
            $ratesMap = [];
            foreach ($records as $rate) {
                $ratesMap[$rate->code] = (float) $rate->rate_to_usd;
            }

            $currenciesArray = $records->map(fn ($r) => [
                'id' => $r->id,
                'code' => $r->code,
                'name_en' => $r->name_en,
                'name_ar' => $r->name_ar,
                'symbol' => $r->symbol,
                'flag' => $r->flag,
                'rate_to_usd' => (float) $r->rate_to_usd,
                'is_auto_sync' => (bool) $r->is_auto_sync,
                'sort_order' => (int) $r->sort_order,
                'last_synced_at' => $r->last_synced_at ? Carbon::parse($r->last_synced_at)->toIso8601String() : null,
            ])->values()->all();

            $lastSynced = ExchangeRate::whereNotNull('last_synced_at')->max('last_synced_at');

            return [
                'base' => 'USD',
                'rates' => $ratesMap,
                'currencies' => $currenciesArray,
                'last_synced_at' => $lastSynced ? Carbon::parse($lastSynced)->toIso8601String() : null,
                'is_live' => true,
            ];
        });
    }

    /**
     * Sync live rates from the open live exchange rate market API.
     */
    public function syncLiveRates(bool $forceAll = false): array
    {
        $this->ensureDefaults();

        $liveRates = $this->fetchLiveRatesFromApi();

        if (! empty($liveRates)) {
            $now = now();
            $currencies = ExchangeRate::all();

            foreach ($currencies as $currency) {
                if (($currency->is_auto_sync || $forceAll) && isset($liveRates[$currency->code])) {
                    $currency->update([
                        'rate_to_usd' => (float) $liveRates[$currency->code],
                        'is_auto_sync' => true,
                        'last_synced_at' => $now,
                    ]);
                }
            }

            Cache::forget(self::CACHE_KEY);

            return [
                'success' => true,
                'message' => 'تم تحديث أسعار الصرف الحية بنجاح من الأسواق الدولية المفتوحة.',
                'data' => $this->getRatesPayload(true),
            ];
        }

        // Return current payload if API fetch failed
        return [
            'success' => false,
            'message' => 'تعذر الاتصال بمزود الأسعار الحي حالياً، تم استخدام آخر أسعار معتمدة.',
            'data' => $this->getRatesPayload(),
        ];
    }

    /**
     * Convert an amount between any two currencies.
     */
    public function convert(float $amount, string $fromCode, string $toCode): float
    {
        $payload = $this->getRatesPayload();
        $rates = $payload['rates'];

        $fromRate = $rates[$fromCode] ?? 1.0;
        $toRate = $rates[$toCode] ?? 1.0;

        if ($fromRate <= 0) {
            return $amount;
        }

        // Convert from source to USD, then from USD to target
        $inUsd = $amount / $fromRate;

        return round($inUsd * $toRate, 4);
    }

    /**
     * Create and register a new currency.
     */
    public function createCurrency(array $data): ExchangeRate
    {
        $code = strtoupper(trim($data['code']));
        $rate = (float) ($data['rate_to_usd'] ?? 1.0);
        $autoSync = (bool) ($data['is_auto_sync'] ?? true);

        // If rate is not specified or 0, try to fetch from open API
        if ($rate <= 0 || ($rate == 1.0 && $code !== 'USD')) {
            $liveRates = $this->fetchLiveRatesFromApi();
            if (isset($liveRates[$code])) {
                $rate = (float) $liveRates[$code];
            }
        }

        $maxSort = ExchangeRate::max('sort_order') ?? 0;

        $currency = ExchangeRate::updateOrCreate(
            ['code' => $code],
            [
                'name_en' => $data['name_en'] ?? $code,
                'name_ar' => $data['name_ar'] ?? ($data['name_en'] ?? $code),
                'symbol' => $data['symbol'] ?? $code,
                'flag' => $data['flag'] ?? '🌐',
                'rate_to_usd' => $rate > 0 ? $rate : 1.0,
                'is_auto_sync' => $autoSync,
                'last_synced_at' => now(),
                'sort_order' => (int) ($data['sort_order'] ?? ($maxSort + 1)),
            ]
        );

        Cache::forget(self::CACHE_KEY);

        return $currency;
    }

    /**
     * Update a single currency rate manually.
     */
    public function updateRate(string $code, float $newRate, ?bool $autoSync = null, ?array $extra = null): bool
    {
        $currency = ExchangeRate::where('code', $code)->first();
        if (! $currency) {
            return false;
        }

        $updates = [
            'rate_to_usd' => $newRate,
            'last_synced_at' => now(),
        ];

        if ($autoSync !== null) {
            $updates['is_auto_sync'] = $autoSync;
        }

        if ($extra) {
            if (isset($extra['name_en'])) {
                $updates['name_en'] = $extra['name_en'];
            }
            if (isset($extra['name_ar'])) {
                $updates['name_ar'] = $extra['name_ar'];
            }
            if (isset($extra['symbol'])) {
                $updates['symbol'] = $extra['symbol'];
            }
            if (isset($extra['flag'])) {
                $updates['flag'] = $extra['flag'];
            }
        }

        $currency->update($updates);

        Cache::forget(self::CACHE_KEY);

        return true;
    }

    /**
     * Delete a custom currency (USD base currency cannot be deleted).
     */
    public function deleteCurrency(string $code): bool
    {
        $code = strtoupper(trim($code));
        if ($code === 'USD') {
            return false;
        }

        $deleted = ExchangeRate::where('code', $code)->delete();
        Cache::forget(self::CACHE_KEY);

        return (bool) $deleted;
    }
}
