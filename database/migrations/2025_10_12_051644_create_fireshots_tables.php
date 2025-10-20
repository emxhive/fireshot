<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Daily Snapshot Headers
        |--------------------------------------------------------------------------
        */
        Schema::create('fireshots_daily_snapshot_headers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->date('snapshot_date');                 // Lagos calendar day
            $table->timestamp('snapshot_at')->nullable();  // UTC capture time
            $table->decimal('sell_rate', 12, 4);           // user-entered
            $table->decimal('buy_rate', 12, 4);            // derived (sell - diff)
            $table->timestamps();

            // one snapshot per user per day
            $table->unique(['user_id', 'snapshot_date'], 'fireshots_unique_user_date');
        });

        /*
        |--------------------------------------------------------------------------
        | 2. Balance Snapshots
        |--------------------------------------------------------------------------
        */
        Schema::create('fireshots_balance_snapshots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('header_id');
            $table->unsignedBigInteger('account_id');
            $table->string('currency_code', 8);
            $table->decimal('balance_raw', 14); // positive balances only
            $table->timestamps();

            $table->foreign('header_id')
                ->references('id')
                ->on('fireshots_daily_snapshot_headers')
                ->cascadeOnDelete();

            $table->index(['user_id', 'header_id'], 'fireshots_balance_user_header_idx');
        });

        /*
        |--------------------------------------------------------------------------
        | 3. Settings Table
        |--------------------------------------------------------------------------
        */
        Schema::create('fireshots_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fireshots_settings');
        Schema::dropIfExists('fireshots_balance_snapshots');
        Schema::dropIfExists('fireshots_daily_snapshot_headers');
    }
};
