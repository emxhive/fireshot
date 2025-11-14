<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('fireshots_asset_accounts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('firefly_id')->nullable();
            $table->string('name', 120);
            $table->string('currency', 10)->default('NGN');
            $table->decimal('balance', 18, 2)->default(0);
            $table->decimal('fee', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fireshots_asset_accounts');
    }
};
