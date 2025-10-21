<?php

namespace App\Console\Commands;

use App\Repositories\Shots\FireflyApiRepository;
use Illuminate\Console\Command;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\NotFoundExceptionInterface;
use Symfony\Component\Console\Command\Command as CommandAlias;

class TestFireflyApiRepo extends Command
{
    protected $signature = 'shots:testapirepo {--start=} {--end=}';
    protected $description = 'Test FireflyApiRepository (API + cache) with live Firefly data';

    /**
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     * @throws ConnectionException
     */
    public function handle(FireflyApiRepository $repo): int
    {
//        // Always clear cache before test
//        Cache::flush();
//        $this->warn('🧹 Cache cleared.');

        $start = $this->option('start') ?? now()->subMonth(6)->toDateString();
        $end = $this->option('end') ?? now()->toDateString();

        $this->info("🔹 Testing FireflyApiRepository with range: {$start} → {$end}");
        $this->newLine();

        $this->section('Accounts (Fresh Fetch)');
        $accounts = $repo->getAccounts();
        $this->line('Found ' . count($accounts) . ' asset accounts.');
        dump(array_slice($accounts, 0, 3));

        $this->section("Transactions {$start} → {$end}");
        $tx = $repo->getTransactions($start, $end);
        $this->line('Fetched ' . count($tx) . ' valid transactions.');
        dump(array_slice($tx, 0, 3));

        $sampleDate = now()->subDays(2)->toDateString();
        $this->section("Daily Totals ({$sampleDate})");
        $totals = $repo->getDailyTotals($sampleDate);
        dump($totals);

        $this->section('Cache Meta Check');
        $meta = cache()->get('firefly.tx.last_6_months.meta');
        dump($meta ?? '❌ No cache meta found — first run or invalid response.');

        return CommandAlias::SUCCESS;
    }

    protected function section(string $title): void
    {
        $this->line('');
        $this->info(str_repeat('═', 15) . " {$title} " . str_repeat('═', 15));
    }
}
