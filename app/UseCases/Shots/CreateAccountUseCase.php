<?php

namespace App\UseCases\Shots;

use App\DTOs\Shots\AccountData;
use App\Repositories\Shots\AccountRepository;
use App\Services\FireflyApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class CreateAccountUseCase
{
    public function __construct(
        protected AccountRepository $repo,
        protected FireflyApiService $firefly
    ) {}

    public function execute(array $data): JsonResponse
    {
        try {
            $fireflyAccount = $this->firefly->createAccount([
                'name' => $data['name'],
                'type' => 'asset',
                'active' => true,
                'include_net_worth' => true,
                'virtual_balance' => '0',
                'currency_code' => $data['currency'] ?? null,
                'opening_balance' => $data['balance'] ?? 0,
                'opening_balance_date' => now()->toDateString(),
            ]);

            if (!$fireflyAccount || empty($fireflyAccount['data']['id'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to create account in Firefly.',
                ], 500);
            }

            $accountId = $fireflyAccount['data']['id'];

            $this->repo->upsertMeta(
                $accountId,
                $data['currency'] ?? null,
                $data['fee'] ?? null
            );

            $merged = $this->repo->getMergedAccounts()->firstWhere('id', $accountId);

            return response()->json([
                'status' => 'success',
                'account' => AccountData::from($merged)->toArray(),
            ]);
        } catch (Throwable $e) {
            Log::error('Account creation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Unexpected server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
