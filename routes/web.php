<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn() => redirect()->route('dashboard'));

Route::get('/dashboard', fn() => Inertia::render('dashboard'))
    ->name('dashboard');

Route::get('/accounts', fn() => Inertia::render('accounts'))
    ->name('accounts');

Route::get('/settings', fn() => Inertia::render('settings'));

Route::fallback(fn() => redirect()->route('dashboard'));



Route::get('/xdd', function () {
    return phpinfo();
});
