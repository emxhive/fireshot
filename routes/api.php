<?php

use App\Http\Controllers\Shots\{AccountsController,
    CacheController,
    RecordController,
    SeriesController,
    SnapshotController,
    SummaryController};
use Illuminate\Support\Facades\Route;

// All analytics endpoints under /api/shots
Route::prefix('shots')->group(function () {
    Route::get('/summaries', [SummaryController::class, 'index']);
    Route::get('/records', [RecordController::class, 'index']);
    Route::get('/snapshots/run', [SnapshotController::class, 'run']);
    Route::get('/cache', [CacheController::class, 'clear']);

    // Optional extras
    Route::get('/series', [SeriesController::class, 'index']);


    // Accounts endpoints
    Route::get('/accounts', [AccountsController::class, 'index'])->name('shots.accounts.index');
    Route::post('/accounts/{account}', [AccountsController::class, 'update'])->name('shots.accounts.update');
    Route::post('/accounts/create', [AccountsController::class, 'create'])->name('shots.accounts.create');
});
