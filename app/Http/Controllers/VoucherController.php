<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;
use App\Models\Voucher;
use Illuminate\Validation\Rule;

class VoucherController extends Controller
{
    public function index()
    {
        $vouchers = Voucher::latest()->get();
        
        $totalVouchers = $vouchers->count();
        // 'status' is a computed attribute - can't use it in query, count from actual fields
        $activeVouchers = $vouchers->filter(fn($v) => $v->status === 'active')->count();
        $totalRedeemed = $vouchers->sum('used_count');

        return Inertia::render('Admin/Voucher/Index', [
            'vouchers' => $vouchers,
            'stats' => [
                'total' => $totalVouchers,
                'active' => $activeVouchers,
                'redeemed' => $totalRedeemed
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', 'unique:vouchers,code'],
            'discount_amount' => ['required', 'integer', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'min_nights' => ['required', 'integer', 'min:1'],
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['code'] = strtoupper($validated['code']);

        Voucher::create($validated);

        return redirect()->back()->with('success', 'Voucher created successfully.');
    }

    public function update(Request $request, Voucher $voucher)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:255', Rule::unique('vouchers')->ignore($voucher->id)],
            'discount_amount' => ['required', 'integer', 'min:0'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'min_nights' => ['required', 'integer', 'min:1'],
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['code'] = strtoupper($validated['code']);

        $voucher->update($validated);

        return redirect()->back()->with('success', 'Voucher updated successfully.');
    }

    public function destroy(Voucher $voucher)
    {
        $voucher->delete();
        
        return redirect()->back()->with('success', 'Voucher deleted successfully.');
    }
}
