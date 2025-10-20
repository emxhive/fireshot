<?php

namespace App\Models\Shots;

use Illuminate\Database\Eloquent\Model;

class AccountMeta extends Model
{
    protected $table = 'fireshots_account_meta';

    protected $fillable = [
        'account_id',
        'currency_code',
        'fee_percent',
    ];
}
