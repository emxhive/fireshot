#!/bin/bash
# setup.sh — sets up Fireshots analytics layer
# Generates:
#   - app/Enums/Shots/Granularity.php
#   - app/Services/Shots/ComputeService.php

mkdir -p app/Enums/Shots
mkdir -p app/Services/Shots

echo "Creating Granularity enum..."
cat > app/Enums/Shots/Granularity.php <<'PHP'
<?php

namespace App\Enums\Shots;

enum Granularity: string
{
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';

    public static function defaultLimit(self $g): int
    {
        return match ($g) {
            self::Day   => 30,
            self::Week  => 6,
            self::Month => 6,
        };
    }

    public static function fromString(string $value): self
    {
        return match (strtolower($value)) {
            'day'   => self::Day,
            'week'  => self::Week,
            'month' => self::Month,
            default => self::Day,
        };
    }

    public static function periodKey(self $g, string|\DateTimeInterface $date): string
    {
        $ts = is_string($date) ? strtotime($date) : $date->getTimestamp();
        return match ($g) {
            self::Day   => date('Y-m-d', $ts),
            self::Week  => date('o-\WW', $ts),
            self::Month => date('Y-m', $ts),
        };
    }
}
PHP

echo "✅ Granularity enum created at app/Enums/Shots/Granularity.php"


echo "Creating ComputeService..."
cat > app/Services/Shots/ComputeService.php <<'PHP'
<?php

namespace App\Services\Shots;

use App\Enums\Shots\Granularity;
use App\Models\Shots\{DailySnapshotHeader, BalanceSnapshot};
use App\Repositories\Shots\FireflyRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Carbon\Carbon;

readonly class ComputeService
{
    public function __construct(private FireflyRepository $firefly) {}

    /**
     * Unified summaries for any granularity.
     */
    public function getSummaries(string $granularity = 'day', ?int $limit = null): array
    {
        $g = Granularity::fromString($granularity);
        $limit = $limit ?? Granularity::defaultLimit($g);

        // 1. Transactions grouped by period
        $periodTx = collect($this->firefly->getPeriodTransactions($g->value, $limit))
            ->keyBy('period');

        // 2. NAVs by period
        $periodNav = match ($g) {
            Granularity::Day   => $this->buildDailyNav($limit),
            Granularity::Week  => $this->buildNavByPeriod('week', $limit),
            Granularity::Month => $this->buildNavByPeriod('month', $limit),
        };

        // 3. Combine and compute flow_adjusted_value + valuation_delta
        $orderedPeriods = $this->orderPeriods(array_unique(
            array_merge(array_keys($periodNav), array_keys($periodTx->all()))
        ), $g->value);

        $out = [];
        $prevX = null;

        foreach ($orderedPeriods as $p) {
            $navRow = $periodNav[$p] ?? ['usd'=>0,'ngn'=>0,'nav'=>null,'sell'=>null];
            $tx     = (float)($periodTx[$p]['total'] ?? 0.0);
            if ($navRow['nav'] === null) continue;

            $x = $navRow['nav'] - $tx;
            $y = ($prevX === null) ? 0.0 : ($x - $prevX);
            $prevX = $x;

            $out[] = [
                'period'              => $p,
                'usd'                 => round($navRow['usd'], 2),
                'ngn'                 => round($navRow['ngn'], 2),
                'net_asset_value'     => round($navRow['nav'], 2),
                'transactions'        => round($tx, 2),
                'flow_adjusted_value' => round($x, 2),
                'valuation_delta'     => round($y, 2),
            ];
        }

        return $out;
    }

    /* ---------- Helpers ---------- */

    private function buildDailyNav(int $limit): array
    {
        $headers = DailySnapshotHeader::orderBy('snapshot_date', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();

        if ($headers->isEmpty()) return [];

        $balances = BalanceSnapshot::select('header_id','currency_code',DB::raw('SUM(balance_raw) AS total'))
            ->whereIn('header_id',$headers->pluck('id'))
            ->groupBy('header_id','currency_code')
            ->get()
            ->groupBy('header_id');

        $map = [];
        foreach ($headers as $h) {
            $d = $h->snapshot_date->format('Y-m-d');
            $bucket = $balances->get($h->id, collect());
            $usd = (float)($bucket->firstWhere('currency_code','USD')->total ?? 0);
            $ngn = (float)($bucket->firstWhere('currency_code','NGN')->total ?? 0);
            $nav = $ngn + $usd * (float)$h->sell_rate;
            $map[$d] = ['usd'=>$usd,'ngn'=>$ngn,'nav'=>$nav,'sell'=>(float)$h->sell_rate];
        }
        return $map;
    }

    private function buildNavByPeriod(string $periodType, int $limit): array
    {
        $headers = DailySnapshotHeader::orderBy('snapshot_date','desc')->limit(200)->get();
        if ($headers->isEmpty()) return [];

        $grouped = $headers->groupBy(function($h) use ($periodType) {
            $dt = Carbon::parse($h->snapshot_date);
            return match ($periodType) {
                'week'  => $dt->format('o-\WW'),
                'month' => $dt->format('Y-m'),
                default => $dt->format('Y-m-d'),
            };
        });

        $periodKeys = $grouped->keys()->sort()->values();
        if ($periodKeys->count() > $limit) $periodKeys = $periodKeys->slice(-$limit);

        $result = [];
        foreach ($periodKeys as $key) {
            $list = $grouped[$key]->sortBy('snapshot_date');
            $last = $list->last();
            if (!$last) continue;

            $bucket = BalanceSnapshot::select('currency_code', DB::raw('SUM(balance_raw) AS total'))
                ->where('header_id',$last->id)
                ->groupBy('currency_code')
                ->get();

            $usd = (float)($bucket->firstWhere('currency_code','USD')->total ?? 0);
            $ngn = (float)($bucket->firstWhere('currency_code','NGN')->total ?? 0);
            $nav = $ngn + $usd * (float)$last->sell_rate;
            $result[$key] = ['usd'=>$usd,'ngn'=>$ngn,'nav'=>$nav,'sell'=>(float)$last->sell_rate];
        }
        return $result;
    }

    private function orderPeriods(array $keys, string $granularity): array
    {
        usort($keys, fn($a,$b)=>strcmp($a,$b));
        return $keys;
    }
}
PHP

echo "✅ ComputeService created at app/Services/Shots/ComputeService.php"

echo "All done. You can now run:"
echo "php artisan optimize:clear && composer dump-autoload"
