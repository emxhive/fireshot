<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Snapshots\Repositories\SnapshotRepository;
use App\Models\Shots\BalanceSnapshot;
use App\Models\Shots\DailySnapshotHeader;
use Illuminate\Support\Facades\DB;
use Throwable;

final class EloquentSnapshotRepository implements SnapshotRepository
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
    public function saveSnapshot(array $balances, string $date, float $sellRate): void
    {
        DB::transaction(function () use ($balances, $date, $sellRate) {
            $header = DailySnapshotHeader::create([
                'snapshot_date' => $date,
                'sell_rate' => $sellRate,
            ]);

            foreach ($balances as $balance) {
                BalanceSnapshot::create([
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
        $nav = $ngn + $usd * (float)$header->sell_rate;

        return ['usd' => $usd, 'ngn' => $ngn, 'nav' => $nav];
    }
}
