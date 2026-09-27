<?php

namespace App\Http\Requests\Teacher;

use App\Models\CourseSession;

class UpdateCourseSessionRequest extends StoreCourseSessionRequest
{
    public function authorize(): bool
    {
        $session = $this->route('session');

        return $session instanceof CourseSession && $this->user()?->can('update', $session) === true;
    }
}
