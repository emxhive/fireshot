#!/bin/bash
set -e

echo "🚀 Updating FireflyApiRepository with self-refreshing 6-month cache..."

cat > app/Repositories/Shots/FireflyApiRepository.php <<'EOF'
<?php

namespace App\Repositories\Shots;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Bus;

class FireflyApiRepository
{
    protected string $baseUrl;
    protected string $token;

    public function __construct()
    {
        $this->baseUrl = config('services.firefly.base_url');
        $this->token   = config('services.firefly.token');
    }

    protected function client()
    {
        return Http::withToken($this->token)
            ->baseUrl($this->baseUrl)
            ->acceptJson();
    }

    /**
     * Always fetch fresh asset accounts (no caching)
     */
    public function getAccounts(): array
    {
        $response = $this->client()->get('/api/v1/accounts', ['type' => 'asset']);
        $data = $response->json('data') ?? [];

        return array_map(fn($a) => [
            'id'            => (int) $a['id'],
            'name'          => $a['attributes']['name'],
            'balance'       => (float) ($a['attributes']['current_balance'] ?? 0),
            'currency_code' => $a['attributes']['currency_code'] ?? 'NGN',
        ], $data);
    }

    /**
     * Return transactions for the given range using a pre-cached 6-month dataset.
     * If cache is missing or stale, automatically refresh it asynchronously.
     */
    public function getTransactions(string $start, string $end): array
    {
        $this->ensureSixMonthCacheFresh();
        $all = Cache::get('firefly.tx.last_6_months', []);

        // Filter the 6-month cache for the requested range
        return array_values(array_filter($all, function ($tx) use ($start, $end) {
            $date = $tx['attributes']['date'] ?? null;
            return $date && $date >= $start && $date <= $end;
        }));
    }

    /**
     * Fetch daily totals from the cached 6-month dataset.
     */
    public function getDailyTotals(string $date): array
    {
        $this->ensureSixMonthCacheFresh();
        $all = Cache::get('firefly.tx.last_6_months', []);

        $totals = ['USD' => 0.0, 'NGN' => 0.0];
        foreach ($all as $tx) {
            $txDate = $tx['attributes']['date'] ?? null;
            if ($txDate !== $date) continue;

            $currency = $tx['attributes']['currency_code'] ?? 'NGN';
            $amount   = (float) ($tx['attributes']['amount'] ?? 0);
            $totals[$currency] = ($totals[$currency] ?? 0) + $amount;
        }
        return $totals;
    }

    /**
     * Ensure the 6-month transaction cache is populated and fresh.
     * If older than 24 h, refresh asynchronously in background.
     */
    public function ensureSixMonthCacheFresh(): void
    {
        $key = 'firefly.tx.last_6_months';
        $metaKey = "$key.meta";

        $meta = Cache::get($metaKey);
        $expired = !$meta || now()->diffInHours($meta['timestamp']) >= 24;

        if ($expired) {
            Log::info('[FireflyApiRepository] Refreshing 6-month transaction cache...');

            // Run async refresh to avoid blocking request
            Bus::dispatch(function () {
                try {
                    app(self::class)->seedSixMonthCache();
                } catch (\Throwable $e) {
                    Log::error('Failed to refresh Firefly 6-month cache', ['error' => $e->getMessage()]);
                }
            });
        }
    }

    /**
     * Pull the last 6 months of transactions from Firefly and cache them for 24 h.
     * Handles pagination automatically.
     */
    public function seedSixMonthCache(): array
    {
        $key = 'firefly.tx.last_6_months';
        $metaKey = "$key.meta";

        $start = now()->subMonths(6)->format('Y-m-d');
        $end   = now()->format('Y-m-d');

        $page = 1;
        $limit = 1000;
        $data = [];

        do {
            $response = $this->client()->get('/api/v1/transactions', [
                'start' => $start,
                'end'   => $end,
                'type'  => 'all',
                'limit' => $limit,
                'page'  => $page,
            ]);

            $batch = $response->json('data') ?? [];
            $data  = array_merge($data, $batch);

            $pagination = $response->json('meta.pagination') ?? [];
            $hasMore = $pagination['current_page'] < $pagination['total_pages'];
            $page++;
        } while ($hasMore);

        Cache::put($key, $data, now()->addDay());
        Cache::put($metaKey, ['timestamp' => now()], now()->addDay());

        Log::info('[FireflyApiRepository] Cached ' . count($data) . ' transactions for 6-month window.');

        return $data;
    }
}
EOF

echo "✅ FireflyApiRepository replaced with Render-friendly 6-month self-refreshing cache."
