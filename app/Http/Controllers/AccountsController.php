<?php

namespace App\Http\Controllers;

use App\Domain\Accounts\DTOs\AssetAccountData;
use App\Domain\Accounts\Services\AssetAccountService;
use App\Shared\ApiResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final readonly class AccountsController
{
    public function __construct(
        private AssetAccountService $accounts,
    )
    {
    }


    public function index(Request $request)
    {
        $accounts = $this->accounts->getAll();
        return ApiResponse::success($accounts);
    }


    public function store(Request $request)
    {
        $dto = new AssetAccountData(
            id: 0,
            name: $request->input('name'),
            currency: $request->input('currency', 'NGN'),
            balance: (float)$request->input('balance', 0),
            fee: (float)$request->input('fee', 0),
            updatedAt: now()->toDateTimeString(),
        );
        $created = $this->accounts->create($dto);

        return ApiResponse::success($created, 'Account created successfully', Response::HTTP_CREATED);
    }


    public function update(Request $request, int $id)
    {
        $dto = new AssetAccountData(
            id: $id,
            name: $request->input('name'),
            currency: $request->input('currency', 'NGN'),
            balance: (float)$request->input('balance', 0),
            fee: (float)$request->input('fee', 0),
            updatedAt: now()->toDateTimeString(),
        );
        $updated = $this->accounts->update($id, $dto);

        return ApiResponse::success($updated, 'Account updated successfully');
    }


    public function sync()
    {
        $accounts = $this->accounts->getAll();
        return ApiResponse::success($accounts);
    }
}
