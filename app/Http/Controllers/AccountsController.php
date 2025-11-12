<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use App\Domain\Accounts\Services\AccountService;
use App\Domain\Accounts\DTOs\AccountData;
use Symfony\Component\HttpFoundation\Response;

final readonly class AccountsController
{
    public function __construct(
        private AccountService $accounts,
    ) {}

    /**
     * @throws ConnectionException
     */
    public function index(Request $request)
    {
        $accounts = $this->accounts->getMergedAccounts();
        return response()->json($accounts);
    }

    public function store(Request $request)
    {
        $dto = new AccountData(
            id: 0,
            name: $request->input('name'),
            currency: $request->input('currency', 'NGN'),
            balance: (float)$request->input('balance', 0),
            fee: (float)$request->input('fee', 0),
            updatedAt: now()->toDateTimeString(),
        );
        $createdArray = $this->accounts->createAccount($dto);
        $created = AccountData::from($createdArray);
        return response()->json($created, Response::HTTP_CREATED);
    }

    public function update(Request $request, int $id)
    {
        $dto = new AccountData(
            id: $id,
            name: $request->input('name'),
            currency: $request->input('currency', 'NGN'),
            balance: (float)$request->input('balance', 0),
            fee: (float)$request->input('fee', 0),
            updatedAt: now()->toDateTimeString(),
        );
        $updatedArray = $this->accounts->updateAccount($id, $dto);
        $updated = AccountData::from($updatedArray);
        return response()->json($updated);
    }

    /**
     * @throws ConnectionException
     */
    public function sync()
    {
        $accounts = $this->accounts->getMergedAccounts();
        return response()->json($accounts);
    }
}
