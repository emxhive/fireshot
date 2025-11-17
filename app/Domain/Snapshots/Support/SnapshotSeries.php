<?php

namespace App\Domain\Snapshots\Support;

use App\Domain\Snapshots\DTOs\SnapshotSummaryData;
use Carbon\Carbon;
use Illuminate\Support\Collection;

final class SnapshotSeries
{
    /**
     * EXACT movement logic preserved.
     * Builds daily intervals from headers + callback data providers.
     *
     * @param Collection $headers Collection of DailySnapshotHeader models
     * @param callable $txProvider function (string $from, string $to): float
     * @param callable $navProvider function(int $headerId): array{usd:float,ngn:float,nav:float}
     * @return SnapshotSummaryData[]
     */
    public static function buildDailySeries(
        Collection $headers,
        callable   $txProvider,
        callable   $navProvider
    ): array
    {
        $out = [];
        $prevNav = 0;
        $prev = null;

        foreach ($headers as $curr) {

            if ($prev) {
                $from = $prev->snapshot_date->toDateString();
                $to = $curr->snapshot_date->toDateString();
            } else {
                $from = $to = $curr->snapshot_date->toDateString();
            }

            $txSum = $txProvider($from, $to);
            $navData = $navProvider($curr->id);

            $nav = $navData['nav'] ?? 0;
            $vd = count($out) ? ($nav - $prevNav) - $txSum : 0;

            $out[] = new SnapshotSummaryData(
                from: $from,
                to: $to,
                usd: round($navData['usd'] ?? 0, 2),
                ngn: round($navData['ngn'] ?? 0, 2),
                netAssetValue: round($nav, 2),
                valuationDelta: round($vd, 2),
                transactions: round($txSum, 2),
            );

            $prevNav = $nav;
            $prev = $curr;
        }

        return $out;
    }

    /**
     * Canonical aggregation (logical mirror of frontend).
     *
     * @param SnapshotSummaryData[] $daily
     * @return SnapshotSummaryData[]
     */
    public static function aggregateSeries(array $daily, string $mode, int $limit): array
    {
        $buckets = [];

        foreach ($daily as $row) {
            $date = Carbon::parse($row->to);

            $key = match ($mode) {
                'week' => $date->isoWeekYear() . '-W' . str_pad($date->isoWeek(), 2, '0', STR_PAD_LEFT),
                'month' => $date->format('Y-m'),
            };

            if (!isset($buckets[$key])) {
                $buckets[$key] = [
                    'from' => $row->from,
                    'to' => $row->to,
                    'usd' => $row->usd,
                    'ngn' => $row->ngn,
                    'nav' => $row->netAssetValue,
                    'valuationDelta' => $row->valuationDelta,
                    'transactions' => $row->transactions,
                ];
            } else {
                $b = &$buckets[$key];

                if ($row->from < $b['from']) $b['from'] = $row->from;
                if ($row->to > $b['to']) $b['to'] = $row->to;

                if ($row->to >= $b['to']) {
                    $b['usd'] = $row->usd;
                    $b['ngn'] = $row->ngn;
                    $b['nav'] = $row->netAssetValue;
                }

                $b['valuationDelta'] += $row->valuationDelta;
                $b['transactions'] += $row->transactions;
            }
        }

        $sorted = collect($buckets)->sortBy(fn($x) => $x['to'])->values();

        if ($sorted->count() > $limit) {
            $sorted = $sorted->slice($sorted->count() - $limit);
        }

        return $sorted->map(fn($g) => new SnapshotSummaryData(
            from: $g['from'],
            to: $g['to'],
            usd: round($g['usd'], 2),
            ngn: round($g['ngn'], 2),
            netAssetValue: round($g['nav'], 2),
            valuationDelta: round($g['valuationDelta'], 2),
            transactions: round($g['transactions'], 2),
        ))->all();
    }
}
