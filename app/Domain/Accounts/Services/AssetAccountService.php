<?php

namespace App\Domain\Accounts\Services;

use App\Client\Firefly\AccountsClient;
use App\Domain\Accounts\DTOs\AssetAccountData;
use App\Domain\Accounts\Mappers\AssetAccountMapper;
use App\Domain\Accounts\Repositories\AssetAccountRepository;
use App\Jobs\MirrorAssetAccountToFirefly;
use App\Models\Shots\AssetAccount;
use Illuminate\Support\Facades\Log;
use Throwable;

final readonly class AssetAccountService
{
    public function __construct(private AssetAccountRepository $repo)
    {
    }

    /** @return AssetAccountData[] */
    public function getAll(): array
    {
        if ($this->repo->isEmpty()) {
            $this->importFromFirefly();
        }

        return AssetAccountMapper::collectFromModels($this->repo->all());
    }

    public function create(AssetAccountData $dto): AssetAccountData
    {
        // Build raw attributes for DB write (no mapper round-trip)
        $attributes = $this->buildModelAttributesFromDto($dto);

        $model = $this->repo->create($attributes);
        $outDto = AssetAccountMapper::fromModel($model);

        $this->mirrorToFirefly($outDto);

        return $outDto;
    }

    public function update(int $id, AssetAccountData $dto): ?AssetAccountData
    {

        $attributes = $this->buildModelAttributesFromDto($dto);

        $model = $this->repo->update($id, $attributes);
        if (!$model) {
            return null;
        }

        $outDto = AssetAccountMapper::fromModel($model);
        $this->mirrorToFirefly($outDto);

        return $outDto;
    }

    public function delete(int $id): void
    {
        $this->repo->delete($id);
    }

    /**
     * Convert DTO into a simple attribute array for the AssetAccount model.
     * Note: firefly_id is intentionally NOT set here — it is managed by imports and mirroring.
     */
    private function buildModelAttributesFromDto(AssetAccountData $dto): array
    {
        return [
            'name' => $dto->name,
            'currency' => $dto->currency,
            'balance' => $dto->balance,
            'fee' => $dto->fee
        ];
    }

    /**
     * Mirror local account state to Firefly. Async but DTO-only.
     */
    public function mirrorToFirefly(AssetAccountData $dto): void
    {
        MirrorAssetAccountToFirefly::dispatch($dto->toArray());
    }

    public function importFromFirefly(): void
    {
        try {
            $client = app(AccountsClient::class);
            $fireflyAccounts = $client->getAccounts();

            if (empty($fireflyAccounts)) {
                return;
            }

            // Collect existing Firefly IDs to avoid duplicates
            $existingIds = AssetAccount::query()
                ->whereIn('firefly_id', array_column($fireflyAccounts, 'id'))
                ->pluck('firefly_id')
                ->map(fn($id) => (int)$id)
                ->all();

            $batch = [];

            foreach ($fireflyAccounts as $fa) {
                $fid = (int)($fa['id'] ?? 0);

                // Skip already-imported accounts
                if (in_array($fid, $existingIds, true)) {
                    continue;
                }

                $batch[] = [
                    'firefly_id' => $fid,
                    'name' => (string)($fa['name'] ?? ''),
                    'currency' => (string)($fa['currency_code'] ?? 'NGN'),
                    'balance' => (float)($fa['balance'] ?? 0),
                    'fee' => 0,
                    'updated_at' => now(),
                    'created_at' => now(),
                ];
            }

            // Execute ONE bulk insert if there is data
            if (!empty($batch)) {
                AssetAccount::query()->insert($batch);
            }

        } catch (Throwable $e) {
            Log::error('[AssetAccountService] Firefly batch import failed', [
                'error' => $e->getMessage(),
            ]);
        }
    }


    public function getFireflyId(int $id): ?int
    {
        return AssetAccount::query()->whereKey($id)->value('firefly_id');
    }


}
