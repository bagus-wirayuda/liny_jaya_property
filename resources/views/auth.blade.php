@php
    $title = match ($screen) {
        'register' => 'Daftar sebagai klien',
        'forgot' => 'Atur ulang kata sandi',
        'reset' => 'Buat kata sandi baru',
        default => 'Masuk ke LinyJaya',
    };
    $action = match ($screen) {
        'register' => route('register.submit'),
        'forgot' => route('password.email'),
        'reset' => route('password.update'),
        default => route('login.submit'),
    };
@endphp
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }} · LinyJaya Development</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('assets/brand/favicon.svg') }}">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
<main class="auth-layout" id="main">
    <div class="auth-visual"><div><h2>Ruang untuk hidup<br>lebih baik.</h2><p>LinyJaya Development</p></div></div>
    <div class="auth-content">
        <div class="auth-box">
            <a class="brand" href="{{ route('home') }}"><img class="brand-lockup" src="{{ asset('assets/brand/linyjaya-logo.svg') }}" alt="LinyJaya Development"></a>
            <h1>{{ $title }}</h1>
            @if (session('status'))
                <p class="notice" role="status">{{ session('status') }}</p>
            @endif
            @if ($errors->any())
                <div class="form-error" role="alert">{{ $errors->first() }}</div>
            @endif
            <form class="stack" method="post" action="{{ $action }}">
                @csrf
                @if ($screen === 'reset')
                    <input type="hidden" name="token" value="{{ $token }}">
                @endif
                @if ($screen === 'register')
                    <div class="field"><label for="name">Nama lengkap</label><input id="name" class="form-control" name="name" value="{{ old('name') }}" autocomplete="name" required></div>
                @endif
                <div class="field"><label for="email">Email</label><input id="email" class="form-control" name="email" type="email" value="{{ old('email', $screen === 'reset' ? request()->query('email') : '') }}" autocomplete="email" required></div>
                @if ($screen === 'register')
                    <div class="field"><label for="phone">Nomor telepon</label><input id="phone" class="form-control" name="phone" type="tel" value="{{ old('phone') }}" autocomplete="tel"></div>
                @endif
                @if ($screen !== 'forgot')
                    <div class="field"><label for="password">Kata sandi</label><input id="password" class="form-control" name="password" type="password" autocomplete="{{ $screen === 'login' ? 'current-password' : 'new-password' }}" required></div>
                @endif
                @if (in_array($screen, ['register', 'reset'], true))
                    <div class="field"><label for="password_confirmation">Ulangi kata sandi</label><input id="password_confirmation" class="form-control" name="password_confirmation" type="password" autocomplete="new-password" required><small>Minimal 12 karakter.</small></div>
                @endif
                @if ($screen === 'login')
                    <label class="toggle-line">Ingat saya <input type="checkbox" name="remember" value="1"></label>
                @endif
                <button class="btn primary full" type="submit">{{ match ($screen) { 'register' => 'Buat akun klien', 'forgot' => 'Kirim petunjuk', 'reset' => 'Simpan kata sandi', default => 'Masuk' } }}</button>
            </form>
            <div class="legal-related">
                @if ($screen === 'login')
                    <a href="{{ route('password.request') }}">Lupa kata sandi</a>
                    <a href="{{ route('register') }}">Daftar sebagai klien</a>
                @else
                    <a href="{{ route('login') }}">Kembali ke halaman masuk</a>
                @endif
                <a href="{{ route('home') }}">Beranda</a>
            </div>
        </div>
    </div>
</main>
</body>
</html>
