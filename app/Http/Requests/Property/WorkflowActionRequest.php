<?php

namespace App\Http\Requests\Property;

use Illuminate\Foundation\Http\FormRequest;

class WorkflowActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'revision' => ['required', 'integer', 'min:0'],
            'input' => ['present', 'array', 'max:12'],
        ];
    }
}
