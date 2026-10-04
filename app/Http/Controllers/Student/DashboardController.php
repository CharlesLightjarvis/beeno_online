<?php

namespace App\Http\Controllers\Student;

use App\Enums\ExamParticipationStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $participations = $request->user()->examParticipations()
            ->with('examSession:id,title,status,created_at')
            ->latest()
            ->get();

        return Inertia::render('student/dashboard', [
            'summary' => [
                'total' => $participations->count(),
                'in_progress' => $participations->where('status', ExamParticipationStatus::InProgress)->count(),
                'completed' => $participations->where('status', ExamParticipationStatus::Completed)->count(),
            ],
            'recentExams' => $participations->take(5)->map(fn ($participation): array => [
                'id' => (string) $participation->id,
                'title' => (string) $participation->examSession->title,
                'status' => $participation->status->value,
                'session_status' => $participation->examSession->status->value,
            ])->values(),
        ]);
    }
}
