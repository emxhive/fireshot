<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Carbon;

class FireflyApiSeeder extends Seeder
{
    protected string $apiBase;
    protected string $token;

    public function __construct()
    {
        $this->apiBase = rtrim(config('services.firefly.url'), '/');
        $this->token   = config('services.firefly.token');
    }

    public function run(): void
    {
        echo "🌐 Seeding Firefly via API...\n";

        $kwId    = $this->ensureAccount('KW', [
            'type' => 'asset',
            'account_role' => 'cashWalletAsset',
            'currency_code' => 'NGN',
            'active' => true,
            'include_net_worth' => false,
            'notes' => 'Cash wallet ledger for spending; negative balances expected.'
        ]);

        $spendId = $this->ensureAccount('SPEND', [
            'type' => 'expense',
            'currency_code' => 'NGN',
            'active' => true,
            'notes' => 'Sink for KW outflows.'
        ]);

        $fundId  = $this->ensureAccount('FUND', [
            'type' => 'revenue',
            'currency_code' => 'NGN',
            'active' => true,
            'notes' => 'Source for KW inflows.'
        ]);

        // Now generate transactions
        $this->seedTransactions($kwId, $spendId, $fundId);
    }

    protected function ensureAccount(string $name, array $attributes): ?int
    {
        echo "→ Checking account: {$name}\n";

        $response = Http::withToken($this->token)
            ->accept('application/json')
            ->get("{$this->apiBase}/accounts", ['search' => $name]);

        $existing = collect($response->json('data'))
            ->first(fn($acc) => strcasecmp($acc['attributes']['name'], $name) === 0);

        if ($existing) {
            echo "   ✓ {$name} exists (ID {$existing['id']})\n";
            return $existing['id'];
        }

        $payload = array_merge(['name' => $name], $attributes);

        $response = Http::withToken($this->token)
            ->asJson()
            ->accept('application/json')
            ->post("{$this->apiBase}/accounts", $payload);

        if ($response->failed()) {
            echo "   ❌ Failed to create {$name}: {$response->status()} {$response->body()}\n";
            return null;
        }

        $id = $response->json('data.id') ?? $response->json('id');
        echo "   ✅ Created {$name} (ID {$id})\n";
        return $id;
    }

    protected function seedTransactions(?int $kwId, ?int $spendId, ?int $fundId): void
    {
        echo "💸 Generating Firefly transactions...\n";

        $start = now()->subMonths(6)->startOfWeek();
        $end   = now()->startOfDay();
        $week  = $start->copy();

        while ($week->lt($end)) {
            // baseline weekly spend ≈ 250 k NGN ±15%
            $weeklySpend = 250000 * (1 + mt_rand(-15,15)/100);
            $splits = mt_rand(3,5);
            $chunk = (int) round($weeklySpend / $splits);

            for ($i=0; $i<$splits; $i++) {
                $date = $week->copy()->addDays(mt_rand(0,6))->toDateString();
                $this->createTransaction($kwId, $spendId, $chunk, "Weekly expense", $date);
            }

            // occasional gadget buy
            if (mt_rand(1,6) === 1) {
                $amount = mt_rand(120000, 400000);
                $date   = $week->copy()->addDays(mt_rand(0,6))->toDateString();
                $this->createTransaction($kwId, $spendId, $amount, "Gadget purchase", $date);
            }

            // rare inflow (15 % chance)
            if (mt_rand(1,7) === 1) {
                $amount = mt_rand(30000, 120000);
                $date   = $week->copy()->addDays(mt_rand(0,6))->toDateString();
                $this->createTransaction($fundId, $kwId, $amount, "Debt repayment / funding", $date, false);
            }

            $week->addWeek();
        }

        echo "   ✅ Firefly transaction seeding complete.\n";
    }

    protected function createTransaction(?int $sourceId, ?int $destId, float $amount, string $desc, string $date, bool $spent = true): void
    {
        if (!$sourceId || !$destId) return;

        $payload = [
            "transactions" => [[
                "type" => $spent? "withdrawal" : "deposit",
                "description" => $desc,
                "date" => $date,
                "amount" => (string) $amount,
                "currency_code" => "NGN",
                "source_id" => $sourceId,
                "destination_id" => $destId
            ]]
        ];

        $res = Http::withToken($this->token)
            ->asJson()
            ->accept('application/json')
            ->post("{$this->apiBase}/transactions", $payload);

        if ($res->failed()) {

            echo "     ⚠️  Txn fail {$desc} ({$amount} NGN on {$date}): {$res->status()}\n";
        }

    }
}
