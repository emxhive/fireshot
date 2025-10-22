<?php

namespace App\Services\Shots;

use App\Support\Shots\CacheKeys;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RecordService
{
    /**
     * Update record highs and lows from a set of computed summaries.
     *
     * @param array $summaries Output of ComputeService::getSummaries()
     * @param string $granularity 'day' | 'week' | 'month'
     */
    public function updateFromSummaries(array $summaries, string $granularity): void
    {
        $records = Cache::get(CacheKeys::RECORDS, []);

        foreach ($summaries as $row) {
            $period = $row['period'] ?? null;
            if (!$period || $this->isCurrentPeriod($granularity, $period)) {
                continue; // skip ongoing period
            }

            // --- NET ASSET VALUE ---
            $this->trackGlobal($records, 'net_asset_value', $row['net_asset_value'], $period);

            // --- TRANSACTIONS ---
            $this->trackScoped($records, 'transactions', $granularity, $row['transactions'], $period);

            // --- VALUATION DELTA ---
            $this->trackScoped($records, 'valuation_delta', $granularity, $row['valuation_delta'], $period);
        }

        Cache::put(CacheKeys::RECORDS, $records, CacheKeys::RECORDS_TTL);
        Log::info('[RecordService] Records updated.', ['granularity' => $granularity]);
    }

    /**
     * Get all record data.
     */
    public function getAll(): array
    {
        return Cache::get(CacheKeys::RECORDS, []);
    }

    /**
     * Reset all record caches.
     */
    public function reset(): void
    {
        Cache::forget(CacheKeys::RECORDS);
    }

    /* ---------------------------------------------------------------------
       Internal helpers
       --------------------------------------------------------------------- */

    /**
     * Skip incomplete current day/week/month periods.
     */
    private function isCurrentPeriod(string $granularity, string $period): bool
    {
        $now = now();

        return match ($granularity) {
            'day' => $period === $now->format('Y-m-d'),
            'week' => $period === $now->format('o-\WW'),
            'month' => $period === $now->format('Y-m'),
            default => false,
        };
    }

    /**
     * Track a metric that is global (not scoped by granularity),
     * e.g., net_asset_value.
     */
    private function trackGlobal(array &$records, string $key, float $value, string $period): void
    {
        $current = Arr::get($records, $key, []);

        if (!isset($current['high']) || $value > ($current['high']['value'] ?? PHP_FLOAT_MIN)) {
            $current['high'] = ['value' => $value, 'date' => $period];
        }

        if (!isset($current['low']) || $value < ($current['low']['value'] ?? PHP_FLOAT_MAX)) {
            $current['low'] = ['value' => $value, 'date' => $period];
        }

        $records[$key] = $current;
    }

    /**
     * Track a metric scoped by granularity (week, month),
     * e.g., valuation_delta, transactions.
     */
    private function trackScoped(
        array  &$records,
        string $metric,
        string $granularity,
        float  $value,
        string $period
    ): void
    {
        $current = Arr::get($records, "$metric.$granularity", []);

        if (!isset($current['high']) || $value > ($current['high']['value'] ?? PHP_FLOAT_MIN)) {
            $current['high'] = ['value' => $value, 'period' => $period];
        }

        if (!isset($current['low']) || $value < ($current['low']['value'] ?? PHP_FLOAT_MAX)) {
            $current['low'] = ['value' => $value, 'period' => $period];
        }

        $records[$metric][$granularity] = $current;
    }
}
