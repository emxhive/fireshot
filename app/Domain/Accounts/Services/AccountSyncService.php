<?php

namespace App\Domain\Accounts\Services;

use App\Domain\Accounts\Repositories\AccountMetaRepository;

final readonly class AccountSyncService
{
    public function __construct(private AccountMetaRepository $repo) {}

    public function upsertMeta(int $accountId, ?string $currencyCode, ?float $feePercent): void
    {
        $this->repo->upsert($accountId, $currencyCode, $feePercent);
    }

    /** @return iterable<object> */
    public function getAll(): iterable
    {
        return $this->repo->all();
    }

    public function getMeta(int $accountId): ?object
    {
        return $this->repo->findByAccountId($accountId);
    }

    public function delete(int $accountId): void
    {
        $this->repo->deleteByAccountId($accountId);
    }
}
