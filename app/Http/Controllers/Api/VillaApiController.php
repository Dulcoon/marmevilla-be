<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Villa;
use Illuminate\Http\Request;

class VillaApiController extends Controller
{
    public function index()
    {
        $villas = Villa::with(['images', 'facilities'])->get();
        return response()->json([
            'status' => 'success',
            'data' => $villas
        ]);
    }

    public function show($slug)
    {
        $villa = Villa::with(['images', 'facilities'])->where('slug', $slug)->firstOrFail();
        return response()->json([
            'status' => 'success',
            'data' => $villa
        ]);
    }
}
