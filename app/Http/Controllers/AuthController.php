<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\Project;
use App\Models\PropertyFavorite;
use App\Models\Unit;
use App\Models\User;
use App\Services\PropertyRecords;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();
        if (! Auth::attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
            'active' => true,
            'archived_at' => null,
        ], $request->boolean('remember'))) {
            throw ValidationException::withMessages(['email' => 'Email atau kata sandi tidak sesuai.']);
        }

        $user = $request->user();
        $this->syncSessionFavorites($request, $user);
        $request->session()->regenerate();

        return redirect()->intended(route('workspace'));
    }

    public function dashboard(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->canAccessWorkspaceRole($user->role) && isset(PropertyPageController::DASHBOARDS[$user->role]), 403);

        return redirect()->route('workspace.'.$user->role);
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function register(RegisterRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $user = new User;
        $user->forceFill([...$data, 'role' => 'client', 'active' => true])->save();

        $this->syncSessionFavorites($request, $user);
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('workspace');
    }

    public function sendReset(ForgotPasswordRequest $request): RedirectResponse
    {
        $data = $request->validated();
        Password::sendResetLink(['email' => $data['email'], 'active' => true]);

        return back()->with('status', 'Jika akun aktif ditemukan, petunjuk penggantian kata sandi akan dikirim.');
    }

    public function reset(ResetPasswordRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $status = Password::reset([...$data, 'active' => true], function (User $user, string $password): void {
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            event(new PasswordReset($user));
        });

        if ($status !== Password::PasswordReset) {
            throw ValidationException::withMessages(['email' => 'Tautan penggantian kata sandi tidak berlaku atau telah kedaluwarsa.']);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('status', 'Kata sandi diperbarui. Silakan masuk.');
    }

    public function updatePassword(ChangePasswordRequest $request, PropertyRecords $records): JsonResponse|RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $sessionId = $request->session()->getId();

        DB::transaction(function () use ($user, $request, $sessionId, $records): void {
            $user->forceFill([
                'password' => $request->validated('password'),
                'remember_token' => Str::random(60),
            ])->save();

            DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $sessionId)
                ->delete();

            $records->audit($user, 'Kata sandi akun diperbarui');
        });

        $message = 'Kata sandi berhasil diperbarui.';
        if ($request->expectsJson()) {
            return response()->json(['message' => $message]);
        }

        return back()->with('status', $message);
    }

    private function syncSessionFavorites(Request $request, ?User $user): void
    {
        if (! $user) {
            return;
        }

        $guestFavorites = $request->session()->pull('property_favorites', []);
        if (! is_array($guestFavorites) || $guestFavorites === []) {
            return;
        }

        $validIds = Project::query()->whereIn('id', $guestFavorites)->pluck('id')
            ->merge(Unit::query()->whereIn('id', $guestFavorites)->pluck('id'))
            ->unique();

        foreach ($validIds as $propertyId) {
            PropertyFavorite::query()->firstOrCreate([
                'user_id' => $user->id,
                'property_id' => $propertyId,
            ]);
        }
    }
}
