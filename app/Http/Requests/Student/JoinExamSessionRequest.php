<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class JoinExamSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isStudent() ?? false;
    }

    /** @return array<string, list<string>> */
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['code' => ['required', 'string', 'size:8', 'alpha_num']];
    }
}
