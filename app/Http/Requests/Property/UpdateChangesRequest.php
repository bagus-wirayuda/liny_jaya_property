<?php

namespace App\Http\Requests\Property;

use App\Services\PropertyRecords;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateChangesRequest extends FormRequest
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
            'workspace' => ['required', 'boolean'],
            'revision' => ['required', 'integer', 'min:0'],
            'changes' => ['required', 'array', 'min:1', 'max:30'],
            'changes.*' => ['required', 'array:resource,id,operation,fields'],
            'changes.*.resource' => ['required', Rule::in([...PropertyRecords::GROUPS, 'company', 'settings', 'paymentConfig', 'profile', 'accounts'])],
            'changes.*.id' => ['required', 'string', 'regex:/\A[\w-]{1,64}\z/'],
            'changes.*.operation' => ['required', 'in:create,update,delete'],
            'changes.*.fields' => ['sometimes', 'array', 'max:32'],
        ];
    }
}
