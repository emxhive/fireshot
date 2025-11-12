<?php

namespace App\Client\Firefly;

use App\Shared\CacheKeys;
use App\Shared\Enums\Granularity;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TransactionsClient extends FireflyClient
{
    public function __construct(private TransactionCacheManager $cache)
    {
        parent::__construct();
    }

    /**
     * Return cached KW transactions between [start, end].
     */
    public function getTransactions(string $start, string $end): array
    {
        $this->cache->ensureFreshCache();
        $all = Cache::get(CacheKeys::FIREFLY_KW_TX, []);
        return array_values(array_filter($all, fn($tx) => isset($tx['date']) && $tx['date'] >= $start && $tx['date'] <= $end
        ));
    }

    /**
     * Aggregate cached transactions by granularity.
     */
    public function getPeriodTransactions(string $granularity = 'month', int $limit = 12): array
    {
        $this->cache->ensureFreshCache();
        $data = Cache::get(CacheKeys::FIREFLY_KW_TX, []);

        if (empty($data)) {
            Log::warning('[TransactionsClient] No cached KW transactions.');
            return [];
        }

        $g = Granularity::fromString($granularity);

        return collect($data)
            ->filter(fn($t) => isset($t['date'], $t['amount']))
            ->map(fn($t) => [
                ...$t,
                'period' => Granularity::periodKey($g, $t['date']),
            ])
            ->groupBy('period')
            ->map(fn($grp) => $grp->sum('amount'))
            ->sortKeysDesc()
            ->take($limit)
            ->reverse()
            ->map(fn($total, $period) => [
                'period' => $period,
                'total' => round($total, 2),
            ])
            ->values()
            ->all();
    }
}
