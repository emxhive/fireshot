<?php

namespace App\Http\Controllers\Web;

use App\Domain\Snapshots\Services\SnapshotComputationService;
use App\Shared\CacheKeys;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

final readonly class DashboardPageController
{
    public function __construct(private SnapshotComputationService $compute)
    {
    }

    public function __invoke()
    {
        // Avoid stampede + cleaner syntax
        $payload = Cache::remember(
            CacheKeys::DASHBOARD_SUMMARY,
            now()->addMinutes(10), // TTL still allowed, though not strictly needed
            fn() => $this->compute->getDashboardPayload()
        );

        return Inertia::render('dashboard', $payload);
    }
}
