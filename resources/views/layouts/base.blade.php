<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#1857e8">
    @hasSection('meta_description')
        <meta name="description" content="@yield('meta_description')">
    @endif
    <base href="{{ request()->root() ?: url('/') }}/">
    <title>@yield('title', $page['title'] ?? 'LinyJaya Property')</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('assets/brand/favicon.svg') }}">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}?v={{ @filemtime(public_path('css/style.css')) ?: '1' }}">
    @stack('head')
</head>
<body @yield('body_attributes')>
    @yield('shell')
    @stack('scripts')
</body>
</html>
