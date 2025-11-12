<?php

namespace App\Domain\Snapshots\Services;

use App\Client\Firefly\AccountsClient;
use App\Domain\Snapshots\Repositories\SnapshotRepository;
use Illuminate\Http\Client\ConnectionException;

final readonly class SnapshotService
{
    public function __construct(
        private AccountsClient     $accounts,
        private SnapshotRepository $repo,
        private RecordService      $records,
    )
    {
    }

    /**
     * @throws ConnectionException
     */
    public function run(string $date, float $sellRate): void
    {
        $accounts = $this->accounts->getAccounts();
        $balances = array_map(fn($a) => [
            'account_id' => (int)($a['id'] ?? 0),
            'currency_code' => (string)($a['currency_code'] ?? 'NGN'),
            'balance_raw' => (float)($a['balance'] ?? 0.0),
        ], $accounts);

        $this->repo->saveSnapshot($balances, $date, $sellRate);

        $totalNav = array_sum(array_column($balances, 'balance_raw'));
        $this->records->touchNav($totalNav, $date);
    }
}
