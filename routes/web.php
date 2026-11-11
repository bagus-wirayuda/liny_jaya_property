<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyDataController;
use App\Http\Controllers\PropertyPageController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentication & Password Recovery
Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:8,1')->name('login.submit');
    Route::view('/register', 'auth.register')->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1')->name('register.submit');
});

Route::view('/forgot-password', 'auth.forgot-password')->name('password.request');
Route::post('/forgot-password', [AuthController::class, 'sendReset'])->middleware('throttle:4,1')->name('password.email');
Route::get('/reset-password/{token}', fn (string $token) => view('auth.reset-password', ['token' => $token]))->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'reset'])->middleware('throttle:8,1')->name('password.update');

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [AuthController::class, 'dashboard'])->name('workspace');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/profile/password', [AuthController::class, 'updatePassword'])->middleware('throttle:6,1')->name('profile.password');
});

// Workspace JSON API & Attachments
Route::prefix('api/property')->name('property.')->group(function (): void {
    Route::get('/data', [PropertyDataController::class, 'index'])->name('data');
    Route::post('/changes', [PropertyDataController::class, 'update'])->middleware('throttle:45,1')->name('update');
    Route::post('/workflow/{action}', [PropertyDataController::class, 'workflow'])->middleware(['auth', 'throttle:45,1'])->name('workflow');
    Route::post('/favorite', [PropertyDataController::class, 'favorite'])->middleware('throttle:45,1')->name('favorite');
});
Route::get('/lampiran/{id}', [PropertyDataController::class, 'attachment'])->whereUuid('id')->name('property.attachment');

// Public Pages (Clean Laravel Routes + Optional Resource Parameters)
$pages = config('linyjaya_pages');
foreach ($pages as $key => $page) {
    if (isset($page['role'])) {
        continue;
    }

    $uri = $page['uri'] === '' ? '/' : '/'.$page['uri'];
    Route::get($uri, PropertyPageController::class)->defaults('pageKey', $key)->name($page['route']);
}

Route::get('/proyek/{id}', PropertyPageController::class)
    ->defaults('pageKey', 'proyek')
    ->where('id', '[\w-]+')
    ->name('public.proyek.show');
Route::get('/unit/{id}', PropertyPageController::class)
    ->defaults('pageKey', 'unit')
    ->where('id', '[\w-]+')
    ->name('public.unit.show');
Route::get('/artikel-detail/{id}', PropertyPageController::class)
    ->defaults('pageKey', 'artikel-detail')
    ->where('id', '[\w-]+')
    ->name('public.artikel-detail.show');
Route::get('/artikel/{id}', PropertyPageController::class)
    ->defaults('pageKey', 'artikel-detail')
    ->where('id', '[\w-]+')
    ->name('public.artikel.show');

// Role-Protected Workspace Routes (RBAC Middleware Enforced)
$workspaces = [
    'admin' => 'admin',
    'client' => 'client',
    'employee' => 'karyawan',
    'director' => 'pimpinan',
];

foreach ($workspaces as $roleName => $folder) {
    Route::middleware(['auth', 'role:'.$roleName])->group(function () use ($pages, $roleName): void {
        foreach ($pages as $key => $page) {
            if (($page['role'] ?? null) !== $roleName) {
                continue;
            }

            Route::get('/'.$page['uri'], PropertyPageController::class)
                ->defaults('pageKey', $key)
                ->name($page['route']);
        }
    });
}

// Backward-Compatible Redirects for Legacy .html URLs
Route::redirect('/portal.html', '/dashboard', 301)->middleware('auth');
Route::redirect('/client/bantuan-akses.html', '/forgot-password', 301);
foreach ($pages as $key => $page) {
    Route::get('/'.$page['legacy'], function (Request $request) use ($page): RedirectResponse {
        $url = route($page['route']);
        $query = $request->getQueryString();

        return redirect()->to($query ? $url.'?'.$query : $url, 301);
    })->name('legacy.'.str_replace('/', '.', $key));
}
