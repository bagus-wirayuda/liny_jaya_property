<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class SimulatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'unit' => ['required', 'string', 'exists:units,id'],
            'method' => ['required', 'string', 'in:Cash Keras,Cash Lunak,Cash Bertahap,KPR,KPR Bank'],
            'promoId' => ['nullable', 'string', 'exists:promos,id'],
            'presetId' => ['nullable', 'string', 'max:60'],
            'dpPercent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'tenorMonths' => ['nullable', 'integer', 'min:1', 'max:60'],
            'tenorYears' => ['nullable', 'integer', 'min:1', 'max:30'],
            'interestRate' => ['nullable', 'numeric', 'min:0', 'max:30'],
            'interestPercent' => ['nullable', 'numeric', 'min:0', 'max:30'],
        ];
    }
}
