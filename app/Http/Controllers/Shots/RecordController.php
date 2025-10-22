<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\RecordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Throwable;

final class RecordController extends Controller
{
    public function __construct(private readonly RecordService $records)
    {
    }

    /**
     * GET /api/shots/records
     */
    public function index(): JsonResponse
    {
        try {
            $data = $this->records->getAll();

            return response()->json([
                'status' => 'success',
                'count' => count($data),
                'data' => $data,
            ]);
        } catch (Throwable $e) {
            report($e);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch record data',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}
