<?php

namespace App\Domain\Snapshots\Services;

use App\Domain\Snapshots\DTOs\SnapshotSummaryData;
use App\Domain\Snapshots\Repositories\SnapshotRepository;
use App\Domain\Transactions\Services\TransactionService;

final readonly class SnapshotComputationService
{
    public function __construct(private SnapshotRepository $repo, private TransactionService $transactions)
    {
    }


    /**
     * Build interval summaries and include latest snapshot meta (sell_rate, buy_rate, buy_diff).
     * Returns structure: ['summaries' => SnapshotSummaryData[], 'latest_meta' => array|null]
     */
    public function getIntervalSummaries(?int $limit = null): array
    {
        $headers = collect($this->repo->getHeaders($limit))->values();

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

            $txSum = $this->transactions->getSignedTotal($from, $to);
            $navData = $this->repo->computeNavForHeader($curr->id);

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

        // Build latest meta from most recent header if available
        $latest = $headers->last();
        $latestMeta = null;
        if ($latest) {
            $sell = (float)$latest->sell_rate;
            $buy = (float)($latest->buy_rate ?? 0);
            $latestMeta = [
                'sell_rate' => $sell,
                'buy_rate'  => $buy,
                'buy_diff'  => $sell - $buy,
            ];
        }

        return [
            'summaries' => $out,
            'latest_meta' => $latestMeta,
        ];
    }

}
