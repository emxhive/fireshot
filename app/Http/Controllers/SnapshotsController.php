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
        private SnapshotService            $snapshots,
        private SnapshotComputationService $compute,
    )
    {
    }

    public function summaries(Request $request)
    {
        $limit = (int)$request->query('limit', 12);
        $data = $this->compute->getIntervalSummaries($limit);
        return ApiResponse::success([
            'summaries' => $data['summaries'],
            'latest_meta' => $data['latest_meta'],
        ]);
    }


    /**
     * @throws Throwable
     * @throws ConnectionException
     */
    public function run(Request $request)
    {
        $input = $request->validate([
            'snapshot_date' => 'required|date',
            'sell_rate' => 'required|numeric',
            'buy_diff' => 'nullable|numeric',
        ]);

        $buyRate = $input['sell_rate'] - ($input['buy_diff'] ?? 0);


        $this->snapshots->run(
            $input['snapshot_date'],
            $input['sell_rate'],
            $buyRate
        );

        return ApiResponse::success(null, 'Snapshot successfully created.', Response::HTTP_CREATED);

    }
}
