<?php

use App\Http\Middleware\EnsureWorkspaceRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureWorkspaceRole::class,
        ]);
        $middleware->redirectUsersTo('/dashboard');
        $middleware->trimStrings(except: [
            'password',
            'password_confirmation',
            'current_password',
            'changes.*.fields.password',
            'changes.*.fields.currentPassword',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
