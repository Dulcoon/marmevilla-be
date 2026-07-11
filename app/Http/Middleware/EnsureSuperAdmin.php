<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->hasRole('superadmin')) {
            abort(403, 'Akses ditolak. Hanya Superadmin yang dapat mengakses halaman ini.');
        }

        return $next($request);
    }
}
