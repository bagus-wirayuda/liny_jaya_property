@extends('layouts.auth')

@section('title', 'Atur ulang kata sandi · LinyJaya Development')
@section('heading', 'Atur ulang kata sandi')

@section('content')
<form class="stack" method="post" action="{{ route('password.email') }}">
    @csrf
    <x-auth-field id="email" label="Email" type="email" autocomplete="email" :required="true" />
    <button class="btn primary full" type="submit">Kirim petunjuk</button>
</form>
@endsection

@section('links')
    <a href="{{ route('login') }}">Kembali ke halaman masuk</a>
@endsection
