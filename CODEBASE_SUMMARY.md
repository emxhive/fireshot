```markdown
# Fireshot Laravel Codebase Summary (app/ and routes/ only)

This document provides a concise yet comprehensive, project-aware summary of all PHP classes under app/ and all route files under routes/. It excludes migrations and tests. Use it to understand the system without browsing the repository.


## Classes under app/

### App\DTOs\Shots\AccountData — app/DTOs/Shots/AccountData.php
- Summary: Data Transfer Object (Spatie Laravel Data) representing a merged view of a Firefly account and Fireshots metadata.
- Methods (public/protected):
  - __construct(int $id, string $name, float $balance, ?string $currency_code, ?float $fee_percent, Carbon $updated_at): Initializes the DTO with account identity, name, current balance, optional currency and fee percentage, and the last update timestamp (cast to 'Y-m-d H:i:s').


### App\DTOs\Shots\RecordStatsData — app/DTOs/Shots/RecordStatsData.php
- Summary: DTO for a single record statistic point, which can be tied to a specific date or a period label.
- Methods:
  - __construct(?float $value, ?string $periodOrDate, ?string $type): Creates the DTO with a numeric value and either a period or specific date, including a type discriminator ('date' or 'period').
  - public static fromArray(array $data): self — Builds the DTO from a plain array, mapping 'value', and inferring 'periodOrDate' from 'date' or 'period'; sets 'type' to 'date' if 'date' present, else 'period'.


### App\DTOs\Shots\SeriesPointData — app/DTOs/Shots/SeriesPointData.php
- Summary: DTO representing one point in a time series view used by charts for transactions, balance and change, grouped by a granularity like month/week.
- Methods:
  - __construct(string $period, float $transactions, float $change, float $balance): Initializes a series point with a formatted period key and numeric aggregates.


### App\DTOs\Shots\SnapshotHeaderData — app/DTOs/Shots/SnapshotHeaderData.php
- Summary: DTO representing the header of a daily snapshot, including exchange rates and capture timestamps.
- Methods:
  - __construct(int $id, string $snapshot_date, string $snapshot_at, float $sell_rate, float $buy_rate, bool $replaced_previous): Initializes with header id, Lagos calendar date, UTC capture time, sell/buy rates and whether it replaced an existing snapshot.
  - public static fromModel(DailySnapshotHeader $header, bool $replacedPrevious = false): self — Maps an Eloquent model to this DTO, formatting dates and casting rates to floats.


### App\DTOs\Shots\SnapshotSummaryData — app/DTOs/Shots/SnapshotSummaryData.php
- Summary: DTO for summarizing a daily snapshot in normalized currency terms and transaction aggregates.
- Methods:
  - __construct(string $date, float $usd, float $ngn, float $unifiedNGN, float $transactions, float $change): Initializes a single-day summary with USD/NGN totals, unified NGN value (usd*sell+ngn), transactions sum in NGN, and net change.


### App\Http\Controllers\AccountsController — app/Http/Controllers/AccountsController.php
- Summary: API controller for listing, updating, and creating Firefly accounts while merging Fireshots metadata (currency, fee) and syncing changes to the Firefly API when needed.
- Methods:
  - public function __construct(protected AccountRepository $repo, protected FireflyApiService $firefly): Injects the repositories/services used by endpoints.
  - public function index(): JsonResponse — GET /api/shots/accounts. Returns merged accounts from Firefly and Fireshots metadata as AccountData collection.
  - public function update(Request $request, int $account_id): JsonResponse — POST /api/shots/accounts/{account_id}. Validates optional currency/fee/name/balance. Fetches current Firefly account, builds a minimal API payload for fields that actually changed (name, currency_code, opening balance/date), conditionally calls Firefly update. Always upserts Fireshots metadata (currency, fee). Returns the updated merged account DTO. Handles and logs errors with 500 response on failure.
  - public function create(Request $request): JsonResponse — POST /api/shots/accounts/create. Validates required name and optional currency/fee/balance, creates the account in Firefly (asset account type). On success, upserts Fireshots metadata, re-merges the account view and returns it as DTO. Logs and 500s on failure.


### App\Http\Controllers\Shots\CacheController — app/Http/Controllers/Shots/CacheController.php
- Summary: Small utility controller to clear snapshot-related caches.
- Methods:
  - public function clear(): array — Clears summaries and series caches (month/week) and returns a simple status response.


### App\Http\Controllers\Shots\RecordController — app/Http/Controllers/Shots/RecordController.php
- Summary: Provides read-only access to precomputed record values (extrema) cached indefinitely.
- Methods:
  - public function __construct(private RecordService $records): Injects the record service.
  - public function index(): array — Returns the records payload from RecordService::get() (using Cache::rememberForever).


### App\Http\Controllers\Shots\SeriesController — app/Http/Controllers/Shots/SeriesController.php
- Summary: Serves time series data for charts at a chosen granularity (month/week) with daily caching.
- Methods:
  - public function __construct(private ComputeService $compute): Injects the compute service.
  - public function index(Request $request): array — Validates optional 'granularity' in ['month','week'] defaulting to 'month'. Caches the computed series for 24h under key 'shots.series.{granularity}', computed via ComputeService::getSeries(granularity, 12).


### App\Http\Controllers\Shots\SnapshotController — app/Http/Controllers/Shots/SnapshotController.php
- Summary: Endpoint to run a snapshot job for a given user and date, writing the header and balance rows, returning the created header DTO.
- Methods:
  - public function __construct(private SnapshotService $snapshots): Injects SnapshotService.
  - public function run(Request $request): SnapshotHeaderData — Validates required user_id, sell_rate, snapshot_date (Y-m-d), optional buy_diff. Calls SnapshotService::run(user, date, sell_rate, buy_diff) to perform transactional creation/replacement and returns the mapped header.


### App\Http\Controllers\Shots\SummaryController — app/Http/Controllers/Shots/SummaryController.php
- Summary: Serves daily snapshot summaries list, and a detail endpoint by date, both cached for 24 hours.
- Methods:
  - public function __construct(private ComputeService $compute): Injects ComputeService.
  - public function index(): array — Returns up to 30 recent daily summaries from ComputeService::getDailySummaries(30), cached 24h under 'shots.summaries'.
  - public function show(Request $request): SnapshotSummaryData — Validates 'snapshot_date' (Y-m-d), reuses cached summaries, finds the matching date; 404s if not found; returns the matching DTO.


### App\Models\Shots\AccountMeta — app/Models/Shots/AccountMeta.php
- Summary: Eloquent model for fireshots_account_meta table storing per-account Fireshots metadata (currency and fee).
- Methods:
  - [no public/protected methods defined other than inherited].


### App\Models\Shots\BalanceSnapshot — app/Models/Shots/BalanceSnapshot.php
- Summary: Eloquent model for fireshots_balance_snapshots rows representing per-account balances recorded for a given snapshot header.
- Methods:
  - public function header(): BelongsTo — Eloquent relation to DailySnapshotHeader via 'header_id'.


### App\Models\Shots\DailySnapshotHeader — app/Models/Shots/DailySnapshotHeader.php
- Summary: Eloquent model for fireshots_daily_snapshot_headers that captures per-day snapshot metadata (user, dates, FX rates).
- Methods:
  - public function balances() — hasMany relation to BalanceSnapshot by 'header_id'.


### App\Models\Shots\Setting — app/Models/Shots/Setting.php
- Summary: Eloquent model for application key/value settings (fireshots_settings table).
- Methods:
  - [no public/protected methods defined other than inherited].


### App\Providers\AppServiceProvider — app/Providers/AppServiceProvider.php
- Summary: Standard Laravel provider hooks for registering and bootstrapping app services; currently empty.
- Methods:
  - public function register(): void — Place to bind services; currently does nothing.
  - public function boot(): void — Place for boot logic; currently does nothing.


### App\Providers\FortifyServiceProvider — app/Providers/FortifyServiceProvider.php
- Summary: Placeholder provider for Fortify-related bootstrapping (e.g., views, rate limiters); current boot code is commented out.
- Methods:
  - public function register(): void — No-op.
  - public function boot(): void — Contains commented examples for Fortify views and rate limiter; no active logic.


### App\Providers\ShotsServiceProvider — app/Providers/ShotsServiceProvider.php
- Summary: Binds interface-to-implementation for the Shots domain.
- Methods:
  - public function register(): void — Binds App\Repositories\Shots\FireflyRepository to App\Repositories\Shots\FireflyPgRepository in the service container.


### App\Repositories\AccountRepository — app/Repositories/AccountRepository.php
- Summary: Repository for merging Firefly core account data with Fireshots metadata; also manages metadata persistence.
- Methods:
  - protected function getAccountTypeId(string $typeName): ?int — Looks up account_types.id by case/space-insensitive name match using a raw SQL expression.
  - public function getMergedAccounts(): Collection — Retrieves all 'asset account' records from Firefly DB, computes each account's net balance via sum of transactions and last update timestamp; merges with AccountMeta data (currency_code, fee_percent); outputs a collection of associative arrays with id, name, balance, currency_code, fee_percent, updated_at.
  - public function upsertMeta(int $accountId, ?string $currencyCode, ?float $feePercent): void — Upserts an AccountMeta row for the account id with provided currency code and fee percent.


### App\Repositories\Shots\FireflyRepository (interface) — app/Repositories/Shots/FireflyRepository.php
- Summary: Contract for querying Firefly data used by the Shots services.
- Methods:
  - public function getPositiveBalancesForDate(string $snapshotDate): array — Should return positive account balances by currency at or before the given date.
  - public function getDailyTransactionsTotals(string $date): array — Should return total transaction amounts per currency for a single day.
  - public function getPeriodTransactions(string $granularity, int $limit = 12): array — Should return aggregated transaction totals grouped by period (month/week) with a limit.


### App\Repositories\Shots\FireflyPgRepository — app/Repositories/Shots/FireflyPgRepository.php
- Summary: PostgreSQL-specific implementation of FireflyRepository using raw SQL for performance and date grouping.
- Methods:
  - public function getPositiveBalancesForDate(string $snapshotDate): array — Selects account_id, currency_code, and SUM(amount) up to the given date; only returns positive sums.
  - public function getDailyTransactionsTotals(string $date): array — Aggregates transaction sums per currency for the given date; returns a normalized associative array including at least 'USD' and 'NGN' keys set to floats (0.0 if absent).
  - public function getPeriodTransactions(string $granularity, int $limit = 12): array — Aggregates totals by month or ISO week using date_trunc and to_char, ordered descending and limited.


### App\Services\FireflyApiService — app/Services/FireflyApiService.php
- Summary: HTTP client wrapper for Firefly API with common request helpers and account-specific endpoints; logs responses and gracefully handles errors.
- Methods:
  - protected function request(string $method, string $endpoint, array $data = []): ?array — Centralized HTTP call with token auth, JSON accept, method dispatch (GET/POST/PATCH), response logging, and error handling; returns decoded JSON or null.
  - protected function get(string $endpoint, array $query = []): ?array — Helper delegating to request('GET', ...).
  - protected function post(string $endpoint, array $payload = []): ?array — Helper delegating to request('POST', ...).
  - protected function patch(string $endpoint, array $payload = []): ?array — Helper delegating to request('PATCH', ...).
  - protected function logResponse(string $method, string $endpoint, Response $response): void — Logs the HTTP status and response JSON for observability.
  - public function getAccounts(): ?array — Calls GET /accounts.
  - public function getAccount(int $id): ?array — Calls GET /accounts/{id}.
  - public function createAccount(array $payload): ?array — Calls POST /accounts.
  - public function updateAccount(int $id, array $payload): ?array — Calls PATCH /accounts/{id}.


### App\Services\Shots\ComputeService — app/Services/Shots/ComputeService.php
- Summary: Computes higher-level aggregates and chart series from persisted snapshots combined with Firefly transaction data.
- Methods:
  - public function __construct(private FireflyRepository $firefly): Injects data access abstraction.
  - public function getDailySummaries(int $limit = 30): array — Reads up to limit+1 recent DailySnapshotHeader rows and associated BalanceSnapshot sums per currency; computes for each day USD, NGN, unified NGN (ngn + usd*sell_rate), transaction totals in unified NGN using FireflyRepository::getDailyTransactionsTotals, and net change compared to previous day minus transactions. Rounds values and returns structured arrays suitable for SnapshotSummaryData.
  - public function getSeries(string $granularity = 'month', int $limit = 12): array — Fetches aggregated transaction totals by period from FireflyRepository and maps to series rows with keys: period, Transactions, Change (0 placeholder), Balance (0 placeholder).


### App\Services\Shots\RecordService — app/Services/Shots/RecordService.php
- Summary: Provides a cached structure for record highs/lows across balance, change, and transactions at week/month granularities; currently placeholder values are null.
- Methods:
  - public function get(): array — Returns a deeply nested associative array of 'records' cached forever under 'shots.records'.


### App\Services\Shots\SnapshotService — app/Services/Shots/SnapshotService.php
- Summary: Orchestrates the creation (or replacement) of a daily snapshot and its balance rows, applying account-level fee adjustments and clearing dependent caches.
- Methods:
  - public function __construct(private FireflyRepository $firefly): Injects Firefly data repository.
  - public function run(int $userId, string $snapshotDate, float $sellRate, ?float $buyDiff = null): DailySnapshotHeader — Transactionally: deletes any existing snapshot for user/date; creates a new DailySnapshotHeader with snapshot_at=now(UTC), sell_rate, and derived buy_rate (sell - buyDiff or equal to sell if null). Fetches positive balances for the date via repository, looks up per-account fee_percent from AccountMeta, applies fee deduction, and inserts BalanceSnapshot rows rounded to 2 decimals. Clears caches for 'shots.summaries' and 'shots.series.*'. Returns the created header model.


## Route files under routes/

### routes/api.php
- Summary of defined routes (prefix: /shots):
  - POST /shots/snapshots/run → App\Http\Controllers\Shots\SnapshotController@run
  - GET  /shots/summaries → App\Http\Controllers\Shots\SummaryController@index
  - GET  /shots/summary → App\Http\Controllers\Shots\SummaryController@show
  - GET  /shots/series → App\Http\Controllers\Shots\SeriesController@index
  - GET  /shots/records → App\Http\Controllers\Shots\RecordController@index
  - POST /shots/cache/clear → App\Http\Controllers\Shots\CacheController@clear


### routes/web.php
- Summary of defined routes:
  - GET / → Closure returning Inertia::render('welcome') [name: home]
  - GET /dashboard → Closure returning Inertia::render('dashboard') [name: dashboard]
  - Fallback → Closure returning Inertia::render('dashboard')
  - GET /accounts → Closure returning Inertia::render('accounts') [name: accounts]


### routes/settings.php
- Summary of defined routes (within middleware 'auth'):
  - Redirect /settings → /settings/profile
  - GET /settings/profile → App\Http\Controllers\Settings\ProfileController@edit [name: profile.edit]
  - PATCH /settings/profile → App\Http\Controllers\Settings\ProfileController@update [name: profile.update]
  - DELETE /settings/profile → App\Http\Controllers\Settings\ProfileController@destroy [name: profile.destroy]
  - GET /settings/password → App\Http\Controllers\Settings\PasswordController@edit [name: password.edit]
  - PUT /settings/password → App\Http\Controllers\Settings\PasswordController@update [name: password.update, throttle: 6,1]
  - GET /settings/appearance → Closure returning Inertia::render('settings/appearance') [name: appearance.edit]
  - GET /settings/two-factor → App\Http\Controllers\Settings\TwoFactorAuthenticationController@show [name: two-factor.show]

```
