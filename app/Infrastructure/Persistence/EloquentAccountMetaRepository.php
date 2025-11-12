<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Accounts\Repositories\AccountMetaRepository;
use App\Models\Shots\AccountMeta;

final class EloquentAccountMetaRepository implements AccountMetaRepository
{
    public function all(): iterable
    {
        return AccountMeta::all();
    }

    public function findByAccountId(int $accountId): ?object
    {
        return AccountMeta::where('account_id', $accountId)->first();
    }

    public function upsert(int $accountId, ?string $currencyCode, ?float $feePercent): void
    {
        AccountMeta::updateOrCreate(
            ['account_id' => $accountId],
            ['currency_code' => $currencyCode, 'fee_percent' => $feePercent]
        );
    }

    public function deleteByAccountId(int $accountId): void
    {
        AccountMeta::where('account_id', $accountId)->delete();
    }
}
