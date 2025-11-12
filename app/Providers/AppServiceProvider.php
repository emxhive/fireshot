<?php

namespace App\Providers;

use App\Domain\Accounts\Repositories\AccountMetaRepository;
use App\Domain\Snapshots\Repositories\SnapshotRepository;
use App\Infrastructure\Persistence\EloquentAccountMetaRepository;
use App\Infrastructure\Persistence\EloquentSnapshotRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(AccountMetaRepository::class, EloquentAccountMetaRepository::class);
        $this->app->bind(SnapshotRepository::class, EloquentSnapshotRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
