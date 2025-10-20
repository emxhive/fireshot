<?php

namespace App\Repositories;

use App\Models\Shots\AccountMeta;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AccountRepository
{
    /**
     * Resolve Firefly account_type.id dynamically
     * by matching the type name (case- and space-insensitive).
     */
    protected function getAccountTypeId(string $typeName): ?int
    {
        return DB::table('account_types')
            ->whereRaw("LOWER(REPLACE(type, ' ', '')) = LOWER(REPLACE(?, ' ', ''))", [$typeName])
            ->value('id');
    }

    /**
     * Fetch all Firefly accounts (asset accounts only)
     * with Fireshots metadata merged in.
     */
    public function getMergedAccounts(): Collection
    {
        $assetTypeId = $this->getAccountTypeId('asset account');

        if (!$assetTypeId) {
            return collect(); // safety fallback if no asset type found
        }

        // Query all asset accounts and compute their net balance
        $accounts = DB::table('accounts as a')
            ->where('a.account_type_id', $assetTypeId)
            ->select(
                'a.id',
                'a.name',
                DB::raw('COALESCE(SUM(t.amount), 0) AS balance'),
                DB::raw('MAX(t.updated_at) AS last_firefly_update')
            )
            ->leftJoin('transactions as t', 't.account_id', '=', 'a.id')
            ->groupBy('a.id', 'a.name')
            ->get();

        // Fetch Fireshots metadata for merging
        $meta = AccountMeta::all()->keyBy('account_id');

        return $accounts->map(function ($acc) use ($meta) {
            $m = $meta->get($acc->id);

            $latestUpdate = collect([
                $acc->last_firefly_update,
                optional($m)->updated_at,
            ])->filter()->max();

            return [
                'id' => $acc->id,
                'name' => $acc->name,
                'balance' => (float)$acc->balance,
                'currency_code' => $m->currency_code ?? null,
                'fee_percent' => $m->fee_percent ?? null,
                'updated_at' => $latestUpdate,
            ];
        });
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
