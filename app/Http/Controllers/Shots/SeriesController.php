<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\ComputeService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use App\DTOs\Shots\SeriesPointData;

class SeriesController extends Controller
{
    public function __construct(private readonly ComputeService $compute) {}

    public function index(Request $request)
    {
        $granularity = $request->validate([
            'granularity' => ['nullable', Rule::in(['month', 'week'])],
        ])['granularity'] ?? 'month';

        $key = "shots.series.$granularity";

        return Cache::remember($key, 86400, fn() =>
            $this->compute->getSeries($granularity, 12)
        );
    }
}
