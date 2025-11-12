<?php

namespace App\Domain\Transactions\Services;

use App\Domain\Transactions\DTOs\TransactionData;
use App\Shared\Helpers\DateHelper;

final class TransactionAggregator
{
    /**
     * Group transactions by computed period (day/week/month).
     * @param TransactionData[] $transactions
     * @return array<string, TransactionData[]>
     */
    public static function groupByPeriod(array $transactions, string $granularity): array
    {
        $groups = [];
        foreach ($transactions as $t) {
            $period = DateHelper::periodKey($granularity, $t->date);
            $groups[$period][] = $t;
        }
        return $groups;
    }

    /**
     * Sum signed amounts per period.
     */
    public static function sumByPeriod(array $grouped): array
    {
        $sums = [];
        foreach ($grouped as $period => $items) {
            $sums[$period] = round(array_sum(array_map(fn($t) => $t->amount, $items)), 2);
        }
        return $sums;
    }

    /**
     * Full aggregation pipeline.
     * @param TransactionData[] $transactions
     * @return array [['period'=>string,'total'=>float],...]
     */
    public static function aggregate(array $transactions, string $granularity, int $limit = 12): array
    {
        $grouped = self::groupByPeriod($transactions, $granularity);
        $summed  = self::sumByPeriod($grouped);

        krsort($summed);
        $slice = array_slice($summed, 0, $limit, true);

        return array_reverse(
            array_map(
                fn($period, $total) => ['period' => $period, 'total' => $total],
                array_keys($slice),
                $slice
            )
        );
    }
}
