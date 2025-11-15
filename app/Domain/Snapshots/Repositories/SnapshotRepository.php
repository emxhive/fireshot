<?php

namespace App\Domain\Snapshots\Repositories;

use App\Models\Shots\BalanceSnapshot;
use App\Models\Shots\DailySnapshotHeader;
use Illuminate\Support\Facades\DB;
use Throwable;

final class SnapshotRepository
{
    public function getHeaders(?int $limit = null): iterable
    {
        $query = DailySnapshotHeader::orderBy('snapshot_date');
        if ($limit && $limit > 1) {
            $count = $query->count();
            $query->skip(max(0, $count - ($limit + 1)));
        }
        return $query->get();
    }


    /**
     * @throws Throwable
     */
    public function saveSnapshot(array $balances, string $date, float $sellRate, float $buyRate): void
    {
        $userId = 1;
        DailySnapshotHeader::where('user_id', $userId)
            ->where('snapshot_date', $date)
            ->delete();

        DB::transaction(function () use ($balances, $date, $sellRate, $buyRate, $userId) {
            $header = DailySnapshotHeader::create([
                "user_id" => $userId,
                "snapshot_at" => now(),
                'snapshot_date' => $date,
                'sell_rate' => $sellRate,
                'buy_rate' => $buyRate,
            ]);

            foreach ($balances as $balance) {
                BalanceSnapshot::create([
                    "user_id" => $userId,
                    'header_id' => $header->id,
                    'account_id' => $balance['account_id'],
                    'currency_code' => $balance['currency_code'],
                    'balance_raw' => $balance['balance_raw'],
                ]);
            }
        });
    }

    public function computeNavForHeader(int $headerId): array
    {
        $header = DailySnapshotHeader::findOrFail($headerId);

        $totals = BalanceSnapshot::select('currency_code', DB::raw('SUM(balance_raw) AS total'))
            ->where('header_id', $header->id)
            ->groupBy('currency_code')
            ->pluck('total', 'currency_code');

        $usd = (float)($totals['USD'] ?? 0);
        $ngn = (float)($totals['NGN'] ?? 0);
        // Use buy_rate for converting USD to NGN when computing NAV per requirements
        $rate = (float)($header->buy_rate ?? $header->sell_rate ?? 0);
        $nav = $ngn + $usd * $rate;

        return ['usd' => $usd, 'ngn' => $ngn, 'nav' => $nav];
    }
}
