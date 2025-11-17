<?php

namespace App\Domain\Snapshots\Services;

use App\Domain\Snapshots\DTOs\SnapshotSummaryData;
use App\Domain\Snapshots\Repositories\SnapshotRepository;
use App\Domain\Transactions\Services\TransactionService;
use App\Domain\Snapshots\Support\SnapshotSeries;
use Illuminate\Support\Collection;

final readonly class SnapshotComputationService
{
    public function __construct(
        private SnapshotRepository $repo,
        private TransactionService $transactions
    ) {}

    public function getIntervalSummaries(?int $limit = null): array
    {
        $headers = collect($this->repo->getHeaders($limit))->values();

        $daily = SnapshotSeries::buildDailySeries(
            $headers,
            fn(string $from, string $to) => $this->transactions->getSignedTotal($from, $to),
            fn(int $headerId) => $this->repo->computeNavForHeader($headerId)
        );

        return [
            'summaries'    => $daily,
            'latest_meta'  => $this->buildLatestMeta(),
        ];
    }

    /** @return SnapshotSummaryData[] */
    public function getDailySummaries(int $days): array
    {
        $headers = collect($this->repo->getLatestHeaders($days + 1))->values();

        $series = SnapshotSeries::buildDailySeries(
            $headers,
            fn(string $from, string $to) => $this->transactions->getSignedTotal($from, $to),
            fn(int $headerId) => $this->repo->computeNavForHeader($headerId)
        );

        return count($series) > $days
            ? array_slice($series, count($series) - $days)
            : $series;
    }

    /** @return SnapshotSummaryData[] */
    public function getWeeklySummaries(int $weeks): array
    {
        $daily = $this->getDailySummaries($weeks * 7 + 1);
        return SnapshotSeries::aggregateSeries($daily, 'week', $weeks);
    }

    /** @return SnapshotSummaryData[] */
    public function getMonthlySummaries(int $months): array
    {
        $daily = $this->getDailySummaries($months * 31 + 1);
        return SnapshotSeries::aggregateSeries($daily, 'month', $months);
    }

    public function getDashboardPayload(): array
    {
        return [
            'day30'      => $this->getDailySummaries(30),
            'week12'     => $this->getWeeklySummaries(12),
            'month12'    => $this->getMonthlySummaries(12),
            'latestMeta' => $this->buildLatestMeta(),
        ];
    }

    private function buildLatestMeta(): ?array
    {
        $latest = collect($this->repo->getLatestHeaders(1))->last();
        if (!$latest) return null;

        $sell = (float)$latest->sell_rate;
        $buy  = (float)$latest->buy_rate;

        return [
            'sell_rate' => $sell,
            'buy_rate'  => $buy,
            'buy_diff'  => $sell - $buy,
        ];
    }
}
