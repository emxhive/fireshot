<?php

namespace App\Domain\Accounts\Mappers;

use App\Domain\Accounts\DTOs\AssetAccountData;
use App\Models\Shots\AssetAccount;
use Illuminate\Support\Collection;

final class AssetAccountMapper
{
    /**
     * Map an Eloquent AssetAccount model to a DTO.
     */
    public static function fromModel(AssetAccount $a): AssetAccountData
    {

        return new AssetAccountData(
            id: (int)$a->id,
            name: (string)$a->name,
            currency: (string)$a->currency,
            balance: (float)$a->balance,
            fee: (float)$a->fee,
            updatedAt: $a->updated_at->toIso8601String(),
        );
    }

    /**
     * Map a collection / iterable of AssetAccount models to an array of DTOs.
     *
     * @return AssetAccountData[]
     */
    public static function collectFromModels($models): array
    {
        if ($models instanceof Collection) {
            return $models
                ->map(fn($m) => self::fromModel($m))
                ->all();
        }

        return array_map(
            fn($m) => self::fromModel($m),
            is_array($models) ? $models : iterator_to_array($models),
        );
    }

    /**
     * Build payload for Firefly from the DTO only.
     * No DB / model involvement here.
     */
    public static function toFireflyPayload(AssetAccountData $a): array
    {
        $payload = [
            'name' => $a->name,
            'active' => true,
            'include_net_worth' => true,
            'virtual_balance' => '0',
        ];

        if ($a->currency) {
            $payload['currency_code'] = $a->currency;
        }

        if ($a->balance !== null) {
            $payload['opening_balance'] = (string)$a->balance;
            $payload['opening_balance_date'] = now('UTC')->toIso8601String();
        }

        return $payload;
    }
}
