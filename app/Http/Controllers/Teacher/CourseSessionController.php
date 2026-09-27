<?php

namespace App\Http\Controllers\Teacher;

use App\Actions\Teacher\CreateCourseSession;
use App\Actions\Teacher\UpdateCourseSession;
use App\Enums\AttendanceStatus;
use App\Enums\CourseSessionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreCourseSessionRequest;
use App\Http\Requests\Teacher\UpdateCourseSessionRequest;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Support\SessionMetrics;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CourseSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CourseSession::class);

        $nextLevelPositions = CourseLevel::query()
            ->where('is_active', true)
            ->pluck('position')
            ->all();
        $sessions = $request->user()->courseSessions()
            ->select([
                'id',
                'course_level_id',
                'label',
                'target_minutes',
                'hourly_rate_millimes',
                'starts_on',
                'status',
                'created_at',
            ])
            ->with('level:id,code,name,position')
            ->withCount('students')
            ->withExists('nextSession')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $sessions->getCollection()->each(function (CourseSession $session) use ($nextLevelPositions): void {
            $session->setAttribute(
                'can_create_next_session',
                $session->status === CourseSessionStatus::Completed
                    && in_array($session->level->position + 1, $nextLevelPositions, true)
                    && ! (bool) $session->getAttribute('next_session_exists'),
            );
            $session->makeHidden('next_session_exists');
        });

        return Inertia::render('teacher/sessions/index', [
            'sessions' => $sessions,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', CourseSession::class);

        return Inertia::render('teacher/sessions/create', [
            'levels' => CourseLevel::query()
                ->where('is_active', true)
                ->ordered()
                ->get(['id', 'code', 'name', 'target_minutes']),
            'students' => $request->user()->students()
                ->whereNull('archived_at')
                ->orderBy('name')
                ->get(['id', 'name']),
            'defaults' => null,
        ]);
    }

    public function createNext(Request $request, CourseSession $session): Response
    {
        $this->authorize('view', $session);

        abort_unless($session->status === CourseSessionStatus::Completed, 404);
        abort_if($session->nextSession()->exists(), 404);

        $session->load('level:id,code,position');
        $nextLevel = CourseLevel::query()
            ->where('is_active', true)
            ->where('position', $session->level->position + 1)
            ->firstOrFail();

        $students = $request->user()->students()
            ->whereNull('archived_at')
            ->orderBy('name')
            ->get(['id', 'name']);
        $selectedStudentIds = $session->students()
            ->wherePivotNull('left_at')
            ->whereNull('archived_at')
            ->pluck('users.id')
            ->values();

        return Inertia::render('teacher/sessions/create', [
            'levels' => [$nextLevel->only(['id', 'code', 'name', 'target_minutes'])],
            'students' => $students,
            'defaults' => [
                'previous_session_id' => $session->id,
                'course_level_id' => $nextLevel->id,
                'label' => str_replace($session->level->code, $nextLevel->code, $session->label),
                'student_ids' => $selectedStudentIds,
            ],
        ]);
    }

    public function show(CourseSession $session): Response
    {
        $this->authorize('view', $session);
        $session->load('level:id,code,name,position');

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

        return Inertia::render('teacher/sessions/show', [
            'session' => [
                ...$session->only([
                    'id', 'label', 'target_minutes', 'hourly_rate_millimes',
                    'starts_on', 'status', 'completed_at',
                ]),
                'level' => $session->level,
                'can_create_next_session' => $this->canCreateNextSession($session),
            ],
            'students' => $students,
            'lessons' => $lessons,
            'metrics' => SessionMetrics::from($session),
        ]);
    }

    public function store(
        StoreCourseSessionRequest $request,
        CreateCourseSession $createCourseSession,
    ): RedirectResponse {
        $data = $request->validated();
        $level = CourseLevel::query()
            ->where('is_active', true)
            ->whereKey($data['course_level_id'])
            ->firstOrFail();

        $previousSession = null;
        if (! empty($data['previous_session_id'])) {
            $previousSession = CourseSession::query()
                ->with('level:id,position')
                ->where('teacher_id', $request->user()->id)
                ->whereKey($data['previous_session_id'])
                ->firstOrFail();

            abort_unless($previousSession->status === CourseSessionStatus::Completed, 404);
            abort_if($previousSession->nextSession()->exists(), 404);

            $expectedLevel = CourseLevel::query()
                ->where('is_active', true)
                ->where('position', $previousSession->level->position + 1)
                ->firstOrFail();

            if (! $expectedLevel->is($level)) {
                throw ValidationException::withMessages([
                    'course_level_id' => 'Le sous-niveau doit être celui qui suit la session clôturée.',
                ]);
            }
        }

        /** @var array<int, string> $studentIds */
        $studentIds = $data['student_ids'] ?? [];

        $createCourseSession->handle(
            $request->user(),
            $level,
            $data['label'],
            CarbonImmutable::parse($data['starts_on']),
            $studentIds,
            $previousSession,
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Session créée.']);

        return redirect()->route('teacher.sessions.index');
    }

    public function edit(Request $request, CourseSession $session): Response
    {
        $this->authorize('update', $session);

        return Inertia::render('teacher/sessions/edit', [
            'session' => [
                ...$session->only(['id', 'label', 'course_level_id']),
                'starts_on' => CarbonImmutable::parse($session->starts_on)->toDateString(),
            ],
            'selectedStudentIds' => $session->students()->wherePivotNull('left_at')->pluck('users.id'),
            'levels' => CourseLevel::query()->where('is_active', true)->ordered()->get(['id', 'code', 'name', 'target_minutes']),
            'students' => $request->user()->students()->whereNull('archived_at')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateCourseSessionRequest $request, CourseSession $session, UpdateCourseSession $update): RedirectResponse
    {
        $data = $request->validated();
        $level = CourseLevel::query()->where('is_active', true)->whereKey($data['course_level_id'])->firstOrFail();
        /** @var array<int, string> $studentIds */
        $studentIds = $data['student_ids'] ?? [];
        $update->handle($session, $level, $data['label'], $data['starts_on'], $studentIds);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Session mise à jour.']);

        return redirect()->route('teacher.sessions.index');
    }

    public function destroy(CourseSession $session): RedirectResponse
    {
        $this->authorize('update', $session);
        $session->update(['status' => CourseSessionStatus::Completed, 'completed_at' => now()]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Session clôturée.']);

        return redirect()->route('teacher.sessions.index');
    }

    private function canCreateNextSession(CourseSession $session): bool
    {
        return $session->status === CourseSessionStatus::Completed
            && ! $session->nextSession()->exists()
            && CourseLevel::query()
                ->where('is_active', true)
                ->where('position', $session->level->position + 1)
                ->exists();
    }
}
