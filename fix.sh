#!/bin/bash
# Create SnapshotSummaryBuilder class file
# Usage: bash create_snapshot_summary_builder.sh

# Ensure directory exists
mkdir -p app/Domain/Snapshots/Support

# Create the PHP file
cat > app/Domain/Snapshots/Support/SnapshotSummaryBuilder.php <<'PHP'
<?php

namespace App\Domain\Snapshots\Support;

final class SnapshotSummaryBuilder
{
    /**
     * Build a single computed snapshot summary row.
     *
     * @param string $from
     * @param string $to
     * @param array $navData Expecting keys: usd, ngn, nav
     * @param float $txSum
     * @param float|null $prevFlowAdjusted
     * @return array
     */
    public static function build(
        string $from,
        string $to,
        array $navData,
        float $txSum,
        ?float $prevFlowAdjusted = null
    ): array {
        $flowAdjusted = $navData['nav'] - $txSum;
        $valuationDelta = $prevFlowAdjusted === null
            ? 0.0
            : ($flowAdjusted - $prevFlowAdjusted);

        return [
            'from' => $from,
            'to' => $to,
            'usd' => round($navData['usd'] ?? 0, 2),
            'ngn' => round($navData['ngn'] ?? 0, 2),
            'nav' => round($navData['nav'] ?? 0, 2),
            'transactions' => round($txSum, 2),
            'flow_adjusted_value' => round($flowAdjusted, 2),
            'valuation_delta' => round($valuationDelta, 2),
            'change' => round($valuationDelta, 2),
            'period' => "{$from} → {$to}",
            'computed_at' => now()->toDateTimeString(),
        ];
    }
}
PHP

# Feedback
echo "✅ Created: app/Domain/Snapshots/Support/SnapshotSummaryBuilder.php"
