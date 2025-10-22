<?php

namespace App\Services;

use Exception;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FireflyApiService
{
    protected string $baseUrl;
    protected string $token;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.firefly.url'), '/');
        $this->token = config('services.firefly.token');
    }

    /* -------------------------------------------------
     | Generic HTTP helpers
     * ------------------------------------------------*/

    protected function request(string $method, string $endpoint, array $data = []): ?array
    {
        try {
            $url = "{$this->baseUrl}/{$endpoint}";
            $http = Http::withToken($this->token)->acceptJson();

            $response = match ($method) {
                'GET' => $http->get($url, $data),
                'POST' => $http->post($url, $data),
                'PATCH' => $http->patch($url, $data),
                default => throw new Exception("Unsupported method: {$method}"),
            };

            $this->logResponse($method, $endpoint, $response);

            return $response->successful() ? $response->json() : null;
        } catch (Exception $e) {
            Log::error("Firefly {$method} {$endpoint} failed: {$e->getMessage()}");
            return null;
        }
    }

    protected function get(string $endpoint, array $query = []): ?array
    {
        return $this->request('GET', $endpoint, $query);
    }

    protected function post(string $endpoint, array $payload = []): ?array
    {
        return $this->request('POST', $endpoint, $payload);
    }

    protected function patch(string $endpoint, array $payload = []): ?array
    {
        return $this->request('PATCH', $endpoint, $payload);
    }

    protected function logResponse(string $method, string $endpoint, Response $response): void
    {
        Log::info("Firefly API {$method} {$endpoint}", [
            'status' => $response->status(),
            'body' => $response->json(),
        ]);
    }


    public function getAccount(int $id): ?array
    {
        return $this->get("accounts/{$id}");
    }

    public function createAccount(array $payload): ?array
    {
        return $this->post('accounts', $payload);
    }

    public function updateAccount(int $id, array $payload): ?array
    {
        return $this->patch("accounts/{$id}", $payload);
    }
}
