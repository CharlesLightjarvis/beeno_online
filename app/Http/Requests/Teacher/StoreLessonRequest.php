<?php

namespace App\Http\Requests\Teacher;

use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isTeacher() === true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'held_on' => ['required', 'date'],
            'starts_at' => ['nullable', 'date_format:H:i'],
            'duration_hours' => ['required', 'numeric', 'min:0.25', 'multiple_of:0.25'],
            'attendances' => ['required', 'array'],
            'attendances.*' => ['required', Rule::enum(AttendanceStatus::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'duration_hours' => str_replace(',', '.', (string) $this->input('duration_hours')),
        ]);
    }
}
