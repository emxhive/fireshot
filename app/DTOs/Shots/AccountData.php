<?php

namespace App\DTOs\Shots;

use Carbon\Carbon;
use Spatie\LaravelData\Attributes\WithCast;
use Spatie\LaravelData\Casts\DateTimeInterfaceCast;
use Spatie\LaravelData\Data;

class AccountData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public float $balance,
        public ?string $currency_code,
        public ?float $fee_percent,


        #[WithCast(DateTimeInterfaceCast::class, format: 'Y-m-d H:i:s')]
        public Carbon $updated_at,
    ) {}
}
