<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email:rfc', 'max:240'],
            'password' => ['required', 'string', 'max:72'],
        ]);
        if (! Auth::attempt([...$credentials, 'active' => true], $request->boolean('remember'))) {
            throw ValidationException::withMessages(['email' => 'Email atau kata sandi tidak sesuai.']);
        }
        $request->session()->regenerate();

        return redirect()->intended(route('workspace'));
    }

    public function dashboard(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->active && isset(PropertyPageController::DASHBOARDS[$user->role]), 403);

        return redirect()->route('property.'.PropertyPageController::DASHBOARDS[$user->role]);
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:240', 'unique:users'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'confirmed', 'max:72', PasswordRule::min(12)],
        ]);
        $user = new User;
        $user->forceFill([...$data, 'role' => 'client', 'active' => true])->save();
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('workspace');
    }

    public function sendReset(Request $request): RedirectResponse
    {
        $data = $request->validate(['email' => ['required', 'email:rfc', 'max:240']]);
        Password::sendResetLink([...$data, 'active' => true]);

        return back()->with('status', 'Jika akun aktif ditemukan, petunjuk penggantian kata sandi akan dikirim.');
    }

    public function reset(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email:rfc', 'max:240'],
            'password' => ['required', 'confirmed', 'max:72', PasswordRule::min(12)],
        ]);
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
}
