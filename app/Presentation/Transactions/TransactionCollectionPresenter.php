<?php

namespace App\Presentation\Transactions;

use App\Domain\Transactions\DTOs\TransactionData;

final class TransactionCollectionPresenter
{
    /** @param TransactionData[] $items */
    public static function present(array $items): array
    {
        return array_map(fn(TransactionData $dto) => TransactionPresenter::present($dto), $items);
    }
}
