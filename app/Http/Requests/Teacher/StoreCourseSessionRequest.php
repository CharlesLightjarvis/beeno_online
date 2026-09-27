<?php

namespace App\Http\Requests\Teacher;

use App\Models\CourseLevel;
use App\Models\CourseSession;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isTeacher() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:255'],
            'course_level_id' => [
                'required',
                'uuid',
                Rule::exists(CourseLevel::class, 'id')->where('is_active', true),
            ],
            'starts_on' => ['required', 'date'],
            'previous_session_id' => ['nullable', 'uuid', Rule::exists(CourseSession::class, 'id')],
            'student_ids' => ['sometimes', 'array'],
            'student_ids.*' => ['required', 'uuid', 'distinct'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'label' => trim((string) $this->input('label')),
            'student_ids' => $this->input('student_ids', []),
        ]);
    }
}
