<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Concerns\PasswordValidationRules;
use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\error;
use function Laravel\Prompts\info;
use function Laravel\Prompts\password;
use function Laravel\Prompts\select;
use function Laravel\Prompts\table;
use function Laravel\Prompts\text;
use function Laravel\Prompts\warning;

class ManageUsersCommand extends Command
{
    use PasswordValidationRules;

    protected $signature = 'make:users';

    protected $description = 'Gestion interactive des administrateurs et professeurs';

    public function handle(): int
    {
        while (true) {
            $action = select(
                label: 'Que veux-tu faire ?',
                options: [
                    'list' => 'Lister les utilisateurs',
                    'create' => 'Créer un utilisateur',
                    'update' => 'Modifier un utilisateur',
                    'role' => 'Changer le rôle d\'un utilisateur',
                    'delete' => 'Supprimer un utilisateur',
                    'exit' => 'Quitter',
                ],
            );

            if ($action === 'exit') {
                info('À bientôt.');

                return self::SUCCESS;
            }

            match ($action) {
                'list' => $this->listUsers(),
                'create' => $this->createUser(),
                'update' => $this->updateUser(),
                'role' => $this->changeRole(),
                'delete' => $this->deleteUser(),
                default => null,
            };

            $this->newLine();
        }
    }

    /**
     * Liste uniquement les comptes connectables :
     * administrateurs et professeurs.
     */
    private function listUsers(): void
    {
        $users = $this->manageableUsersQuery()
            ->orderBy('name')
            ->get();

        if ($users->isEmpty()) {
            warning('Aucun administrateur ou professeur trouvé.');

            return;
        }

        table(
            headers: [
                'ID',
                'Nom',
                'Email',
                'Rôle',
                'Créé le',
            ],
            rows: $users
                ->map(function (User $user): array {
                    return [
                        (string) $user->getKey(),
                        $user->name,
                        $user->email ?? '—',
                        $user->roles->pluck('name')->implode(', ') ?: '—',
                        $user->created_at?->format('d/m/Y H:i') ?? '—',
                    ];
                })
                ->all(),
        );
    }

    /**
     * Crée un administrateur ou un professeur.
     *
     * Les étudiants ne sont jamais créés depuis cette commande.
     */
    private function createUser(): void
    {
        $name = text(
            label: 'Nom complet',
            required: true,
        );

        $email = text(
            label: 'Email',
            required: true,
            validate: fn(string $value): ?string => $this->validateEmail(
                email: $value,
            ),
        );

        $plainPassword = password(
            label: 'Mot de passe',
            required: true,
            validate: fn(string $value): ?string =>
            $this->validatePasswordWithoutConfirmation($value),
        );

        password(
            label: 'Confirme le mot de passe',
            required: true,
            validate: fn(string $value): ?string =>
            $value === $plainPassword
                ? null
                : 'Les mots de passe ne correspondent pas.',
        );

        $role = select(
            label: 'Rôle',
            options: $this->roleOptions(),
        );

        if (
            $role === RoleEnum::Admin->value
            && ! confirm(
                label: 'Confirmer la création de cet administrateur ?',
                default: false,
            )
        ) {
            info('Création annulée.');

            return;
        }

        $user = new User();

        $user->name = $name;
        $user->email = $email;
        $user->password = Hash::make($plainPassword);
        $user->email_verified_at = now();

        $user->save();

        $user->assignRole($role);

        info(
            sprintf(
                'Utilisateur créé : %s (%s)',
                $user->email,
                $role,
            ),
        );
    }

    /**
     * Modifie le nom, l'email et éventuellement
     * le mot de passe d'un compte.
     */
    private function updateUser(): void
    {
        $user = $this->pickUser();

        if ($user === null) {
            return;
        }

        $name = text(
            label: 'Nom complet',
            default: $user->name,
            required: true,
        );

        $email = text(
            label: 'Email',
            default: $user->email ?? '',
            required: true,
            validate: fn(string $value): ?string => $this->validateEmail(
                email: $value,
                ignoreUserId: $user->getKey(),
            ),
        );

        $changePassword = confirm(
            label: 'Changer le mot de passe ?',
            default: false,
        );

        $user->name = $name;
        $user->email = $email;

        if ($changePassword) {
            $plainPassword = password(
                label: 'Nouveau mot de passe',
                required: true,
                validate: fn(string $value): ?string =>
                $this->validatePasswordWithoutConfirmation($value),
            );

            password(
                label: 'Confirme le nouveau mot de passe',
                required: true,
                validate: fn(string $value): ?string =>
                $value === $plainPassword
                    ? null
                    : 'Les mots de passe ne correspondent pas.',
            );

            $user->password = Hash::make($plainPassword);
        }

        $user->save();

        info("Utilisateur {$user->email} mis à jour.");
    }

