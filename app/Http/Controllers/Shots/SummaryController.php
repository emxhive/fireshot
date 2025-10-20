<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\ComputeService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use App\DTOs\Shots\SnapshotSummaryData;

class SummaryController extends Controller
{
    public function __construct(private ComputeService $compute) {}

    public function index()
    {
        return Cache::remember('shots.summaries', 86400, fn() =>
            $this->compute->getDailySummaries(30)
        );
    }

    public function show(Request $request): SnapshotSummaryData
    {
        $date = $request->validate([
            'snapshot_date' => ['required', 'date_format:Y-m-d'],
        ])['snapshot_date'];

        $summaries = Cache::remember('shots.summaries', 86400, fn() =>
            $this->compute->getDailySummaries(30)
        );

        $summary = $summaries->first(fn($dto) => $dto->date === $date);

        if (!$summary) {
            abort(404, 'Snapshot not found');
        }

        return $summary;
    }
}
