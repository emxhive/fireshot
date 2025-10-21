<?php

namespace App\UseCases\Shots;

use App\DTOs\Shots\AccountData;
use App\Repositories\Shots\AccountRepository;
use App\Services\FireflyApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class UpdateAccountUseCase
{
    public function __construct(
        protected AccountRepository $repo,
        protected FireflyApiService $firefly
    )
    {
    }

    public function execute(int $accountId, array $data): JsonResponse
    {
        try {
            $current = $this->firefly->getAccount($accountId);
            $existing = $current['data']['attributes'] ?? [];
            $fireflyPayload = [];

            // Update name if changed
            if (!empty($data['name'])
                && isset($existing['name'])
                && $data['name'] !== $existing['name']) {
                $fireflyPayload['name'] = $data['name'];
            }

            // Update balance if changed
            if (array_key_exists('balance', $data) && $data['balance'] !== null) {
                $currentBalance = (float)($existing['current_balance'] ?? 0);
                $newBalance = (float)$data['balance'];
                if (round($currentBalance, 2) !== round($newBalance, 2)) {
                    $fireflyPayload['opening_balance'] = $newBalance;
                    $fireflyPayload['opening_balance_date'] = now()->toDateString();
                }
            }

            // Update currency if changed
            if (!empty($data['currency'])
                && isset($existing['currency_code'])
                && $data['currency'] !== $existing['currency_code']) {
                $fireflyPayload['currency_code'] = $data['currency'];
            }

            // Commit Firefly update if needed
            if (!empty($fireflyPayload)) {
                $resp = $this->firefly->updateAccount($accountId, $fireflyPayload);
                if (!$resp) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Failed to update account in Firefly.',
                    ], 500);
                }
            }

            // Always update Fireshots metadata
            $this->repo->upsertMeta(
                $accountId,
                $data['currency'] ?? null,
                $data['fee'] ?? null
            );

            $updated = $this->repo->getMergedAccounts()->firstWhere('id', $accountId);

            return response()->json([
                'status' => 'success',
                'account' => AccountData::from($updated)->toArray(),
            ]);
        } catch (Throwable $e) {
            Log::error('Account update failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Unexpected server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
