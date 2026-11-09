<?php

namespace App\Http\Controllers;

use App\Services\PropertyState;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PropertyPageController extends Controller
{
    public const DASHBOARDS = [
        'admin' => 'admin/index.html',
        'client' => 'client/index.html',
        'employee' => 'karyawan/index.html',
        'director' => 'pimpinan/index.html',
    ];

    public function __invoke(Request $request, PropertyState $state, string $file): Response|RedirectResponse
    {
        $page = config('linyjaya_pages')[$file] ?? abort(404);
        $user = $request->user();
        $role = $page['role'] ?? null;
        if (isset($page['resource']) && $request->filled('workspace')) {
            abort_unless(in_array($page['resource'], ['projects', 'units'], true), 404);
            $role = array_search($request->string('workspace')->append('/index.html')->toString(), self::DASHBOARDS, true) ?: abort(404);
        }
        if ($role) {
            if (! $user) {
                return redirect()->guest(route('login'));
            }
            abort_unless($user->active && $user->role === $role && ($role !== 'employee' || $user->employee_id), 403);
        }
        if (isset($page['resource']) && $request->filled('id')) {
            abort_unless($state->visible($page['resource'], $role ? $user : null)
                ->where('id', $request->string('id')->toString())->exists(), 404);
        }
        $user = $user?->active ? $user : null;
        $bootstrap = DB::transaction(fn () => [
            'data' => $state->snapshot($user, (bool) $role, $request->session()->get('property_favorites', [])),
            'revision' => $state->version(),
            'workspace' => (bool) $role,
            'user' => $user ? ['name' => $user->name, 'email' => $user->email, 'role' => $user->role, 'employeeId' => $user->employee_id] : null,
            'csrf' => csrf_token(),
            'endpoints' => [
                'update' => route('property.update'), 'workflow' => route('property.workflow', ['action' => 'ACTION']),
                'favorite' => route('property.favorite'), 'login' => route('login'),
                'logout' => route('logout'), 'dashboard' => route('workspace'),
            ],
        ]);
        $nonce = Str::random(32);

        return response()->view('property', compact('page', 'bootstrap', 'nonce', 'role'), 200, [
            'Cache-Control' => 'private, no-store',
            'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'nonce-$nonce'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; object-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
