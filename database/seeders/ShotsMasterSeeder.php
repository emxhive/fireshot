<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ShotsMasterSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
//            FireflyApiSeeder::class,
            ShotsSnapshotsSeeder::class,
        ]);
    }
}
