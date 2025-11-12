<?php

namespace App\Client\Firefly;

use Illuminate\Http\Client\Factory;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

/**
 * Base HTTP client for Firefly API: handles base URL and token.
 */
class FireflyClient
{
    protected string $baseUrl;
    protected string $token;

    public function __construct()
    {
        $this->baseUrl = rtrim((string)config('services.firefly.url'), '/');
        $this->token = (string)config('services.firefly.token');
    }

    protected function client(): PendingRequest|Factory
    {
        return Http::withToken($this->token)
            ->baseUrl($this->baseUrl)
            ->acceptJson();
    }
}
