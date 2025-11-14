<?php

namespace App\Domain\Accounts\Repositories;

use App\Models\Shots\AssetAccount;
use Illuminate\Database\Eloquent\Collection;

final class AssetAccountRepository
{
    public function all(): Collection
    {
        return AssetAccount::query()->orderBy('name')->get();
    }

    public function isEmpty(): bool
    {
        return AssetAccount::query()->count() === 0;
    }

    public function create(array $attributes): AssetAccount
    {
        return AssetAccount::query()->create($attributes);
    }

    public function find(int $id): ?AssetAccount
    {
        return AssetAccount::query()->find($id);
    }

    public function update(int $id, array $attributes): ?AssetAccount
    {
        $model = $this->find($id);
        if (!$model) return null;
        $model->update($attributes);
        return $model->fresh();
    }

    public function delete(int $id): void
    {
        AssetAccount::query()->where('id', $id)->delete();
    }
}
