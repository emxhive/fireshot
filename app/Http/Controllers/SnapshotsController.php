<?php

namespace App\Http\Controllers;


use App\Domain\Snapshots\Services\SnapshotComputationService;
use App\Domain\Snapshots\Services\SnapshotService;
use App\Shared\ApiResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

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
        $limit = (int)$request->query('limit', 12);
        $snapshots = $this->compute->getIntervalSummaries($limit);
        return ApiResponse::success($snapshots);
    }


    /**
     * @throws Throwable
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
