<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'villa_id',
        'check_in',
        'check_out',
        'guest_name',
        'guest_email',
        'guest_phone',
        'special_requests',
        'guest_count',
        'extra_guests',
        'base_price_total',
        'extra_charge_total',
        'voucher_id',
        'discount_amount',
        'total_amount',
        'payment_status',
        'booking_status',
        'midtrans_snap_token',
        'midtrans_order_id',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'base_price_total' => 'integer',
        'extra_charge_total' => 'integer',
        'discount_amount' => 'integer',
        'total_amount' => 'integer',
    ];

    public function villa()
    {
        return $this->belongsTo(Villa::class);
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
