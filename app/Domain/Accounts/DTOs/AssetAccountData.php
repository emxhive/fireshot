<?php

namespace App\Domain\Accounts\DTOs;

use Spatie\LaravelData\Data;

final class AssetAccountData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $currency,
        public float $balance,
        public float $fee,
        public string $updatedAt,
    ) {}
}
