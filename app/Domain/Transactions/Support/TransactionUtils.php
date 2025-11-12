<?php

namespace App\Domain\Transactions\Support;


final class TransactionUtils
{
    public static function sign(string $type, float $amount): float
    {

        return $type === 'withdrawal' ? -abs($amount) : abs($amount);

    }
}
