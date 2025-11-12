<?php

namespace App\Client\Firefly;

use App\Domain\Transactions\Support\TransactionUtils;
use App\Shared\CacheKeys;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class TransactionCacheManager extends FireflyClient
{
    /**
     * Ensures cached KW transactions exist and are <24h old.
     */
    public function ensureFreshCache(): void
    {
        $meta = Cache::get(CacheKeys::FIREFLY_KW_TX_META);
        $expired = !$meta || now()->diffInHours($meta['timestamp']) >= 24;
        $empty = empty(Cache::get(CacheKeys::FIREFLY_KW_TX, []));

        if ($expired || $empty) {
            $lock = Cache::lock(CacheKeys::FIREFLY_KW_LOCK_REFRESH, 300);
            if ($lock->get()) {
                try {
                    $this->seedSixMonthCache();
                } catch (Throwable $e) {
                    Log::error('[TransactionCacheManager] Refresh failed', ['error' => $e->getMessage()]);
                } finally {
                    $lock->release();
                }
            }
        }
    }

    /** @return array<array{date:string,amount:float,type:string}> */
    public function getAll(): array
    {
        $this->ensureFreshCache();
        return Cache::get(CacheKeys::FIREFLY_KW_TX, []);
    }

    public function getWindow(string $start, string $end): array
    {
        return array_values(array_filter(
            $this->getAll(),
            fn($t) => isset($t['date']) && $t['date'] >= $start && $t['date'] < $end
        ));
    }

    /**
     * Rebuilds the KW cache from Firefly for the last 6 months.
     * @throws ConnectionException
     */
    public function seedSixMonthCache(): array
    {
        // === Find KW account ===
        $search = $this->client()->get('/search/accounts', [
            'query' => 'KW',
            'field' => 'name',
            'type' => 'asset',
            'limit' => 1,
        ]);

        if (!$search->successful()) {
            Log::error('[TransactionCacheManager] Failed to find KW account', [
                'status' => $search->status(),
                'body' => $search->body(),
            ]);
            return [];
        }

        $kw = $search->json('data.0');
        if (!$kw || empty($kw['id'])) {
            Log::warning('[TransactionCacheManager] KW account not found.');
            return [];
        }

        $id = $kw['id'];
        $start = now()->subMonths(6)->format('Y-m-d');
        $end = now()->format('Y-m-d');
        $page = 1;
        $limit = 100;
        $flat = [];

        do {
            $res = $this->client()->get("/accounts/{$id}/transactions", [
                'type' => 'withdrawal,deposit',
                'start' => $start,
                'end' => $end,
                'limit' => $limit,
                'page' => $page,
            ]);

            if (!$res->successful()) {
                Log::error('[TransactionCacheManager] Transaction fetch failed', [
                    'status' => $res->status(),
                    'body' => $res->body(),
                ]);
                break;
            }

            $batch = $res->json('data') ?? [];
            $meta = $res->json('meta.pagination') ?? [];
            $page++;
            $hasMore = ($meta['current_page'] ?? 1) < ($meta['total_pages'] ?? 1);

            foreach ($batch as $entry) {
                foreach ($entry['attributes']['transactions'] ?? [] as $tx) {
                    $type = $tx['type'] ?? null;
                    $date = $tx['date'] ?? null;
                    $amount = (float)($tx['amount'] ?? 0);
                    if (!$date || !$type) continue;

                    $signed = TransactionUtils::sign($type, $amount);
                    $flat[] = [
                        "id" => $entry['id'],
                        'date' => substr($date, 0, 10),
                        'amount' => $signed,
                        'type' => $type,
                    ];
                }
            }
        } while ($hasMore);

        if (empty($flat)) {
            Log::warning('[TransactionCacheManager] No transactions to cache.');
            return [];
        }

        Cache::put(CacheKeys::FIREFLY_KW_TX, $flat, now()->addDay());
        Cache::put(CacheKeys::FIREFLY_KW_TX_META, ['timestamp' => now(), 'count' => count($flat)], now()->addDay());

        Log::info('[TransactionCacheManager] Cached ' . count($flat) . ' KW transactions.');
        return $flat;
    }
}
