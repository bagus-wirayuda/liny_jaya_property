@props([
    'href' => route('home'),
    'label' => 'LinyJaya Property',
])

<a {{ $attributes->merge(['class' => 'brand', 'href' => $href]) }}>
    <img class="brand-lockup" src="{{ asset('assets/brand/linyjaya-logo.svg') }}" alt="{{ $label }}">
</a>
