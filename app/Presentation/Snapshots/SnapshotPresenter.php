<?php

namespace App\Presentation\Snapshots;

use App\Domain\Snapshots\DTOs\SnapshotSummaryData;

final class SnapshotPresenter
{
    public static function present(SnapshotSummaryData $dto): array
    {
        return [
            'from' => $dto->from,
            "to" => $dto->to,
            'usd' => $dto->usd,
            'ngn' => $dto->ngn,
            'nav' => $dto->netAssetValue,
            'valuation_delta' => $dto->valuationDelta,
            'transactions' => $dto->transactions,
        ];
    }
}
