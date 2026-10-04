<?php

use App\Models\ExamSession;
use App\Models\ExamParticipation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('exam-sessions.{sessionId}.teacher', function (User $user, string $sessionId): bool {
    return $user->isTeacher()
        && ExamSession::query()->whereKey($sessionId)->where('teacher_id', $user->id)->exists();
});

Broadcast::channel('exam-sessions.{sessionId}.students.{studentId}', function (User $user, string $sessionId, string $studentId): bool {
    return $user->isStudent()
        && (string) $user->id === $studentId
        && ExamSession::query()->whereKey($sessionId)
            ->whereHas('participations', fn ($query) => $query->where('student_id', $user->id)->whereNotNull('joined_at'))
            ->exists();
});

Broadcast::channel('exam-sessions.{sessionId}.participations.{participationId}.presence', function (User $user, string $sessionId, string $participationId): array|bool {
    $participation = ExamParticipation::query()
        ->whereKey($participationId)
        ->where('exam_session_id', $sessionId)
        ->first();

    if (!$participation) {
        return false;
    }

    $ownsSession = $user->isTeacher()
        && ExamSession::query()->whereKey($sessionId)->where('teacher_id', $user->id)->exists();

    if ($ownsSession) {
        return ['id' => 'teacher'];
    }

    $isActiveParticipant = $user->isStudent()
        && (string) $participation->student_id === (string) $user->id
        && $participation->joined_at !== null
        && $participation->status->value !== 'completed';

    return $isActiveParticipant ? ['id' => 'student'] : false;
});
