<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Villa extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'long_description' => 'array',
        'features' => 'array',
        'weekend_enabled' => 'boolean',
    ];

    public function images()
    {
        return $this->hasMany(VillaImage::class)->orderBy('is_primary', 'desc')->orderBy('created_at', 'asc');
    }

    public function customPrices()
    {
        return $this->hasMany(VillaCustomPrice::class)->orderBy('start_date', 'asc');
    }
}
