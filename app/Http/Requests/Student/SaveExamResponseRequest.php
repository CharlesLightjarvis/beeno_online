<?php

namespace App\Http\Requests\Student;

use App\Models\ExamParticipation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

class SaveExamResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $participation = $this->route('examParticipation');

        return $participation instanceof ExamParticipation
            && ($this->user()?->can('update', $participation) ?? false);
    }

    /** @return array<string, list<string|Exists>> */
    /** @return array<string, list<string|Exists>> */
    public function rules(): array
    {
        return [
            'task_id' => ['required', 'uuid', Rule::exists('exam_session_tasks', 'id')],
            'choice_id' => ['required', 'uuid', Rule::exists('exam_session_choices', 'id')],
        ];
    }
}
