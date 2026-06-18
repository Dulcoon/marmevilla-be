<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('villas', \App\Http\Controllers\VillaController::class);
        
        // Villa Images Routes
        Route::delete('villas/{villa}/images/{image}', [\App\Http\Controllers\VillaImageController::class, 'destroy'])->name('villas.images.destroy');
        Route::patch('villas/{villa}/images/{image}/set-primary', [\App\Http\Controllers\VillaImageController::class, 'setPrimary'])->name('villas.images.set-primary');
    
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
    });
});

require __DIR__.'/auth.php';
