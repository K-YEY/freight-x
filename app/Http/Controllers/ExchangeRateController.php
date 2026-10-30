<?php

namespace App\Http\Controllers;

use App\Services\ExchangeRateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExchangeRateController extends Controller
{
    public function __construct(
        protected ExchangeRateService $exchangeRateService
    ) {}

    /**
     * Get live exchange rates payload.
     */
    public function index(): JsonResponse
    {
        $payload = $this->exchangeRateService->getRatesPayload();

        return response()->json($payload);
    }

    /**
     * Force live sync from international exchange rates API.
     */
    public function refresh(Request $request): JsonResponse
    {
        $force = $request->boolean('force', true);
        $result = $this->exchangeRateService->syncLiveRates($force);

        return response()->json($result);
    }

    /**
     * Add a new currency.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|size:3',
            'name_en' => 'nullable|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'symbol' => 'nullable|string|max:10',
            'flag' => 'nullable|string|max:10',
            'rate_to_usd' => 'nullable|numeric|gt:0',
            'is_auto_sync' => 'nullable|boolean',
        ]);

        $currency = $this->exchangeRateService->createCurrency($validated);

        return response()->json([
            'success' => true,
            'message' => 'تمت إضافة العملة بنجاح.',
            'currency' => $currency,
            'data' => $this->exchangeRateService->getRatesPayload(true),
        ], 201);
    }

    /**
     * Update rate for a specific currency manually.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|size:3',
            'rate_to_usd' => 'required|numeric|gt:0',
            'is_auto_sync' => 'nullable|boolean',
            'name_en' => 'nullable|string|max:100',
            'name_ar' => 'nullable|string|max:100',
            'symbol' => 'nullable|string|max:10',
            'flag' => 'nullable|string|max:10',
        ]);

        $success = $this->exchangeRateService->updateRate(
            strtoupper($validated['code']),
            (float) $validated['rate_to_usd'],
            isset($validated['is_auto_sync']) ? (bool) $validated['is_auto_sync'] : null,
            $validated
        );

        if (! $success) {
            return response()->json([
                'success' => false,
                'message' => 'العملة المحددة غير موجودة.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم تعديل سعر الصرف بنجاح.',
            'data' => $this->exchangeRateService->getRatesPayload(true),
        ]);
    }

    /**
     * Delete a currency.
     */
    public function destroy(string $code): JsonResponse
    {
        if (strtoupper($code) === 'USD') {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف العملة الأساسية للمنصة (USD).',
            ], 422);
        }

        $success = $this->exchangeRateService->deleteCurrency($code);

        if (! $success) {
            return response()->json([
                'success' => false,
                'message' => 'العملة غير موجودة.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'تم حذف العملة بنجاح.',
            'data' => $this->exchangeRateService->getRatesPayload(true),
        ]);
    }

    /**
     * Live conversion calculator endpoint.
     */
    public function convert(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
        ]);

        $converted = $this->exchangeRateService->convert(
            (float) $validated['amount'],
            strtoupper($validated['from']),
            strtoupper($validated['to'])
        );

        return response()->json([
            'amount' => (float) $validated['amount'],
            'from' => strtoupper($validated['from']),
            'to' => strtoupper($validated['to']),
            'converted' => $converted,
        ]);
    }
}
