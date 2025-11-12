<?php

namespace App\Domain\Transactions\Mappers;

use App\Domain\Transactions\DTOs\TransactionData;
use App\Domain\Transactions\Support\TransactionUtils as Utils;

final class TransactionMapper
{
    public static function fromFirefly(array $data): TransactionData
    {
        // Firefly transaction entry shape can be varied; support flat cached rows too
        // Prefer nested attributes.transactions[0] if present
        $attributes = $data['attributes'] ?? null;
        if ($attributes && isset($attributes['transactions'][0])) {
            $tx = $attributes['transactions'][0];
            $type = (string)($tx['type'] ?? '');
            $amount = (float)($tx['amount'] ?? 0);

            $signed = Utils::sign($type, $amount);
            return new TransactionData(
                id: (string)($data['id'] ?? ''),
                type: $type,
                date: substr((string)($tx['date'] ?? ''), 0, 10),
                amount: $signed,
                currencyCode: (string)($tx['currency_code'] ?? 'NGN'),
            );
        }
        return self::fallBackStructure($data);

    }


    /**
     * @return TransactionData[]
     */
    public static function collectFromFirefly(array $list): array
    {
        return array_map(fn($row) => self::fromFirefly($row), $list);
    }


    private static function fallBackStructure(array $data): TransactionData
    {
        // Fallback: flat structure like {date, amount, type, currency_code?}
        $type = (string)($data['type'] ?? '');
        $amount = (float)($data['amount'] ?? 0);
        $signed = Utils::sign($type, $amount);
        return new TransactionData(
            id: (string)($data['id'] ?? ''),
            type: $type,
            date: substr((string)($data['date'] ?? ''), 0, 10),
            amount: $signed,
            currencyCode: (string)($data['currency_code'] ?? ($data['currencyCode'] ?? 'NGN')),
        );
    }


}

