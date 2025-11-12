<?php

namespace App\Domain\Snapshots\Services;

use App\Shared\CacheKeys;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

final class RecordService
{
    /**
     * Retrieve all cached records.
     */
    public function getAll(): array
    {
        return Cache::get(CacheKeys::RECORDS, []);
    }

    /**
     * Update NAV (Net Asset Value) high/low using snapshot NAVs.
     * Called whenever a new snapshot is taken.
     */
    public function touchNav(float $nav, string $date): void
    {
        $records = Cache::get(CacheKeys::RECORDS, []);

        $current = Arr::get($records, 'net_asset_value', []);

        // only replace it if new NAV beats current record
        if (!isset($current['high']) || $nav > ($current['high']['value'] ?? PHP_FLOAT_MIN)) {
            $current['high'] = ['value' => $nav, 'date' => $date];
        }
        if (!isset($current['low']) || $nav < ($current['low']['value'] ?? PHP_FLOAT_MAX)) {
            $current['low'] = ['value' => $nav, 'date' => $date];
        }

        $records['net_asset_value'] = $current;

        Cache::put(CacheKeys::RECORDS, $records, CacheKeys::RECORDS_TTL);
    }

    /**
     * Update transaction highs and lows for week/month.
     * Does NOT reset old values — only updates when new data beats them.
     * Expected input: arrays of ['period' => 'YYYY-W##' | 'YYYY-MM', 'total' => float]
     */
    public function setTransactionsRecords(?array $weekly, ?array $monthly): void
    {
        $records = Cache::get(CacheKeys::RECORDS, []);

        $records['transactions']['week'] = $this->mergeHiLo(
            $records['transactions']['week'] ?? [],
            $this->candidateHiLo($weekly)
        );

        $records['transactions']['month'] = $this->mergeHiLo(
            $records['transactions']['month'] ?? [],
            $this->candidateHiLo($monthly)
        );

        Cache::put(CacheKeys::RECORDS, $records, CacheKeys::RECORDS_TTL);
    }

    /* --------------------------------------------------------
       Internal helpers
       -------------------------------------------------------- */

    private function candidateHiLo(?array $rows): array
    {
        $rows = collect($rows ?? [])
            ->map(fn($r) => [
                'period' => (string)($r['period'] ?? ''),
                'value' => (float)($r['total'] ?? 0),
            ])
            ->filter(fn($r) => $r['period'] !== '');

        if ($rows->isEmpty()) return [];

        $high = $rows->sortByDesc('value')->first();
        $low = $rows->sortBy('value')->first();

        return [
            'high' => ['value' => $high['value'], 'period' => $high['period']],
            'low' => ['value' => $low['value'], 'period' => $low['period']],
        ];
    }

    private function mergeHiLo(array $existing, array $candidate): array
    {
        if (empty($candidate)) return $existing;

        $out = $existing;

        // HIGH: update only if a new candidate exceeds existing
        if (
            empty($existing['high']) ||
            (isset($candidate['high']) && (float)$candidate['high']['value'] > (float)($existing['high']['value'] ?? PHP_FLOAT_MIN))
        ) {
            $out['high'] = $candidate['high'];
        }

        // LOW: update only if a new candidate is lower
        if (
            empty($existing['low']) ||
            (isset($candidate['low']) && (float)$candidate['low']['value'] < (float)($existing['low']['value'] ?? PHP_FLOAT_MAX))
        ) {
            $out['low'] = $candidate['low'];
        }

        return $out;
    }
}
