<?php

namespace App\Services\Shots;

use App\Enums\Shots\Granularity;
use App\Models\Shots\{BalanceSnapshot, DailySnapshotHeader};
use App\Repositories\Shots\FireflyRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

readonly class ComputeService
{
    public function __construct(private FireflyRepository $firefly)
    {
    }

    /**
     * Unified summaries for any granularity (day, week, month).
     */
    public function getSummaries(string $granularity = 'day', ?int $limit = null): array
    {
        $g = Granularity::fromString($granularity);
        $limit = $limit ?? Granularity::defaultLimit($g);

        // 1. Firefly transactions grouped by period
        $periodTx = collect($this->firefly->getPeriodTransactions($g->value, $limit))
            ->keyBy('period');

        // 2. Snapshot-based NAVs grouped by period
        $periodNav = match ($g) {
            Granularity::Day => $this->buildDailyNav($limit),
            Granularity::Week => $this->buildNavByPeriod('week', $limit),
            Granularity::Month => $this->buildNavByPeriod('month', $limit),
        };

        // 3. Combine and compute flow_adjusted_value + valuation_delta
        $orderedPeriods = $this->orderPeriods(array_unique(
            array_merge(array_keys($periodNav), array_keys($periodTx->all()))
        ));

        $out = [];
        $prevX = null;

        foreach ($orderedPeriods as $period) {
            $navRow = $periodNav[$period] ?? ['usd' => 0, 'ngn' => 0, 'nav' => null, 'sell' => null];
            $tx = (float)($periodTx[$period]['total'] ?? 0.0);

            if ($navRow['nav'] === null) {
                continue;
            }

            $x = $navRow['nav'] - $tx;
            $y = $prevX === null ? 0.0 : ($x - $prevX);
            $prevX = $x;

            $out[] = [
                'period' => $period,
                'usd' => round($navRow['usd'], 2),
                'ngn' => round($navRow['ngn'], 2),
                'net_asset_value' => round($navRow['nav'], 2),
                'transactions' => round($tx, 2),
                'flow_adjusted_value' => round($x, 2),
                'valuation_delta' => round($y, 2),
            ];
        }

        app(RecordService::class)->updateFromSummaries($out, $g->value);
        return $out;
    }

    /* ---------- Helpers ---------- */

    private function buildDailyNav(int $limit): array
    {
        $headers = DailySnapshotHeader::orderBy('snapshot_date', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        if ($headers->isEmpty()) {
            return [];
        }

        $balances = BalanceSnapshot::select('header_id', 'currency_code', DB::raw('SUM(balance_raw) AS total'))
            ->whereIn('header_id', $headers->pluck('id'))
            ->groupBy('header_id', 'currency_code')
            ->get()
            ->groupBy('header_id');

        $map = [];
        foreach ($headers as $h) {
            $d = $h->snapshot_date->format('Y-m-d');
            $bucket = $balances->get($h->id, collect());
            $map = $this->addNavEntry($bucket, $h, $map, $d);
        }
        return $map;
    }

    private function buildNavByPeriod(string $periodType, int $limit): array
    {
        $headers = DailySnapshotHeader::orderBy('snapshot_date', 'desc')->limit(365)->get();
        if ($headers->isEmpty()) {
            return [];
        }
        $grouped = collect($headers)->groupBy(function ($h) use ($periodType) {
            $dt = Carbon::parse($h->snapshot_date);
            return match ($periodType) {
                'week' => $dt->format('o-\WW'),
                'month' => $dt->format('Y-m'),
                default => $dt->format('Y-m-d'),
            };
        });

        $periodKeys = $grouped->keys()->sort()->values();
        if ($periodKeys->count() > $limit) {
            $periodKeys = $periodKeys->slice(-$limit);
        }

        $result = [];
        foreach ($periodKeys as $key) {
            $list = $grouped[$key]->sortBy('snapshot_date');
            $last = $list->last();
            if (!$last) {
                continue;
            }

            $bucket = BalanceSnapshot::select('currency_code', DB::raw('SUM(balance_raw) AS total'))
                ->where('header_id', $last->id)
                ->groupBy('currency_code')
                ->get();

            $result = $this->addNavEntry($bucket, $last, $result, $key);
        }
        return $result;
    }

    private function orderPeriods(array $keys): array
    {
        sort($keys, SORT_STRING);
        return $keys;
    }

    /** Extracted shared logic for NAV calculation. */
    private function addNavEntry($bucket, $header, array $result, string $key): array
    {
        $usd = (float)($bucket->firstWhere('currency_code', 'USD')->total ?? 0);
        $ngn = (float)($bucket->firstWhere('currency_code', 'NGN')->total ?? 0);
        $nav = $ngn + $usd * (float)$header->sell_rate;

        $result[$key] = [
            'usd' => $usd,
            'ngn' => $ngn,
            'nav' => $nav,
            'sell' => (float)$header->sell_rate,
        ];

        return $result;
    }
}
