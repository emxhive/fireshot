<?php

namespace App\Domain\Transactions\Services;

use App\Client\Firefly\TransactionCacheManager;
use App\Client\Firefly\TransactionsClient;
use App\Domain\Transactions\DTOs\TransactionData;
use App\Domain\Transactions\Mappers\TransactionMapper;
use Illuminate\Http\Client\ConnectionException;

final readonly class TransactionService
{
    public function __construct(
        private TransactionsClient      $client,
        private TransactionCacheManager $cache
    )
    {
    }

    /** @return TransactionData[] */
    public function getTransactions(string $start, string $end): array
    {
        $rows = $this->client->getTransactions($start, $end);
        return TransactionMapper::collectFromFirefly($rows);
    }

    /** @return array [['period'=>string,'total'=>float],...] */
    public function getPeriodTransactions(string $granularity = 'month', int $limit = 12): array
    {
        return $this->client->getPeriodTransactions($granularity, $limit);
    }

    public function getSignedTotal(string $start, string $end): float
    {
        $window = $this->cache->getWindow($start, $end);
        $sum = array_sum(array_map(fn($t) => (float)($t['amount'] ?? 0), $window));
        return round($sum, 2);
    }

    /**
     * @throws ConnectionException
     */
    public function refreshCache(): void
    {
        $this->cache->seedSixMonthCache();
    }
}
