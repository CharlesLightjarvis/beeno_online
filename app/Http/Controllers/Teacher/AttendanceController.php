<?php

namespace App\Http\Controllers\Teacher;

use App\Actions\Teacher\RecordLesson;
use App\Actions\Teacher\UpdateLesson;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreLessonRequest;
use App\Models\CourseSession;
use App\Models\Lesson;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function create(CourseSession $session): Response
    {
        $this->authorize('update', $session);
        $session->load([
            'level:id,code,name',
            'students' => fn ($query) => $query
                ->wherePivotNull('left_at')
                ->orderBy('name')
                ->select('users.id', 'name'),
        ]);

        return Inertia::render('teacher/sessions/attendances/create', [
            'session' => $session->only(['id', 'label', 'status', 'level', 'students']),
        ]);
    }

    public function store(
        StoreLessonRequest $request,
        CourseSession $session,
        RecordLesson $recordLesson,
    ): RedirectResponse {
        $this->authorize('update', $session);
        $data = $request->validated();

        /** @var array<string, string> $attendances */
        $attendances = $data['attendances'];
        $recordLesson->handle(
            $session,
            CarbonImmutable::parse($data['held_on']),
            $data['starts_at'] ?? null,
            (int) round((float) $data['duration_hours'] * 60),
            $attendances,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Présences enregistrées.']);

        return redirect()->route('teacher.sessions.show', $session);
    }

    public function edit(CourseSession $session, Lesson $lesson): Response
    {
        $this->authorize('update', $session);
        $this->ensureLessonBelongsToSession($lesson, $session);
        $session->load('level:id,code,name');
        $lesson->load('attendances.student:id,name');

        return Inertia::render('teacher/sessions/attendances/edit', [
            'session' => $session->only(['id', 'label', 'level']),
            'lesson' => [
                ...$lesson->only(['id', 'attendances']),
                'held_on' => CarbonImmutable::parse($lesson->held_on)->toDateString(),
                'starts_at' => $lesson->starts_at
                    ? substr((string) $lesson->starts_at, 0, 5)
                    : null,
                'duration_hours' => $lesson->duration_minutes / 60,
            ],
        ]);
    }

    public function update(
        StoreLessonRequest $request,
        CourseSession $session,
        Lesson $lesson,
        UpdateLesson $updateLesson,
    ): RedirectResponse {
        $this->authorize('update', $session);
        $this->ensureLessonBelongsToSession($lesson, $session);
        $data = $request->validated();

        /** @var array<string, string> $attendances */
        $attendances = $data['attendances'];
        $updateLesson->handle(
            $lesson,
            CarbonImmutable::parse($data['held_on']),
            $data['starts_at'] ?? null,
            (int) round((float) $data['duration_hours'] * 60),
            $attendances,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Présences mises à jour.']);

        return redirect()->route('teacher.sessions.show', $session);
    }

    private function ensureLessonBelongsToSession(Lesson $lesson, CourseSession $session): void
    {
        abort_unless($lesson->course_session_id === $session->id, 404);
    }
}
