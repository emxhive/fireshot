<?php

namespace App\Models\Shots;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'fireshots_settings';
    protected $fillable = ['key','value'];
}