    /**
     * Change le rôle d'un utilisateur.
     *
     * Les seuls rôles disponibles ici sont Admin et Teacher.
     */
    private function changeRole(): void
    {
        $user = $this->pickUser();

        if ($user === null) {
            return;
        }

        $currentRole = $user->roles->first()?->name;

        $newRole = select(
            label: sprintf(
                'Nouveau rôle pour %s (actuel : %s)',
                $user->email ?? $user->name,
                $currentRole ?? '—',
            ),
            options: $this->roleOptions(),
        );

        if ($newRole === $currentRole) {
            info('Aucun changement : cet utilisateur possède déjà ce rôle.');

            return;
        }

        /*
         * Le dernier administrateur ne peut pas devenir professeur.
         */
        if (
            $currentRole === RoleEnum::Admin->value
            && $newRole !== RoleEnum::Admin->value
            && $this->adminCount() <= 1
        ) {
            error(
                'Impossible : ce compte est le dernier administrateur restant.',
            );

            return;
        }

        /*
         * Promotion vers administrateur :
         * confirmation explicite obligatoire.
         */
        if (
            $newRole === RoleEnum::Admin->value
            && ! confirm(
                label: 'Confirmer la promotion de cet utilisateur en ADMIN ?',
                default: false,
            )
        ) {
            info('Changement de rôle annulé.');

            return;
        }

        $user->syncRoles([$newRole]);

        info(
            sprintf(
                'Rôle de %s mis à jour : %s',
                $user->email ?? $user->name,
                $newRole,
            ),
        );
    }

    /**
     * Supprime définitivement un compte.
     */
    private function deleteUser(): void
    {
        $user = $this->pickUser();

        if ($user === null) {
            return;
        }

        /*
         * Protection absolue du dernier administrateur.
         */
        if (
            $user->hasRole(RoleEnum::Admin->value)
            && $this->adminCount() <= 1
        ) {
            error(
                'Impossible : ce compte est le dernier administrateur restant.',
            );

            return;
        }

        $identifier = $user->email ?? $user->name;

        $confirmed = confirm(
            label: sprintf(
                'Supprimer définitivement %s ? Cette action est irréversible.',
                $identifier,
            ),
            default: false,
        );

        if (! $confirmed) {
            info('Suppression annulée.');

            return;
        }

        /*
         * Suppression via Query Builder.
         *
         * On évite volontairement $user->delete() afin de ne pas
         * déclencher l'ambiguïté de signature signalée par Intelephense.
         */
        User::query()
            ->whereKey($user->getKey())
            ->delete();

        info("Utilisateur {$identifier} supprimé.");
    }

    /**
     * Recherche un administrateur ou professeur.
     */
    private function pickUser(): ?User
    {
        $search = text(
            label: 'Cherche un administrateur ou professeur par nom ou email',
            required: true,
        );

        $users = $this->manageableUsersQuery()
            ->where(function (Builder $query) use ($search): void {
                $query
                    ->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            })
            ->orderBy('name')
            ->limit(10)
            ->get();

        if ($users->isEmpty()) {
            warning(
                sprintf(
                    'Aucun administrateur ou professeur trouvé pour « %s ».',
                    $search,
                ),
            );

            return null;
        }

        $selectedId = select(
            label: 'Sélectionne un utilisateur',
            options: $users
                ->mapWithKeys(function (User $user): array {
                    $role = $user->roles->first()?->name ?? '—';
                    $email = $user->email ?? 'sans email';

                    return [
                        (string) $user->getKey() =>
                        "{$user->name} ({$email}) — {$role}",
                    ];
                })
                ->all(),
        );

        return $users->first(
            fn(User $user): bool =>
            (string) $user->getKey() === (string) $selectedId,
        );
    }

    /**
     * Query de base pour les comptes gérés par cette commande.
     */
    private function manageableUsersQuery(): Builder
    {
        return User::query()
            ->with('roles')
            ->whereHas(
                'roles',
                function (Builder $query): void {
                    $query->whereIn(
                        'name',
                        $this->manageableRoles(),
                    );
                },
            );
    }

    /**
     * Rôles autorisés dans cette commande.
     *
     * Student est volontairement exclu.
     */
    private function manageableRoles(): array
    {
        return [
            RoleEnum::Admin->value,
            RoleEnum::Teacher->value,
        ];
    }

    /**
     * Options de rôles affichées dans le terminal.
     */
    private function roleOptions(): array
    {
        return [
            RoleEnum::Admin->value => RoleEnum::Admin->label(),
            RoleEnum::Teacher->value => RoleEnum::Teacher->label(),
        ];
    }

    /**
     * Compte le nombre d'administrateurs.
     *
     * count('*') est explicite pour éviter le faux positif
     * Intelephense rencontré avec count().
     */
    private function adminCount(): int
    {
        return User::query()
            ->whereHas(
                'roles',
                function (Builder $query): void {
                    $query->where(
                        'name',
                        RoleEnum::Admin->value,
                    );
                },
            )
            ->count('*');
    }

    /**
     * Validation de l'adresse email.
     */
    private function validateEmail(
        string $email,
        mixed $ignoreUserId = null,
    ): ?string {
        $uniqueRule = 'unique:users,email';

        if ($ignoreUserId !== null) {
            $uniqueRule .= ',' . $ignoreUserId;
        }

        $validator = Validator::make(
            ['email' => $email],
            [
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    $uniqueRule,
                ],
            ],
        );

        return $validator->errors()->first('email') ?: null;
    }

    /**
     * Validation du mot de passe.
     *
     * La confirmation est effectuée séparément par Laravel Prompts,
     * donc la règle "confirmed" est retirée.
     */
    private function validatePasswordWithoutConfirmation(
        string $password,
    ): ?string {
        $rules = collect($this->passwordRules())
            ->reject(
                fn(mixed $rule): bool => $rule === 'confirmed',
            )
            ->values()
            ->all();

        $validator = Validator::make(
            ['password' => $password],
            ['password' => $rules],
        );

        return $validator->errors()->first('password') ?: null;
    }
}
