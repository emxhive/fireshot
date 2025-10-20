<?php

namespace App\DTOs\Shots;

use Spatie\LaravelData\Data;

class SnapshotSummaryData extends Data
{
    public function __construct(
        public string $date,
        public float $usd,
        public float $ngn,
        public float $unifiedNGN,
        public float $transactions,
        public float $change,
    ) {}
}
