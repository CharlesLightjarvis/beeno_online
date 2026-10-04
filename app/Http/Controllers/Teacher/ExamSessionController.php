<?php

namespace App\Http\Controllers\Teacher;

use App\Actions\Teacher\CloseExamSession;
use App\Actions\Teacher\AdvanceExamSessionModule;
use App\Actions\Teacher\CreateExamSession;
use App\Actions\Teacher\OpenExamSession;
use App\Actions\Teacher\SetExamSessionDisplayMaterial;
use App\Enums\ExamSessionStatus;
use App\Enums\ExamStatus;
use App\Enums\RoleEnum;
use App\Events\ExamSessionMaterialChanged;
use App\Events\ExamSessionStateChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\SetExamSessionDisplayMaterialRequest;
use App\Http\Requests\Teacher\StoreExamSessionRequest;
use App\Models\ExamSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ExamSession::class);

        return Inertia::render('teacher/exam-sessions/index', [
            'sessions' => $request->user()->examSessions()
                ->withCount('participations')
                ->latest()
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', ExamSession::class);

        return Inertia::render('teacher/exam-sessions/create', [
            'exams' => $request->user()->exams()
                ->where('status', ExamStatus::Published->value)
                ->latest()
                ->get(['id', 'title']),
            'students' => $request->user()->students()
                ->whereNull('archived_at')
                ->role(RoleEnum::Student->value)
                ->orderBy('name')
                ->get(['id', 'name']),
            'selectedExamId' => $request->string('exam_id')->toString(),
        ]);
    }

    public function store(StoreExamSessionRequest $request, CreateExamSession $create): RedirectResponse
    {
        $data = $request->validated();
        $exam = $request->user()->exams()->whereKey($data['exam_id'])->firstOrFail();
        $session = $create->handle($request->user(), $exam, $data['student_ids'] ?? []);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Session d’examen créée.']);

        return redirect()->route('teacher.exam-sessions.show', $session);
    }

    public function show(ExamSession $examSession): Response
    {
        $this->authorize('view', $examSession);
        $examSession->load('participations.student');

        return Inertia::render('teacher/exam-sessions/overview', [
            'session' => $this->sessionSummary($examSession),
        ]);
    }

    public function run(ExamSession $examSession): Response
    {
        $this->authorize('view', $examSession);
        abort_if($examSession->status !== ExamSessionStatus::Open || $examSession->started_at === null, 403);

        $examSession->load('parts.readingMaterials', 'parts.tasks.choices', 'participations.student', 'participations.responses.task.part');
        $parts = $examSession->parts->map(fn ($part): array => [
            'id' => (string) $part->id,
            'module' => (string) $part->module,
            'module_position' => (int) $part->module_position,
            'part_number' => (int) $part->part_number,
            'instructions' => $part->instructions === null ? null : (string) $part->instructions,
            'reading_materials' => $part->readingMaterials->map(fn ($material): array => [
                'id' => (string) $material->id,
                'position' => (int) $material->position,
                'body' => (string) $material->body,
                'media_type' => (string) $material->media_type,
                'media_url' => $material->media_url,
            ])->all(),
            'tasks' => $part->tasks->map(fn ($task): array => [
                'id' => (string) $task->id,
                'position' => (int) $task->position,
                'prompt' => $task->prompt === null ? null : (string) $task->prompt,
                'response_type' => (string) $task->response_type,
                'choices' => $task->choices->map(fn ($choice): array => [
                    'label' => (string) $choice->label,
                    'body' => $choice->body === null ? null : (string) $choice->body,
                ])->all(),
            ])->all(),
        ])->all();

        return Inertia::render('teacher/exam-sessions/run', [
            'session' => $this->sessionSummary($examSession, includeProgress: true),
            'parts' => $parts,
        ]);
    }

    public function start(ExamSession $examSession): RedirectResponse
    {
        $this->authorize('view', $examSession);
        abort_if($examSession->status !== ExamSessionStatus::Open, 403);

        $started = ExamSession::query()
            ->whereKey($examSession->getKey())
            ->whereNull('started_at')
            ->update(['started_at' => now(), 'active_module' => $examSession->active_module ?? 'lesen']);

        if ($started > 0) {
            event(ExamSessionStateChanged::fromSession($examSession->refresh()));
        }

        return redirect()->route('teacher.exam-sessions.run', $examSession);
    }

    public function advance(ExamSession $examSession, AdvanceExamSessionModule $advance): RedirectResponse
    {
        $this->authorize('view', $examSession);
        $examSession = $advance->handle($examSession);
        event(ExamSessionStateChanged::fromSession($examSession));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Module suivant activé.']);

        return redirect()->route('teacher.exam-sessions.run', $examSession);
    }

    /** @return array<string, mixed> */
    private function sessionSummary(ExamSession $examSession, bool $includeProgress = false): array
    {
        return [
            'id' => (string) $examSession->id,
            'title' => (string) $examSession->title,
            'access_code' => (string) $examSession->access_code,
            'status' => $examSession->status->value,
            'opened_at' => $examSession->opened_at,
            'started_at' => $examSession->started_at,
            'active_module' => $examSession->active_module,
            'closed_at' => $examSession->closed_at,
            'participations' => $examSession->participations->map(function ($participation) use ($examSession, $includeProgress): array {
                $student = [
                    'id' => (string) $participation->student->getKey(),
                    'name' => (string) $participation->student->name,
                ];
                $data = [
                    'id' => (string) $participation->id,
                    'student' => $student,
                    'status' => $participation->status->value,
                    'joined_at' => $participation->joined_at?->toISOString(),
                    'last_seen_at' => $participation->last_seen_at,
                    'completed_at' => $participation->completed_at,
                ];

                if ($includeProgress) {
                    $data['progress'] = $examSession->parts->map(fn ($part): array => [
                        'module' => (string) $part->module,
                        'part_number' => (int) $part->part_number,
                        'answered_task_positions' => $participation->responses
                            ->filter(fn ($response): bool => $response->task?->part_id === $part->id)
                            ->map(fn ($response): ?int => $response->task?->position === null ? null : (int) $response->task->position)
                            ->filter()
                            ->sort()
                            ->values()
                            ->all(),
                        'total_tasks' => $part->tasks->count(),
                    ])->all();
                }

                return $data;
            })->all(),
        ];
    }

    public function setDisplayMaterial(SetExamSessionDisplayMaterialRequest $request, ExamSession $examSession, SetExamSessionDisplayMaterial $setMaterial): RedirectResponse
    {
        $this->authorize('view', $examSession);
        $examSession = $setMaterial->handle($examSession, $request->validated('displayed_material_id'));
        ExamSessionMaterialChanged::dispatch($examSession->id, $examSession->displayed_material_id);

        return back();
    }

    public function open(ExamSession $examSession, OpenExamSession $open): RedirectResponse
    {
        $this->authorize('open', $examSession);
        $examSession = $open->handle($examSession);
        event(ExamSessionStateChanged::fromSession($examSession));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Session ouverte aux étudiants.']);

        return redirect()->route('teacher.exam-sessions.show', $examSession);
    }

    public function close(ExamSession $examSession, CloseExamSession $close): RedirectResponse
    {
        $this->authorize('close', $examSession);
        $examSession = $close->handle($examSession);
        event(ExamSessionStateChanged::fromSession($examSession));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Session clôturée.']);

        return redirect()->route('teacher.exam-sessions.show', $examSession);
    }
}
