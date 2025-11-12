<?php

namespace App\Presentation\Snapshots;

use App\Domain\Snapshots\DTOs\SnapshotSummaryData;

final class SnapshotCollectionPresenter
{
    /** @param SnapshotSummaryData[] $items */
    public static function present(array $items): array
    {
        return array_map(fn(SnapshotSummaryData $dto) => SnapshotPresenter::present($dto), $items);
    }
}
