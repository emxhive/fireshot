<?php

namespace App\Http\Controllers;

use App\Domain\Accounts\DTOs\AssetAccountData;
use App\Domain\Accounts\Services\AssetAccountService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

final readonly class AccountsApiController
{
    public function __construct(
        private AssetAccountService $accounts,
    )
    {
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

        return response()->json($created, Response::HTTP_CREATED);
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

        return response()->json($updated);
    }


    public function bootstrap()
    {
        $accounts = $this->accounts->getAll();
        return response()->json($accounts);
    }
}
