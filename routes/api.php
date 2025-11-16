<?php

use App\Http\Controllers\{AccountsController, SnapshotsController, TransactionsController};

Route::prefix('shots')->group(function () {
    // --- Snapshots ---
    Route::get('/summaries', [SnapshotsController::class, 'summaries'])
        ->name('shots.summaries');
    Route::post('/run', [SnapshotsController::class, 'run'])
        ->name('shots.run');
    Route::get('/snapshots', [SnapshotsController::class, 'index'])
        ->name('shots.snapshots.index');
    Route::get('/snapshots/{snapshot}', [SnapshotsController::class, 'show'])
        ->name('shots.snapshots.show');
    Route::delete('/snapshots/{snapshot}', [SnapshotsController::class, 'destroy'])
        ->name('shots.snapshots.destroy');

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
    Route::post('/accounts/bootstrap', [AccountsController::class, 'bootstrap'])
        ->name('shots.accounts.bootstrap');

});

