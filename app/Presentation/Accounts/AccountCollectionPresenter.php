<?php

namespace App\Presentation\Accounts;

use App\Domain\Accounts\DTOs\AccountData;

final class AccountCollectionPresenter
{
    /** @param AccountData[] $items */
    public static function present(array $items): array
    {
        return array_map(fn(AccountData $dto) => AccountPresenter::present($dto), $items);
    }
}
