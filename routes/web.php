<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => redirect()->route('dashboard'));

Route::get('/dashboard', [DashboardController::class, '__invoke'])
    ->name('dashboard');

Route::get('/accounts', fn() => Inertia::render('accounts'))
    ->name('accounts');

Route::get('/settings', fn() => Inertia::render('settings'));

Route::fallback(fn() => redirect()->route('dashboard'));
