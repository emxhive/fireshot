<?php

namespace App\Http\Controllers\Shots;

use App\Models\Shots\DailySnapshotHeader;
use App\Services\Shots\SnapshotService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\DTOs\Shots\SnapshotHeaderData;
use Throwable;

class SnapshotController extends Controller
{
    public function __construct(private readonly SnapshotService $snapshots) {}

    /**
     * @throws Throwable
     */
    public function run(Request $request): DailySnapshotHeader
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer'],
            'sell_rate' => ['required', 'numeric'],
            'snapshot_date' => ['required', 'date_format:Y-m-d'],
            'buy_diff' => ['nullable', 'numeric'],
        ]);

        return $this->snapshots->run(
            $data['user_id'],
            $data['snapshot_date'],
            (float) $data['sell_rate'],
            $data['buy_diff'] ?? null
        );
    }
}
