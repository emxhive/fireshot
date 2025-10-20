#!/bin/bash
set -e

echo "🚀 Updating Shots controllers to return Spatie DTOs..."

# ------------------------------------------------------------
# SnapshotController
# ------------------------------------------------------------
cat > app/Http/Controllers/Shots/SnapshotController.php <<'EOF'
<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\SnapshotService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use App\DTOs\Shots\SnapshotHeaderData;

class SnapshotController extends Controller
{
    public function __construct(private SnapshotService $snapshots) {}

    public function run(Request $request): SnapshotHeaderData
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer'],
            'sell_rate' => ['required', 'numeric'],
            'snapshot_date' => ['required', 'date_format:Y-m-d'],
            'buy_diff' => ['nullable', 'numeric'],
        ]);

        return $this->snapshots->run(
            $data['user_id'],
            $data['snapshot_date'],
            (float) $data['sell_rate'],
            $data['buy_diff'] ?? null
        );
    }
}
EOF

# ------------------------------------------------------------
# SummaryController
# ------------------------------------------------------------
cat > app/Http/Controllers/Shots/SummaryController.php <<'EOF'
<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\ComputeService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use App\DTOs\Shots\SnapshotSummaryData;

class SummaryController extends Controller
{
    public function __construct(private ComputeService $compute) {}

    public function index()
    {
        return Cache::remember('shots.summaries', 86400, fn() =>
            $this->compute->getDailySummaries(30)
        );
    }

    public function show(Request $request): SnapshotSummaryData
    {
        $date = $request->validate([
            'snapshot_date' => ['required', 'date_format:Y-m-d'],
        ])['snapshot_date'];

        $summaries = Cache::remember('shots.summaries', 86400, fn() =>
            $this->compute->getDailySummaries(30)
        );

        $summary = $summaries->first(fn($dto) => $dto->date === $date);

        if (!$summary) {
            abort(404, 'Snapshot not found');
        }

        return $summary;
    }
}
EOF

# ------------------------------------------------------------
# SeriesController
# ------------------------------------------------------------
cat > app/Http/Controllers/Shots/SeriesController.php <<'EOF'
<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\ComputeService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use App\DTOs\Shots\SeriesPointData;

class SeriesController extends Controller
{
    public function __construct(private ComputeService $compute) {}

    public function index(Request $request)
    {
        $granularity = $request->validate([
            'granularity' => ['nullable', Rule::in(['month', 'week'])],
        ])['granularity'] ?? 'month';

        $key = "shots.series.$granularity";

        return Cache::remember($key, 86400, fn() =>
            $this->compute->getSeries($granularity, 12)
        );
    }
}
EOF

# ------------------------------------------------------------
# RecordController
# ------------------------------------------------------------
cat > app/Http/Controllers/Shots/RecordController.php <<'EOF'
<?php

namespace App\Http\Controllers\Shots;

use App\Services\Shots\RecordService;
use Illuminate\Routing\Controller;

class RecordController extends Controller
{
    public function __construct(private RecordService $records) {}

    public function index()
    {
        return $this->records->get();
    }
}
EOF

# ------------------------------------------------------------
# CacheController
# ------------------------------------------------------------
cat > app/Http/Controllers/Shots/CacheController.php <<'EOF'
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
EOF

echo "✅ All Shots controllers replaced successfully with DTO integration!"
