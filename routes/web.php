<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\ContactController;

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
        Route::delete('facilities/{facility}', [\App\Http\Controllers\VillaFacilityController::class, 'destroy'])->name('facilities.destroy');
    
        // Pricing Rules Routes
        Route::get('pricing', [\App\Http\Controllers\PricingRuleController::class, 'index'])->name('pricing.index');
        Route::put('pricing/{villa}/weekend', [\App\Http\Controllers\PricingRuleController::class, 'updateWeekendPremium'])->name('pricing.weekend');
        Route::post('pricing/{villa}/custom-prices', [\App\Http\Controllers\PricingRuleController::class, 'storeCustomPrice'])->name('pricing.custom-prices.store');
        Route::delete('pricing/{villa}/custom-prices/{customPrice}', [\App\Http\Controllers\PricingRuleController::class, 'destroyCustomPrice'])->name('pricing.custom-prices.destroy');

        // Blocked Dates Routes
        Route::get('blocked-dates', [\App\Http\Controllers\Admin\BlockedDateController::class, 'index'])->name('blocked-dates.index');
        Route::post('blocked-dates/{villa}', [\App\Http\Controllers\Admin\BlockedDateController::class, 'store'])->name('blocked-dates.store');
        Route::delete('blocked-dates/{villa}/{blockedDate}', [\App\Http\Controllers\Admin\BlockedDateController::class, 'destroy'])->name('blocked-dates.destroy');

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
        Route::patch('notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
        Route::patch('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
        
        // Contact Routes
        Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
        Route::patch('contacts/{id}/mark-as-read', [ContactController::class, 'markAsRead'])->name('contacts.mark-as-read');
        Route::patch('contacts/mark-all-read', [ContactController::class, 'markAllAsRead'])->name('contacts.mark-all-read');
        Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');

        // Review Routes
        Route::get('reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index'])->name('reviews.index');
        Route::patch('reviews/{review}/toggle-publish', [\App\Http\Controllers\Admin\ReviewController::class, 'togglePublish'])->name('reviews.toggle-publish');
        Route::delete('reviews/{review}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy'])->name('reviews.destroy');
    });
});


require __DIR__.'/auth.php';
