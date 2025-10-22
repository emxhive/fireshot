<?php

namespace App\Repositories\Shots;

interface FireflyRepository
{
    public function getAccounts(): array;

    public function getTransactions(string $start, string $end): array;

    public function getPeriodTransactions(string $granularity = 'month', int $limit = 12): array;

    public function getPositiveBalancesForDate(string $date): array;


}
