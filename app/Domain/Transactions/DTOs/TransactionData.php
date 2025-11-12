<?php

namespace App\Domain\Transactions\DTOs;


use Spatie\LaravelData\Data;

final class TransactionData extends Data
{
    public function __construct(
        public string $id,
        public string $type,
        public string $date,
        public float  $amount,
        public string $currencyCode,
    )
    {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: (string)($data['id'] ?? ''),
            type: (string)($data['type'] ?? ''),
            date: (string)($data['date'] ?? ''),
            amount: (float)($data['amount'] ?? 0),
            currencyCode: (string)($data['currencyCode'] ?? ($data['currency_code'] ?? 'NGN')),
        );
    }


}
