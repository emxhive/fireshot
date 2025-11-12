<?php

namespace App\Domain\Snapshots\DTOs;

use Spatie\LaravelData\Data;

final class SnapshotSummaryData extends Data
{
    public function __construct(
        public string $from,
        public string $to,

        public float  $usd,
        public float  $ngn,

        public float  $netAssetValue,
        public float  $valuationDelta,
        public float  $transactions,
    )
    {
    }
}
