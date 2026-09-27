<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AttendanceStatus;
use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\IndexCourseSessionRequest;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\User;
use App\Support\AdminSessionMetrics;
use Inertia\Inertia;
use Inertia\Response;

class CourseSessionController extends Controller
{
    public function index(IndexCourseSessionRequest $request): Response
    {
        $sessions = AdminSessionMetrics::query(CourseSession::query())
            ->with(['teacher:id,name', 'level:id,code,name'])
            ->withCount([
                'students' => fn ($query) => $query->whereNull('course_session_student.left_at'),
            ])
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (CourseSession $session): array => [
                ...$session->only([
                    'id', 'label', 'target_minutes', 'hourly_rate_millimes',
                    'starts_on', 'status', 'students_count', 'updated_at',
                ]),
                'teacher' => $session->teacher->only(['id', 'name']),
                'level' => $session->level->only(['id', 'code', 'name']),
                ...AdminSessionMetrics::fromLoaded($session),
            ]);

        return Inertia::render('admin/sessions/index', [
            'sessions' => $sessions,
            'teachers' => User::query()
                ->role(RoleEnum::Teacher->value)
                ->orderBy('name')
                ->get(['id', 'name']),
            'levels' => CourseLevel::query()
                ->where('is_active', true)
                ->ordered()
                ->get(['id', 'code', 'name']),
        ]);
    }

    public function show(CourseSession $session): Response
    {
        $session = AdminSessionMetrics::query(CourseSession::query())
            ->with(['teacher:id,name', 'level:id,code,name'])
            ->whereKey($session->id)
            ->firstOrFail();
        $students = $session->students()
            ->wherePivotNull('left_at')
            ->orderBy('name')
            ->get(['users.id', 'name']);
        $lessons = $session->lessons()
            ->with('attendances.student:id,name')
            ->withCount([
                'attendances as present_count' => fn ($query) => $query->where('status', AttendanceStatus::Present->value),
                'attendances as absent_count' => fn ($query) => $query->where('status', AttendanceStatus::Absent->value),
            ])
            ->latest('held_on')
            ->latest('created_at')
            ->get(['id', 'course_session_id', 'held_on', 'starts_at', 'duration_minutes', 'created_at']);

        $lessons->each(fn ($lesson) => $lesson->setRelation(
            'attendances',
            $lesson->attendances->sortBy('student.name')->values(),
        ));

        return Inertia::render('admin/sessions/show', [
            'session' => [
                ...$session->only([
                    'id', 'label', 'target_minutes', 'hourly_rate_millimes',
                    'starts_on', 'completed_at', 'status',
                ]),
                'teacher' => $session->teacher->only(['id', 'name']),
                'level' => $session->level->only(['id', 'code', 'name']),
            ],
            'metrics' => AdminSessionMetrics::fromLoaded($session),
            'students' => $students,
            'lessons' => $lessons,
        ]);
    }
}
