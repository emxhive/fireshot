<?php

namespace App\DTOs\Shots;

use Spatie\LaravelData\Data;

class SeriesPointData extends Data
{
    public function __construct(
        public string $period,
        public float $transactions,
        public float $change,
        public float $balance,
    ) {}
}
