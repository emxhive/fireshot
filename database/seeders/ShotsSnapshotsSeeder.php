<?php

namespace Database\Seeders;

use App\Models\Shots\AccountMeta;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ShotsSnapshotsSeeder extends Seeder
{
    public function run(): void
    {
        echo "📸 Seeding Fireshots snapshot data...\n";

        $assetAccounts = AccountMeta::select('id', 'currency_code')->get();



        if ($assetAccounts->isEmpty()) {
            echo "   ⚠️  No eligible asset accounts found.\n";
            return;
        }

        $start = now()->subMonths(6)->startOfWeek();
        $end = now()->startOfDay();
        $week = $start->copy();

        while ($week->lt($end)) {
            $snapCount = mt_rand(2, 4);
            $days = collect(range(0, 6))->shuffle()->take($snapCount)->sort();

            foreach ($days as $offset) {
                $date = $week->copy()->addDays($offset);
                $sellRate = 1600 + mt_rand(-60, 60);
                $diff = mt_rand(15, 35);
                $buyRate = $sellRate - $diff;

                $headerId = DB::table('fireshots_daily_snapshot_headers')->insertGetId([
                    'user_id' => 1,
                    'snapshot_date' => $date->toDateString(),
                    'snapshot_at' => Carbon::now('UTC'),
                    'sell_rate' => $sellRate,
                    'buy_rate' => $buyRate,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $unifiedTarget = 2500000 + mt_rand(-150000, 150000);

                $weights = [];
                foreach ($assetAccounts as $acc) {
                    $weights[$acc->id] = mt_rand(5, 25);
                }
                $sumW = array_sum($weights);

                foreach ($assetAccounts as $acc) {
                    $portion = $unifiedTarget * ($weights[$acc->id] / $sumW);
                    $isUSD = $acc->currency_code === 'USD';
                    $currency = $acc->currency_code;
                    $balanceRaw = $isUSD
                        ? round($portion / $sellRate, 2)
                        : round($portion, 2);

                    DB::table('fireshots_balance_snapshots')->insert([
                        'user_id' => 1,
                        'header_id' => $headerId,
                        'account_id' => $acc->id,
                        'currency_code' => $currency,
                        'balance_raw' => $balanceRaw,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
            $week->addWeek();
        }

        echo "   ✅ Snapshot seeding complete.\n";
    }
}
