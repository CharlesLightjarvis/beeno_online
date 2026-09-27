<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseSessionStatus;
use App\Http\Controllers\Controller;
use App\Models\CourseSession;
use App\Support\SalaryRow;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SalaryController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'payment' => ['nullable', Rule::in(['unpaid', 'partially_paid', 'paid'])],
        ]);

        $query = CourseSession::query()
            ->where('status', CourseSessionStatus::Completed)
            ->with(['teacher:id,name', 'payments'])
            ->withCount('lessons')
            ->withSum('lessons as total_minutes', 'duration_minutes')
            ->when(
                $validated['payment'] ?? null,
                fn ($q, string $payment) => $q->where('payment_status', $payment),
            )
            ->orderBy('completed_at');

        $salaries = $query->get()->map(fn (CourseSession $session) => [
            ...SalaryRow::from($session),
            'teacher_name' => $session->teacher->name,
        ]);

        return Inertia::render('admin/salaries/index', [
            'salaries' => $salaries,
            'summary' => [
                'total_millimes' => $salaries->sum('salary_millimes'),
                'paid_millimes' => $salaries->sum('paid_millimes'),
                'remaining_millimes' => $salaries->sum('remaining_millimes'),
            ],
            'filter' => $validated['payment'] ?? null,
        ]);
    }
}
