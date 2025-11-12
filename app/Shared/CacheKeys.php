<?php

namespace App\Shared;

/**
 * Centralized cache keys and TTLs for the Shots domain.
 */
final class CacheKeys
{
    // Records
    public const RECORDS = 'fireshots.records';
    public const RECORDS_TTL = 31536000; // 1 year

    // Firefly transactions
    public const FIREFLY_KW_TX = 'firefly.tx.kw';
    public const FIREFLY_KW_TX_META = 'firefly.tx.kw.meta';
    public const FIREFLY_KW_LOCK_REFRESH = 'lock:firefly.tx.kw.refresh';

    // Summaries (by granularity)
    public const SUMMARIES_DAY   = 'fireshots.summaries.day';
    public const SUMMARIES_WEEK  = 'fireshots.summaries.week';
    public const SUMMARIES_MONTH = 'fireshots.summaries.month';

    /* -------------------- Grouping -------------------- */
    public const GROUP_ANALYTICS = [
        self::SUMMARIES_DAY,
        self::SUMMARIES_WEEK,
        self::SUMMARIES_MONTH,
    ];

    public const GROUP_TRANSACTIONS = [
        self::FIREFLY_KW_TX,
        self::FIREFLY_KW_TX_META,
    ];

    public const GROUP_RECORDS = [
        self::RECORDS,
    ];
}
