<?php

namespace App\Support\Shots;

/**
 * Centralized cache keys and TTLs for the Shots domain.
 */
final class CacheKeys
{
    // RecordService
    public const RECORDS = 'fireshots.records';
    public const RECORDS_TTL = 31536000; // 1 year in seconds

    // Firefly KW transactions
    public const FIREFLY_KW_TX = 'firefly.tx.kw';
    public const FIREFLY_KW_TX_META = 'firefly.tx.kw.meta';
    public const FIREFLY_KW_LOCK_REFRESH = 'lock:firefly.tx.kw.refresh';

// Snapshot summaries (by granularity)
    public const SUMMARIES_DAY   = 'fireshots.summaries.day';
    public const SUMMARIES_WEEK  = 'fireshots.summaries.week';
    public const SUMMARIES_MONTH = 'fireshots.summaries.month';


}
