<?php

use App\Http\Controllers\Student\ExamSessionController as StudentExamSessionController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::get('/dashboard', function (Request $request) {
    return match (true) {
        $request->user()->isAdmin() => redirect()->route('admin.dashboard'),
        $request->user()->isTeacher() => redirect()->route('teacher.dashboard'),
        $request->user()->isStudent() => redirect()->route('student.dashboard'),
        default => abort(403),
    };
})->middleware(['auth'])->name('dashboard');

Route::middleware(['auth', 'role:student'])
    ->prefix('student')
    ->name('student.')
    ->group(function (): void {
        Route::get('dashboard', StudentDashboardController::class)->middleware('permission:view.student-dashboard')->name('dashboard');
        Route::middleware('permission:view.own-exam-sessions')->group(function (): void {
            Route::get('exam-sessions', [StudentExamSessionController::class, 'index'])->name('exam-sessions.index');
            Route::post('exam-sessions/join', [StudentExamSessionController::class, 'join'])->middleware('throttle:5,1')->name('exam-sessions.join');
            Route::post('exam-sessions/{examParticipation}/access', [StudentExamSessionController::class, 'access'])->middleware('throttle:10,1')->name('exam-sessions.access');
            Route::get('exam-sessions/{examParticipation}', [StudentExamSessionController::class, 'show'])->name('exam-sessions.show');
            Route::get('exam-sessions/{examParticipation}/results', [StudentExamSessionController::class, 'results'])->name('exam-sessions.results');
            Route::get('exam-sessions/{examParticipation}/state', [StudentExamSessionController::class, 'state'])->name('exam-sessions.state');
            Route::post('exam-sessions/{examParticipation}/heartbeat', [StudentExamSessionController::class, 'heartbeat'])->middleware('throttle:6,1')->name('exam-sessions.heartbeat');
            Route::post('exam-sessions/{examParticipation}/responses', [StudentExamSessionController::class, 'saveResponse'])->middleware('throttle:60,1')->name('exam-sessions.responses.store');
            Route::post('exam-sessions/{examParticipation}/finish', [StudentExamSessionController::class, 'finish'])->name('exam-sessions.finish');
        });
    });

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/teacher.php';
