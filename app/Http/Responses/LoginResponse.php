<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isAdmin()) {
            try {
                Http::timeout(3)
                    ->withHeaders([
                        'Title' => 'Connexion administrateur',
                        'Priority' => 'high',
                        'Tags' => 'warning,lock',
                    ])
                    ->withBody(
                        "{$user->name} vient de se connecter sur ".config('app.name').'.',
                        'text/plain',
                    )
                    ->post((string) config('services.ntfy.admin_login_url'));
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        $fallback = match (true) {
            $user->isAdmin() => route('admin.dashboard'),
            $user->isTeacher() => route('teacher.dashboard'),
            default => route('login'),
        };

        return redirect()->intended($fallback);
    }
}
