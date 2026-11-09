<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#1857e8">
    <base href="{{ url('/') }}/">
    <title>{{ $page['title'] }}</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('assets/brand/favicon.svg') }}">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <script nonce="{{ $nonce }}">window.LJ = { bootstrap: {{ Illuminate\Support\Js::from($bootstrap) }} };</script>
    @foreach ($page['scripts'] as $script)
        <script defer src="{{ asset($script) }}"></script>
    @endforeach
</head>
<body data-role="{{ $page['role'] ?? '' }}" data-menu="{{ $page['menu'] ?? '' }}"
      data-page="{{ $page['page'] ?? '' }}" data-resource="{{ $page['resource'] ?? '' }}">
    <a class="skip-link" href="#main">Lewati ke konten</a>
    <div id="app"></div>
    <div id="modal-root"></div>
    <div id="toast-root" role="status" aria-live="polite"></div>
    <noscript><p>Aktifkan JavaScript untuk membuka halaman LinyJaya.</p></noscript>
</body>
</html>
