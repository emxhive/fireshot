<?php

namespace App\Http\Controllers\Shots;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;

final class CacheController extends Controller
{
    public function clear(): array
    {
        Cache::flush();

        return [
            'status'  => 'ok',
            'message' => 'All application caches have been cleared.',
        ];
    }
}
