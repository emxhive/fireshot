<?php

namespace App\Jobs;

use App\Client\Firefly\AccountsClient;
use App\Domain\Accounts\DTOs\AssetAccountData;
use App\Domain\Accounts\Mappers\AssetAccountMapper;
use App\Domain\Accounts\Services\AssetAccountService;
use App\Models\Shots\AssetAccount;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class MirrorAssetAccountToFirefly implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public array $backoff = [60, 60, 10];

    /**
     * Raw DTO payload, stored as an array to keep the job easily serializable.
     */
    public function __construct(public array $dtoPayload)
    {
    }

    /**
     * Handle the job.
     */
    public function handle(AccountsClient $client): void
    {
        // Rebuild DTO from array payload
        $dto = AssetAccountData::from($this->dtoPayload);

        try {

            $payload = AssetAccountMapper::toFireflyPayload($dto);
            $fireflyId = AssetAccountService::getFireflyId($dto->id);

            // If Firefly ID already exists, just update that remote account
            if ($fireflyId) {
                $client->updateAccount($fireflyId, $payload);
                return;
            }


            // Otherwise create a new remote asset account
            $payload['type'] = 'asset';
            $resp = $client->createAccount($payload);
            $id = $resp['data']['id'] ?? null;

            // Backfill local firefly_id if we have both IDs
            if ($id && $dto->id) {
                AssetAccount::query()
                    ->whereKey((int)$dto->id)
                    ->update(['firefly_id' => (int)$id]);
            }
        } catch (Throwable $e) {
            Log::error('[MirrorAssetAccountToFirefly] Failed', [
                'error' => $e->getMessage(),
                'account_id' => $dto->id,
                'firefly_id' => $fireflyId,
            ]);

            // Let Laravel handle retries / failed_jobs
            throw $e;
        }
    }
}
