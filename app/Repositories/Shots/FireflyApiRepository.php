<?php

namespace App\Repositories\Shots;

use App\Enums\Shots\AccountRole;
use App\Enums\Shots\Granularity;
use App\Support\Shots\CacheKeys;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class FireflyApiRepository implements FireflyRepository
{
    protected string $baseUrl;
    protected string $token;

    public function __construct()
    {
        $this->baseUrl = (string)config('services.firefly.url');
        $this->token = (string)config('services.firefly.token');
    }

    protected function client(): PendingRequest|Factory
    {
        return Http::withToken($this->token)
            ->baseUrl($this->baseUrl)
            ->acceptJson();
    }

    /**
     * Always fetch fresh asset accounts (no caching).
     * @throws ConnectionException
     */
    public function getAccounts(AccountRole $role = AccountRole::DefaultAsset): array
    {
        $response = $this->client()->get('/accounts', ['type' => 'asset']);
        if (!$response->successful()) {
            Log::error('[FireflyApiRepository] Failed to fetch accounts', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        $data = $response->json('data') ?? [];

        $filtered = array_filter($data, fn($a) => ($a['attributes']['account_role'] ?? null) === $role->value
        );

        return array_map(function ($a) {
            $attr = $a['attributes'] ?? [];
            return [
                'id' => (int)($a['id'] ?? 0),
                'name' => (string)($attr['name'] ?? ''),
                'role' => $attr['account_role'] ?? null,
                'balance' => (float)($attr['current_balance'] ?? 0),
                'currency_code' => $attr['currency_code']
                    ?? $attr['primary_currency_code']
                        ?? 'NGN',
            ];
        }, $filtered);
    }


    /**
     * Returns cached KW transactions (signed amounts).
     */
    public function getTransactions(string $start, string $end): array
    {
        $this->ensureSixMonthCacheFresh();

        $all = Cache::get(CacheKeys::FIREFLY_KW_TX, []);

        // filter by date window
        return array_values(array_filter($all, fn($tx) => ($tx['date'] ?? null) >= $start && ($tx['date'] ?? null) <= $end
        ));
    }


    /**
     * Aggregate cached KW transactions by day, week, or month.
     * Signed totals (withdrawal negative, deposit positive).
     */
    public function getPeriodTransactions(string $granularity = 'month', int $limit = 12): array
    {
        $this->ensureSixMonthCacheFresh();
        $data = Cache::get(CacheKeys::FIREFLY_KW_TX, []);

        if (empty($data)) {
            Log::warning('[FireflyApiRepository] No cached KW transactions for aggregation.');
            return [];
        }

        $g = Granularity::fromString($granularity);

        return collect($data)
            ->filter(fn($t) => isset($t['date'], $t['amount']))
            ->map(function ($t) use ($g) {
                $t['period'] = Granularity::periodKey($g, $t['date']);
                return $t;
            })
            ->groupBy('period')
            ->map(fn($group) => $group->sum('amount'))
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


    /**
     * Return positive balances for snapshot input date.
     * Note: Firefly API does not expose historical balances per arbitrary date;
     *       we use current balances as the snapshot source of truth.
     * @throws ConnectionException
     */
    public function getPositiveBalancesForDate(string $date): array
    {

        $accounts = $this->getAccounts();

        // Normalize to the structure SnapshotService expects
        $mapped = array_map(function (array $a) {
            return [
                'account_id' => (int)($a['id'] ?? 0),
                'currency_code' => (string)($a['currency_code'] ?? 'NGN'),
                'balance_raw' => (float)($a['balance'] ?? 0.0),
            ];
        }, $accounts);

        // Keep strictly positive balances
        return array_values(array_filter($mapped, fn($r) => ($r['balance_raw'] ?? 0) > 0));
    }

    public function ensureSixMonthCacheFresh(): void
    {
        $key = CacheKeys::FIREFLY_KW_TX;
        $metaKey = CacheKeys::FIREFLY_KW_TX_META;

        $data = Cache::get($key, []);
        $meta = Cache::get($metaKey);
        $expired = !$meta || now()->diffInHours($meta['timestamp']) >= 24;

        if ($expired || empty($data)) {
            $lock = Cache::lock(CacheKeys::FIREFLY_KW_LOCK_REFRESH, 300);

            if ($lock->get()) {
                try {
                    $data = $this->seedSixMonthCache();

                    if (empty($data)) {
                        Log::warning('[FireflyApiRepository] No KW transactions found after retry.');
                    }
                } catch (Throwable $e) {
                    Log::error('Failed to refresh KW cache', ['error' => $e->getMessage()]);
                } finally {
                    optional($lock)->release();
                }
            }
        }
    }


    /**
     * Pulls KW account transactions and caches only {date, amount, type}.
     * @throws ConnectionException
     */
    public function seedSixMonthCache(): array
    {
        $key = CacheKeys::FIREFLY_KW_TX;
        $metaKey = CacheKeys::FIREFLY_KW_TX_META;

        // Step 1: find a KW account
        $search = $this->client()->get('/search/accounts', [
            'query' => 'KW',
            'field' => 'name',
            'type' => 'asset',
            'limit' => 1,
        ]);

        if (!$search->successful()) {
            Log::error('[FireflyApiRepository] Failed to find KW account', [
                'status' => $search->status(),
                'body' => $search->body(),
            ]);
            return [];
        }

        $kw = $search->json('data.0');
        if (!$kw) {
            Log::warning('[FireflyApiRepository] KW account not found.');
            return [];
        }

        $id = $kw['id'] ?? null;
        if (!$id) return [];

        $start = now()->subMonths(6)->format('Y-m-d');
        $end = now()->format('Y-m-d');
        $page = 1;
        $limit = 100;
        $flat = [];

        do {
            $response = $this->client()->get("/accounts/{$id}/transactions", [
                'type' => 'withdrawal,deposit',
                'start' => $start,
                'end' => $end,
                'limit' => $limit,
                'page' => $page,
            ]);

            if (!$response->successful()) {
                Log::error('[FireflyApiRepository] KW transaction fetch failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                break;
            }

            $json = $response->json();
            $batch = $json['data'] ?? [];
            $pagination = $json['meta']['pagination'] ?? [];

            $currentPage = (int)($pagination['current_page'] ?? 1);
            $totalPages = (int)($pagination['total_pages'] ?? 1);
            $hasMore = $currentPage < $totalPages;
            $page++;

            foreach ($batch as $entry) {
                foreach ($entry['attributes']['transactions'] ?? [] as $tx) {
                    $type = $tx['type'] ?? null;
                    $date = $tx['date'] ?? null;
                    $amount = (float)($tx['amount'] ?? 0);

                    if (!$date || !$type) continue;
                    if (!in_array($type, ['deposit', 'withdrawal'])) continue;

                    // sign the amount
                    $signedAmount = $type === 'withdrawal'
                        ? -abs($amount)
                        : abs($amount);

                    $flat[] = [
                        'date' => substr($date, 0, 10),
                        'amount' => $signedAmount,
                        'type' => $type,
                    ];
                }
            }
        } while ($hasMore);

        // Guard: only cache if structure valid
        $valid = collect($flat)->every(fn($tx) => isset($tx['date'], $tx['amount'], $tx['type'])
        );

        if (!$valid || empty($flat)) {
            Log::warning('[FireflyApiRepository] Invalid or empty KW dataset — not caching.');
            return [];
        }

        Cache::put($key, $flat, now()->addDay());
        Cache::put($metaKey, ['timestamp' => now(), 'count' => count($flat)], now()->addDay());

        Log::info('[FireflyApiRepository] Cached ' . count($flat) . ' KW transactions.');

        return $flat;
    }


}
