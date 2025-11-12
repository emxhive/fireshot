<?php

namespace App\Domain\Accounts\Repositories;

interface AccountMetaRepository
{
    /** @return iterable<object> Eloquent-like records (account_id, currency_code, fee_percent, updated_at) */
    public function all(): iterable;

    public function findByAccountId(int $accountId): ?object;

    public function upsert(int $accountId, ?string $currencyCode, ?float $feePercent): void;

    public function deleteByAccountId(int $accountId): void;
}
