<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyDataController;
use App\Http\Controllers\PropertyPageController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::view('/login', 'auth', ['screen' => 'login'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:8,1')->name('login.submit');
    Route::view('/register', 'auth', ['screen' => 'register'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1')->name('register.submit');
});
Route::view('/forgot-password', 'auth', ['screen' => 'forgot'])->name('password.request');
Route::post('/forgot-password', [AuthController::class, 'sendReset'])->middleware('throttle:4,1')->name('password.email');
Route::get('/reset-password/{token}', fn (string $token) => view('auth', ['screen' => 'reset', 'token' => $token]))->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'reset'])->middleware('throttle:8,1')->name('password.update');

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [AuthController::class, 'dashboard'])->name('workspace');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

Route::prefix('api/property')->name('property.')->group(function (): void {
    Route::get('/data', [PropertyDataController::class, 'index'])->name('data');
    Route::post('/changes', [PropertyDataController::class, 'update'])->middleware('throttle:45,1')->name('update');
    Route::post('/workflow/{action}', [PropertyDataController::class, 'workflow'])->middleware(['auth', 'throttle:45,1'])->name('workflow');
    Route::post('/favorite', [PropertyDataController::class, 'favorite'])->middleware('throttle:45,1')->name('favorite');
});
Route::get('/lampiran/{id}', [PropertyDataController::class, 'attachment'])->whereUuid('id')->name('property.attachment');

Route::get('/', PropertyPageController::class)->defaults('file', 'index.html')->name('home');
Route::redirect('/portal.html', '/dashboard')->middleware('auth');
Route::redirect('/client/bantuan-akses.html', '/forgot-password');
foreach (array_keys(config('linyjaya_pages')) as $file) {
    if ($file !== 'client/bantuan-akses.html') {
        Route::get('/'.$file, PropertyPageController::class)->defaults('file', $file)->name('property.'.$file);
    }
}
foreach (PropertyPageController::DASHBOARDS as $file) {
    $folder = explode('/', $file)[0];
    Route::get('/'.$folder, PropertyPageController::class)->defaults('file', $file)->name('workspace.'.$folder);
}
