<?php

namespace App\Services\Shots;

use App\Models\Shots\{AccountMeta, BalanceSnapshot, DailySnapshotHeader};
use App\Repositories\Shots\FireflyRepository;
use App\Support\Shots\CacheKeys;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

readonly class SnapshotService
{
    public function __construct(private FireflyRepository $firefly)
    {
    }

    /**
     * @throws Throwable
     */
    public function run(int $userId, string $snapshotDate, float $sellRate, ?float $buyDiff = null): DailySnapshotHeader
    {
        // --- PREP: normalize inputs and prefetch external data (no DB locks yet)
        $date = $this->normalizeDate($snapshotDate);
        $buyRate = round($sellRate - ($buyDiff ?? 0), 4);

        // Fetch positive balances before the transaction to avoid holding DB locks while waiting for I/O
        $balances = $this->firefly->getPositiveBalancesForDate($date->toDateString());
        if (empty($balances)) {
            throw new RuntimeException('No positive balances returned from Firefly for snapshot.');
        }

        // Build fee map once (global; if you later scope by user, update here)
        $feeMap = AccountMeta::query()->pluck('fee_percent', 'account_id')->toArray();

        // --- TX: write header + rows atomically
        return DB::transaction(function () use ($userId, $date, $sellRate, $buyRate, $balances, $feeMap) {

            // Replace existing snapshot (same Lagos calendar day)
            $existing = DailySnapshotHeader::where('user_id', $userId)
                ->whereDate('snapshot_date', $date->toDateString())
                ->first();

            if ($existing) {
                BalanceSnapshot::where('header_id', $existing->id)->delete();
                $existing->delete(); // or ->forceDelete() if you use SoftDeletes on headers
            }

            // New header
            $header = DailySnapshotHeader::create([
                'user_id' => $userId,
                'snapshot_date' => $date,            // Carbon; Eloquent will cast to date
                'snapshot_at' => now('UTC'),
                'sell_rate' => $sellRate,
                'buy_rate' => $buyRate,
            ]);

            // Prepare bulk rows
            $rows = [];
            foreach ($balances as $r) {
                $accountId = (int)($r['account_id'] ?? 0);
                $currency = (string)($r['currency_code'] ?? 'NGN');
                $val = (float)($r['balance_raw'] ?? 0.0);
                if ($val <= 0 || $accountId <= 0) {
                    continue;
                }

                // Apply account-level fee if any
                $feePercent = (float)($feeMap[$accountId] ?? 0.0);
                if ($feePercent > 0) {
                    $val = $this->applyFee($val, $feePercent);
                }

                // Round consistently per currency
                $val = $this->roundByCurrency($val, $currency);

                $rows[] = [
                    'user_id' => $userId,
                    'header_id' => $header->id,
                    'account_id' => $accountId,
                    'currency_code' => $currency,
                    'balance_raw' => $val,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($rows)) {
                BalanceSnapshot::insert($rows);
            }

            // Invalidate related caches (post-write)
            $this->clearRelatedCaches();

            return $header;
        });
    }

    /* -------------------- Helpers (shared, no repetition) -------------------- */

    private function normalizeDate(string $date): CarbonImmutable
    {
        // one-per-day in Lagos, normalized to start of day to avoid tz drift
        return CarbonImmutable::parse($date, 'Africa/Lagos')->startOfDay();
    }

    private function applyFee(float $amount, float $percent): float
    {
        return $amount * (1 - ($percent / 100));
    }

    private function roundByCurrency(float $value, string $currency): float
    {
        // Simple centralized rounding; tweak per your business rules later
        $precision = match (strtoupper($currency)) {
            'USD' => 2,   // keep 2 for visual consistency; set 0 if you truly want integers
            default => 0,
        };
        return round($value, $precision);
    }

    private function clearRelatedCaches(): void
    {
        Cache::forget(CacheKeys::RECORDS);
        Cache::forget(CacheKeys::SUMMARIES_DAY);
        Cache::forget(CacheKeys::SUMMARIES_WEEK);
        Cache::forget(CacheKeys::SUMMARIES_MONTH);
    }


}
