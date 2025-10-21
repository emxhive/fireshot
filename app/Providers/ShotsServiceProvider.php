<?php

namespace App\Providers;

use App\Repositories\Shots\{FireflyApiRepository, FireflyRepository};
use Illuminate\Support\ServiceProvider;

class ShotsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(FireflyRepository::class, FireflyApiRepository::class);
    }
}
