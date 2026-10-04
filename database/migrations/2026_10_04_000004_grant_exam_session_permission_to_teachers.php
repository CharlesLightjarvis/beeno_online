<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = collect([
            'manage.own-exam-sessions',
            'view.own-exam-sessions',
            'view.student-dashboard',
        ])->mapWithKeys(fn (string $name): array => [
            $name => Permission::firstOrCreate([
                'name' => $name,
                'guard_name' => 'web',
            ]),
        ]);

        Role::query()
            ->where('name', 'teacher')
            ->where('guard_name', 'web')
            ->first()?->givePermissionTo($permissions['manage.own-exam-sessions']);

        Role::query()
            ->where('name', 'student')
            ->where('guard_name', 'web')
            ->first()?->givePermissionTo([
                $permissions['view.own-exam-sessions'],
                $permissions['view.student-dashboard'],
            ]);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        Role::query()
            ->where('name', 'teacher')
            ->where('guard_name', 'web')
            ->first()?->revokePermissionTo('manage.own-exam-sessions');

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
