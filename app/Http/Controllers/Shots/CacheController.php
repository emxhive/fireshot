<?php

namespace App\Http\Controllers\Shots;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;

class CacheController extends Controller
{
    public function clear()
    {
        Cache::forget('shots.summaries');
        Cache::forget('shots.series.month');
        Cache::forget('shots.series.week');
        return ['status' => 'ok'];
    }
}
