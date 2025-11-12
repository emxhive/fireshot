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


    /**@return SnapshotSummaryData[] */
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

        return $out;
    }

}
