<?php

namespace App\Http\Controllers;

use App\Services\Shots\ComputeService;
use App\Services\Shots\RecordService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController
{
    public function __construct(
        private readonly ComputeService $compute,
        private readonly RecordService $records,
    ) {}

    public function __invoke(): Response
    {
        // Aggregate data needed by the Dashboard page and its child components
        $summaries = $this->compute->getDailySummaries(30);
        $seriesMonth = $this->compute->getSeries('month', 12);
        $seriesWeek = $this->compute->getSeries('week', 12);
        $records = $this->records->get();

        return Inertia::render('dashboard', [
            'summaries' => $summaries,
            'seriesMonth' => $seriesMonth,
            'seriesWeek' => $seriesWeek,
            'records' => $records,
        ]);
    }
}
