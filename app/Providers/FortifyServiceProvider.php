<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
//        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));
//        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
//
//        RateLimiter::for('two-factor', function (Request $request) {
//            return Limit::perMinute(5)->by($request->session()->get('login.id'));
//        });
    }
}

