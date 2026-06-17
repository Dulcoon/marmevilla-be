<?php

namespace App\Http\Controllers;

use App\Models\Villa;
use App\Models\VillaCustomPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PricingRuleController extends Controller
{
    public function index(Request $request)
    {
        $villas = Villa::select('id', 'name')->get();
        
        $selectedVillaId = $request->query('villa_id');
        $villa = null;

        if ($selectedVillaId) {
            $villa = Villa::with('customPrices')->find($selectedVillaId);
        } elseif ($villas->count() > 0) {
            $villa = Villa::with('customPrices')->first();
        }

        return Inertia::render('Admin/Pricing/Index', [
            'villas' => $villas,
            'selectedVilla' => $villa
        ]);
    }

    public function updateWeekendPremium(Request $request, Villa $villa)
    {
        $validated = $request->validate([
            'weekend_enabled' => 'required|boolean',
            'weekend_price' => 'nullable|integer|min:0'
        ]);

        $villa->update($validated);

        return redirect()->back()->with('success', 'Weekend premium updated.');
    }

    public function storeCustomPrice(Request $request, Villa $villa)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'custom_price' => 'required|integer|min:0',
            'min_stay' => 'required|integer|min:1'
        ]);

        $villa->customPrices()->create($validated);

        return redirect()->back()->with('success', 'Custom price rule added.');
    }

    public function destroyCustomPrice(Villa $villa, VillaCustomPrice $customPrice)
    {
        // Ensure the custom price belongs to the villa
        if ($customPrice->villa_id !== $villa->id) {
            abort(403);
        }

        $customPrice->delete();

        return redirect()->back()->with('success', 'Custom price rule deleted.');
    }
}
