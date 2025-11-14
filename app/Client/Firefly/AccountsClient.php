<?php

namespace App\Client\Firefly;

use App\Shared\Enums\AccountRole;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Log;

class AccountsClient extends FireflyClient
{
    /**
     * Always fetch fresh asset accounts (no caching) and map to simplified shape.
     * @throws ConnectionException
     */
    public function getAccounts(AccountRole $role = AccountRole::DefaultAsset): array
    {
        $response = $this->client()->get('/accounts', ['type' => 'asset']);
        if (!$response->successful()) {
            Log::error('[AccountsClient] Failed to fetch accounts', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }
        $data = $response->json('data') ?? [];
        $filtered = array_filter($data, fn($a) => ($a['attributes']['account_role'] ?? null) === $role->value);

        return array_map(function ($a) {
            $attr = $a['attributes'] ?? [];
            return [
                'id' => (int)($a['id'] ?? 0),
                'name' => (string)($attr['name'] ?? ''),
                'role' => $attr['account_role'] ?? null,
                'balance' => (float)($attr['current_balance'] ?? 0),
                'currency_code' => $attr['currency_code']
                    ?? ($attr['primary_currency_code'] ?? 'NGN'),
            ];
        }, $filtered);
    }


    /**
     * @throws ConnectionException
     */
    public function getAccount(int $id): ?array
    {
        $resp = $this->client()->get("/accounts/{$id}");
        return $resp->successful() ? $resp->json() : null;
    }

    /**
     * @throws ConnectionException
     */
    public function createAccount(array $payload): ?array
    {
        $resp = $this->client()->post('/accounts', $payload);
        return $resp->successful() ? $resp->json() : null;
    }

    /**
     * @throws ConnectionException
     */
    public function updateAccount(int $id, array $payload): ?array
    {
        $resp = $this->client()->put("/accounts/{$id}", $payload);
        return $resp->successful() ? $resp->json() : null;
    }
}
