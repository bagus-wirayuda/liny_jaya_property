@props([
    'id',
    'label',
    'name' => null,
    'type' => 'text',
    'value' => '',
    'autocomplete' => null,
    'required' => false,
    'hint' => null,
])

@php
    $fieldName = $name ?? $id;
@endphp

<div class="field">
    <label for="{{ $id }}">{{ $label }}</label>
    <input
        id="{{ $id }}"
        class="form-control"
        name="{{ $fieldName }}"
        type="{{ $type }}"
        @if ($type !== 'password') value="{{ old($fieldName, $value) }}" @endif
        @if ($autocomplete) autocomplete="{{ $autocomplete }}" @endif
        @if ($required) required @endif
        {{ $attributes }}
    >
    @if ($hint)
        <small>{{ $hint }}</small>
    @endif
</div>
