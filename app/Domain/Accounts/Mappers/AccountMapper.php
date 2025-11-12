<?php

namespace App\Domain\Accounts\Mappers;

use App\Domain\Accounts\DTOs\AccountData;

final class AccountMapper
{
    public static function fromFirefly(array $data): AccountData
    {
        $attributes = $data['attributes'] ?? $data;

        return new AccountData(
            id: (int)($data['id'] ?? $attributes['id'] ?? 0),
            name: (string)($attributes['name'] ?? $data['name'] ?? ''),
            currency: $attributes['currency_code']
            ?? $attributes['primary_currency_code']
            ?? $data['currency']
            ?? $data['currency_code']
            ?? null,
            balance: (float)($attributes['current_balance'] ?? $data['balance'] ?? 0),
            fee: isset($data['fee']) ? (float)$data['fee'] : (isset($data['fee_percent']) ? (float)$data['fee_percent'] : null),
            updatedAt: isset($data['updated_at']) ? (string)$data['updated_at'] : null,
        );
    }

    /**
     * @return AccountData[]
     */
    public static function collectFromFirefly(array $list): array
    {
        return array_map(fn($row) => self::fromFirefly($row), $list);
    }

    public static function toFireflyPayload(AccountData $dto): array
    {
        $payload = [
            'name' => $dto->name,
            'type' => 'asset',
            'active' => true,
            'include_net_worth' => true,
            'virtual_balance' => '0',
        ];

        if ($dto->currency) $payload['currency_code'] = $dto->currency;
        if ($dto->balance !== null) {
            $payload['opening_balance'] = $dto->balance;
            $payload['opening_balance_date'] = now()->toDateString();
        }

        return $payload;
    }
}
