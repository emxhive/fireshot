<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\ComputeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;
use Throwable;

final class SummaryController extends Controller
{
    public function __construct(private readonly ComputeService $compute) {}

    /**
     * GET /api/shots/summaries?granularity=day|week|month&limit=30
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'granularity' => 'nullable|string|in:day,week,month',
                'limit'       => 'nullable|integer|min:1|max:90',
            ]);

            $granularity = $validated['granularity'] ?? 'day';
            $limit       = $validated['limit'] ?? null;

            $data = $this->compute->getSummaries($granularity, $limit);
            debug($data);
            return response()->json([
                'status'      => 'success',
                'granularity' => $granularity,
                'count'       => count($data),
                'data'        => $data,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'error'  => 'Invalid parameters',
                'details' => $e->errors(),
            ], 422);
        } catch (Throwable $e) {
            report($e);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch summaries',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
