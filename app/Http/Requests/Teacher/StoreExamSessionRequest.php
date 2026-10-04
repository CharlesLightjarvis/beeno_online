<?php

namespace App\Http\Requests\Teacher;

use App\Models\ExamSession;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

class StoreExamSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', ExamSession::class) ?? false;
    }

    /** @return array<string, list<string|Exists>> */
    public function rules(): array
    {
        return [
            'exam_id' => ['required', 'uuid', Rule::exists('exams', 'id')->where('status', 'published')->whereNull('deleted_at')],
            'student_ids' => ['nullable', 'array', 'max:200'],
            'student_ids.*' => ['required', 'uuid', 'distinct', Rule::exists('users', 'id')],
        ];
    }
}
