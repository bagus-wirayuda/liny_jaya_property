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
        'admin' => 'admin',
        'client' => 'client',
        'employee' => 'karyawan',
        'director' => 'pimpinan',
    ];

    public function __invoke(Request $request, PropertyState $state): Response|RedirectResponse
    {
        $pageKey = (string) $request->route('pageKey', '');
        $page = config('linyjaya_pages')[$pageKey] ?? abort(404);
        $user = $request->user();
        $role = $page['role'] ?? null;

        if (isset($page['resource']) && $request->filled('workspace')) {
            abort_unless(in_array($page['resource'], ['projects', 'units'], true), 404);
            $role = array_search($request->string('workspace')->toString(), self::DASHBOARDS, true) ?: abort(404);
        }

        if ($role) {
            if (! $user) {
                return redirect()->guest(route('login'));
            }
            abort_unless($user->canAccessWorkspaceRole($role), 403);
        }

        $recordId = (string) ($request->route('id') ?: $request->string('id')->toString());
        if (isset($page['resource']) && $recordId !== '') {
            abort_unless(
                $state->visible($page['resource'], $role ? $user : null)
                    ->where('id', $recordId)
                    ->exists(),
                404,
            );
        }

        $activeUser = $user && $user->active && $user->archived_at === null ? $user : null;
        $bootstrap = DB::transaction(fn (): array => [
            'data' => $state->snapshot($activeUser, (bool) $role, $request->session()->get('property_favorites', [])),
            'revision' => $state->version(),
            'workspace' => (bool) $role,
            'pageKey' => $pageKey,
            'recordId' => $recordId !== '' ? $recordId : null,
            'user' => $activeUser ? [
                'name' => $activeUser->name,
                'email' => $activeUser->email,
                'role' => $activeUser->role,
                'employeeId' => $activeUser->employee_id,
            ] : null,
            'csrf' => csrf_token(),
            'endpoints' => [
                'update' => route('property.update'),
                'workflow' => route('property.workflow', ['action' => 'ACTION']),
                'favorite' => route('property.favorite'),
                'passwordUpdate' => route('profile.password'),
                'login' => route('login'),
                'logout' => route('logout'),
                'dashboard' => route('workspace'),
            ],
        ]);
        $nonce = Str::random(32);

        return response()->view(
            $page['view'],
            compact('page', 'pageKey', 'recordId', 'bootstrap', 'nonce', 'role'),
            200,
            [
                'Cache-Control' => 'private, no-store',
                'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'nonce-$nonce'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; object-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}
