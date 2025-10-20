<?php

namespace App\Services\Shots;

use Illuminate\Support\Facades\Cache;

class RecordService
{
    const KEY = 'shots.records';

    public function get(): array
    {
        return Cache::rememberForever(self::KEY, fn() => [
            'balance' => ['high' => ['value' => null, 'date' => null], 'low' => ['value' => null, 'date' => null]],
            'change' => [
                'week' => ['high' => ['value' => null, 'period' => null], 'low' => ['value' => null, 'period' => null]],
                'month' => ['high' => ['value' => null, 'period' => null], 'low' => ['value' => null, 'period' => null]],
            ],
            'transactions' => [
                'week' => ['high' => ['value' => null, 'period' => null], 'low' => ['value' => null, 'period' => null]],
                'month' => ['high' => ['value' => null, 'period' => null], 'low' => ['value' => null, 'period' => null]],
            ],
        ]);
    }
}
