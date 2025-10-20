<?php

namespace App\Models\Shots;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BalanceSnapshot extends Model
{
    protected $table = 'fireshots_balance_snapshots';
    protected $fillable = ['user_id', 'header_id', 'account_id', 'currency_code', 'balance_raw'];
    protected $casts = ['balance_raw' => 'decimal:2'];

    public function header(): BelongsTo
    {
        return $this->belongsTo(DailySnapshotHeader::class, 'header_id');
    }
}
