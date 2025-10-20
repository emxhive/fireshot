<?php

namespace App\DTOs\Shots;

use Spatie\LaravelData\Data;

class RecordStatsData extends Data
{
    public function __construct(
        public ?float $value,
        public ?string $periodOrDate,
        public ?string $type, // "date" or "period"
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            $data['value'] ?? null,
            $data['date'] ?? $data['period'] ?? null,
            isset($data['date']) ? 'date' : 'period',
        );
    }
}
