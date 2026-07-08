<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'token',
        'guest_name',
        'city',
        'rating',
        'comment',
        'is_published',
        'status',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'rating'       => 'integer',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
