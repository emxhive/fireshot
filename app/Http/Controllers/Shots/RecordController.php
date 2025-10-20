<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\RecordService;
use Illuminate\Routing\Controller;

class RecordController extends Controller
{
    public function __construct(private readonly RecordService $records) {}

    public function index()
    {
        return $this->records->get();
    }
}
