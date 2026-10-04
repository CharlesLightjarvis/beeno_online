<?php

namespace App\Http\Controllers\Teacher;

use App\Actions\Teacher\SaveExam;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreExamRequest;
use App\Http\Requests\Teacher\UpdateExamRequest;
use App\Models\Exam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Exam::class);
        $exams = $request->user()->exams()->withCount('parts')->latest()->paginate(15)->withQueryString();
        $exams->getCollection()->each(function (Exam $exam): void {
            $exam->setAttribute('tasks_count', $exam->parts()->withCount('tasks')->get()->sum('tasks_count'));
        });

        return Inertia::render('teacher/exams/index', ['exams' => $exams]);
    }

    public function create(): Response
    {
        $this->authorize('create', Exam::class);

        return Inertia::render('teacher/exams/create', ['exam' => null]);
    }

    public function store(StoreExamRequest $request, SaveExam $save): RedirectResponse
    {
        $save->handle($request->user(), $request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Examen créé.']);

        return redirect()->route('teacher.exams.index');
    }

    public function edit(Exam $exam): Response
    {
        $this->authorize('update', $exam);
        $exam->load('parts.readingMaterials', 'parts.tasks.readingMaterial', 'parts.tasks.choices');

        return Inertia::render('teacher/exams/edit', ['exam' => $exam]);
    }

    public function update(UpdateExamRequest $request, Exam $exam, SaveExam $save): RedirectResponse
    {
        $save->handle($request->user(), $request->validated(), $exam);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Examen mis à jour.']);

        return redirect()->route('teacher.exams.index');
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $this->authorize('delete', $exam);
        $hasSessions = $exam->sessions()->exists();

        if ($hasSessions) {
            $exam->delete();
        } else {
            $exam->forceDelete();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $hasSessions ? 'Examen archivé ; son historique est conservé.' : 'Examen supprimé.',
        ]);

        return redirect()->route('teacher.exams.index');
    }
}
