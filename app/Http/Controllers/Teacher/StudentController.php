<?php

namespace App\Http\Controllers\Teacher;

use App\Actions\Teacher\CreateStudent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreStudentRequest;
use App\Http\Requests\Teacher\UpdateStudentRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('teacher/students/index', [
            'students' => $request->user()->students()
                ->whereNull('archived_at')
                ->select(['id', 'name', 'created_at'])
                ->orderBy('name')
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('teacher/students/create');
    }

    public function store(StoreStudentRequest $request, CreateStudent $createStudent): RedirectResponse
    {
        $data = $request->validated();
        $createStudent->handle($request->user(), $data['name']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Étudiant ajouté.']);

        return redirect()->route('teacher.students.index');
    }

    public function edit(Request $request, User $student): Response
    {
        $this->authorize('view', $student);

        return Inertia::render('teacher/students/edit', [
            'student' => $student->only(['id', 'name']),
        ]);
    }

    public function update(UpdateStudentRequest $request, User $student): RedirectResponse
    {
        $data = $request->validated();
        $student->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Étudiant mis à jour.']);

        return back();
    }

    public function destroy(Request $request, User $student): RedirectResponse
    {
        $this->authorize('delete', $student);
        $student->update(['archived_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Étudiant archivé.']);

        return redirect()->route('teacher.students.index');
    }
}
