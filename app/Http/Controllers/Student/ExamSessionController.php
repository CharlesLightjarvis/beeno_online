<?php

namespace App\Http\Controllers\Student;

use App\Actions\Student\FinishExamParticipation;
use App\Actions\Student\JoinExamSession;
use App\Actions\Student\SaveExamResponse;
use App\Enums\ExamParticipationStatus;
use App\Events\ExamSessionPresenceUpdated;
use App\Events\ExamSessionProgressUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\JoinExamSessionRequest;
use App\Http\Requests\Student\SaveExamResponseRequest;
use App\Models\ExamParticipation;
use App\Models\ExamSessionChoice;
use App\Models\ExamSessionPart;
use App\Models\ExamSessionTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ExamSessionController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('student/exam-sessions/index', [
            'participations' => $request->user()->examParticipations()
                ->with('examSession:id,title,status,created_at')
                ->latest()
                ->get()
                ->map(fn (ExamParticipation $participation): array => [
                    'id' => $participation->id,
                    'title' => $participation->examSession->title,
                    'session_status' => $participation->examSession->status->value,
                    'status' => $participation->status->value,
                    'joined_at' => $participation->joined_at,
                ]),
        ]);
    }

    public function join(JoinExamSessionRequest $request, JoinExamSession $join): RedirectResponse
    {
        $participation = $join->handle($request->user(), $request->validated('code'));

        return redirect()->route('student.exam-sessions.show', $participation);
    }

    public function access(JoinExamSessionRequest $request, ExamParticipation $examParticipation, JoinExamSession $join): RedirectResponse
    {
        $this->authorize('access', $examParticipation);

        $code = strtoupper(trim($request->validated('code')));

        if (! hash_equals((string) $examParticipation->examSession->access_code, $code)) {
            throw ValidationException::withMessages([
                'code' => 'Ce code ne correspond pas à cette session. Vérifiez le code communiqué par votre professeur.',
            ]);
        }

        $participation = $join->handle($request->user(), $code);
        event(new ExamSessionPresenceUpdated(
            $participation->exam_session_id,
            (string) $participation->student_id,
            $participation->last_seen_at->toISOString(),
        ));

        return redirect()->route('student.exam-sessions.show', $participation);
    }

    public function show(ExamParticipation $examParticipation): Response
    {
        $this->authorize('view', $examParticipation);
        $examParticipation->load('examSession');
        $session = $examParticipation->examSession;
        $hasStarted = $session->started_at !== null;

        if ($hasStarted) {
            $examParticipation->load('examSession.parts.readingMaterials', 'examSession.parts.tasks.choices', 'examSession.parts.tasks.readingMaterial', 'responses.choice');
        }

        $visibleParts = $hasStarted && $session->active_module !== null
            ? $session->parts->filter(fn (ExamSessionPart $part): bool => $part->module_position <= ($session->parts->firstWhere('module', $session->active_module)?->module_position ?? 0))->values()
            : $session->parts;

        $review = ($examParticipation->status === ExamParticipationStatus::Completed || $session->status->value === 'closed')
            ? $session->parts->flatMap->tasks->mapWithKeys(function (ExamSessionTask $task) use ($examParticipation): array {
                $response = $examParticipation->responses->firstWhere('task_id', $task->id);
                $correctChoice = $task->choices->firstWhere('is_correct', true);

                return [(string) $task->id => [
                    'selected_choice_id' => $response?->choice_id,
                    'correct_choice_id' => $correctChoice?->id,
                    'is_correct' => $response?->choice?->is_correct,
                ]];
            })->all()
            : null;
        $reviewScores = $review === null ? null : collect(['lesen', 'hoeren', 'schreiben', 'sprechen'])
            ->mapWithKeys(function (string $module) use ($session, $examParticipation): array {
                $tasks = $session->parts->where('module', $module)->flatMap->tasks;
                $choiceTasks = $tasks->where('response_type', 'choice');
                $correct = $choiceTasks->filter(function (ExamSessionTask $task) use ($examParticipation): bool {
                    $response = $examParticipation->responses->firstWhere('task_id', $task->id);

                    return $response?->choice?->is_correct === true;
                })->count();

                return [$module => [
                    'available' => $choiceTasks->isNotEmpty(),
                    'correct' => $correct,
                    'total' => $choiceTasks->count(),
                ]];
            })->all();

        return Inertia::render('student/exam-sessions/show', [
            'participation' => [
                'id' => $examParticipation->id,
                'session_id' => $session->id,
                'student_id' => (string) $examParticipation->student_id,
                'status' => $examParticipation->status->value,
                'completed_at' => $examParticipation->completed_at,
                'session_status' => $session->status->value,
                'started_at' => $session->started_at?->toISOString(),
            ],
            'exam' => [
                'title' => $session->title,
                'parts' => $hasStarted ? $visibleParts->map(fn (ExamSessionPart $part): array => [
                    'id' => (string) $part->id,
                    'module' => (string) $part->module,
                    'part_number' => (int) $part->part_number,
                    'instructions' => $part->instructions === null ? null : (string) $part->instructions,
                    'tasks' => $part->tasks->map(fn (ExamSessionTask $task): array => [
                        'id' => (string) $task->id,
                        'position' => (int) $task->position,
                        'prompt' => $task->prompt === null ? null : (string) $task->prompt,
                        'response_type' => (string) $task->response_type,
                        'material' => $task->readingMaterial ? [
                            'media_type' => (string) $task->readingMaterial->media_type,
                            'media_url' => $task->readingMaterial->media_url,
                            'body' => $task->readingMaterial->body,
                        ] : null,
                        'choices' => $task->choices->map(fn (ExamSessionChoice $choice): array => [
                            'id' => (string) $choice->id,
                            'label' => (string) $choice->label,
                            'body' => $choice->body,
                        ])->all(),
                    ])->all(),
                ]) : [],
            ],
            'responses' => $hasStarted ? $examParticipation->responses->mapWithKeys(
                fn ($response): array => [$response->task_id => $response->choice_id ?? $response->answer_text],
            ) : [],
            'review' => $review,
            'review_scores' => $reviewScores,
        ]);
    }

    public function results(ExamParticipation $examParticipation): Response|RedirectResponse
    {
        $this->authorize('view', $examParticipation);

        abort_unless($examParticipation->status === ExamParticipationStatus::Completed || $examParticipation->examSession->status->value === 'closed', 403);

        return redirect()->route('student.exam-sessions.show', $examParticipation);

        $examParticipation->load('examSession.parts.tasks.choices', 'responses.choice', 'responses.task.part');
        $responses = $examParticipation->responses->keyBy('task_id');
        $modules = [];
        $correct = 0;
        $scored = 0;
        $pending = 0;

        foreach ($examParticipation->examSession->parts as $part) {
            $module = (string) $part->module;
            $modules[$module] ??= ['module' => $module, 'parts' => [], 'correct' => 0, 'scored' => 0, 'pending' => 0];
            $partData = ['part_number' => (int) $part->part_number, 'tasks' => []];

            foreach ($part->tasks as $task) {
                $response = $responses->get($task->id);
                $selectedChoice = $response?->choice;
                $isCorrect = $task->response_type === 'choice' && $selectedChoice !== null
                    ? (bool) $selectedChoice->is_correct
                    : null;

                if ($isCorrect !== null) {
                    $scored++;
                    $modules[$module]['scored']++;
                    if ($isCorrect) {
                        $correct++;
                        $modules[$module]['correct']++;
                    }
                } elseif ($task->response_type === 'text' && $response !== null) {
                    $pending++;
                    $modules[$module]['pending']++;
                }

                $partData['tasks'][] = [
                    'position' => (int) $task->position,
                    'prompt' => $task->prompt,
                    'response_type' => (string) $task->response_type,
                    'answer_text' => $response?->answer_text,
                    'selected_choice_id' => $response?->choice_id,
                    'selected_choice_label' => $selectedChoice?->label,
                    'is_correct' => $isCorrect,
                    'choices' => $task->choices->map(fn ($choice): array => [
                        'id' => (string) $choice->id,
                        'label' => (string) $choice->label,
                        'body' => $choice->body,
                        'is_correct' => (bool) $choice->is_correct,
                    ])->all(),
                ];
            }

            $modules[$module]['parts'][] = $partData;
        }

        return Inertia::render('student/exam-sessions/results', [
            'exam' => ['title' => $examParticipation->examSession->title],
            'summary' => ['correct' => $correct, 'scored' => $scored, 'pending' => $pending],
            'modules' => array_values($modules),
        ]);
    }

    public function saveResponse(SaveExamResponseRequest $request, ExamParticipation $examParticipation, SaveExamResponse $save): JsonResponse|RedirectResponse
    {
        $data = $request->validated();
        $save->handle($examParticipation, $data['task_id'], $data['choice_id'] ?? null, $data['answer_text'] ?? null);
        event(ExamSessionProgressUpdated::fromParticipation($examParticipation->fresh()));
        if ($request->expectsJson()) {
            return response()->json(['saved' => true]);
        }

        Inertia::flash('responseSaved', true);

        return back();
    }

    public function finish(Request $request, ExamParticipation $examParticipation, FinishExamParticipation $finish): RedirectResponse
    {
        $this->authorize('update', $examParticipation);
        $examParticipation = $finish->handle($examParticipation);
        event(ExamSessionProgressUpdated::fromParticipation($examParticipation));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Examen terminé.']);

        return redirect()->route('student.exam-sessions.show', $examParticipation);
    }

    public function state(Request $request, ExamParticipation $examParticipation): JsonResponse
    {
        $this->authorize('view', $examParticipation);

        if ($examParticipation->examSession->started_at === null) {
            return response()->json([
                'status' => $examParticipation->status->value,
                'session_status' => $examParticipation->examSession->status->value,
                'started_at' => null,
                'answered_task_ids' => [],
                'answered_total' => 0,
                'tasks_by_part' => [],
                'responses' => [],
            ]);
        }

        $examParticipation->load('examSession.parts.tasks', 'responses');
        $positions = $examParticipation->examSession->parts
            ->mapWithKeys(fn ($part) => [
                $part->module.':'.$part->part_number => $part->tasks->pluck('position')->all(),
            ]);

        return response()->json([
            'status' => $examParticipation->status->value,
            'session_status' => $examParticipation->examSession->status->value,
            'started_at' => $examParticipation->examSession->started_at?->toISOString(),
            'answered_task_ids' => $examParticipation->responses->pluck('task_id')->values(),
            'answered_total' => $examParticipation->responses->count(),
            'tasks_by_part' => $positions,
            'responses' => $examParticipation->responses->mapWithKeys(
                fn ($response): array => [$response->task_id => $response->choice_id ?? $response->answer_text],
            ),
        ]);
    }

    public function heartbeat(Request $request, ExamParticipation $examParticipation): JsonResponse
    {
        $this->authorize('view', $examParticipation);

        if ($examParticipation->status->value === 'completed') {
            return response()->json(['last_seen_at' => $examParticipation->last_seen_at?->toISOString()]);
        }

        $examParticipation->update(['last_seen_at' => now()]);
        $participation = $examParticipation->refresh();
        event(new ExamSessionPresenceUpdated(
            $participation->exam_session_id,
            (string) $participation->student_id,
            $participation->last_seen_at->toISOString(),
        ));

        return response()->json(['last_seen_at' => $participation->last_seen_at->toISOString()]);
    }
}
