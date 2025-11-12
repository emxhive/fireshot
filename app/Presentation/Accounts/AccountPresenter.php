<?php

namespace App\Presentation\Accounts;

use App\Domain\Accounts\DTOs\AccountData;

final class AccountPresenter
{
    public static function present(AccountData $dto): array
    {
        return [
            'id'        => $dto->id,
            'name'      => $dto->name,
            'currency'  => $dto->currency,
            'balance'   => $dto->balance,
            'fee'       => $dto->fee,
            'updatedAt' => $dto->updatedAt,
        ];
    }
}
