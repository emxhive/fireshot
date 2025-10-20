<?php

namespace App\Models\Shots;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailySnapshotHeader extends Model
{
    protected $table = 'fireshots_daily_snapshot_headers';
    protected $fillable = ['user_id','snapshot_date','snapshot_at','sell_rate','buy_rate'];
    protected $casts = [
        'snapshot_date' => 'date',
        'snapshot_at'   => 'datetime',
        'sell_rate'     => 'decimal:4',
        'buy_rate'      => 'decimal:4',
    ];

    public function balances(): HasMany|DailySnapshotHeader
    { return $this->hasMany(BalanceSnapshot::class,'header_id'); }
}
