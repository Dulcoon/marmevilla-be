<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        Route::resource('villas', \App\Http\Controllers\VillaController::class);
        
        // Villa Images Routes
        Route::delete('villas/{villa}/images/{image}', [\App\Http\Controllers\VillaImageController::class, 'destroy'])->name('villas.images.destroy');
        Route::patch('villas/{villa}/images/{image}/set-primary', [\App\Http\Controllers\VillaImageController::class, 'setPrimary'])->name('villas.images.set-primary');
        Route::patch('villas/{villa}/images/{image}/album', [\App\Http\Controllers\VillaImageController::class, 'updateAlbum'])->name('villas.images.update-album');
        
        // Villa Facilities
        Route::post('facilities', [\App\Http\Controllers\VillaFacilityController::class, 'store'])->name('facilities.store');
    
        // Pricing Rules Routes
        Route::get('pricing', [\App\Http\Controllers\PricingRuleController::class, 'index'])->name('pricing.index');
        Route::put('pricing/{villa}/weekend', [\App\Http\Controllers\PricingRuleController::class, 'updateWeekendPremium'])->name('pricing.weekend');
        Route::post('pricing/{villa}/custom-prices', [\App\Http\Controllers\PricingRuleController::class, 'storeCustomPrice'])->name('pricing.custom-prices.store');
        Route::delete('pricing/{villa}/custom-prices/{customPrice}', [\App\Http\Controllers\PricingRuleController::class, 'destroyCustomPrice'])->name('pricing.custom-prices.destroy');

        // Voucher Routes
        Route::resource('vouchers', \App\Http\Controllers\VoucherController::class)->except(['create', 'show', 'edit']);

        // Settings Routes
        Route::get('settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings.index');
        Route::post('settings', [\App\Http\Controllers\Admin\SettingController::class, 'store'])->name('settings.store');

        // Reservation Routes
        Route::get('reservations', [\App\Http\Controllers\BookingController::class, 'index'])->name('reservations.index');
        Route::get('reservations/{booking}', [\App\Http\Controllers\BookingController::class, 'show'])->name('reservations.show');
        Route::patch('reservations/{booking}/status', [\App\Http\Controllers\BookingController::class, 'updateStatus'])->name('reservations.update-status');
        Route::patch('reservations/{booking}/dates', [\App\Http\Controllers\BookingController::class, 'updateDates'])->name('reservations.update-dates');
        Route::patch('reservations/{booking}/cancel', [\App\Http\Controllers\BookingController::class, 'cancel'])->name('reservations.cancel');

        // Notification Routes
        Route::patch('notifications/{id}/mark-as-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
        Route::patch('notifications/mark-all-read', [\App\Http\Controllers\Admin\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    });
});

require __DIR__.'/auth.php';
