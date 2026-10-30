<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExchangeRateTest extends TestCase
{
    protected ?User $user = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::first() ?? User::factory()->create();
    }

    public function test_can_fetch_exchange_rates_endpoint(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/exchange-rates');

        $response->assertOk()
            ->assertJsonStructure([
                'base',
                'rates',
                'currencies',
                'last_synced_at',
                'is_live',
            ])
            ->assertJson(['base' => 'USD']);

        $this->assertDatabaseHas('exchange_rates', ['code' => 'USD']);
        $this->assertDatabaseHas('exchange_rates', ['code' => 'EGP']);
    }

    public function test_can_convert_currencies_via_api(): void
    {
        // Ensure default rates exist
        app(ExchangeRateService::class)->ensureDefaults();

        $response = $this->actingAs($this->user)->getJson('/api/exchange-rates/convert?amount=100&from=USD&to=EGP');

        $response->assertOk()
            ->assertJsonStructure([
                'amount',
                'from',
                'to',
                'converted',
            ])
            ->assertJson([
                'amount' => 100,
                'from' => 'USD',
                'to' => 'EGP',
            ]);

        $this->assertGreaterThan(0, $response->json('converted'));
    }

    public function test_can_update_custom_exchange_rate(): void
    {
        app(ExchangeRateService::class)->ensureDefaults();

        // Add CAD for update test
        $this->actingAs($this->user)->postJson('/api/exchange-rates', [
            'code' => 'CAD',
            'name_ar' => 'دولار كندي',
            'name_en' => 'Canadian Dollar',
            'symbol' => 'CA$',
            'flag' => '🇨🇦',
            'rate_to_usd' => 1.35,
            'is_auto_sync' => true,
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/exchange-rates/update', [
            'code' => 'CAD',
            'rate_to_usd' => 1.39,
            'is_auto_sync' => false,
        ]);

        $response->assertOk()
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('exchange_rates', [
            'code' => 'CAD',
            'rate_to_usd' => 1.39,
            'is_auto_sync' => false,
        ]);

        // Clean up test currency
        $this->actingAs($this->user)->deleteJson('/api/exchange-rates/CAD');
    }

    public function test_can_sync_live_rates_from_market_api(): void
    {
        Http::fake([
            'open.er-api.com/*' => Http::response([
                'result' => 'success',
                'base_code' => 'USD',
                'rates' => [
                    'USD' => 1.0,
                    'EGP' => 51.25,
                    'EUR' => 0.93,
                    'SAR' => 3.75,
                    'AED' => 3.67,
                    'CNY' => 7.28,
                    'GBP' => 0.79,
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->user)->postJson('/api/exchange-rates/refresh');

        $response->assertOk()
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('exchange_rates', [
            'code' => 'EUR',
            'rate_to_usd' => 0.93,
        ]);
    }

    public function test_can_store_new_currency(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/exchange-rates', [
            'code' => 'KWD',
            'name_ar' => 'دينار كويتي',
            'name_en' => 'Kuwaiti Dinar',
            'symbol' => 'د.ك',
            'flag' => '🇰🇼',
            'rate_to_usd' => 0.308,
            'is_auto_sync' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('exchange_rates', [
            'code' => 'KWD',
            'symbol' => 'د.ك',
            'rate_to_usd' => 0.308,
        ]);
    }

    public function test_can_delete_currency(): void
    {
        // First ensure KWD exists
        $this->actingAs($this->user)->postJson('/api/exchange-rates', [
            'code' => 'QAR',
            'name_ar' => 'ريال قطري',
            'name_en' => 'Qatari Riyal',
            'symbol' => 'ر.ق',
            'flag' => '🇶🇦',
            'rate_to_usd' => 3.64,
        ]);

        $response = $this->actingAs($this->user)->deleteJson('/api/exchange-rates/QAR');

        $response->assertOk()
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('exchange_rates', [
            'code' => 'QAR',
        ]);
    }

    public function test_cannot_delete_base_usd_currency(): void
    {
        $response = $this->actingAs($this->user)->deleteJson('/api/exchange-rates/USD');

        $response->assertStatus(422)
            ->assertJson(['success' => false]);

        $this->assertDatabaseHas('exchange_rates', [
            'code' => 'USD',
        ]);
    }
}
