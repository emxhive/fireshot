<?php

namespace App\Domain\Snapshots\Services;


use App\Domain\Accounts\Repositories\AssetAccountRepository;
use App\Domain\Snapshots\Repositories\SnapshotRepository;
use Illuminate\Http\Client\ConnectionException;
use Throwable;

final readonly class SnapshotService
{
    public function __construct(
        private SnapshotRepository $snapRepo, private AssetAccountRepository $assetRepo)
    {
    }

    /**
     * @throws ConnectionException
     * @throws Throwable
     */
    public function run(string $date, float $sellRate, float $buyRate, ?array $overrideBalances = null): void
    {
        // If override balances are provided, use them as-is (already normalized by controller)
        if (is_array($overrideBalances)) {
            $this->snapRepo->saveSnapshot($overrideBalances, $date, $sellRate, $buyRate);
            return;
        }

        // Backwards-compatible default behavior: read balances and currencies from AssetAccountRepository
        $accounts = $this->assetRepo->all();
        $balances = $accounts->map(fn($a) => [
            'account_id' => (int)$a->id,
            'currency_code' => (string)($a->currency ?? 'NGN'),
            'balance_raw' => (float)($a->balance ?? 0.0),
        ])->all();

        $this->snapRepo->saveSnapshot($balances, $date, $sellRate, $buyRate);
    }
}
