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
     * Return the newest N daily snapshot headers in chronological order (oldest → newest).
     * Avoids skip-based pagination by first taking a descending slice and then reversing it.
     */
    public function getLatestHeaders(int $limit): iterable
    {
        if ($limit <= 0) return collect();

        $slice = DailySnapshotHeader::orderByDesc('snapshot_date')
            ->limit($limit)
            ->get();

        // Reverse to chronological order
        return $slice->sortBy('snapshot_date')->values();
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

    public function listSnapshots(?int $limit = null): array
    {
        $query = DailySnapshotHeader::orderByDesc('snapshot_date');
        if ($limit && $limit > 0) {
            $query->limit($limit);
        }
        $headers = $query->get();

        return $headers->map(function (DailySnapshotHeader $h) {
            $nav = $this->computeNavForHeader($h->id);
            $sell = (float)$h->sell_rate;
            $buy = (float)($h->buy_rate ?? 0);
            return [
                'id' => (int)$h->id,
                'snapshot_date' => $h->snapshot_date->toDateString(),
                'sell_rate' => $sell,
                'buy_rate' => $buy,
                'buy_diff' => $sell - $buy,
                'usd' => round($nav['usd'] ?? 0, 2),
                'ngn' => round($nav['ngn'] ?? 0, 2),
                'net_asset_value' => round($nav['nav'] ?? 0, 2),
            ];
        })->all();
    }

    public function getSnapshotAccounts(int $headerId): array
    {
        // Left join to enrich with account name and fee
        $rows = BalanceSnapshot::query()
            ->select([
                'fireshots_balance_snapshots.account_id as account_id',
                'fireshots_balance_snapshots.currency_code as currency_code',
                'fireshots_balance_snapshots.balance_raw as balance_raw',
                'fireshots_asset_accounts.name as account_name',
                'fireshots_asset_accounts.fee as fee',
            ])
            ->leftJoin('fireshots_asset_accounts', 'fireshots_asset_accounts.id', '=', 'fireshots_balance_snapshots.account_id')
            ->where('fireshots_balance_snapshots.header_id', $headerId)
            ->orderBy('fireshots_asset_accounts.name')
            ->get();

        return $rows->map(function ($r) {
            return [
                'account_id' => (int)$r->account_id,
                'account_name' => (string)($r->account_name ?? ''),
                'currency_code' => (string)$r->currency_code,
                'balance_raw' => (float)$r->balance_raw,
                'fee' => $r->fee !== null ? (float)$r->fee : null,
            ];
        })->all();
    }

    public function deleteSnapshot(int $headerId): void
    {
        DailySnapshotHeader::whereKey($headerId)->delete();
    }
}
