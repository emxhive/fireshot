<?php

namespace App\Http\Controllers\Shots;

use App\UseCases\Shots\CreateAccountUseCase;
use App\UseCases\Shots\GetAccountsUseCase;
use App\UseCases\Shots\UpdateAccountUseCase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AccountsController extends Controller
{
    public function __construct(
        protected GetAccountsUseCase   $getAccounts,
        protected UpdateAccountUseCase $updateAccount,
        protected CreateAccountUseCase $createAccount
    )
    {
    }

    /**
     * @throws ConnectionException
     */
    public function index(): JsonResponse
    {
        return $this->getAccounts->execute();
    }

    public function update(Request $request, int $account_id): JsonResponse
    {
        $validated = $request->validate([
            'currency' => ['nullable', 'string', 'max:8'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'name' => ['nullable', 'string', 'max:128'],
            'balance' => ['nullable', 'numeric'],
        ]);
        return $this->updateAccount->execute($account_id, $validated);
    }

    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:128'],
            'currency' => ['nullable', 'string', 'max:8'],
            'fee' => ['nullable', 'numeric', 'min:0'],
            'balance' => ['nullable', 'numeric'],
        ]);
        return $this->createAccount->execute($validated);
    }
}
