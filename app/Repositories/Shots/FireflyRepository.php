<?php

namespace App\Repositories\Shots;

interface FireflyRepository
{
    public function getPositiveBalancesForDate(string $snapshotDate): array;
    public function getDailyTransactionsTotals(string $date): array;
    public function getPeriodTransactions(string $granularity, int $limit = 12): array;
}
