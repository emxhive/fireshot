<?php

namespace App\Services\Shots;

use App\Models\Shots\{AccountMeta, BalanceSnapshot, DailySnapshotHeader};
use App\Repositories\Shots\FireflyRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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
        $buyRate = round($sellRate - ($buyDiff ?? 0), 4);

        return DB::transaction(function () use ($userId, $snapshotDate, $sellRate, $buyRate) {
            // Overwrite an existing snapshot
            $existing = DailySnapshotHeader::where('user_id', $userId)
                ->whereDate('snapshot_date', $snapshotDate)
                ->first();

            if ($existing) {
                BalanceSnapshot::where('header_id', $existing->id)->delete();
                $existing->delete();
            }

            $header = DailySnapshotHeader::create([
                'user_id' => $userId,
                'snapshot_date' => $snapshotDate,
                'snapshot_at' => Carbon::now('UTC'),
                'sell_rate' => $sellRate,
                'buy_rate' => $buyRate,
            ]);

            // Get all positive Firefly balances
            $balances = $this->firefly->getPositiveBalancesForDate($snapshotDate);

            // Get all fee percentages from AccountMeta
            $feeMap = AccountMeta::all()->pluck('fee_percent', 'account_id')->toArray();

            foreach ($balances as $row) {
                $accountId = (int)($row->account_id ?? $row['account_id']);
                $val = (float)($row->balance_raw ?? $row['balance_raw']);
                $currency = (string)($row->currency_code ?? $row['currency_code']);

                if ($val <= 0) {
                    continue;
                }

                // Apply account-level fee adjustment
                $feePercent = $feeMap[$accountId] ?? 0;
                if ($feePercent > 0) {
                    $val = $val - ($val * $feePercent / 100);
                }

                BalanceSnapshot::create([
                    'user_id' => $userId,
                    'header_id' => $header->id,
                    'account_id' => $accountId,
                    'currency_code' => $currency,
                    'balance_raw' => round($val, 2),
                ]);
            }

            // Clear caches after snapshot
            Cache::forget('shots.summaries');
            Cache::forget('shots.series.month');
            Cache::forget('shots.series.week');

            return $header;
        });
    }
}
