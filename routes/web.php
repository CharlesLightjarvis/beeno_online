<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::get('/dashboard', function (Request $request) {
    return match (true) {
        $request->user()->isAdmin() => redirect()->route('admin.dashboard'),
        $request->user()->isTeacher() => redirect()->route('teacher.dashboard'),
        default => abort(403),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
require __DIR__.'/teacher.php';
