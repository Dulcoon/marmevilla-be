<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Villa;
use Illuminate\Http\Request;

class VillaApiController extends Controller
{
    private function attachDisplayPrice($villas)
    {
        $villaIds = $villas->pluck('id');
        $today = \Carbon\Carbon::today()->toDateString();
        $isWeekend = \Carbon\Carbon::today()->isWeekend();

        $customPriceMins = \App\Models\VillaCustomPrice::whereIn('villa_id', $villaIds)
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->selectRaw('villa_id, MIN(custom_price) as min_price')
            ->groupBy('villa_id')
            ->pluck('min_price', 'villa_id');

        $villas->each(function ($villa) use ($customPriceMins, $isWeekend) {
            $price = $villa->base_price;

            if ($isWeekend && $villa->weekend_enabled && $villa->weekend_price) {
                $price = $villa->weekend_price;
            }

            if (isset($customPriceMins[$villa->id])) {
                $price = (int) $customPriceMins[$villa->id];
            }

            $villa->display_price = $price;
            $villa->makeHidden('customPrices');
        });
    }

    public function index()
    {
        $villas = Villa::with(['images', 'facilities'])->orderBy('sort_order', 'asc')->get();
        $this->attachDisplayPrice($villas);
        return response()->json([
            'status' => 'success',
            'data' => $villas
        ]);
    }

    public function lite()
    {
        $villas = Villa::select('id', 'slug', 'name', 'description', 'description_en', 'size', 'bed_count', 'capacity', 'base_price', 'weekend_price', 'weekend_enabled')
            ->with(['images' => function ($q) {
                $q->select('id', 'villa_id', 'image_url', 'is_primary');
            }])
            ->orderBy('sort_order', 'asc')
            ->get();

        $this->attachDisplayPrice($villas);
        return response()->json([
            'status' => 'success',
            'data' => $villas
        ]);
    }

    public function show($slug)
    {
        $villa = Villa::with(['images', 'facilities'])->where('slug', $slug)->firstOrFail();
        $this->attachDisplayPrice(collect([$villa]));
        return response()->json([
            'status' => 'success',
            'data' => $villa
        ]);
    }
}
