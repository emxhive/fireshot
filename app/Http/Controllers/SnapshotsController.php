<?php

namespace App\Http\Controllers;


use App\Domain\Snapshots\Services\SnapshotComputationService;
use App\Domain\Snapshots\Services\SnapshotService;
use App\Domain\Snapshots\Repositories\SnapshotRepository;
use App\Models\Shots\AssetAccount;
use App\Models\Shots\DailySnapshotHeader;
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
        private SnapshotRepository         $repo,
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
            // Optional balances override
            'balances' => 'nullable|array',
            'balances.*.account_id' => 'required_with:balances|integer|exists:fireshots_asset_accounts,id',
            'balances.*.balance_raw' => 'required_with:balances|numeric',
        ]);

        $buyRate = $input['sell_rate'] - ($input['buy_diff'] ?? 0);

        // Normalize optional balances: derive currency_code from AssetAccount, ignore any client-provided currency
        $override = null;
        if (!empty($input['balances']) && is_array($input['balances'])) {
            $ids = collect($input['balances'])->pluck('account_id')->all();
            $accounts = AssetAccount::whereIn('id', $ids)->get(['id', 'currency']);
            $currencyById = $accounts->pluck('currency', 'id');

            $override = collect($input['balances'])->map(function ($row) use ($currencyById) {
                $accountId = (int)$row['account_id'];
                $currency = (string)($currencyById[$accountId] ?? 'NGN');
                return [
                    'account_id' => $accountId,
                    'currency_code' => $currency,
                    'balance_raw' => (float)$row['balance_raw'],
                ];
            })->all();
        }

        $this->snapshots->run(
            $input['snapshot_date'],
            $input['sell_rate'],
            $buyRate,
            $override
        );

        return ApiResponse::success(null, 'Snapshot successfully created.', Response::HTTP_CREATED);

    }

    // New endpoints for Snapshots listing/detail/delete
    public function index(Request $request)
    {
        $limit = (int)$request->query('limit', 50);
        $snapshots = $this->repo->listSnapshots($limit);
        return ApiResponse::success($snapshots);
    }

    public function show(int $snapshot)
    {
        // Fetch header directly to avoid overloading getHeaders
        $h = DailySnapshotHeader::findOrFail($snapshot);
        $nav = $this->repo->computeNavForHeader($h->id);
        $sell = (float)$h->sell_rate;
        $buy = (float)($h->buy_rate ?? 0);

        $accounts = $this->repo->getSnapshotAccounts($h->id);

        return ApiResponse::success([
            'id' => (int)$h->id,
            'snapshot_date' => $h->snapshot_date->toDateString(),
            'sell_rate' => $sell,
            'buy_rate' => $buy,
            'buy_diff' => $sell - $buy,
            'usd' => round($nav['usd'] ?? 0, 2),
            'ngn' => round($nav['ngn'] ?? 0, 2),
            'net_asset_value' => round($nav['nav'] ?? 0, 2),
            'accounts' => $accounts,
        ]);
    }

    public function destroy(int $snapshot)
    {
        $this->repo->deleteSnapshot($snapshot);
        return ApiResponse::success(null, 'Snapshot deleted.');
    }
}
