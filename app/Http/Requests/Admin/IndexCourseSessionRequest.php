<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class IndexCourseSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('view.admin-sessions') === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [];
    }
}
