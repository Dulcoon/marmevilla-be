<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BlockedDate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'villa_id',
        'start_date',
        'end_date',
        'reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function villa()
    {
        return $this->belongsTo(Villa::class);
    }
}
