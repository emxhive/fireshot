<?php

namespace App\Domain\Snapshots\Repositories;

interface SnapshotRepository
{
    /** @return iterable<object> ordered snapshot headers */
    public function getHeaders(?int $limit = null): iterable;

    /** Save a new snapshot (header + balances) */
    public function saveSnapshot(array $balances, string $date, float $sellRate): void;

    /** Compute NAV data for a header */
    public function computeNavForHeader(int $headerId): array;
}
