<?php

namespace App\Domain\Accounts\Services;

use App\Client\Firefly\AccountsClient;
use App\Domain\Accounts\DTOs\AccountData;
use App\Domain\Accounts\Mappers\AccountMapper;
use App\Shared\Enums\AccountRole;
use Illuminate\Http\Client\ConnectionException;

final readonly class AccountService
{
    public function __construct(
        private AccountsClient     $client,
        private AccountSyncService $sync,
    ) {}

    /** @return AccountData[]
     * @throws ConnectionException
     */
    public function getMergedAccounts(?AccountRole $role = AccountRole::DefaultAsset): array
    {
        $remote = $this->client->getAccounts($role);
        $metaById = collect($this->sync->getAll())->keyBy('account_id');

        return array_map(function (array $acc) use ($metaById) {
            $m = $metaById->get($acc['id']);
            return AccountMapper::fromFirefly([
                ...$acc,
                'currency_code' => $m->currency_code ?? ($acc['currency_code'] ?? null),
                'fee_percent'   => $m->fee_percent ?? null,
                'updated_at'    => $m->updated_at ?? null,
            ]);
        }, $remote);
    }

    public function createAccount(AccountData $dto): array
    {
        return $this->client->createAccount(AccountMapper::toFireflyPayload($dto));
    }

    public function updateAccount(int $id, AccountData $dto): array
    {
        return $this->client->updateAccount($id, AccountMapper::toFireflyPayload($dto));
    }

    public function getAccountRaw(int $id): ?array
    {
        return $this->client->getAccount($id);
    }
}
