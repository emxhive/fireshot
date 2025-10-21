<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('dashboard', DashboardController::class)->name('dashboard');

Route::fallback(function () {
    return redirect()->route('dashboard');
});

Route::get('accounts', function () {
    return Inertia::render('accounts');
})->name('accounts');
