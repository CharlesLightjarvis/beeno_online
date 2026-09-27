<?php

use App\Http\Controllers\Admin\CourseSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\TeacherController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('dashboard', DashboardController::class)
        ->middleware('permission:view.admin-dashboard')
        ->name('dashboard');
    Route::get('teachers', [TeacherController::class, 'index'])
        ->middleware('permission:view.admin-teachers')
        ->name('teachers.index');
    Route::get('sessions', [CourseSessionController::class, 'index'])
        ->middleware('permission:view.admin-sessions')
        ->name('sessions.index');
    Route::get('sessions/{session}', [CourseSessionController::class, 'show'])
        ->middleware('permission:view.admin-sessions')
        ->name('sessions.show');
});
