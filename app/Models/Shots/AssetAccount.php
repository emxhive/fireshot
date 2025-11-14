<?php

namespace App\Models\Shots;

use Illuminate\Database\Eloquent\Model;

class AssetAccount extends Model
{
    protected $table = 'fireshots_asset_accounts';

    protected $fillable = [
        'firefly_id',
        'name',
        'currency',
        'balance',
        'fee',
        'updated_at',
    ];

    protected $casts = [
        'balance' => 'float',
        'fee' => 'float',
        'updated_at' => 'datetime',
    ];
}
