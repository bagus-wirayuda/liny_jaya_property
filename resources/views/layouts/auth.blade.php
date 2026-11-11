@extends('layouts.base')

@section('shell')
<main class="auth-layout" id="main">
    <div class="auth-visual">
        <div>
            <h2>Ruang untuk hidup<br>lebih baik.</h2>
            <p>LinyJaya Development</p>
        </div>
    </div>
    <div class="auth-content">
        <div class="auth-box">
            <x-brand />
            <h1>@yield('heading')</h1>
            <x-flash />
            @yield('content')
            <div class="legal-related">
                @yield('links')
                <a href="{{ route('home') }}">Beranda</a>
            </div>
        </div>
    </div>
</main>
@endsection
