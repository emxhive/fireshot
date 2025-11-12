<?php

namespace App\Presentation\Transactions;

use App\Domain\Transactions\DTOs\TransactionData;

final class TransactionPresenter
{
    public static function present(TransactionData $dto): array
    {
        return [
            'id'           => (int)$dto->id,
            'type'         => $dto->type,
            'date'         => $dto->date,
            'amount'       => $dto->amount,
            'currencyCode' => $dto->currencyCode,
        ];
    }
}
