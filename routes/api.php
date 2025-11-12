<?php

use App\Http\Controllers\{AccountsController, SnapshotsController, TransactionsController};

Route::prefix('shots')->group(function () {
    // --- Snapshots ---
    Route::get('/summaries', [SnapshotsController::class, 'summaries'])
        ->name('shots.summaries');
    Route::post('/run', [SnapshotsController::class, 'run'])
        ->name('shots.run');

    // --- Transactions ---
    Route::get('/transactions', [TransactionsController::class, 'index'])
        ->name('shots.transactions.index');
    Route::get('/transactions/summary', [TransactionsController::class, 'summary'])
        ->name('shots.transactions.summary');
    Route::post('/transactions/refresh', [TransactionsController::class, 'refresh'])
        ->name('shots.transactions.refresh');

    // --- Accounts ---
    Route::get('/accounts', [AccountsController::class, 'index'])
        ->name('shots.accounts.index');
    Route::post('/accounts/create', [AccountsController::class, 'store'])
        ->name('shots.accounts.create');
    Route::put('/accounts/{account}', [AccountsController::class, 'update'])
        ->name('shots.accounts.update');
    Route::post('/accounts/sync', [AccountsController::class, 'sync'])
        ->name('shots.accounts.sync');

});
