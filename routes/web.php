<?php

use App\Http\Controllers\Web\AccountsPageController;
use App\Http\Controllers\Web\DashboardPageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- Application Pages ---
Route::name('shots.')->group(function () {

    Route::get('/dashboard', DashboardPageController::class)->name('dashboard');

    Route::get('/accounts', AccountsPageController::class)->name('accounts.index');

    Route::inertia('/settings', 'settings')->name('settings');

});

// --- Redirects & Fallbacks ---

Route::get('/', fn() => redirect()->route('shots.dashboard'));

// Any route not defined above also redirects to the dashboard
Route::fallback(fn() => redirect()->route('shots.dashboard'));
