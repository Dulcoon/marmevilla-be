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

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        
        // Villa Routes with explicit permissions
        Route::get('villas', [\App\Http\Controllers\VillaController::class, 'index'])->name('villas.index')->middleware('permission:view villas');
        Route::get('villas/create', [\App\Http\Controllers\VillaController::class, 'create'])->name('villas.create')->middleware('permission:create villas');
        Route::post('villas', [\App\Http\Controllers\VillaController::class, 'store'])->name('villas.store')->middleware('permission:create villas');
        Route::get('villas/{villa}/edit', [\App\Http\Controllers\VillaController::class, 'edit'])->name('villas.edit')->middleware('permission:edit villas');
        Route::put('villas/{villa}', [\App\Http\Controllers\VillaController::class, 'update'])->name('villas.update')->middleware('permission:edit villas');
        Route::patch('villas/{villa}', [\App\Http\Controllers\VillaController::class, 'update'])->middleware('permission:edit villas');
        Route::delete('villas/{villa}', [\App\Http\Controllers\VillaController::class, 'destroy'])->name('villas.destroy')->middleware('permission:delete villas');
        Route::post('villas/reorder', [\App\Http\Controllers\VillaController::class, 'reorder'])->name('villas.reorder')->middleware('permission:edit villas');
        
        // Villa Images Routes (requires edit villas permission)
        Route::delete('villas/{villa}/images/{image}', [\App\Http\Controllers\VillaImageController::class, 'destroy'])->name('villas.images.destroy')->middleware('permission:edit villas');
        Route::patch('villas/{villa}/images/{image}/set-primary', [\App\Http\Controllers\VillaImageController::class, 'setPrimary'])->name('villas.images.set-primary')->middleware('permission:edit villas');
        Route::patch('villas/{villa}/images/{image}/album', [\App\Http\Controllers\VillaImageController::class, 'updateAlbum'])->name('villas.images.update-album')->middleware('permission:edit villas');
        
        // Villa Facilities (requires edit villas permission)
        Route::post('facilities', [\App\Http\Controllers\VillaFacilityController::class, 'store'])->name('facilities.store')->middleware('permission:edit villas');
        Route::delete('facilities/{facility}', [\App\Http\Controllers\VillaFacilityController::class, 'destroy'])->name('facilities.destroy')->middleware('permission:edit villas');
    
        // Pricing Rules Routes
        Route::get('pricing', [\App\Http\Controllers\PricingRuleController::class, 'index'])->name('pricing.index')->middleware('permission:view pricing');
        Route::put('pricing/{villa}/weekend', [\App\Http\Controllers\PricingRuleController::class, 'updateWeekendPremium'])->name('pricing.weekend')->middleware('permission:edit pricing');
        Route::post('pricing/{villa}/custom-prices', [\App\Http\Controllers\PricingRuleController::class, 'storeCustomPrice'])->name('pricing.custom-prices.store')->middleware('permission:edit pricing');
        Route::delete('pricing/{villa}/custom-prices/{customPrice}', [\App\Http\Controllers\PricingRuleController::class, 'destroyCustomPrice'])->name('pricing.custom-prices.destroy')->middleware('permission:edit pricing');

        // Blocked Dates Routes
        Route::get('blocked-dates', [\App\Http\Controllers\Admin\BlockedDateController::class, 'index'])->name('blocked-dates.index')->middleware('permission:view blocked-dates');
        Route::post('blocked-dates/{villa}', [\App\Http\Controllers\Admin\BlockedDateController::class, 'store'])->name('blocked-dates.store')->middleware('permission:manage blocked-dates');
        Route::delete('blocked-dates/{villa}/{blockedDate}', [\App\Http\Controllers\Admin\BlockedDateController::class, 'destroy'])->name('blocked-dates.destroy')->middleware('permission:manage blocked-dates');

        // Voucher Routes
        Route::get('vouchers', [\App\Http\Controllers\VoucherController::class, 'index'])->name('vouchers.index')->middleware('permission:view vouchers');
        Route::post('vouchers', [\App\Http\Controllers\VoucherController::class, 'store'])->name('vouchers.store')->middleware('permission:create vouchers');
        Route::put('vouchers/{voucher}', [\App\Http\Controllers\VoucherController::class, 'update'])->name('vouchers.update')->middleware('permission:edit vouchers');
        Route::patch('vouchers/{voucher}', [\App\Http\Controllers\VoucherController::class, 'update'])->middleware('permission:edit vouchers');
        Route::delete('vouchers/{voucher}', [\App\Http\Controllers\VoucherController::class, 'destroy'])->name('vouchers.destroy')->middleware('permission:delete vouchers');

        // Settings Routes
        Route::get('settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('settings.index')->middleware('permission:view settings');
        Route::post('settings', [\App\Http\Controllers\Admin\SettingController::class, 'store'])->name('settings.store')->middleware('permission:edit settings');

        // Reservation Routes
        Route::get('reservations', [\App\Http\Controllers\BookingController::class, 'index'])->name('reservations.index')->middleware('permission:view reservations');
        Route::get('reservations/search', [\App\Http\Controllers\BookingController::class, 'search'])->name('reservations.search')->middleware('permission:view reservations');
        Route::get('reservations/{booking}', [\App\Http\Controllers\BookingController::class, 'show'])->name('reservations.show')->middleware('permission:view reservations');
        Route::patch('reservations/{booking}/status', [\App\Http\Controllers\BookingController::class, 'updateStatus'])->name('reservations.update-status')->middleware('permission:edit reservations');
        Route::patch('reservations/{booking}/dates', [\App\Http\Controllers\BookingController::class, 'updateDates'])->name('reservations.update-dates')->middleware('permission:edit reservations');
        Route::patch('reservations/{booking}/cancel', [\App\Http\Controllers\BookingController::class, 'cancel'])->name('reservations.cancel')->middleware('permission:edit reservations');

        // Notification Routes
        Route::patch('notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
        Route::patch('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
        
        // Contact Routes
        Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index')->middleware('permission:view contacts');
        Route::patch('contacts/{id}/mark-as-read', [ContactController::class, 'markAsRead'])->name('contacts.mark-as-read')->middleware('permission:manage contacts');
        Route::patch('contacts/mark-all-read', [ContactController::class, 'markAllAsRead'])->name('contacts.mark-all-read')->middleware('permission:manage contacts');
        Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy')->middleware('permission:manage contacts');

        // Review Routes
        Route::get('reviews', [\App\Http\Controllers\Admin\ReviewController::class, 'index'])->name('reviews.index')->middleware('permission:view reviews');
        Route::patch('reviews/{review}/toggle-publish', [\App\Http\Controllers\Admin\ReviewController::class, 'togglePublish'])->name('reviews.toggle-publish')->middleware('permission:manage reviews');
        Route::put('reviews/{review}', [\App\Http\Controllers\Admin\ReviewController::class, 'update'])->name('reviews.update')->middleware('permission:manage reviews');
        Route::delete('reviews/{review}', [\App\Http\Controllers\Admin\ReviewController::class, 'destroy'])->name('reviews.destroy')->middleware('permission:manage reviews');

        // ─── Superadmin Only ─────────────────────────────────────────────────
        Route::middleware('superadmin')->group(function () {
            // Kelola Akun Admin
            Route::prefix('manage-admins')->name('manage-admins.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\AdminManagementController::class, 'index'])->name('index');
                Route::get('/create', [\App\Http\Controllers\Admin\AdminManagementController::class, 'create'])->name('create');
                Route::post('/', [\App\Http\Controllers\Admin\AdminManagementController::class, 'store'])->name('store');
                Route::get('/{user}/edit', [\App\Http\Controllers\Admin\AdminManagementController::class, 'edit'])->name('edit');
                Route::put('/{user}', [\App\Http\Controllers\Admin\AdminManagementController::class, 'update'])->name('update');
                Route::delete('/{user}', [\App\Http\Controllers\Admin\AdminManagementController::class, 'destroy'])->name('destroy');
            });

            // Kelola Role & Permission
            Route::prefix('manage-roles')->name('manage-roles.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Admin\RoleManagementController::class, 'index'])->name('index');
                Route::get('/create', [\App\Http\Controllers\Admin\RoleManagementController::class, 'create'])->name('create');
                Route::post('/', [\App\Http\Controllers\Admin\RoleManagementController::class, 'store'])->name('store');
                Route::get('/{role}/edit', [\App\Http\Controllers\Admin\RoleManagementController::class, 'edit'])->name('edit');
                Route::put('/{role}', [\App\Http\Controllers\Admin\RoleManagementController::class, 'update'])->name('update');
                Route::delete('/{role}', [\App\Http\Controllers\Admin\RoleManagementController::class, 'destroy'])->name('destroy');
            });
        });
    });
});


require __DIR__.'/auth.php';
