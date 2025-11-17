<?php

namespace App\Http\Controllers\Web;

use App\Domain\Accounts\Services\AssetAccountService;
use Inertia\Inertia;

final readonly class AccountsPageController
{
    public function __construct(
        private AssetAccountService $accounts,
    )
    {
    }

    public function __invoke()
    {
        return Inertia::render('accounts', [
            'accounts' => $this->accounts->getAll(),
        ]);
    }
}
