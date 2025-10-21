<?php

use App\Services\Shots\ComputeService;
use App\Http\Controllers\Shots\{CacheController,
    RecordController,
    SeriesController,
    SnapshotController,
    SummaryController};
use App\Http\Controllers\Shots\AccountsController;
use App\Repositories\Shots\FireflyApiRepository;

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


Route::get('/test/summaries', function (ComputeService $svc) {
    $granularity = request('g', 'day');   // 'day' | 'week' | 'month'
    $limit = request('limit');            // optional numeric limit

    $data = $svc->getSummaries($granularity, $limit ? (int)$limit : null);

    return response()->json([
        'granularity' => $granularity,
        'count' => count($data),
        'data' => $data,
    ]);
});
