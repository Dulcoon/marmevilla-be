<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\VillaApiController;
use App\Http\Controllers\Api\BookingApiController;
use App\Http\Controllers\Api\MidtransWebhookController;
use App\Http\Controllers\Api\DokuWebhookController;
use App\Http\Controllers\Api\ContactApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Frontend endpoints
Route::get('/villas', [VillaApiController::class, 'index']);
Route::get('/villas/{slug}', [VillaApiController::class, 'show']);
Route::get('/villas/{slug}/booked-dates', [BookingApiController::class, 'getBookedDates']);
Route::post('/check-availability', [BookingApiController::class, 'checkAvailability']);
Route::post('/bookings', [BookingApiController::class, 'store']);
Route::post('/contact', [ContactApiController::class, 'store']);
Route::post('/midtrans/webhook', [MidtransWebhookController::class, 'handleWebhook']);
Route::post('/doku/webhook', [DokuWebhookController::class, 'handleWebhook']);
