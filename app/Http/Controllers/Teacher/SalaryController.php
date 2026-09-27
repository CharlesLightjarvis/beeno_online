<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\CourseSessionStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\CourseSession;
use App\Models\CourseSessionPayment;
use App\Models\User;
use App\Support\SalaryRow;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SalaryController extends Controller
{
    public function index(Request $request): Response
    {
        $salaries = $this->salaryQuery($request->user())
            ->with('payments')
            ->orderBy('completed_at')
            ->get()
            ->map(fn (CourseSession $session) => SalaryRow::from($session));

        return Inertia::render('teacher/salaries/index', [
            'salaries' => $salaries,
        ]);
    }

    public function markPaid(Request $request, CourseSession $session): RedirectResponse
    {
        $this->authorizeSalaryMutation($request, $session);

        DB::transaction(function () use ($session): void {
            $salary = $this->salaryMillimes($session);
            $paidTotal = $this->paymentsTotal($session);
            $missing = $salary - $paidTotal;

            if ($missing > 0) {
                $session->payments()->create([
                    'teacher_id' => $session->teacher_id,
                    'amount_millimes' => $missing,
                    'paid_on' => today()->toDateString(),
                ]);
            }

            $session->update([
                'payment_status' => PaymentStatus::Paid,
                'paid_millimes' => $salary,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Session marquée comme payée.']);

        return back();
    }

    public function markPartiallyPaid(Request $request, CourseSession $session): RedirectResponse
    {
        $this->authorizeSalaryMutation($request, $session);

        $validated = $request->validate([
            'amount_millimes' => ['required', 'integer', 'min:1', 'max:999999999'],
        ]);

        $salary = $this->salaryMillimes($session);
        $paidTotal = $this->paymentsTotal($session);
        $remaining = $salary - $paidTotal;

        $validated['amount_millimes'] = min($validated['amount_millimes'], $remaining);

        if ($validated['amount_millimes'] < 1) {
            return back()->withErrors([
                'amount_millimes' => 'Cette session est déjà intégralement payée.',
            ]);
        }

        DB::transaction(function () use ($session, $validated, $salary): void {
            $session->payments()->create([
                'teacher_id' => $session->teacher_id,
                'amount_millimes' => $validated['amount_millimes'],
                'paid_on' => today()->toDateString(),
            ]);

            $paidTotal = $this->paymentsTotal($session);

            $session->update([
                'payment_status' => $paidTotal >= $salary
                    ? PaymentStatus::Paid
                    : PaymentStatus::PartiallyPaid,
                'paid_millimes' => $paidTotal,
            ]);
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Versement enregistré : '.number_format($validated['amount_millimes'] / 1000, 3, ',', ' ').' DT.',
        ]);

        return back();
    }

    public function markUnpaid(Request $request, CourseSession $session): RedirectResponse
    {
        $this->authorizeSalaryMutation($request, $session);

        DB::transaction(function () use ($session): void {
            $session->payments()->delete();
            $session->update([
                'payment_status' => PaymentStatus::Unpaid,
                'paid_millimes' => 0,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Session marquée comme impayée.']);

        return back();
    }

    public function deletePayment(Request $request, CourseSession $session, CourseSessionPayment $payment): RedirectResponse
    {
        $this->authorizeSalaryMutation($request, $session);
        abort_unless($payment->course_session_id === $session->getKey(), 404);

        DB::transaction(function () use ($session, $payment): void {
            $payment->delete();

            $paidTotal = $this->paymentsTotal($session);
            $salary = $this->salaryMillimes($session);

            $session->update([
                'payment_status' => $paidTotal <= 0
                    ? PaymentStatus::Unpaid
                    : ($paidTotal >= $salary ? PaymentStatus::Paid : PaymentStatus::PartiallyPaid),
                'paid_millimes' => $paidTotal,
            ]);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Versement supprimé.']);

        return back();
    }

    private function salaryMillimes(CourseSession $session): int
    {
        return SalaryRow::salaryMillimes(
            (int) $session->lessons()->sum('duration_minutes'),
            $session->hourly_rate_millimes,
        );
    }

    private function paymentsTotal(CourseSession $session): int
    {
        return (int) $session->payments()->sum('amount_millimes');
    }

    private function authorizeSalaryMutation(Request $request, CourseSession $session): void
    {
        abort_unless(
            $request->user()->hasPermissionTo('view.own-salaries'),
            403,
        );
        abort_unless(
            $session->teacher_id === $request->user()->id
                && $session->status === CourseSessionStatus::Completed,
            404,
        );
    }

    /**
     * @return HasMany<CourseSession, User>
     */
    private function salaryQuery(User $teacher): HasMany
    {
        return $teacher->courseSessions()
            ->where('status', CourseSessionStatus::Completed)
            ->withCount('lessons')
            ->withSum('lessons as total_minutes', 'duration_minutes');
    }
}
