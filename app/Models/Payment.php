<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'booking_id',
        'provider',
        'transaction_id',
        'order_id',
        'payment_type',
        'gross_amount',
        'transaction_status',
        'snap_token',
        'raw_response',
        'paid_at',
    ];

    protected $casts = [
        'raw_response' => 'array',
        'gross_amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
