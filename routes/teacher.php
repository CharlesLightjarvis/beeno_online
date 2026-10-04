<?php

use App\Http\Controllers\Teacher\AttendanceController;
use App\Http\Controllers\Teacher\CourseSessionController;
use App\Http\Controllers\Teacher\DashboardController;
use App\Http\Controllers\Teacher\ExamController;
use App\Http\Controllers\Teacher\ExamSessionController;
use App\Http\Controllers\Teacher\SalaryController;
use App\Http\Controllers\Teacher\StudentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:teacher'])
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function (): void {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::resource('students', StudentController::class)
            ->except(['show']);
        Route::resource('exams', ExamController::class)->except(['show']);
        Route::resource('exam-sessions', ExamSessionController::class)->only(['index', 'create', 'store', 'show']);
        Route::get('exam-sessions/{examSession}/run', [ExamSessionController::class, 'run'])->name('exam-sessions.run');
        Route::post('exam-sessions/{examSession}/start', [ExamSessionController::class, 'start'])->name('exam-sessions.start');
        Route::post('exam-sessions/{examSession}/open', [ExamSessionController::class, 'open'])->name('exam-sessions.open');
        Route::post('exam-sessions/{examSession}/close', [ExamSessionController::class, 'close'])->name('exam-sessions.close');
        Route::post('exam-sessions/{examSession}/reading-material', [ExamSessionController::class, 'setDisplayMaterial'])->name('exam-sessions.reading-material');
        Route::get('sessions/{session}/next/create', [CourseSessionController::class, 'createNext'])
            ->name('sessions.next.create');
        Route::resource('sessions', CourseSessionController::class)
            ->only(['index', 'create', 'store', 'show', 'edit', 'update', 'destroy']);
        Route::get('sessions/{session}/attendances/create', [AttendanceController::class, 'create'])
            ->name('sessions.attendances.create');
        Route::post('sessions/{session}/attendances', [AttendanceController::class, 'store'])
            ->name('sessions.attendances.store');
        Route::get('sessions/{session}/attendances/{lesson}/edit', [AttendanceController::class, 'edit'])
            ->name('sessions.attendances.edit');
        Route::put('sessions/{session}/attendances/{lesson}', [AttendanceController::class, 'update'])
            ->name('sessions.attendances.update');
        Route::get('salaries', [SalaryController::class, 'index'])->name('salaries.index');
        Route::post('salaries/{session}/paid', [SalaryController::class, 'markPaid'])
            ->name('salaries.mark-paid');
        Route::post('salaries/{session}/partially-paid', [SalaryController::class, 'markPartiallyPaid'])
            ->name('salaries.mark-partially-paid');
        Route::delete('salaries/{session}/payments/{payment}', [SalaryController::class, 'deletePayment'])
            ->name('salaries.delete-payment');
        Route::post('salaries/{session}/unpaid', [SalaryController::class, 'markUnpaid'])
            ->name('salaries.mark-unpaid');
    });
