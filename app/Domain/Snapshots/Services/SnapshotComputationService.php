<?php

namespace App\Domain\Snapshots\Services;

use App\Domain\Snapshots\Repositories\SnapshotRepository;
use App\Domain\Transactions\Services\TransactionService;
use App\Shared\Enums\Granularity;

final readonly class SnapshotComputationService
{
    public function __construct(private SnapshotRepository $repo, private TransactionService $transactions)
    {
    }

    public function getIntervalSummaries(string $granularity, ?int $limit = null): array
    {
        $g = Granularity::fromString($granularity);
        $limit = $limit && $limit > 0 ? $limit : Granularity::defaultLimit($g);

        if ($limit <= 0) {
            return [];
        }

        $daily = $this->buildDailySummaries();
        if (empty($daily)) {
            return [];
        }

        if ($g === Granularity::Day) {
            $slice = array_slice($daily, -$limit);
            return array_map(fn(array $row) => $this->formatSummaryRow($row, $g), $slice);
        }

        $grouped = collect($daily)
            ->groupBy(fn(array $row) => Granularity::periodKey($g, $row['to']))
            ->sortKeys();

        $result = [];
        $prevFlowAdjusted = null;

        foreach ($grouped as $periodKey => $rows) {
            $rows = array_values($rows);
            $first = $rows[0];
            $last = $rows[array_key_last($rows)];

            $transactions = round(array_reduce($rows, fn(float $carry, array $row) => $carry + $row['transactions'], 0.0), 2);
            $flowAdjusted = $last['flow_adjusted_value'];
            $valuationDelta = $prevFlowAdjusted === null ? 0.0 : round($flowAdjusted - $prevFlowAdjusted, 2);

            $result[] = [
                'from' => $first['from'],
                'to' => $last['to'],
                'period_key' => $periodKey,
                'usd' => $last['usd'],
                'ngn' => $last['ngn'],
                'net_asset_value' => $last['net_asset_value'],
                'transactions' => $transactions,
                'flow_adjusted_value' => $flowAdjusted,
                'valuation_delta' => $valuationDelta,
            ];

            $prevFlowAdjusted = $flowAdjusted;
        }

        $result = array_slice($result, -$limit);

        return array_map(fn(array $row) => $this->formatSummaryRow($row, $g), $result);
    }

    private function buildDailySummaries(): array
    {
        $headers = collect($this->repo->getHeaders())->values();

        if ($headers->isEmpty()) {
            return [];
        }

        $out = [];
        $prev = null;
        $prevFlowAdjusted = null;

        foreach ($headers as $curr) {
            $currentDate = $curr->snapshot_date->toDateString();
            $from = $prev ? $prev->snapshot_date->toDateString() : $currentDate;

            $txSum = $this->transactions->getSignedTotal($from, $currentDate);
            $navData = $this->repo->computeNavForHeader($curr->id);

            $nav = (float)($navData['nav'] ?? 0.0);
            $flowAdjusted = $nav - $txSum;
            $valuationDelta = $prevFlowAdjusted === null ? 0.0 : round($flowAdjusted - $prevFlowAdjusted, 2);

            $out[] = [
                'from' => $from,
                'to' => $currentDate,
                'usd' => round((float)($navData['usd'] ?? 0.0), 2),
                'ngn' => round((float)($navData['ngn'] ?? 0.0), 2),
                'net_asset_value' => round($nav, 2),
                'transactions' => round($txSum, 2),
                'flow_adjusted_value' => round($flowAdjusted, 2),
                'valuation_delta' => $valuationDelta,
            ];

            $prevFlowAdjusted = $flowAdjusted;
            $prev = $curr;
        }

        return $out;
    }

    private function formatSummaryRow(array $row, Granularity $granularity): array
    {
        $period = match ($granularity) {
            Granularity::Day => $row['to'],
            Granularity::Week => sprintf('%s → %s', $row['from'], $row['to']),
            Granularity::Month => date('M Y', strtotime($row['to'])),
        };

        return [
            'period' => $period,
            'usd' => $row['usd'],
            'ngn' => $row['ngn'],
            'net_asset_value' => $row['net_asset_value'],
            'transactions' => $row['transactions'],
            'flow_adjusted_value' => $row['flow_adjusted_value'],
            'valuation_delta' => round($row['valuation_delta'], 2),
        ];
    }
}
