<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceRole
{
    /**
     * Handle an incoming request by verifying workspace role access and active account status.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->guest(route('login'));
        }

        $allowed = $roles !== []
            ? collect($roles)->contains(fn (string $role): bool => $user->canAccessWorkspaceRole($role))
            : $user->canAccessWorkspaceRole($user->role);

        abort_unless($allowed, 403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');

        return $next($request);
    }
}
