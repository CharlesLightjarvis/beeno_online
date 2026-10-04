<?php

namespace App\Http\Requests\Teacher;

use App\Models\ExamSession;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

class SetExamSessionDisplayMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        $session = $this->route('examSession');

        return $session instanceof ExamSession
            && ($this->user()?->can('view', $session) ?? false);
    }

    /** @return array<string, list<string|Exists>> */
    public function rules(): array
    {
        return [
            'displayed_material_id' => ['required', 'uuid', Rule::exists('exam_session_reading_materials', 'id')],
        ];
    }
}
