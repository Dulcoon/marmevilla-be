<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_amount',
        'start_date',
        'end_date',
        'usage_limit',
        'used_count',
        'is_active',
        'min_nights',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'min_nights' => 'integer',
    ];

    protected $appends = ['status'];

    public function getStatusAttribute()
    {
        if (!$this->is_active) {
            return 'disabled';
        }

        $now = Carbon::now()->startOfDay();

        if ($this->end_date && $now->gt($this->end_date)) {
            return 'expired';
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return 'depleted';
        }

        return 'active';
    }
}
