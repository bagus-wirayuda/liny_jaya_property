@extends('layouts.auth')

@section('title', 'Masuk ke LinyJaya · LinyJaya Property')
@section('heading', 'Masuk ke LinyJaya')

@section('content')
<form class="stack" method="post" action="{{ route('login.submit') }}">
    @csrf
    <x-auth-field id="email" label="Email" type="email" autocomplete="email" :required="true" />
    <x-auth-field id="password" label="Kata sandi" type="password" autocomplete="current-password" :required="true" />
    <label class="toggle-line">Ingat saya <input type="checkbox" name="remember" value="1"></label>
    <button class="btn primary full" type="submit">Masuk</button>
</form>

@if ($qaAccounts !== [])
    <div class="qa-quick-access" data-qa-login>
        <div class="divider"></div>
        <p class="qa-quick-label">Akses cepat QA · klik role untuk mengisi email &amp; kata sandi</p>
        <div class="role-grid">
            @foreach ($qaAccounts as $account)
                <button
                    type="button"
                    class="role-card qa-fill-btn"
                    data-qa-fill
                    data-qa-role="{{ $account['roleLabel'] }}"
                    data-qa-email="{{ $account['email'] }}"
                    data-qa-password="{{ $qaPassword }}"
                    aria-pressed="false"
                >
                    <span class="tag blue">{{ $account['roleLabel'] }}</span>
                    <strong>{{ $account['name'] }}</strong>
                    <p>{{ $account['email'] }}</p>
                </button>
            @endforeach
        </div>
        <p class="qa-quick-status" id="qa-fill-status" aria-live="polite"></p>
    </div>
@endif
@endsection

@section('links')
    <a href="{{ route('password.request') }}">Lupa kata sandi</a>
    <a href="{{ route('register') }}">Daftar sebagai klien</a>
@endsection

@if ($qaAccounts !== [])
    @push('scripts')
        <script src="{{ asset('js/auth-qa.js') }}" defer></script>
    @endpush
@endif
