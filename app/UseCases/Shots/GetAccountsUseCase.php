<?php

namespace App\UseCases\Shots;

use App\DTOs\Shots\AccountData;
use App\Repositories\Shots\AccountRepository;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;

class GetAccountsUseCase
{
    public function __construct(protected AccountRepository $repo)
    {
    }

    /**
     * @throws ConnectionException
     */
    public function execute(): JsonResponse
    {
        $accounts = $this->repo->getMergedAccounts();
        return response()->json([
            'status' => 'success',
            'accounts' => AccountData::collect($accounts),
        ]);
    }
}
