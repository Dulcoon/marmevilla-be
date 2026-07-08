<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\VillaApiController;
use App\Http\Controllers\Api\BookingApiController;
use App\Http\Controllers\Api\MidtransWebhookController;
use App\Http\Controllers\Api\DokuWebhookController;
use App\Http\Controllers\Api\ContactApiController;
use App\Http\Controllers\Api\ReviewApiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Frontend endpoints
Route::get('/villas', [VillaApiController::class, 'index'])->middleware('throttle:60,1');
Route::get('/villas/lite', [VillaApiController::class, 'lite'])->middleware('throttle:60,1');
Route::get('/villas/{slug}', [VillaApiController::class, 'show'])->middleware('throttle:60,1');
Route::get('/villas/{slug}/booked-dates', [BookingApiController::class, 'getBookedDates'])->middleware('throttle:60,1');
Route::post('/check-availability', [BookingApiController::class, 'checkAvailability'])->middleware('throttle:20,1');
Route::get('/bookings/status', [BookingApiController::class, 'showStatus'])->middleware('throttle:30,1');
Route::post('/bookings', [BookingApiController::class, 'store'])->middleware('throttle:20,1');
Route::post('/contact', [ContactApiController::class, 'store'])->middleware('throttle:3,1');
Route::post('/midtrans/webhook', [MidtransWebhookController::class, 'handleWebhook'])->middleware('throttle:10,1');
Route::post('/doku/webhook', [DokuWebhookController::class, 'handleWebhook'])->middleware('throttle:10,1');

// Review routes
Route::get('/reviews', [ReviewApiController::class, 'published'])->middleware('throttle:60,1');
Route::get('/reviews/form/{token}', [ReviewApiController::class, 'showForm'])->middleware('throttle:30,1');
Route::post('/reviews/form/{token}', [ReviewApiController::class, 'submitForm'])->middleware('throttle:5,1');
