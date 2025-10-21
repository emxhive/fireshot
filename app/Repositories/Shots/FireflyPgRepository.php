<?php

namespace App\Repositories\Shots;

use Illuminate\Support\Facades\DB;

class FireflyPgRepository
{
    /**
     * Get all asset accounts that have a positive net balance
     * up to and including a given snapshot date.
     */
    public function getPositiveBalancesForDate(string $snapshotDate): array
    {
        $sql = <<<SQL
        SELECT a.id AS account_id,
               SUM(t.amount) AS balance_raw
        FROM transactions t
        JOIN transaction_journals j ON j.id = t.transaction_journal_id
        JOIN accounts a ON a.id = t.account_id
        JOIN account_types at ON at.id = a.account_type_id
        WHERE at.type = 'asset'
          AND a.deleted_at IS NULL
          AND j.date <= :date::date
        GROUP BY a.id
        HAVING SUM(t.amount) > 0;
        SQL;

        $rows = DB::select($sql, ['date' => $snapshotDate]);

        return array_map(
            fn($r) => [
                'account_id' => (int)$r->account_id,
                'balance_raw' => (float)$r->balance_raw,
            ],
            $rows
        );
    }

    /**
     * Get a total transaction sum (single currency) for a specific date.
     */
    public function getDailyTransactionsTotals(string $date): array
    {
        $sql = <<<SQL
        SELECT SUM(t.amount) AS total
        FROM transactions t
        JOIN transaction_journals j ON j.id = t.transaction_journal_id
        JOIN accounts a ON a.id = t.account_id
        JOIN account_types at ON at.id = a.account_type_id
        WHERE at.type = 'asset'
          AND a.deleted_at IS NULL
          AND j.date >= :date::date
          AND j.date < (:date::date + INTERVAL '1 day');
        SQL;

        $row = DB::selectOne($sql, ['date' => $date]);

        return [
            'total' => (float)($row->total ?? 0.0),
        ];
    }

    /**
     * Aggregate transaction totals by period (month or ISO week).
     */
    public function getPeriodTransactions(string $granularity, int $limit = 12): array
    {
        $interval = $granularity === 'month' ? 'month' : 'week';
        $format = $granularity === 'month' ? 'YYYY-MM' : 'YYYY-"W"IW';

        $sql = <<<SQL
        SELECT
            to_char(date_trunc('$interval', j.date), '$format') AS period,
            SUM(t.amount) AS total
        FROM transactions t
        JOIN transaction_journals j ON j.id = t.transaction_journal_id
        JOIN accounts a ON a.id = t.account_id
        JOIN account_types at ON at.id = a.account_type_id
        WHERE at.type = 'asset'
          AND a.deleted_at IS NULL
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT $limit;
        SQL;

        $rows = DB::select($sql);

        return array_map(
            fn($r) => [
                'period' => $r->period,
                'total' => (float)$r->total,
            ],
            $rows
        );
    }
}
