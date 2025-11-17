<?php

use App\Http\Controllers\{AccountsApiController, SnapshotsController, TransactionsController};
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------

*/

Route::prefix('shots')->name('shots.')->group(function () {

    // --- Snapshots ---
    Route::controller(SnapshotsController::class)->group(function () {
        // Routes at the root of /shots
        Route::get('/summaries', 'summaries')->name('summaries');
        Route::post('/run', 'run')->name('run');

        // Routes under /shots/snapshots
        Route::prefix('snapshots')->name('snapshots.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/{snapshot}', 'show')->name('show');
            Route::delete('/{snapshot}', 'destroy')->name('destroy');
        });
    });

    // --- Transactions ---
    Route::controller(TransactionsController::class)
        ->prefix('transactions')
        ->name('transactions.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/summary', 'summary')->name('summary');
            Route::post('/refresh', 'refresh')->name('refresh');
        });

    // --- Accounts ---
    Route::controller(AccountsApiController::class)
        ->prefix('accounts')
        ->name('accounts.')
        ->group(function () {
            Route::post('/create', 'store')->name('create');
            Route::put('/{account}', 'update')->name('update');
            Route::post('/bootstrap', 'bootstrap')->name('bootstrap');
        });
});
