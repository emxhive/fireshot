<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

final class DashboardController
{
    public function __invoke(): Response
    {

        return Inertia::render('dashboard');
    }
}
