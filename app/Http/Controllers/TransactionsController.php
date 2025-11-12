<?php

namespace App\Http\Controllers;

use App\Domain\Transactions\DTOs\TransactionData;
use App\Domain\Transactions\Services\TransactionService;
use App\Shared\ApiResponse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final readonly class TransactionsController
{
    public function __construct(
        private TransactionService $transactions,
    )
    {
    }

    public function index(Request $request)
    {
        $data = $request->validate([
            'start' => 'nullable|date',
        ]);

        $start = $data['start'] ?? now()->subDays(30)->toDateString();
        $end = now()->toDateString();

        $data = $this->transactions->getTransactions($start, $end);
        return ApiResponse::success($data);
    }

    public function summary(Request $request)
    {
        $granularity = $request->query('granularity', 'month');
        $limit = (int)$request->query('limit', 12);
        $summary = $this->transactions->getPeriodTransactions($granularity, $limit);
        return ApiResponse::success($summary);
    }

    /**
     * @throws ConnectionException
     */
    public function refresh()
    {
        $this->transactions->refreshCache();
        return ApiResponse::success(null, 'Transaction cache refreshed.', Response::HTTP_OK);
    }
}
