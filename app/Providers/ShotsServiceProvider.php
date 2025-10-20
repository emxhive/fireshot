<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Shots\{FireflyRepository, FireflyPgRepository};

class ShotsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(FireflyRepository::class, FireflyPgRepository::class);
    }
}
