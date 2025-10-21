<?php

namespace App\Repositories\Shots;

use App\Enums\Shots\AccountRole;
use App\Models\Shots\AccountMeta;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Collection;

class AccountRepository
{
    public function __construct(
        protected FireflyApiRepository $firefly,
    )
    {
    }

    /**
     * Fetch all Firefly asset accounts via API
     * and merge Fireshots metadata into each record.
     *
     * @param AccountRole|null $role Optionally filter by Firefly account_role
     * @throws ConnectionException
     */
    public function getMergedAccounts(?AccountRole $role = null): Collection
    {
        // 1️⃣ Fetch all asset accounts from Firefly API
        $accounts = collect($this->firefly->getAccounts());


        // 3️⃣ Fetch Fireshots metadata for merging
        $meta = AccountMeta::all()->keyBy('account_id');

        // 4️⃣ Merge
        return $accounts->map(function ($acc) use ($meta) {
            $m = $meta->get($acc['id']);

            return [
                'id' => $acc['id'],
                'name' => $acc['name'],
                'balance' => (float)($acc['balance'] ?? 0),
                'currency_code' => $m->currency_code ?? ($acc['currency_code'] ?? null),
                'fee_percent' => $m->fee_percent ?? null,
                'updated_at' => $m?->updated_at ?? now(),
            ];
        })->values();
    }

    /**
     * Update or create Fireshots metadata for a single account.
     */
    public function upsertMeta(int $accountId, ?string $currencyCode, ?float $feePercent): void
    {
        AccountMeta::updateOrCreate(
            ['account_id' => $accountId],
            [
                'currency_code' => $currencyCode,
                'fee_percent' => $feePercent,
            ]
        );
    }
}
