<?php

namespace App\Http\Requests\Teacher;

class UpdateExamRequest extends StoreExamRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('exam')) === true;
    }
}
