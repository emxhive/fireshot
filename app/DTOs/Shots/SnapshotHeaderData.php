<?php

namespace App\DTOs\Shots;

use Spatie\LaravelData\Data;
use App\Models\Shots\DailySnapshotHeader;

class SnapshotHeaderData extends Data
{
    public function __construct(
        public int $id,
        public string $snapshot_date,
        public string $snapshot_at,
        public float $sell_rate,
        public float $buy_rate,
        public bool $replaced_previous,
    ) {}

    public static function fromModel(DailySnapshotHeader $header, bool $replacedPrevious = false): self
    {
        return new self(
            $header->id,
            $header->snapshot_date->format('Y-m-d'),
            $header->snapshot_at->toISOString(),
            (float) $header->sell_rate,
            (float) $header->buy_rate,
            $replacedPrevious,
        );
    }
}
