<?php

namespace App\Console\Commands;

use App\Repositories\Shots\FireflyPgRepository;
use Illuminate\Console\Command;
use Symfony\Component\Console\Command\Command as CommandAlias;

class TestFireflyRepo extends Command
{
    protected $signature = 'shots:testrepo {date?}';
    protected $description = 'Test FireflyPgRepository methods with live data';

    public function handle(FireflyPgRepository $repo): int
    {
        $date = $this->argument('date') ?? now()->toDateString();

        $this->info("🔹 Testing FireflyPgRepository with date: {$date}");
        $this->newLine();

        $this->section('Positive Balances');
        dump($repo->getPositiveBalancesForDate($date));

        $this->section('Daily Totals');
        dump($repo->getDailyTransactionsTotals($date));

        $this->section('Period Transactions (month)');
        dump($repo->getPeriodTransactions('month'));

        return CommandAlias::SUCCESS;
    }

    protected function section(string $title): void
    {
        $this->line('');
        $this->info(str_repeat('═', 15) . " {$title} " . str_repeat('═', 15));
    }
}
