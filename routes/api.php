<?php

use App\Http\Controllers\AccountsController;
use App\Http\Controllers\Shots\{CacheController,
    RecordController,
    SeriesController,
    SnapshotController,
    SummaryController};

Route::prefix('shots')->group(function () {
    Route::post('/snapshots/run', [SnapshotController::class, 'run'])->name('shots.snapshots.run');
    Route::get('/summaries', [SummaryController::class, 'index'])->name('shots.summary.index');
    Route::get('/summary', [SummaryController::class, 'show'])->name('shots.summary.show');
    Route::get('/series', [SeriesController::class, 'index'])->name('shots.series.index');
    Route::get('/records', [RecordController::class, 'index'])->name('shots.records.index');
    Route::post('/cache/clear', [CacheController::class, 'clear'])->name('shots.cache.clear');


    // Accounts
    Route::get('/accounts', [AccountsController::class, 'index'])->name('shots.accounts.index');
    Route::post('/accounts/{account}', [AccountsController::class, 'update'])->name('shots.accounts.update');
    Route::post('/accounts/create', [AccountsController::class, 'create'])->name('shots.accounts.create');
});
