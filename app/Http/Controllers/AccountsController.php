<?php

namespace App\Http\Controllers;

use App\DTOs\Shots\AccountData;
use App\Repositories\AccountRepository;
use App\Services\FireflyApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class AccountsController extends Controller
{
    public function __construct(
        protected AccountRepository $repo,
        protected FireflyApiService $firefly
    )
    {
    }

    /**
     * GET /api/shots/accounts
     * Returns merged Firefly + Fireshots metadata.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'accounts' => AccountData::collect($this->repo->getMergedAccounts()),
        ]);
    }

    /**
     * POST /api/shots/accounts/{account_id}
     * Updates Firefly fields (name, balance) and Fireshots metadata (fee, currency).
     */
    public function update(Request $request, int $account_id): JsonResponse
    {
        $validated = $request->validate([
            'currency' => ['nullable', 'string', 'max:8'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'name' => ['nullable', 'string', 'max:128'],
            'balance' => ['nullable', 'numeric'],
        ]);

        try {
            $current = $this->firefly->getAccount($account_id);
            $existing = $current['data']['attributes'] ?? [];

            $fireflyPayload = [];

            // 🔹 Update name if changed
            if (
                !empty($validated['name']) &&
                array_key_exists('name', $existing) &&
                $validated['name'] !== $existing['name']
            ) {
                $fireflyPayload['name'] = $validated['name'];
            }

            // 🔹 Update balance if changed
            if (!is_null($validated['balance'])) {
                $currentBalance = (float)($existing['current_balance'] ?? 0);
                $newBalance = (float)$validated['balance'];

                if (round($currentBalance, 2) !== round($newBalance, 2)) {
                    $fireflyPayload['opening_balance'] = $newBalance;
                    $fireflyPayload['opening_balance_date'] = now()->toDateString();
                }
            }

            // 🔹 Update currency if changed (Firefly expects currency_code)
            if (
                !empty($validated['currency']) &&
                array_key_exists('currency_code', $existing) &&
                $validated['currency'] !== $existing['currency_code']
            ) {
                $fireflyPayload['currency_code'] = $validated['currency'];
            }

            // ✅ Call Firefly only if any API field changed
            if (!empty($fireflyPayload)) {
                $resp = $this->firefly->updateAccount($account_id, $fireflyPayload);
                if (!$resp) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Failed to update account in Firefly.',
                    ], 500);
                }
            }

            // ✅ Always update Fireshots metadata (currency + fee)
            $this->repo->upsertMeta(
                $account_id,
                $validated['currency'] ?? null,
                $validated['fee'] ?? null
            );

            $updated = $this->repo->getMergedAccounts()->firstWhere('id', $account_id);

            return response()->json([
                'status' => 'success',
                'account' => AccountData::from($updated)->toArray(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Account update failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Unexpected server error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/shots/accounts/create
     * Creates a new Firefly account and Fireshots metadata record.
     */
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:128'],
            'currency' => ['nullable', 'string', 'max:8'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'balance' => ['nullable', 'numeric'],
        ]);

        try {
            // 🔹 Step 1: Create in Firefly
            $fireflyAccount = $this->firefly->createAccount([
                'name' => $validated['name'],
                'type' => 'asset', // Correct Firefly API type
                'active' => true,
                'include_net_worth' => true,
                'virtual_balance' => '0',
                'currency_code' => $validated['currency'] ?? null,
                'opening_balance' => $validated['balance'] ?? 0,
                'opening_balance_date' => now()->toDateString(),
            ]);

            if (!$fireflyAccount || empty($fireflyAccount['data']['id'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to create account in Firefly.',
                ], 500);
            }

            $accountId = $fireflyAccount['data']['id'];

            // 🔹 Step 2: Save Fireshots metadata (currency + fee)
            $this->repo->upsertMeta(
                $accountId,
                $validated['currency'] ?? null,
                $validated['fee'] ?? null
            );

            // 🔹 Step 3: Merge & return
            $merged = $this->repo->getMergedAccounts()->firstWhere('id', $accountId);

            return response()->json([
                'status' => 'success',
                'account' => AccountData::from($merged)->toArray(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Account creation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Unexpected server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
