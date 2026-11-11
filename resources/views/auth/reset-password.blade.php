@extends('layouts.auth')

@section('title', 'Buat kata sandi baru · LinyJaya Development')
@section('heading', 'Buat kata sandi baru')

@section('content')
<form class="stack" method="post" action="{{ route('password.update') }}">
    @csrf
    <input type="hidden" name="token" value="{{ $token }}">
    <x-auth-field id="email" label="Email" type="email" :value="request()->query('email', '')" autocomplete="email" :required="true" />
    <x-auth-field id="password" label="Kata sandi" type="password" autocomplete="new-password" :required="true" />
    <x-auth-field id="password_confirmation" label="Ulangi kata sandi" type="password" autocomplete="new-password" hint="Minimal 12 karakter." :required="true" />
    <button class="btn primary full" type="submit">Simpan kata sandi</button>
</form>
@endsection

@section('links')
    <a href="{{ route('login') }}">Kembali ke halaman masuk</a>
@endsection
