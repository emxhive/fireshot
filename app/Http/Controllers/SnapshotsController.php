<?php

namespace App\Http\Controllers;

use App\Domain\Snapshots\Services\SnapshotComputationService;
use App\Domain\Snapshots\Services\SnapshotService;
use App\Shared\ApiResponse;
use App\Shared\Enums\Granularity;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final readonly class SnapshotsController
{
    public function __construct(
        private SnapshotService $snapshots,
        private SnapshotComputationService $compute,
    )
    {
    }

    public function summaries(Request $request)
    {
        $granularity = $request->query('granularity', 'day');
        $limit = $request->integer('limit');

        $g = Granularity::fromString($granularity);
        $limit = $limit && $limit > 0 ? $limit : null;

        $summaries = $this->compute->getIntervalSummaries($g->value, $limit);

        return ApiResponse::success(
            $summaries,
            'Snapshot summaries retrieved successfully.'
        );
    }

    /**
     * @throws ConnectionException
     */
    public function run(Request $request)
    {
        $date = $request->input('date', now()->toDateString());
        $sellRate = (float)$request->input('sell_rate', 1.0);

        $this->snapshots->run($date, $sellRate);
        return ApiResponse::success(null, 'Snapshot successfully created.', Response::HTTP_CREATED);
    }
}
