@extends('layouts.auth')

@section('title', 'Daftar sebagai klien · LinyJaya Property')
@section('heading', 'Daftar sebagai klien')

@section('content')
<form class="stack" method="post" action="{{ route('register.submit') }}">
    @csrf
    <x-auth-field id="name" label="Nama lengkap" autocomplete="name" :required="true" />
    <x-auth-field id="email" label="Email" type="email" autocomplete="email" :required="true" />
    <x-auth-field id="phone" label="Nomor telepon" type="tel" autocomplete="tel" />
    <x-auth-field id="password" label="Kata sandi" type="password" autocomplete="new-password" :required="true" />
    <x-auth-field id="password_confirmation" label="Ulangi kata sandi" type="password" autocomplete="new-password" hint="Minimal 12 karakter." :required="true" />
    <button class="btn primary full" type="submit">Buat akun klien</button>
</form>
@endsection

@section('links')
    <a href="{{ route('login') }}">Kembali ke halaman masuk</a>
@endsection
