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

    public const DASHBOARD_SUMMARY = 'fireshots.dashboard.summary';


}
