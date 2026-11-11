@if (session('status'))
    <p {{ $attributes->merge(['class' => 'notice', 'role' => 'status']) }}>{{ session('status') }}</p>
@endif

@if ($errors->any())
    <div {{ $attributes->merge(['class' => 'form-error', 'role' => 'alert']) }}>{{ $errors->first() }}</div>
@endif
