@extends('layouts.auth')

@section('title', 'Masuk ke LinyJaya · LinyJaya Development')
@section('heading', 'Masuk ke LinyJaya')

@section('content')
<form class="stack" method="post" action="{{ route('login.submit') }}">
    @csrf
    <x-auth-field id="email" label="Email" type="email" autocomplete="email" :required="true" />
    <x-auth-field id="password" label="Kata sandi" type="password" autocomplete="current-password" :required="true" />
    <label class="toggle-line">Ingat saya <input type="checkbox" name="remember" value="1"></label>
    <button class="btn primary full" type="submit">Masuk</button>
</form>
@endsection

@section('links')
    <a href="{{ route('password.request') }}">Lupa kata sandi</a>
    <a href="{{ route('register') }}">Daftar sebagai klien</a>
@endsection
