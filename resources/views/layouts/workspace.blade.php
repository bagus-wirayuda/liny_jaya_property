@extends('layouts.base')

@push('head')
    <script nonce="{{ $nonce }}">window.LJ = { bootstrap: {{ Illuminate\Support\Js::from($bootstrap) }} };</script>
    @foreach ($page['scripts'] as $script)
        <script defer src="{{ asset($script) }}"></script>
    @endforeach
@endpush

@section('body_attributes')
    data-role="{{ $role ?? ($page['role'] ?? '') }}"
    data-menu="{{ $page['menu'] ?? '' }}"
    data-page="{{ $page['page'] ?? '' }}"
    data-resource="{{ $page['resource'] ?? '' }}"
    data-page-key="{{ $pageKey }}"
    data-record-id="{{ $recordId ?? '' }}"
@endsection

@section('shell')
    <a class="skip-link" href="#main">Lewati ke konten</a>
    @yield('before_app')
    <div id="app" data-view="{{ $page['view'] }}" data-workspace-role="{{ $role }}">@yield('content')</div>
    <div id="modal-root"></div>
    <div id="toast-root" role="status" aria-live="polite"></div>
    <noscript><p>Aktifkan JavaScript untuk membuka ruang kerja LinyJaya.</p></noscript>
@endsection
